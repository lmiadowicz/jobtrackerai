import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SupabaseClient } from "@supabase/supabase-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface AiLogParams {
  userId: string;
  applicationId: string;
  type: "generate_cv" | "generate_cover_letter";
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  latencyMs?: number;
  status?: "success" | "error";
  errorMessage?: string;
  outputDocumentId?: string | null;
  metadata?: Record<string, unknown>;
}

export async function insertAiGenerationLog(supabase: SupabaseClient, params: AiLogParams): Promise<void> {
  const payload = {
    user_id: params.userId,
    application_id: params.applicationId,
    type: params.type,
    model: params.model ?? null,
    prompt_tokens: params.promptTokens ?? null,
    completion_tokens: params.completionTokens ?? null,
    total_tokens: params.totalTokens ?? null,
    latency_ms: params.latencyMs ?? null,
    status: params.status ?? "success",
    error_message: params.errorMessage ?? null,
    output_document_id: params.outputDocumentId ?? null,
    metadata: params.metadata ?? null,
  };
  await supabase.from("ai_generation_logs").insert(payload);
}
