import type { APIRoute } from "astro";
import { z } from "zod";
import { ProfilesService } from "@/lib/profiles.service";

// Query schema for list endpoint
const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  sort_by: z.enum(["created_at", "updated_at", "name"]).optional().default("created_at"),
  sort_dir: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Schema for creating a profile
const currencyRegex = /^[A-Z]{3}$/;
const createProfileSchema = z
  .object({
    name: z.string().min(1).max(120),
    is_default: z.boolean().optional(),
    master_cv: z.string().max(200000).optional(),
    pref_salary_min: z.number().finite().nonnegative().optional(),
    pref_salary_max: z.number().finite().nonnegative().optional(),
    pref_salary_currency: z.string().regex(currencyRegex).optional(),
    pref_salary_period: z.enum(["monthly", "yearly", "hourly"]).optional(),
  })
  .refine((v) => v.pref_salary_min == null || v.pref_salary_max == null || v.pref_salary_min <= v.pref_salary_max, {
    message: "pref_salary_min must be <= pref_salary_max",
    path: ["pref_salary_min"],
  });

export const GET: APIRoute = async ({ url, locals }): Promise<Response> => {
  try {
    // Get supabase client from context
    const supabase = locals.supabase;
    if (!supabase) {
      return Response.json(
        {
          data: null,
          error: { code: "server_error", message: "Database client not initialized" },
        },
        { status: 500 }
      );
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json(
        {
          data: null,
          error: { code: "unauthorized", message: "Authentication required" },
        },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const searchParams = Object.fromEntries(url.searchParams);
    const result = listQuerySchema.safeParse(searchParams);
    if (!result.success) {
      return Response.json(
        {
          data: null,
          error: {
            code: "bad_request",
            message: "Invalid query parameters",
            details: result.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    // Call service to fetch profiles
    const service = new ProfilesService(supabase);
    const data = await service.list(user.id, result.data);

    return Response.json({ data, error: null }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch profiles:", error);
    return Response.json(
      {
        data: null,
        error: {
          code: "server_error",
          message: "Failed to fetch profiles",
          details: error instanceof Error ? error.message : undefined,
        },
      },
      { status: 500 }
    );
  }
};

export const POST: APIRoute = async ({ request, locals }): Promise<Response> => {
  try {
    // Get supabase client from context
    const supabase = locals.supabase;
    if (!supabase) {
      return Response.json(
        {
          data: null,
          error: { code: "server_error", message: "Database client not initialized" },
        },
        { status: 500 }
      );
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json(
        {
          data: null,
          error: { code: "unauthorized", message: "Authentication required" },
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const result = createProfileSchema.safeParse(body);
    if (!result.success) {
      return Response.json(
        {
          data: null,
          error: {
            code: "bad_request",
            message: "Invalid request body",
            details: result.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    // Create profile
    try {
      const service = new ProfilesService(supabase);
      const data = await service.create(user.id, result.data);
      return Response.json({ data, error: null }, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.message === "Profile with this name already exists") {
        return Response.json(
          {
            data: null,
            error: {
              code: "conflict",
              message: "Profile with this name already exists",
            },
          },
          { status: 409 }
        );
      }
      throw error; // Re-throw for general error handling
    }
  } catch (error) {
    console.error("Failed to create profile:", error);
    return Response.json(
      {
        data: null,
        error: {
          code: "server_error",
          message: "Failed to create profile",
          details: error instanceof Error ? error.message : undefined,
        },
      },
      { status: 500 }
    );
  }
};
