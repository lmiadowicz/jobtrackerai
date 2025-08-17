-- Migration: Initial schema setup for JobTrackAI
-- Purpose: Create all tables, enums, and security policies as defined in db-plan.md
-- Date: 2024-03-19 16:30:00 UTC

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create enum types
create type application_status as enum (
    'planned',
    'sent',
    'response',
    'interview',
    'offer',
    'rejection'
);

create type salary_period as enum (
    'monthly',
    'yearly',
    'hourly'
);

create type document_type as enum (
    'cv',
    'cover_letter'
);

-- Create currencies table
create table currencies (
    code char(3) primary key,
    name text not null,
    numeric_code smallint,
    fraction_digits smallint
);

comment on table currencies is 'Stores currency information based on ISO-4217';

-- Enable RLS
alter table currencies enable row level security;

-- Create RLS policies for currencies (public read-only access)
create policy "Allow public read access to currencies"
    on currencies for select
    to anon
    using (true);

create policy "Allow authenticated read access to currencies"
    on currencies for select
    to authenticated
    using (true);

-- Create profiles table
create table profiles (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users not null,
    name varchar(120) not null,
    is_default boolean default false,
    master_cv text,
    pref_salary_min numeric(12,2),
    pref_salary_max numeric(12,2),
    pref_salary_currency char(3) references currencies(code),
    pref_salary_period salary_period,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    version int default 1,
    constraint unique_user_profile_name unique (user_id, name),
    constraint valid_salary_range check (
        (pref_salary_min is null and pref_salary_max is null) or
        (pref_salary_min <= pref_salary_max)
    )
);

comment on table profiles is 'Represents user profiles for job applications';

-- Enable RLS
alter table profiles enable row level security;

-- Create RLS policies for profiles
create policy "Users can view their own profiles"
    on profiles for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can create their own profiles"
    on profiles for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own profiles"
    on profiles for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own profiles"
    on profiles for delete
    to authenticated
    using (auth.uid() = user_id);

-- Create skills table
create table skills (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users not null,
    name varchar(80) not null,
    created_at timestamptz default now()
);

-- Create a unique functional index for case-insensitive skill names per user
create unique index unique_user_skill_name on skills (user_id, lower(name));

comment on table skills is 'User-specific skills dictionary';

-- Enable RLS
alter table skills enable row level security;

-- Create RLS policies for skills
create policy "Users can view their own skills"
    on skills for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can create their own skills"
    on skills for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own skills"
    on skills for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own skills"
    on skills for delete
    to authenticated
    using (auth.uid() = user_id);

-- Create profile_skills table
create table profile_skills (
    profile_id uuid references profiles on delete cascade,
    skill_id uuid references skills on delete cascade,
    created_at timestamptz default now(),
    primary key (profile_id, skill_id)
);

comment on table profile_skills is 'Mapping table for profiles and skills (N:M)';

-- Enable RLS
alter table profile_skills enable row level security;

-- Create RLS policies for profile_skills
create policy "Users can view their profile skills"
    on profile_skills for select
    to authenticated
    using (
        exists (
            select 1 from profiles
            where profiles.id = profile_id
            and profiles.user_id = auth.uid()
        )
    );

create policy "Users can create their profile skills"
    on profile_skills for insert
    to authenticated
    with check (
        exists (
            select 1 from profiles
            where profiles.id = profile_id
            and profiles.user_id = auth.uid()
        )
    );

create policy "Users can delete their profile skills"
    on profile_skills for delete
    to authenticated
    using (
        exists (
            select 1 from profiles
            where profiles.id = profile_id
            and profiles.user_id = auth.uid()
        )
    );

-- Create applications table
create table applications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users not null,
    profile_id uuid references profiles not null,
    company_name varchar(200) not null,
    position_title varchar(150) not null,
    job_link text not null,
    job_description text,
    status application_status default 'planned',
    position int default 0,
    salary_min numeric(12,2),
    salary_max numeric(12,2),
    salary_currency char(3) references currencies(code),
    salary_period salary_period,
    salary_source_snippet varchar(100),
    rejection_reason varchar(1000),
    selected_cv_document_id uuid,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    version int default 1,
    constraint valid_salary_range check (
        (salary_min is null and salary_max is null) or
        (salary_min <= salary_max)
    )
);

