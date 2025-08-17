# REST API Plan

## 1. Resources

- **Auth (Supabase Auth)**: session and user management (no DB table; relies on Supabase Auth)
- **Profiles** → table: `public.profiles`
- **Skills** → table: `public.skills`
- **ProfileSkills** → table: `public.profile_skills` (N:M between profiles and skills)
- **Applications** → table: `public.applications`
- **Documents** → table: `public.documents` (CV, cover letter)
- **ApplicationNotes** → table: `public.application_notes`
- **StatusHistory** → table: `public.status_history`
- **Currencies** → table: `public.currencies` (readonly)
- **AIGenerationLogs** → table: `public.ai_generation_logs` (audit of AI generations)

## 2. Endpoints

Conventions:
- All endpoints require authentication unless stated otherwise.
- Authorization: Supabase JWT in `Authorization: Bearer <access_token>` header; RLS enforces per-user access.
- Pagination: `limit` (default 20, max 100), `offset` (default 0)
- Sorting: `sort_by` (whitelisted fields per resource), `sort_dir` in {`asc`,`desc`} (default `desc`)
- Response envelope:
  - Success: `{ "data": <payload>, "error": null }`
  - Error: `{ "data": null, "error": { "code": string, "message": string, "details"?: any } }`

### 2.1 Auth



### 2.2 Profiles

- GET `/api/profiles`
  - Description: List current user profiles
  - Query: `limit`, `offset`, `sort_by` in {`created_at`,`updated_at`,`name`}, `sort_dir`
  - Response: `{ "data": { "items": Profile[], "total": number }, "error": null }`

- POST `/api/profiles`
  - Description: Create profile
  - Request: `{
      "name": string,
      "is_default"?: boolean,
      "master_cv"?: string,
      "pref_salary_min"?: number,
      "pref_salary_max"?: number,
      "pref_salary_currency"?: string (ISO 4217),
      "pref_salary_period"?: "monthly"|"yearly"|"hourly"
    }`
  - Response: `{ "data": Profile, "error": null }`
  - Errors: `400` validation, `409` (name unique per user)

- GET `/api/profiles/:id`
  - Description: Get profile by id (owned)
  - Response: `{ "data": Profile, "error": null }`

- PUT `/api/profiles/:id`
  - Description: Update profile
  - Request: same fields as POST (all optional)
  - Response: `{ "data": Profile, "error": null }`

- DELETE `/api/profiles/:id`
  - Description: Delete profile (blocked if referenced by applications)
  - Response: `{ "data": { "ok": true }, "error": null }`
  - Errors: `409` if referenced

- POST `/api/profiles/:id/skills`
  - Description: Attach skills to profile (idempotent)
  - Request: `{ "skill_ids": string[] }`
  - Response: `{ "data": { "attached": number }, "error": null }`

- DELETE `/api/profiles/:id/skills`
  - Description: Detach skills from profile
  - Request: `{ "skill_ids": string[] }`
  - Response: `{ "data": { "detached": number }, "error": null }`

### 2.3 Skills

- GET `/api/skills`
  - Description: List user skills
  - Query: `q` (search by name, case-insensitive), `limit`, `offset`, `sort_by` in {`created_at`,`name`}, `sort_dir`
  - Response: `{ "data": { "items": Skill[], "total": number }, "error": null }`

- POST `/api/skills`
  - Description: Create skill (upsert by lower(name) per user)
  - Request: `{ "name": string }`
  - Response: `{ "data": Skill, "error": null }`
  - Errors: `409` on exact duplicate

- PUT `/api/skills/:id`
  - Description: Rename skill
  - Request: `{ "name": string }`
  - Response: `{ "data": Skill, "error": null }`

- DELETE `/api/skills/:id`
  - Description: Delete skill (detaches from profiles)
  - Response: `{ "data": { "ok": true }, "error": null }`

### 2.4 Applications

- GET `/api/applications`
  - Description: List applications for current user
  - Query: `status` (multi allowed), `profile_id`, `q` (company or title substring), `created_from`, `created_to`, `limit`, `offset`, `sort_by` in {`created_at`,`updated_at`,`position`,`status`}, `sort_dir`
  - Response: `{ "data": { "items": Application[], "total": number }, "error": null }`

- POST `/api/applications`
  - Description: Create new application (defaults to status `planned` and top `position`)
  - Request: `{
      "profile_id": string,
      "company_name": string,
      "position_title": string,
      "job_link": string,
      "job_description"?: string
    }`
  - Response: `{ "data": Application, "error": null }`
  - Errors: `409` unique `(user_id, lower(job_link))`

- GET `/api/applications/:id`
  - Description: Get application
  - Response: `{ "data": Application, "error": null }`

- PUT `/api/applications/:id`
  - Description: Update basic fields, salary fields, rejection_reason, selected_cv_document_id
  - Request: partial Application fields (except immutable)
  - Response: `{ "data": Application, "error": null }`

