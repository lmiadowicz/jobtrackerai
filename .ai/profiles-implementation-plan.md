# API Endpoint Implementation Plan: Profiles (/api/profiles)

## 1. Przegląd punktu końcowego
Zestaw endpointów do zarządzania profilami użytkownika. Wspiera listowanie, tworzenie, odczyt, aktualizację, usuwanie oraz zarządzanie powiązaniami ze „skills”. Każda operacja działa w kontekście zalogowanego użytkownika (scope per-user) z zachowaniem ograniczeń integralności i unikalności nazw.

Obsługiwane ścieżki:
- GET `/api/profiles`
- POST `/api/profiles`
- GET `/api/profiles/:id`
- PUT `/api/profiles/:id`
- DELETE `/api/profiles/:id`
- POST `/api/profiles/:id/skills`
- DELETE `/api/profiles/:id/skills`

## 2. Szczegóły żądania
- Metody HTTP i URL: jw.
- Autoryzacja: Wymagana. Kontekst użytkownika pobieramy z `context.locals.supabase.auth.getUser()`.

### GET /api/profiles
- Parametry zapytania:
  - Wymagane: —
  - Opcjonalne: `limit` (1..100, domyślnie 20), `offset` (>=0, domyślnie 0), `sort_by` w {`created_at`,`updated_at`,`name`} (domyślnie `created_at`), `sort_dir` w {`asc`,`desc`} (domyślnie `desc`).
- Body: brak.

### POST /api/profiles
- Body (JSON):
  - Wymagane: `name: string` (1..120)
  - Opcjonalne: `is_default?: boolean`, `master_cv?: string`, `pref_salary_min?: number`, `pref_salary_max?: number`, `pref_salary_currency?: string` (ISO 4217, 3 znaki), `pref_salary_period?: "monthly"|"yearly"|"hourly"`
- Zasady:
  - `name` unikalny w obrębie użytkownika (`user_id` + `name`).
  - Jeżeli `is_default` = true, należy wyzerować `is_default` w innych profilach użytkownika (transakcja/konsekwencja).
  - Walidacja zakresu wynagrodzeń: `pref_salary_min <= pref_salary_max` (jeśli oba podane) oraz zgodność z `pref_salary_currency` i `pref_salary_period`.

### GET /api/profiles/:id
- Parametry ścieżki: `id: uuid` (należy do zalogowanego użytkownika).
- Body: brak.

### PUT /api/profiles/:id
- Body (JSON): wszystkie pola jak w POST opcjonalne.
- Zasady: jak w POST; aktualizacja respektuje unikalność nazwy oraz zasady default i zakresy wynagrodzeń; inkrementacja `updated_at` (DB trigger/kolumna) i ewentualnie `version` jeśli używana.

### DELETE /api/profiles/:id
- Parametry ścieżki: `id: uuid`
- Zasady: blokada usunięcia, jeśli profil jest referencjonowany przez `applications` (FK lub sprawdzenie count>0). Jeżeli profil jest domyślny, usunięcie dozwolone tylko jeśli istnieje inny profil, który można uczynić domyślnym (opcjonalna reguła – jeśli nie określono, po prostu dozwolone, ale aplikacje blokują).

### POST /api/profiles/:id/skills
- Body: `{ "skill_ids": string[] }` (uuid[])
- Zasady: operacja idempotentna; tworzy brakujące powiązania w `profile_skills`, ignorując istniejące.

### DELETE /api/profiles/:id/skills
- Body: `{ "skill_ids": string[] }`
- Zasady: usuwa wskazane powiązania; brakujące są ignorowane; wynik zawiera liczbę `detached`.

## 3. Wykorzystywane typy
- DTO:
  - `ProfileDTO` (`Tables<"profiles">`) – model odczytu
  - `ListResult<ProfileDTO>` i `ApiResponse<T>` – koperta odpowiedzi
- Command modele (z `src/types.ts`):
  - `ProfilesListQuery`
  - `CreateProfileCommand`
  - `UpdateProfileCommand`
  - `AttachProfileSkillsCommand`
  - `DetachProfileSkillsCommand`

## 3. Szczegóły odpowiedzi
- Koperta: `{ data: T, error: null }` lub `{ data: null, error: { code, message, details? } }`
- Kody statusu:
  - 200: sukces odczytu/aktualizacji/usunięcia
  - 201: sukces tworzenia
  - 400: walidacja/nieprawidłowe wejście
  - 401: brak autoryzacji
  - 404: zasób nie istnieje (lub nie należy do użytkownika)
  - 409: konflikt (duplikat nazwy, referencje przy DELETE)
  - 500: błąd serwera/DB