-- Create a unique functional index for case-insensitive job links per user
create unique index unique_user_job_link on applications (user_id, lower(job_link));

comment on table applications is 'Represents job applications';

-- Enable RLS
alter table applications enable row level security;

-- Create RLS policies for applications
create policy "Users can view their own applications"
    on applications for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can create their own applications"
    on applications for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own applications"
    on applications for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own applications"
    on applications for delete
    to authenticated
    using (auth.uid() = user_id);

-- Create documents table
create table documents (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users not null,
    application_id uuid references applications not null,
    type document_type not null,
    title varchar(200),
    content text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    version int default 1
);

comment on table documents is 'Stores application documents (CV/cover letter)';

-- Enable RLS
alter table documents enable row level security;

-- Create RLS policies for documents
create policy "Users can view their own documents"
    on documents for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can create their own documents"
    on documents for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own documents"
    on documents for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own documents"
    on documents for delete
    to authenticated
    using (auth.uid() = user_id);

-- Add foreign key constraint for selected_cv_document_id after documents table is created
alter table applications
add constraint fk_selected_cv_document
foreign key (selected_cv_document_id)
references documents(id);

-- Create application_notes table
create table application_notes (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users not null,
    application_id uuid references applications not null,
    content text not null,
    created_at timestamptz default now()
);

comment on table application_notes is 'Stores notes related to applications';

-- Enable RLS
alter table application_notes enable row level security;

-- Create RLS policies for application_notes
create policy "Users can view their own application notes"
    on application_notes for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can create their own application notes"
    on application_notes for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can delete their own application notes"
    on application_notes for delete
    to authenticated
    using (auth.uid() = user_id);

-- Create status_history table
create table status_history (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users not null,
    application_id uuid references applications not null,
    to_status application_status not null,
    changed_at timestamptz default now()
);

comment on table status_history is 'Tracks status changes for applications';

-- Enable RLS
alter table status_history enable row level security;

-- Create RLS policies for status_history
create policy "Users can view their own status history"
    on status_history for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can create their own status history"
    on status_history for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Create indexes
create index idx_profiles_user_id on profiles(user_id);
create index idx_skills_user_id on skills(user_id);
create index idx_profile_skills_profile_id on profile_skills(profile_id);
create index idx_profile_skills_skill_id on profile_skills(skill_id);
create index idx_applications_user_id_created_at on applications(user_id, created_at);
create index idx_applications_user_id_status on applications(user_id, status);
create index idx_applications_user_id_status_position on applications(user_id, status, position);
create index idx_applications_profile_id on applications(profile_id);
create index idx_documents_application_id_type on documents(application_id, type);
create index idx_documents_user_id on documents(user_id);
create index idx_application_notes_application_id on application_notes(application_id);
create index idx_application_notes_user_id on application_notes(user_id);
create index idx_status_history_application_id_changed_at on status_history(application_id, changed_at);
create index idx_status_history_user_id on status_history(user_id);

-- Create triggers for updated_at and version
create or replace function update_updated_at_and_version()
returns trigger
security definer
set search_path = ''
as $$
begin
    new.updated_at = now();
    new.version = old.version + 1;
    return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at_version
    before update on profiles
    for each row
    execute function update_updated_at_and_version();

create trigger update_applications_updated_at_version
    before update on applications
    for each row
    execute function update_updated_at_and_version();

create trigger update_documents_updated_at_version
    before update on documents
    for each row
    execute function update_updated_at_and_version();

-- Create trigger for validating selected CV
create or replace function validate_selected_cv()
returns trigger
security definer
set search_path = ''
as $$
begin
    if new.selected_cv_document_id is not null then
        if not exists (
            select 1 from public.documents
            where id = new.selected_cv_document_id
            and application_id = new.id
            and type = 'cv'
        ) then
            raise exception 'Selected CV must belong to this application and be of type CV';
        end if;
    end if;
    return new;
end;
$$ language plpgsql;

create trigger validate_selected_cv_before_insert_update
    before insert or update of selected_cv_document_id on applications
    for each row
    execute function validate_selected_cv(); 