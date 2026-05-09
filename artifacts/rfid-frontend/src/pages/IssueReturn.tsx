import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useIssueTool, useReturnTool, getListToolsQueryKey, getGetStatsQueryKey, getListTransactionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, CornerDownLeft, HardHat, Rss } from "lucide-react";

const issueSchema = z.object({
  toolId: z.string().min(1, "Tool ID is required"),
  userId: z.string().min(1, "Operator ID is required"),
});

const returnSchema = z.object({
  toolId: z.string().min(1, "Tool ID is required"),
});

export default function IssueReturn() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
  };

  const issueMutation = useIssueTool({
    mutation: {
      onSuccess: (data) => {
        invalidateQueries();
        issueForm.reset();
        toast({ 
          title: "Tool Issued", 
          description: `Tool ${data.toolId} issued to ${data.userId}`,
          className: "border-blue-500"
        });
      },
      onError: (err) => {
        toast({ title: "Issue Failed", description: err.data?.error || "Unknown error", variant: "destructive" });
      }
    }
  });

  const returnMutation = useReturnTool({
    mutation: {
      onSuccess: (data) => {
        invalidateQueries();
        returnForm.reset();
        toast({ 
          title: "Tool Returned", 
          description: `Tool ${data.toolId} returned to inventory`,
          className: "border-emerald-500"
        });
      },
      onError: (err) => {
        toast({ title: "Return Failed", description: err.data?.error || "Unknown error", variant: "destructive" });
      }
    }
  });

  const issueForm = useForm<z.infer<typeof issueSchema>>({
    resolver: zodResolver(issueSchema),
    defaultValues: { toolId: "", userId: "" },
  });

  const returnForm = useForm<z.infer<typeof returnSchema>>({
    resolver: zodResolver(returnSchema),
    defaultValues: { toolId: "" },
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Issue / Return</h1>
        <p className="text-muted-foreground">Process individual tool checkout and returns</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Issue Card */}
        <Card className="bg-card border-border/50 border-t-blue-500 border-t-4 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ArrowRight className="w-5 h-5 mr-2 text-blue-500" /> Issue Tool
            </CardTitle>
            <CardDescription>Checkout a tool to an operator</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...issueForm}>
              <form onSubmit={issueForm.handleSubmit((v) => issueMutation.mutate({ data: v }))} className="space-y-4">
                <FormField control={issueForm.control} name="toolId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Rss className="w-3 h-3 mr-2 text-muted-foreground"/> RFID Tool ID</FormLabel>
                    <FormControl><Input placeholder="Scan or enter tool ID" {...field} className="font-mono text-lg py-6" data-testid="input-issue-toolid" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={issueForm.control} name="userId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><HardHat className="w-3 h-3 mr-2 text-muted-foreground"/> Operator ID</FormLabel>
                    <FormControl><Input placeholder="Enter operator badge/ID" {...field} className="font-mono text-lg py-6" data-testid="input-issue-userid" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full py-6 mt-4 bg-blue-600 hover:bg-blue-700 text-white" disabled={issueMutation.isPending} data-testid="button-submit-issue">
                  {issueMutation.isPending ? "Processing..." : "Issue Tool"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Return Card */}
        <Card className="bg-card border-border/50 border-t-emerald-500 border-t-4 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CornerDownLeft className="w-5 h-5 mr-2 text-emerald-500" /> Return Tool
            </CardTitle>
            <CardDescription>Check a tool back into the crib</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...returnForm}>
              <form onSubmit={returnForm.handleSubmit((v) => returnMutation.mutate({ data: v }))} className="space-y-4">
                <FormField control={returnForm.control} name="toolId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Rss className="w-3 h-3 mr-2 text-muted-foreground"/> RFID Tool ID</FormLabel>
                    <FormControl><Input placeholder="Scan or enter tool ID" {...field} className="font-mono text-lg py-6" data-testid="input-return-toolid" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="pt-24 pb-2 text-center text-sm text-muted-foreground opacity-50">
                  Tool condition verified upon return
                </div>
                <Button type="submit" className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={returnMutation.isPending} data-testid="button-submit-return">
                  {returnMutation.isPending ? "Processing..." : "Return Tool"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
