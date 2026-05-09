import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  useListTools, 
  useCreateTool, 
  useUpdateTool, 
  useDeleteTool,
  getListToolsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, MoreVertical, Edit2, Trash2 } from "lucide-react";
import type { Tool } from "@workspace/api-client-react";

const toolSchema = z.object({
  toolId: z.string().min(1, "RFID Tool ID is required"),
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["available", "issued", "missing"]).optional(),
});

type ToolFormValues = z.infer<typeof toolSchema>;

export default function Tools() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [deletingTool, setDeletingTool] = useState<Tool | null>(null);

  const { data: tools, isLoading } = useListTools();
  
  const createMutation = useCreateTool({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
        setIsCreateOpen(false);
        createForm.reset();
        toast({ title: "Tool created successfully" });
      },
      onError: (err) => {
        toast({ title: "Failed to create tool", description: err.data?.error || "Unknown error", variant: "destructive" });
      }
    }
  });

  const updateMutation = useUpdateTool({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
        setEditingTool(null);
        toast({ title: "Tool updated successfully" });
      },
      onError: (err) => {
        toast({ title: "Failed to update tool", description: err.data?.error || "Unknown error", variant: "destructive" });
      }
    }
  });

  const deleteMutation = useDeleteTool({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
        setDeletingTool(null);
        toast({ title: "Tool deleted successfully" });
      },
      onError: (err) => {
        toast({ title: "Failed to delete tool", description: err.data?.error || "Unknown error", variant: "destructive" });
      }
    }
  });

  const createForm = useForm<ToolFormValues>({
    resolver: zodResolver(toolSchema),
    defaultValues: { toolId: "", name: "", category: "", status: "available" },
  });

  const editForm = useForm<ToolFormValues>({
    resolver: zodResolver(toolSchema),
  });

  const onEditClick = (tool: Tool) => {
    editForm.reset({
      toolId: tool.toolId,
      name: tool.name,
      category: tool.category,
      status: tool.status as "available" | "issued" | "missing",
    });
    setEditingTool(tool);
  };

  const onSubmitCreate = (values: ToolFormValues) => {
    createMutation.mutate({ data: values });
  };

  const onSubmitEdit = (values: ToolFormValues) => {
    if (!editingTool) return;
    updateMutation.mutate({ id: editingTool.id, data: values });
  };

  const onDeleteConfirm = () => {
    if (!deletingTool) return;
    deleteMutation.mutate({ id: deletingTool.id });
  };

  const filteredTools = tools?.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.toolId.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tool Master</h1>
          <p className="text-muted-foreground">Manage RFID tool registry and inventory</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-tool">
              <Plus className="w-4 h-4 mr-2" /> Add New Tool
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Register New Tool</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-4 mt-4">
                <FormField control={createForm.control} name="toolId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>RFID Hex ID</FormLabel>
                    <FormControl><Input placeholder="e.g. A1B2C3D4" {...field} className="font-mono" data-testid="input-create-toolid" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tool Name</FormLabel>
                    <FormControl><Input placeholder="e.g. Impact Wrench" {...field} data-testid="input-create-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={createForm.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl><Input placeholder="e.g. Power Tools" {...field} data-testid="input-create-category" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter className="mt-6">
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-create">
                    {createMutation.isPending ? "Saving..." : "Register Tool"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by ID, name, or category..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm bg-background border-border/50"
              data-testid="input-search-tools"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">Loading registry...</div>
          ) : (
            <Table>
              <TableHeader className="bg-sidebar/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[120px] font-mono pl-6">RFID ID</TableHead>
                  <TableHead>Tool Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTools?.length === 0 ? (
                  <TableRow className="border-border">
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No tools found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : filteredTools?.map((tool) => (
                  <TableRow key={tool.id} className="border-border" data-testid={`tool-row-${tool.id}`}>
                    <TableCell className="font-mono text-sm pl-6 text-muted-foreground">{tool.toolId}</TableCell>
                    <TableCell className="font-medium">{tool.name}</TableCell>
                    <TableCell>{tool.category}</TableCell>
                    <TableCell><StatusBadge status={tool.status} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(tool.updatedAt || tool.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-actions-${tool.id}`}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem onClick={() => onEditClick(tool)} data-testid={`button-edit-${tool.id}`}>
                            <Edit2 className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500 hover:text-red-600 focus:text-red-600" onClick={() => setDeletingTool(tool)} data-testid={`button-delete-${tool.id}`}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingTool} onOpenChange={(open) => !open && setEditingTool(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit Tool</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4 mt-4">
              <FormField control={editForm.control} name="toolId" render={({ field }) => (
                <FormItem>
                  <FormLabel>RFID Hex ID</FormLabel>
                  <FormControl><Input disabled {...field} className="font-mono bg-muted/50" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tool Name</FormLabel>
                  <FormControl><Input {...field} data-testid="input-edit-name" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl><Input {...field} data-testid="input-edit-category" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Override</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="issued">Issued</SelectItem>
                      <SelectItem value="missing">Missing</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setEditingTool(null)}>Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit-edit">
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingTool} onOpenChange={(open) => !open && setDeletingTool(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the tool <span className="font-bold text-foreground">{deletingTool?.name}</span> (ID: {deletingTool?.toolId}) from the registry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white" data-testid="button-confirm-delete">
              {deleteMutation.isPending ? "Deleting..." : "Delete Tool"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
