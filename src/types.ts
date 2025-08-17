import type { Tables, TablesInsert, TablesUpdate, Enums, Constants } from "@/db/database.types";

/**
 * Enum aliases (derived from DB types)
 */
export type ApplicationStatus = Enums<"application_status">;
export type DocumentType = Enums<"document_type">;
export type SalaryPeriod = Enums<"salary_period">;
export type AIGenerationType = Enums<"ai_generation_type">;
export type AIGenerationStatus = Enums<"ai_generation_status">;

/**
 * Core Entity DTOs (read models) mapped directly to DB Row types
 */
export type ProfileDTO = Tables<"profiles">;
export type SkillDTO = Tables<"skills">;
export type ApplicationDTO = Tables<"applications">;
export type DocumentDTO = Tables<"documents">;
export type ApplicationNoteDTO = Tables<"application_notes">;
export type StatusHistoryDTO = Tables<"status_history">;
export type CurrencyDTO = Tables<"currencies">;
export type AIGenerationLogDTO = Tables<"ai_generation_logs">;

/**
 * API response envelope helpers
 */
export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccess<T> {
  data: T;
  error: null;
}
export interface ApiError {
  data: null;
  error: ApiErrorPayload;
}
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface ListResult<T> {
  items: T[];
  total: number;
}

/**
 * Common query DTOs
 */
export type SortDir = "asc" | "desc";

export interface PaginationQuery {
  limit?: number;
  offset?: number;
}

/**
 * Profiles
 */
export type ProfilesListQuery = PaginationQuery & {
  sort_by?: "created_at" | "updated_at" | "name";
  sort_dir?: SortDir;
};

/**
 * Command model for creating a profile.
 * Derived from TablesInsert<"profiles"> while omitting server-managed/user fields.
 */
export type CreateProfileCommand = Pick<
  TablesInsert<"profiles">,
  | "name"
  | "is_default"
  | "master_cv"
  | "pref_salary_min"
  | "pref_salary_max"
  | "pref_salary_currency"
  | "pref_salary_period"
>;

/**
 * Command model for updating a profile (all fields optional).
 */
export type UpdateProfileCommand = Partial<CreateProfileCommand>;

/**
 * Command models for attaching/detaching skills to a profile.
 */
export interface AttachProfileSkillsCommand {
  skill_ids: string[];
}
export interface DetachProfileSkillsCommand {
  skill_ids: string[];
}

/**
 * Skills
 */
export type SkillsListQuery = PaginationQuery & {
  q?: string;
  sort_by?: "created_at" | "name";
  sort_dir?: SortDir;
};

export type CreateSkillCommand = Pick<TablesInsert<"skills">, "name">;
export type UpdateSkillCommand = CreateSkillCommand;

/**
 * Applications
 */
export type ApplicationsListQuery = PaginationQuery & {
  status?: ApplicationStatus | ApplicationStatus[];
  profile_id?: string;
  q?: string;
  created_from?: string;
  created_to?: string;
  sort_by?: "created_at" | "updated_at" | "position" | "status";
  sort_dir?: SortDir;
};

/**
 * Command model for creating an application.
 * Derived from TablesInsert<"applications">; only client-provided fields included.
 */
export type CreateApplicationCommand = Pick<
  TablesInsert<"applications">,
  "profile_id" | "company_name" | "position_title" | "job_link" | "job_description"
>;

/**
 * Command model for updating an application.
 * Uses TablesUpdate<"applications">, narrowed to fields allowed by the plan.
 */
export type UpdateApplicationCommand = Partial<
  Pick<
    TablesUpdate<"applications">,
    | "company_name"
    | "job_description"
    | "job_link"
    | "position"
    | "position_title"
    | "profile_id"
    | "rejection_reason"
    | "salary_currency"
    | "salary_max"
    | "salary_min"
    | "salary_period"
    | "salary_source_snippet"
    | "selected_cv_document_id"
    | "status"
  >
>;

/**
 * Kanban move/reorder commands
 */
export interface MoveApplicationCommand {
  to_status?: ApplicationStatus;
  after_id?: string;
}

export interface ReorderApplicationsCommand {
  status: ApplicationStatus;
  ordered_ids: string[];
}

/**
 * Documents
 */
export type DocumentsListQuery = PaginationQuery & {
  type?: DocumentType;
  sort_by?: "created_at" | "updated_at";
  sort_dir?: SortDir;
};

/**
 * Create a document (CV or cover letter) under an application.
 * Derived from TablesInsert<"documents"> and narrowed to client-provided fields.
 */
export type CreateDocumentCommand = Pick<TablesInsert<"documents">, "type" | "title" | "content">;

/**
 * Update an existing document (title/content only).
 */
export type UpdateDocumentCommand = Partial<Pick<TablesUpdate<"documents">, "title" | "content">>;

/**
 * Select a CV document for an application.
 */
export interface SelectCvCommand {
  document_id: string;
}

/**
 * Application Notes
 */
export type NotesListQuery = PaginationQuery & {
  sort_by?: "created_at";
  sort_dir?: SortDir;
};

export type AddApplicationNoteCommand = Pick<TablesInsert<"application_notes">, "content">;

/**
 * Status History
 */
export type StatusHistoryListQuery = PaginationQuery & {
  sort_by?: "changed_at";
  sort_dir?: SortDir;
};

/**
 * Currencies (readonly)
 */
export type CurrenciesListQuery = PaginationQuery & {
  q?: string;
};

/**
 * AI Generation
 */
export interface GenerateCvCommand {
  regenerate?: boolean;
}

export interface ExtractedSalaryDTO {
  min?: number;
  max?: number;
  currency?: string;
  period?: SalaryPeriod;
  source_snippet?: string;
}

export interface GenerateCvResponseDTO {
  document: DocumentDTO;
  salary: ExtractedSalaryDTO;
}

export type GenerateCoverLetterCommand = Record<string, never>;
export interface GenerateCoverLetterResponseDTO {
  document: DocumentDTO;
}

/**
 * AI Generation Logs (readonly for clients)
 */
export type AiGenerationLogsListQuery = PaginationQuery & {
  type?: AIGenerationType;
  sort_by?: "created_at";
  sort_dir?: SortDir;
};

/**
 * Response DTO aliases for common endpoints
 */
export type ProfilesListResponse = ApiResponse<ListResult<ProfileDTO>>;
export type SkillsListResponse = ApiResponse<ListResult<SkillDTO>>;
export type ApplicationsListResponse = ApiResponse<ListResult<ApplicationDTO>>;
export type DocumentsListResponse = ApiResponse<ListResult<DocumentDTO>>;
export type ApplicationNotesListResponse = ApiResponse<ListResult<ApplicationNoteDTO>>;
export type StatusHistoryListResponse = ApiResponse<ListResult<StatusHistoryDTO>>;
export type CurrenciesListResponse = ApiResponse<ListResult<CurrencyDTO>>;
export type AiGenerationLogsListResponse = ApiResponse<ListResult<AIGenerationLogDTO>>;

/**
 * Narrowed literal unions (optional convenience), sourced from Constants for exhaustive cases
 */
export type ApplicationStatusLiteral = (typeof Constants.public.Enums.application_status)[number];
export type DocumentTypeLiteral = (typeof Constants.public.Enums.document_type)[number];
export type SalaryPeriodLiteral = (typeof Constants.public.Enums.salary_period)[number];
export type AIGenerationTypeLiteral = (typeof Constants.public.Enums.ai_generation_type)[number];
export type AIGenerationStatusLiteral = (typeof Constants.public.Enums.ai_generation_status)[number];
