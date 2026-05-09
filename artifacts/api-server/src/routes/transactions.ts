import { Router } from "express";
import { db } from "@workspace/db";
import { toolsTable, transactionsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { IssueToolBody, ReturnToolBody, ScanInventoryBody, ListTransactionsQueryParams } from "@workspace/api-zod";
import { formatTool } from "./tools";

const router = Router();

router.post("/issue", requireAuth, async (req: AuthRequest, res) => {
  const parsed = IssueToolBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { toolId, userId } = parsed.data;

  const [tool] = await db.select().from(toolsTable).where(eq(toolsTable.toolId, toolId));
  if (!tool) {
    res.status(404).json({ error: `Tool '${toolId}' not found` });
    return;
  }

  if (tool.status !== "available") {
    res.status(400).json({ error: `Tool '${toolId}' is not available (current status: ${tool.status})` });
    return;
  }

  await db.update(toolsTable).set({ status: "issued", updatedAt: new Date() }).where(eq(toolsTable.toolId, toolId));

  const [transaction] = await db
    .insert(transactionsTable)
    .values({ toolId, userId, action: "issue", notes: `Issued to ${userId}` })
    .returning();

  res.json(formatTransaction(transaction!, tool.name));
});

router.post("/return", requireAuth, async (req: AuthRequest, res) => {
  const parsed = ReturnToolBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { toolId } = parsed.data;

  const [tool] = await db.select().from(toolsTable).where(eq(toolsTable.toolId, toolId));
  if (!tool) {
    res.status(404).json({ error: `Tool '${toolId}' not found` });
    return;
  }

  if (tool.status !== "issued") {
    res.status(400).json({ error: `Tool '${toolId}' is not currently issued (current status: ${tool.status})` });
    return;
  }

  await db.update(toolsTable).set({ status: "available", updatedAt: new Date() }).where(eq(toolsTable.toolId, toolId));

  const [transaction] = await db
    .insert(transactionsTable)
    .values({ toolId, action: "return", notes: "Tool returned" })
    .returning();

  res.json(formatTransaction(transaction!, tool.name));
});

router.post("/scan", requireAuth, async (req: AuthRequest, res) => {
  const parsed = ScanInventoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { scannedToolIds } = parsed.data;
  const scannedSet = new Set(scannedToolIds);

  const allTools = await db.select().from(toolsTable);
  const dbToolIds = new Set(allTools.map((t) => t.toolId));

  const correctTools = allTools.filter((t) => scannedSet.has(t.toolId));
  const missingTools = allTools.filter((t) => !scannedSet.has(t.toolId));
  const extraToolIds = scannedToolIds.filter((id) => !dbToolIds.has(id));

  await db.insert(transactionsTable).values({
    toolId: "SCAN",
    action: "scan",
    notes: `Scanned ${scannedToolIds.length} tools. Missing: ${missingTools.length}, Extra: ${extraToolIds.length}`,
  });

  res.json({
    correct: correctTools.map(formatTool),
    missing: missingTools.map(formatTool),
    extra: extraToolIds,
    summary: {
      totalScanned: scannedToolIds.length,
      totalInDb: allTools.length,
      correctCount: correctTools.length,
      missingCount: missingTools.length,
      extraCount: extraToolIds.length,
    },
  });
});

router.get("/stats", requireAuth, async (req: AuthRequest, res) => {
  const allTools = await db.select().from(toolsTable);
  const recentTxCount = await db
    .select()
    .from(transactionsTable)
    .orderBy(desc(transactionsTable.createdAt))
    .limit(100);

  const stats = {
    totalTools: allTools.length,
    availableTools: allTools.filter((t) => t.status === "available").length,
    issuedTools: allTools.filter((t) => t.status === "issued").length,
    missingTools: allTools.filter((t) => t.status === "missing").length,
    recentTransactions: recentTxCount.length,
  };

  res.json(stats);
});

router.get("/transactions", requireAuth, async (req: AuthRequest, res) => {
  const parsed = ListTransactionsQueryParams.safeParse(req.query);
  const limit = parsed.success && parsed.data.limit ? parsed.data.limit : 50;

  const allTools = await db.select().from(toolsTable);
  const toolMap = new Map(allTools.map((t) => [t.toolId, t.name]));

  const transactions = await db
    .select()
    .from(transactionsTable)
    .orderBy(desc(transactionsTable.createdAt))
    .limit(limit);

  res.json(
    transactions.map((tx) => formatTransaction(tx, toolMap.get(tx.toolId) ?? null))
  );
});

function formatTransaction(
  tx: typeof transactionsTable.$inferSelect,
  toolName: string | null
) {
  return {
    id: tx.id,
    toolId: tx.toolId,
    toolName,
    userId: tx.userId ?? null,
    action: tx.action,
    notes: tx.notes ?? null,
    createdAt: tx.createdAt.toISOString(),
  };
}

export default router;
