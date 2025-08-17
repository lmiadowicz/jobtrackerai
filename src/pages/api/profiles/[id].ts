import type { APIRoute } from "astro";
import { z } from "zod";
import { ProfilesService } from "@/lib/profiles.service";

// Validation schemas
const getByIdSchema = z.string().uuid();

const currencyRegex = /^[A-Z]{3}$/;
const updateProfileSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
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

export const GET: APIRoute = async ({ params, locals }): Promise<Response> => {
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

    // Validate ID parameter
    const result = getByIdSchema.safeParse(params.id);
    if (!result.success) {
      return Response.json(
        {
          data: null,
          error: {
            code: "bad_request",
            message: "Invalid profile ID",
            details: result.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    // Fetch profile
    try {
      const service = new ProfilesService(supabase);
      const data = await service.getById(user.id, result.data);
      return Response.json({ data, error: null }, { status: 200 });
    } catch (error) {
      if (error instanceof Error && error.message === "Profile not found") {
        return Response.json(
          {
            data: null,
            error: { code: "not_found", message: "Profile not found" },
          },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return Response.json(
      {
        data: null,
        error: {
          code: "server_error",
          message: "Failed to fetch profile",
          details: error instanceof Error ? error.message : undefined,
        },
      },
      { status: 500 }
    );
  }
};

export const PUT: APIRoute = async ({ params, request, locals }): Promise<Response> => {
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

    // Validate ID parameter
    const idResult = getByIdSchema.safeParse(params.id);
    if (!idResult.success) {
      return Response.json(
        {
          data: null,
          error: {
            code: "bad_request",
            message: "Invalid profile ID",
            details: idResult.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const bodyResult = updateProfileSchema.safeParse(body);
    if (!bodyResult.success) {
      return Response.json(
        {
          data: null,
          error: {
            code: "bad_request",
            message: "Invalid request body",
            details: bodyResult.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    // Update profile
    try {
      const service = new ProfilesService(supabase);
      const data = await service.update(user.id, idResult.data, bodyResult.data);
      return Response.json({ data, error: null }, { status: 200 });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Profile not found") {
          return Response.json(
            {
              data: null,
              error: { code: "not_found", message: "Profile not found" },
            },
            { status: 404 }
          );
        }
        if (error.message === "Profile with this name already exists") {
          return Response.json(
            {
              data: null,
              error: { code: "conflict", message: "Profile with this name already exists" },
            },
            { status: 409 }
          );
        }
      }
      throw error;
    }
  } catch (error) {
    console.error("Failed to update profile:", error);
    return Response.json(
      {
        data: null,
        error: {
          code: "server_error",
          message: "Failed to update profile",
          details: error instanceof Error ? error.message : undefined,
        },
      },
      { status: 500 }
    );
  }
};

export const DELETE: APIRoute = async ({ params, locals }): Promise<Response> => {
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

    // Validate ID parameter
    const result = getByIdSchema.safeParse(params.id);
    if (!result.success) {
      return Response.json(
        {
          data: null,
          error: {
            code: "bad_request",
            message: "Invalid profile ID",
            details: result.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    // Delete profile
    try {
      const service = new ProfilesService(supabase);
      await service.remove(user.id, result.data);
      return Response.json({ data: { ok: true }, error: null }, { status: 200 });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Profile not found") {
          return Response.json(
            {
              data: null,
              error: { code: "not_found", message: "Profile not found" },
            },
            { status: 404 }
          );
        }
        if (error.message === "Profile is referenced by applications") {
          return Response.json(
            {
              data: null,
              error: {
                code: "conflict",
                message: "Cannot delete profile that is referenced by applications",
              },
            },
            { status: 409 }
          );
        }
        if (error.message === "Cannot delete the only profile") {
          return Response.json(
            {
              data: null,
              error: {
                code: "conflict",
                message: "Cannot delete the only profile",
              },
            },
            { status: 409 }
          );
        }
      }
      throw error;
    }
  } catch (error) {
    console.error("Failed to delete profile:", error);
    return Response.json(
      {
        data: null,
        error: {
          code: "server_error",
          message: "Failed to delete profile",
          details: error instanceof Error ? error.message : undefined,
        },
      },
      { status: 500 }
    );
  }
};
