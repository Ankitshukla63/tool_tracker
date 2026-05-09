import { useGetStats, useListTransactions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wrench, CheckCircle2, AlertTriangle, AlertCircle, Activity } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: transactions, isLoading: txLoading } = useListTransactions({ limit: 10 });

  const formatAction = (action: string) => {
    switch (action) {
      case "issue":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Issued</Badge>;
      case "return":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Returned</Badge>;
      case "scan":
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">Scan</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">System Overview</h1>
        <p className="text-muted-foreground flex items-center">
          <Activity className="w-4 h-4 mr-2 text-emerald-500" />
          Live telemetry from facility RFID nodes
        </p>
      </div>

      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-10"></CardHeader>
              <CardContent className="h-20"></CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Inventory</CardTitle>
              <Wrench className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="stat-total">{stats.totalTools}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered tools</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="stat-available">{stats.availableTools}</div>
              <p className="text-xs text-muted-foreground mt-1">In tool crib</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Issued</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="stat-issued">{stats.issuedTools}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently assigned</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/50 border-red-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Missing</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500" data-testid="stat-missing">{stats.missingTools}</div>
              <p className="text-xs text-muted-foreground mt-1 text-red-500/80">Require immediate action</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-6 mt-8">
        <Card className="col-span-1 bg-card border-border/50">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {txLoading ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">Loading log...</div>
            ) : transactions && transactions.length > 0 ? (
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader className="bg-sidebar">
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="w-[180px]">Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Tool ID</TableHead>
                      <TableHead>Tool Name</TableHead>
                      <TableHead>Operator</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id} className="border-border" data-testid={`tx-row-${tx.id}`}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {format(new Date(tx.createdAt), 'MMM dd, HH:mm:ss')}
                        </TableCell>
                        <TableCell>{formatAction(tx.action)}</TableCell>
                        <TableCell className="font-mono text-sm">{tx.toolId}</TableCell>
                        <TableCell>{tx.toolName || '-'}</TableCell>
                        <TableCell>{tx.userId || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-md">
                No recent activity logged.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
