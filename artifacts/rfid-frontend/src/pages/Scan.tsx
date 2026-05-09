import { useState } from "react";
import { useScanInventory, getGetStatsQueryKey, getListToolsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import type { ScanResult } from "@workspace/api-client-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Scan as ScanIcon, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Scan() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [scanData, setScanData] = useState("");
  const [results, setResults] = useState<ScanResult | null>(null);

  const scanMutation = useScanInventory({
    mutation: {
      onSuccess: (data) => {
        setResults(data);
        queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        toast({ title: "Scan Complete", description: `Processed ${data.summary.totalScanned} records.` });
      },
      onError: (err) => {
        toast({ title: "Scan Failed", description: err.data?.error || "Unknown error", variant: "destructive" });
      }
    }
  });

  const handleScan = () => {
    // split by comma or newline, trim, remove empty
    const ids = scanData
      .split(/[\n,]+/)
      .map(id => id.trim())
      .filter(id => id.length > 0);
      
    if (ids.length === 0) {
      toast({ title: "No data", description: "Please enter tool IDs to scan", variant: "destructive" });
      return;
    }
    
    scanMutation.mutate({ data: { scannedToolIds: ids } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">RFID Bulk Scan</h1>
        <p className="text-muted-foreground">Run an inventory check by processing bulk RFID reads</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input area */}
        <Card className="lg:col-span-1 bg-card border-border/50 h-[fit-content]">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <ScanIcon className="w-5 h-5 mr-2 text-primary" /> Reader Input
            </CardTitle>
            <CardDescription>Paste or scan raw RFID tags</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea 
              placeholder="e.g.&#10;A1B2C3D4&#10;E5F6G7H8&#10;..." 
              className="min-h-[250px] font-mono bg-background border-border text-sm"
              value={scanData}
              onChange={(e) => setScanData(e.target.value)}
              data-testid="textarea-scan-input"
            />
            <Button 
              className="w-full py-6 text-lg tracking-wide" 
              onClick={handleScan} 
              disabled={scanMutation.isPending || !scanData.trim()}
              data-testid="button-run-scan"
            >
              {scanMutation.isPending ? "Processing..." : "Run Inventory Scan"}
            </Button>
          </CardContent>
        </Card>

        {/* Results area */}
        <Card className="lg:col-span-2 bg-card border-border/50 min-h-[400px]">
          <CardHeader className="border-b border-border pb-4 bg-sidebar/30">
            <CardTitle>Scan Diagnostics</CardTitle>
            {results && (
              <div className="flex gap-4 mt-4 pt-4 border-t border-border">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Db</span>
                  <span className="text-xl font-bold">{results.summary.totalInDb}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Read Tags</span>
                  <span className="text-xl font-bold">{results.summary.totalScanned}</span>
                </div>
                <div className="flex flex-col border-l border-border pl-4">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Correct</span>
                  <span className="text-xl font-bold text-emerald-500">{results.summary.correctCount}</span>
                </div>
                <div className="flex flex-col border-l border-border pl-4">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Missing</span>
                  <span className="text-xl font-bold text-red-500">{results.summary.missingCount}</span>
                </div>
                <div className="flex flex-col border-l border-border pl-4">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Alien Tags</span>
                  <span className="text-xl font-bold text-amber-500">{results.summary.extraCount}</span>
                </div>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            {!results ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground opacity-50 flex-col">
                <ScanIcon className="w-12 h-12 mb-4" />
                <p>Awaiting scan payload</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 divide-x border-b divide-border h-[400px] overflow-hidden">
                
                {/* Correct Column */}
                <div className="flex flex-col bg-emerald-500/5">
                  <div className="p-3 border-b border-border bg-emerald-500/10 flex items-center font-medium text-emerald-500">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Correct ({results.correct.length})
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {results.correct.map(t => (
                      <div key={t.id} className="p-2 border border-emerald-500/20 bg-emerald-500/10 rounded-sm text-sm" data-testid={`scan-correct-${t.toolId}`}>
                        <div className="font-mono text-emerald-500/70 text-xs mb-1">{t.toolId}</div>
                        <div className="font-medium text-foreground">{t.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Column */}
                <div className="flex flex-col bg-red-500/5">
                  <div className="p-3 border-b border-border bg-red-500/10 flex items-center font-medium text-red-500">
                    <AlertCircle className="w-4 h-4 mr-2" /> Missing ({results.missing.length})
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {results.missing.map(t => (
                      <div key={t.id} className="p-2 border border-red-500/20 bg-red-500/10 rounded-sm text-sm" data-testid={`scan-missing-${t.toolId}`}>
                        <div className="font-mono text-red-500/70 text-xs mb-1">{t.toolId}</div>
                        <div className="font-medium text-foreground">{t.name}</div>
                        <Badge variant="outline" className="mt-2 bg-red-500/20 text-red-500 border-none text-[10px] uppercase">Record Not Found</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extra Column */}
                <div className="flex flex-col bg-amber-500/5">
                  <div className="p-3 border-b border-border bg-amber-500/10 flex items-center font-medium text-amber-500">
                    <HelpCircle className="w-4 h-4 mr-2" /> Unregistered ({results.extra.length})
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {results.extra.map((id, i) => (
                      <div key={i} className="p-2 border border-amber-500/20 bg-amber-500/10 rounded-sm text-sm" data-testid={`scan-extra-${id}`}>
                        <div className="font-mono text-amber-500/90 font-bold">{id}</div>
                        <Badge variant="outline" className="mt-2 bg-amber-500/20 text-amber-500 border-none text-[10px] uppercase">Alien Tag</Badge>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
