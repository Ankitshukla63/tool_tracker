import { Badge } from "./ui/badge";

export function StatusBadge({ status }: { status: "available" | "issued" | "missing" | string }) {
  if (status === "available") {
    return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 capitalize font-medium rounded-sm">Available</Badge>;
  }
  if (status === "issued") {
    return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 capitalize font-medium rounded-sm">Issued</Badge>;
  }
  if (status === "missing") {
    return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 capitalize font-medium rounded-sm">Missing</Badge>;
  }
  return <Badge variant="outline" className="capitalize rounded-sm">{status}</Badge>;
}
