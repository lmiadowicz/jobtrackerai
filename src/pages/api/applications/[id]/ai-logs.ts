import type { APIContext } from "astro";
import { z } from "zod";

import type { AiGenerationLogsListResponse, AIGenerationLogDTO, AIGenerationType, ListResult } from "@/types";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  sort_by: z.enum(["created_at"]).optional().default("created_at"),
  sort_dir: z.enum(["asc", "desc"]).optional().default("desc"),
  type: z.enum(["generate_cv", "generate_cover_letter"]).optional(),
});

export async function GET(context: APIContext): Promise<Response> {
  const supabase = context.locals.supabase;
  if (!supabase) {
    return Response.json(
      { data: null, error: { code: "server_error", message: "Supabase not initialized" } },
      { status: 500 }
    );
  }

  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) {
    return Response.json({ data: null, error: { code: "unauthorized", message: "Unauthorized" } }, { status: 401 });
  }

  const applicationId = context.params.id as string;
  if (!applicationId) {
    return Response.json(
      { data: null, error: { code: "bad_request", message: "Missing application id" } },
      { status: 400 }
    );
  }

  const parse = querySchema.safeParse(Object.fromEntries(new URL(context.request.url).searchParams));
  if (!parse.success) {
    return Response.json(
      { data: null, error: { code: "bad_request", message: "Invalid query", details: parse.error.flatten() } },
      { status: 400 }
    );
  }
  const { limit, offset, sort_by, sort_dir, type } = parse.data;

  let query = supabase
    .from("ai_generation_logs")
    .select("*", { count: "exact" })
    .eq("application_id", applicationId)
    .order(sort_by, { ascending: sort_dir === "asc" })
    .range(offset, offset + limit - 1);

  if (type) {
    query = query.eq("type", type as AIGenerationType);
  }

  const { data, count, error } = await query;
  if (error) {
    return Response.json(
      { data: null, error: { code: "db_error", message: error.message, details: error } },
      { status: 500 }
    );
  }

  const result: ListResult<AIGenerationLogDTO> = { items: data ?? [], total: count ?? 0 };
  return Response.json({ data: result, error: null } satisfies AiGenerationLogsListResponse);
}