- DELETE `/api/applications/:id`
  - Description: Delete application with cascade to documents/notes via RLS rules
  - Response: `{ "data": { "ok": true }, "error": null }`

- POST `/api/applications/:id/move`
  - Description: Move application to a new status and/or reorder within a column
  - Request: `{ "to_status"?: "planned"|"sent"|"response"|"interview"|"offer"|"rejection", "after_id"?: string }`
  - Response: `{ "data": Application, "error": null }`
  - Notes: Writes to `status_history` when `to_status` provided; updates `position` for kanban ordering

- POST `/api/applications/reorder`
  - Description: Bulk reorder positions within a status column
  - Request: `{ "status": string, "ordered_ids": string[] }`
  - Response: `{ "data": { "ok": true }, "error": null }`

### 2.5 Documents

- GET `/api/applications/:id/documents`
  - Description: List documents for an application (CV/cover_letter)
  - Query: `type` in {`cv`,`cover_letter`}, `limit`, `offset`, `sort_by` in {`created_at`,`updated_at`}, `sort_dir`
  - Response: `{ "data": { "items": Document[], "total": number }, "error": null }`

- POST `/api/applications/:id/documents`
  - Description: Create a document (CV or cover letter)
  - Request: `{ "type": "cv"|"cover_letter", "title"?: string, "content": string }`
  - Response: `{ "data": Document, "error": null }`

- PUT `/api/documents/:docId`
  - Description: Update document title or content
  - Request: `{ "title"?: string, "content"?: string }`
  - Response: `{ "data": Document, "error": null }`

- DELETE `/api/documents/:docId`
  - Description: Delete document
  - Response: `{ "data": { "ok": true }, "error": null }`

- POST `/api/applications/:id/select-cv`
  - Description: Set `selected_cv_document_id` for an application
  - Request: `{ "document_id": string }`
  - Response: `{ "data": Application, "error": null }`

### 2.6 Application Notes

- GET `/api/applications/:id/notes`
  - Description: List notes
  - Query: `limit`, `offset`, `sort_by` in {`created_at`}, `sort_dir`
  - Response: `{ "data": { "items": ApplicationNote[], "total": number }, "error": null }`

- POST `/api/applications/:id/notes`
  - Description: Add note
  - Request: `{ "content": string }`
  - Response: `{ "data": ApplicationNote, "error": null }`

- DELETE `/api/notes/:noteId`
  - Description: Delete note
  - Response: `{ "data": { "ok": true }, "error": null }`

### 2.7 Status History

- GET `/api/applications/:id/status-history`
  - Description: List status changes for an application
  - Query: `limit`, `offset`, `sort_by` in {`changed_at`}, `sort_dir`
  - Response: `{ "data": { "items": StatusHistory[], "total": number }, "error": null }`

### 2.8 Currencies

- GET `/api/currencies`
  - Description: List ISO-4217 currencies
  - Query: `q` (search by code or name), `limit`, `offset`
  - Response: `{ "data": { "items": Currency[], "total": number }, "error": null }`
  - Notes: Readonly

### 2.9 AI Generation

- POST `/api/applications/:id/generate-cv`
  - Description: Generate tailored CV in Markdown based on `job_description` and user profile/skills; extract salary range from description
  - Request: `{ "regenerate"?: boolean }`
  - Response: `{ "data": { "document": Document, "salary": { "min"?: number, "max"?: number, "currency"?: string, "period"?: "monthly"|"yearly"|"hourly", "source_snippet"?: string } }, "error": null }`
  - Side effects: creates a `documents` row (type `cv`), updates `applications.salary_*` fields when extracted; logs an entry in `ai_generation_logs`
  - SLA: completes within ~3 minutes (async-friendly; consider 202-accepted + polling)

- POST `/api/applications/:id/generate-cover-letter`
  - Description: Generate a short cover letter aligned to the offer and profile
  - Request: `{}`
  - Response: `{ "data": { "document": Document }, "error": null }`
  - Side effects: creates a `documents` row (type `cover_letter`); logs an entry in `ai_generation_logs`

### 2.10 AI Generation Logs

- GET `/api/applications/:id/ai-logs`
  - Description: List AI generation logs for an application
  - Query: `type` in {`generate_cv`,`generate_cover_letter`}, `limit`, `offset`, `sort_by` in {`created_at`}, `sort_dir`
  - Response: `{ "data": { "items": AIGenerationLog[], "total": number }, "error": null }`
  - Notes: Readonly; server-side writes on AI endpoints

## 3. Authentication and Authorization

- Mechanism: Supabase Auth JWT passed via `Authorization: Bearer <access_token>`.
- Server access: Astro middleware injects `context.locals.supabase` client (typed using `src/db/supabase.client.ts`). For user context, handlers call `const { data: { user } } = await supabase.auth.getUser();` and enforce `user?.id`.
- RLS: All tables enforce per-user access using row-level security policies; API must not accept `user_id` from clients. The server sets `user_id` server-side or relies on RLS filters.
- Session propagation: For SSR/API requests from the browser, include the `Authorization` header from the client. On the server, apply the token to the request-scoped client if needed before queries.