Przykłady:
- List: `{ "data": { "items": Profile[], "total": number }, "error": null }`
- Create: `{ "data": Profile, "error": null }`
- Attach skills: `{ "data": { "attached": number }, "error": null }`

## 4. Przepływ danych
- Warstwa API (Astro endpointy w `src/pages/api/profiles`...):
  1. Pobierz `supabase` z `context.locals` i użytkownika: `supabase.auth.getUser()`.
  2. Waliduj query/body przez `zod` (spójnie z `ai-logs` handlerem).
  3. Wywołaj serwis `ProfilesService` (w `src/lib/profiles.service.ts`) z przekazaniem `supabase` oraz `user.id`.
  4. Serwis wykonuje zapytania do DB (`from("profiles")`, `from("profile_skills")`, `from("skills")`, `from("applications")`).
  5. Zwróć wynik w kopercie `ApiResponse<T>`.

- Dodatkowe uwagi:
  - Sortowanie i paginacja wykonywane po stronie DB (`order`, `range`, `count: "exact"`).
  - Operacje idempotentne na `profile_skills`: najpierw pobrać istniejące relacje, policzyć różnicę, wykonać upsert/insert, obsłużyć konflikty.
  - Integralność: `DELETE` musi sprawdzić referencje w `applications` przed usunięciem.

## 5. Względy bezpieczeństwa
- Autoryzacja: obowiązkowa; wszystkie zapytania filtrowane po `user_id = currentUserId`.
- Brak ujawniania innych danych użytkowników (zawsze where `user_id`).
- Walidacja wejścia: ścisła (typy, zakresy, długości, enumy, ISO 4217).
- Ochrona przed nadpisaniem: `PUT` nie pozwala zmienić `user_id`, `id`, `created_at`, itp.
- Idempotencja: operacje skills są bezpieczne na powtórne próby.
- Ograniczenie `limit` (max 100) i sanity checks dla `offset`.

## 6. Obsługa błędów
- Mapowanie:
  - Brak `supabase`: 500 `server_error`.
  - Brak użytkownika: 401 `unauthorized`.
  - Walidacja `zod`: 400 `bad_request` z `details` = `flatten()`.
  - Konflikt nazwy przy POST/PUT: 409 `conflict` (wykrycie przez kod DB lub wstępne sprawdzenie `select` + `neq(id)`).
  - DELETE z referencjami `applications`: 409 `conflict` z komunikatem „Profile referenced by applications”.
  - Nie znaleziono zasobu (id nie należy do usera): 404 `not_found`.
  - Błędy DB: 500 `db_error` z `details`.

## 7. Rozważania dotyczące wydajności
- Indeksy: `profiles(user_id, name)` (unikalny już istnieje per spec), rozważ indeks `profiles(user_id, created_at)` oraz `profiles(user_id, updated_at)`, `profiles(user_id, name)` dla sortowań.
- Paginate przez `range(offset, offset+limit-1)` i `count: "exact"` (świadomi kosztu – w razie potrzeby można przełączyć na `planned`/`estimated`).
- Batch insert dla skills (jedno `insert` z tablicą wartości). Unikaj N+1: nie ma joinów poza prostymi, więc OK.
- Minimalizuj payload (zwracamy wyłącznie kolumny tabeli).

## 8. Etapy wdrożenia
1. Struktura plików:
   - `src/pages/api/profiles/index.ts` – obsługa GET, POST.
   - `src/pages/api/profiles/[id].ts` – obsługa GET, PUT, DELETE.
   - `src/pages/api/profiles/[id]/skills.ts` – obsługa POST, DELETE.
   - `src/lib/profiles.service.ts` – logika bazodanowa.
2. Typy i DTO:
   - Upewnić się, że w `src/types.ts` istnieją: `ProfileDTO`, `ProfilesListQuery`, `CreateProfileCommand`, `UpdateProfileCommand`, `AttachProfileSkillsCommand`, `DetachProfileSkillsCommand`, `ProfilesListResponse`. Jeśli brakuje, dodać (są już zdefiniowane w repo).
