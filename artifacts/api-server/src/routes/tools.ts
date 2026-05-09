import { Router } from "express";
import { db } from "@workspace/db";
import { toolsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import {
  CreateToolBody,
  UpdateToolBody,
  GetToolParams,
  UpdateToolParams,
  DeleteToolParams,
  ListToolsQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/tools", requireAuth, async (req: AuthRequest, res) => {
  const parsed = ListToolsQueryParams.safeParse(req.query);
  const conditions = [];

  if (parsed.success) {
    if (parsed.data.status) {
      conditions.push(eq(toolsTable.status, parsed.data.status as "available" | "issued" | "missing"));
    }
    if (parsed.data.category) {
      conditions.push(eq(toolsTable.category, parsed.data.category));
    }
  }

  const tools = conditions.length
    ? await db.select().from(toolsTable).where(and(...conditions))
    : await db.select().from(toolsTable);

  res.json(tools.map(formatTool));
});

router.post("/tools", requireAuth, async (req: AuthRequest, res) => {
  const parsed = CreateToolBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db.select().from(toolsTable).where(eq(toolsTable.toolId, parsed.data.toolId));
  if (existing.length > 0) {
    res.status(400).json({ error: `Tool ID '${parsed.data.toolId}' already exists` });
    return;
  }

  const [tool] = await db
    .insert(toolsTable)
    .values({
      toolId: parsed.data.toolId,
      name: parsed.data.name,
      category: parsed.data.category,
      status: (parsed.data.status as "available" | "issued" | "missing") ?? "available",
    })
    .returning();

  res.status(201).json(formatTool(tool!));
});

router.get("/tools/:id", requireAuth, async (req: AuthRequest, res) => {
  const parsed = GetToolParams.safeParse({ id: Number(req.params["id"]) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid tool ID" });
    return;
  }

  const [tool] = await db.select().from(toolsTable).where(eq(toolsTable.id, parsed.data.id));
  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }

  res.json(formatTool(tool));
});

router.put("/tools/:id", requireAuth, async (req: AuthRequest, res) => {
  const paramsParsed = UpdateToolParams.safeParse({ id: Number(req.params["id"]) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid tool ID" });
    return;
  }

  const bodyParsed = UpdateToolBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  const [existing] = await db.select().from(toolsTable).where(eq(toolsTable.id, paramsParsed.data.id));
  if (!existing) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }

  const updateData: Partial<typeof existing> = {
    updatedAt: new Date(),
  };
  if (bodyParsed.data.name !== undefined) updateData.name = bodyParsed.data.name;
  if (bodyParsed.data.category !== undefined) updateData.category = bodyParsed.data.category;
  if (bodyParsed.data.status !== undefined) updateData.status = bodyParsed.data.status as "available" | "issued" | "missing";

  const [updated] = await db
    .update(toolsTable)
    .set(updateData)
    .where(eq(toolsTable.id, paramsParsed.data.id))
    .returning();

  res.json(formatTool(updated!));
});

router.delete("/tools/:id", requireAuth, async (req: AuthRequest, res) => {
  const parsed = DeleteToolParams.safeParse({ id: Number(req.params["id"]) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid tool ID" });
    return;
  }

  const [existing] = await db.select().from(toolsTable).where(eq(toolsTable.id, parsed.data.id));
  if (!existing) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }

  await db.delete(toolsTable).where(eq(toolsTable.id, parsed.data.id));
  res.json({ message: "Tool deleted successfully" });
});

function formatTool(tool: typeof toolsTable.$inferSelect) {
  return {
    id: tool.id,
    toolId: tool.toolId,
    name: tool.name,
    category: tool.category,
    status: tool.status,
    createdAt: tool.createdAt.toISOString(),
    updatedAt: tool.updatedAt?.toISOString() ?? null,
  };
}

export { formatTool };
export default router;