## 4. Validation and Business Logic

- Validation: Use Zod schemas per endpoint; reject on parse failure with `400`.
- Common rules from schema/PRD:
  - Profiles: `name` required; salary range valid (`pref_salary_min <= pref_salary_max`); currency must exist in `currencies`.
  - Skills: `name` non-empty; unique per user by `lower(name)`.
  - Applications:
    - Required: `company_name`, `position_title`, `job_link`, `profile_id` (owned).
    - Unique `(user_id, lower(job_link))`.
    - Salary range valid; if provided, `salary_currency` must exist; `selected_cv_document_id` must belong to the same application.
  - Documents: `type` in {`cv`,`cover_letter`}; `content` non-empty; title optional; `application_id` owned by user.
  - Notes: `content` non-empty.
  - Status changes: allowed statuses are `planned|sent|response|interview|offer|rejection`; moving status writes to `status_history`.
- Business logic:
  - Kanban ordering: maintain `position` integer; `reorder` accepts ordered IDs to update positions in a single transaction.
  - Status change: transactional write to `applications.status`, append to `status_history`.
  - AI generation: read `applications.job_description`, `profiles.master_cv`, and user `skills`; write generated content to `documents`. Extracted salary persists to `applications` with `salary_source_snippet`. Also write an audit entry to `ai_generation_logs` with `type`, `model`, token usage, latency, status, and `output_document_id` when available.

## 5. Data Models (Response Shapes)

- Profile: `{ id, user_id, name, is_default, master_cv, pref_salary_min, pref_salary_max, pref_salary_currency, pref_salary_period, created_at, updated_at, version }`
- Skill: `{ id, user_id, name, created_at }`
- Application: `{ id, user_id, profile_id, company_name, position_title, job_link, job_description, status, position, salary_min, salary_max, salary_currency, salary_period, salary_source_snippet, rejection_reason, selected_cv_document_id, created_at, updated_at, version }`
- Document: `{ id, user_id, application_id, type, title, content, created_at, updated_at, version }`
- ApplicationNote: `{ id, user_id, application_id, content, created_at }`
- StatusHistory: `{ id, user_id, application_id, to_status, changed_at }`
- Currency: `{ code, name, numeric_code, fraction_digits }`
- AIGenerationLog: `{ id, user_id, application_id, type, model, prompt_tokens, completion_tokens, total_tokens, latency_ms, status, error_message, output_document_id, metadata, created_at }`

## 6. Errors

- 400 Bad Request: validation failed or unsupported query param
- 401 Unauthorized: missing/invalid token
- 403 Forbidden: RLS denied
- 404 Not Found: resource not owned or missing
- 409 Conflict: unique constraint (e.g., job_link duplicate), foreign key violation
- 429 Too Many Requests: rate limit exceeded
- 500 Internal Server Error: unhandled

## 7. Rate Limiting and Security

- Rate limit: 60 requests/min per IP (public endpoints), 30 requests/min per user for mutation endpoints; 10 requests/min per user for AI endpoints.
- Input sanitization: trim strings, normalize URLs (lowercase host, remove tracking params) before `job_link` uniqueness check.
- Content size caps: `documents.content` up to ~100KB; notes up to 5KB.
- CORS: restrict origins to production domain; allow credentials where needed.
- Audit: log status changes via `status_history`, documents created in `documents`, and AI generation events in `ai_generation_logs`.

## 8. Implementation Notes (Astro + Supabase)

- Handlers live under `src/pages/api/**`.
- Use `context.locals.supabase` (typed as `SupabaseClient` imported from `src/db/supabase.client.ts`), not from `@supabase/supabase-js`.
- Before DB calls: `const { data: { user }, error } = await context.locals.supabase.auth.getUser();` Fail with `401` if absent.
- Never accept `user_id` from the client; let RLS and server-side insertion set it via `supabase.rpc` or use `insert` with `user_id` defaulted by DB trigger or pass server-resolved `user.id`.
- Prefer single-transaction operations where multiple rows are updated (status change + history, bulk reorder).
- Validation: create `zod` schemas under `src/lib/schemas/**` and reuse on client.
- Index-aware queries:
  - Applications list uses `user_id + status + position` for kanban; fall back to `created_at` when status not provided.
  - Text search `q` uses `ilike` on `company_name` and `position_title` (FTS may be added later).

## 9. Examples (Concise)

- Create Application request:
  `{ "profile_id": "uuid", "company_name": "Acme", "position_title": "Frontend Dev", "job_link": "https://...", "job_description": "..." }`

- Move Application request:
  `{ "to_status": "sent", "after_id": "uuid-of-prev" }`

- Generate CV response (success):
  `{ "data": { "document": { "id": "uuid", "type": "cv", "content": "# CV..." }, "salary": { "min": 9000, "max": 12000, "currency": "PLN", "period": "monthly", "source_snippet": "..." } }, "error": null }` 