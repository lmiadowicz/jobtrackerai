# Database Schema for JobTrackAI

## 1. Tables, Columns, Types and Constraints

### Enums

- **application_status**: Enum type for application statuses, including `planned`, `sent`, `response`, `interview`, `offer`, and `rejection`.
- **salary_period**: Enum type for salary periods, including `monthly`, `yearly`, and `hourly`.
- **document_type**: Enum type for document types, including `cv` and `cover_letter`.

### Tables

- **currencies**: Stores currency information based on ISO-4217.
  - `code`: CHAR(3), primary key.
  - `name`: TEXT, not null.
  - `numeric_code`: SMALLINT, nullable.
  - `fraction_digits`: SMALLINT, nullable.

- **profiles**: Represents user profiles.
  - `id`: UUID, primary key.
  - `user_id`: UUID, foreign key referencing `auth.users`.
  - `name`: VARCHAR(120), not null.
  - `is_default`: BOOLEAN, default false.
  - `master_cv`: TEXT, nullable.
  - `pref_salary_min`: NUMERIC(12,2), nullable.
  - `pref_salary_max`: NUMERIC(12,2), nullable.
  - `pref_salary_currency`: CHAR(3), foreign key referencing `currencies`.
  - `pref_salary_period`: salary_period, nullable.
  - `created_at`: TIMESTAMPTZ, default now().
  - `updated_at`: TIMESTAMPTZ, default now().
  - `version`: INT, default 1.
  - Constraints: Unique on `user_id` and `name`, check on salary range.

- **skills**: User-specific skills dictionary.
  - `id`: UUID, primary key.
  - `user_id`: UUID, foreign key referencing `auth.users`.
  - `name`: VARCHAR(80), not null.
  - `created_at`: TIMESTAMPTZ, default now().

- **profile_skills**: Mapping table for profiles and skills (N:M).
  - `profile_id`: UUID, foreign key referencing `profiles`.
  - `skill_id`: UUID, foreign key referencing `skills`.
  - `created_at`: TIMESTAMPTZ, default now().
  - Primary key on `profile_id` and `skill_id`.

- **applications**: Represents job applications.
  - `id`: UUID, primary key.
  - `user_id`: UUID, foreign key referencing `auth.users`.
  - `profile_id`: UUID, foreign key referencing `profiles`.
  - `company_name`: VARCHAR(200), not null.
  - `position_title`: VARCHAR(150), not null.
  - `job_link`: TEXT, not null.
  - `job_description`: TEXT, nullable.
  - `status`: application_status, default `planned`.
  - `position`: INT, default 0.
  - `salary_min`: NUMERIC(12,2), nullable.
  - `salary_max`: NUMERIC(12,2), nullable.
  - `salary_currency`: CHAR(3), foreign key referencing `currencies`.
  - `salary_period`: salary_period, nullable.
  - `salary_source_snippet`: VARCHAR(100), nullable.
  - `rejection_reason`: VARCHAR(1000), nullable.
  - `selected_cv_document_id`: UUID, foreign key referencing `documents`.
  - `created_at`: TIMESTAMPTZ, default now().
  - `updated_at`: TIMESTAMPTZ, default now().
  - `version`: INT, default 1.
  - Constraints: Unique on `user_id` and `job_link`, check on salary range.

- **documents**: Stores application documents (CV/cover letter).
  - `id`: UUID, primary key.
  - `user_id`: UUID, foreign key referencing `auth.users`.
  - `application_id`: UUID, foreign key referencing `applications`.
  - `type`: document_type, not null.
  - `title`: VARCHAR(200), nullable.
  - `content`: TEXT, not null.
  - `created_at`: TIMESTAMPTZ, default now().
  - `updated_at`: TIMESTAMPTZ, default now().
  - `version`: INT, default 1.

- **application_notes**: Stores notes related to applications.
  - `id`: UUID, primary key.
  - `user_id`: UUID, foreign key referencing `auth.users`.
  - `application_id`: UUID, foreign key referencing `applications`.
  - `content`: TEXT, not null.
  - `created_at`: TIMESTAMPTZ, default now().

- **status_history**: Tracks status changes for applications.
  - `id`: UUID, primary key.
  - `user_id`: UUID, foreign key referencing `auth.users`.
  - `application_id`: UUID, foreign key referencing `applications`.
  - `to_status`: application_status, not null.
  - `changed_at`: TIMESTAMPTZ, default now().
```

## 2. Relationships

- `auth.users` (1) — (N) `profiles`
- `auth.users` (1) — (N) `skills`
- `profiles` (N) — (M) `skills` via `profile_skills`
- `auth.users` (1) — (N) `applications`
- `profiles` (1) — (N) `applications`
- `applications` (1) — (N) `documents`
- `applications` (1) — (N) `application_notes`
- `applications` (1) — (N) `status_history`
- `currencies` (1) — (N) `applications`/`profiles` (salary currency)
- `documents` (1) — (1) `applications` (selected CV)

## 3. Indexes

- **Profiles**: Index on `user_id`, unique index on `user_id` and `name`.
- **Skills**: Index on `user_id`, unique index on `user_id` and `lower(name)`.
- **Profile Skills**: Indexes on `profile_id` and `skill_id`.
- **Applications**: Indexes on `user_id` and `created_at`, `user_id` and `status`, `user_id`, `status`, and `position`, `profile_id`, unique index on `user_id` and `lower(job_link)`.
- **Documents**: Indexes on `application_id` and `type`, `user_id`.
- **Application Notes**: Indexes on `application_id`, `user_id`.
- **Status History**: Indexes on `application_id` and `changed_at`, `user_id`.

## 4. Row Level Security (RLS)

- **Profiles**: Policies for select, insert, update, and delete based on `user_id`.
- **Skills**: Policies for select, insert, update, and delete based on `user_id`.
- **Profile Skills**: Policies for select, insert, and delete based on existence in `profiles` and `skills`.
- **Applications**: Policies for select, insert, update, and delete based on `user_id` and existence in `profiles`.
- **Documents**: Policies for select, insert, update, and delete based on existence in `applications`.
- **Application Notes & Status History**: Similar policies to `Documents`.

## 5. Additional Notes

- **Triggers**: Functions for setting `updated_at`, incrementing `version`, and validating selected CVs.
- **Extensions**: Use of `uuid-ossp` and `pgcrypto` for UUID generation.
- **Notes**:
  1. Content length validation handled in the application layer.
  2. URL normalization for `job_link` handled in the application layer.
  3. Kanban position management requires periodic reordering in the application layer.
  4. Profile archival/deletion blocked if referenced by applications.
  5. Full text search capabilities to be added later if needed. 