3. Walidacja (`zod`):
   - Query schema dla listy: `limit`, `offset`, `sort_by`, `sort_dir`.
   - Body schema dla POST/PUT: długości, enumy, zakresy, ISO 4217 (`/^[A-Z]{3}$/`). Warunek `pref_salary_min <= pref_salary_max` jeśli oba.
   - Skills schema: tablica `uuid` niepusta (max np. 200 na żądanie).
4. Serwis `ProfilesService` (interfejs):
   - `list(userId: string, query: ProfilesListQuery): Promise<ListResult<ProfileDTO>>`
   - `create(userId: string, cmd: CreateProfileCommand): Promise<ProfileDTO>`
   - `getById(userId: string, id: string): Promise<ProfileDTO | null>`
   - `update(userId: string, id: string, cmd: UpdateProfileCommand): Promise<ProfileDTO | null>`
   - `remove(userId: string, id: string): Promise<{ ok: true }>`
   - `attachSkills(userId: string, id: string, skillIds: string[]): Promise<{ attached: number }>`
   - `detachSkills(userId: string, id: string, skillIds: string[]): Promise<{ detached: number }>`
   - Konstrukcja serwisu z dostępem do `supabase` (przekazanie w konstruktorze lub per-metodę).
5. Implementacja endpointów (spójnie ze stylem `ai-logs.ts`):
   - Pobieranie `supabase` i `user` + wczesne wyjścia (guard clauses).
   - `Response.json({ data: ..., error: null }, { status })` przy sukcesie.
   - Mapowanie błędów na kody wg sekcji 6.
6. Logika `is_default`:
   - Przy `create` z `is_default = true`: w transakcji semantycznej – najpierw wyzerować `is_default` dla wszystkich profili usera, potem wstawić nowy z `is_default = true`.
   - Przy `update` z `is_default = true`: wyzerować inne; przy `false` – dozwolone (można mieć brak profilu domyślnego).
   - Jeśli Supabase nie wspiera transakcji wielozapytaniowych w tym kliencie, zapewnić spójność poprzez kolejne zapytania i obsługę konfliktów (ryzyko wyścigu minimalizowane przez unikalność + ewentualne blokady Future/TODO).
7. Unikalność `name` per user:
   - Sprawdzić istnienie `select` z `eq(user_id, userId)` i `eq(name, cmd.name)` i przy `update` dodać `neq(id, currentId)`; w razie konfliktu zwrócić 409.
   - Alternatywnie przechwycić błąd klucza unikalnego i zmapować na 409.
8. DELETE referencje:
   - Przed usunięciem: `select count(*) from applications where profile_id = :id`. Jeśli `>0` → 409.
9. Testy manualne przez `curl`/REST Client oraz e2e (opcjonalnie):
   - Scenariusze: tworzenie, duplikat nazwy, listowanie z paginacją i sortami, aktualizacja default, usunięcie z referencją (409), operacje skills idempotentne.
10. Dokumentacja (README/Insomnia):
   - Przykładowe requesty i odpowiedzi dla każdego endpointu.

## 9. Schematy Zod (szkic)
- Query listy:
```ts
const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  sort_by: z.enum(["created_at", "updated_at", "name"]).optional().default("created_at"),
  sort_dir: z.enum(["asc", "desc"]).optional().default("desc"),
});
```
- Body POST/PUT:
```ts
const currencyRegex = /^[A-Z]{3}$/;
const createProfileSchema = z.object({
  name: z.string().min(1).max(120),
  is_default: z.boolean().optional(),
  master_cv: z.string().max(200000).optional(),
  pref_salary_min: z.number().finite().nonnegative().optional(),
  pref_salary_max: z.number().finite().nonnegative().optional(),
  pref_salary_currency: z.string().regex(currencyRegex).optional(),
  pref_salary_period: z.enum(["monthly", "yearly", "hourly"]).optional(),
}).refine((v) => (v.pref_salary_min == null || v.pref_salary_max == null) || v.pref_salary_min <= v.pref_salary_max, {
  message: "pref_salary_min must be <= pref_salary_max",
  path: ["pref_salary_min"],
});
const updateProfileSchema = createProfileSchema.partial();
```
- Skills body:
```ts
const skillsBodySchema = z.object({
  skill_ids: z.array(z.string().uuid()).min(1).max(200),
});
```

## 10. Mapowanie odpowiedzi
- Sukces listy: 200 `{ data: { items, total }, error: null }`
- Sukces tworzenia: 201 `{ data: profile, error: null }`
- Sukces odczytu/aktualizacji/usunięcia: 200
- Błędy zgodnie z sekcjami 5–6. 