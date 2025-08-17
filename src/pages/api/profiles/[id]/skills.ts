import type { APIRoute } from "astro";
import { z } from "zod";
import { ProfilesService } from "@/lib/profiles.service";

// Validation schemas
const idSchema = z.string().uuid();
const skillsBodySchema = z.object({
  skill_ids: z.array(z.string().uuid()).min(1).max(200),
});

export const POST: APIRoute = async ({ params, request, locals }): Promise<Response> => {
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

    // Validate profile ID
    const idResult = idSchema.safeParse(params.id);
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
    const bodyResult = skillsBodySchema.safeParse(body);
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

    // Attach skills
    try {
      const service = new ProfilesService(supabase);
      const data = await service.attachSkills(user.id, idResult.data, bodyResult.data.skill_ids);
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
        if (error.message.startsWith("Invalid skill IDs:")) {
          return Response.json(
            {
              data: null,
              error: {
                code: "bad_request",
                message: "One or more skill IDs are invalid",
                details: error.message,
              },
            },
            { status: 400 }
          );
        }
      }
      throw error;
    }
  } catch (error) {
    console.error("Failed to attach skills:", error);
    return Response.json(
      {
        data: null,
        error: {
          code: "server_error",
          message: "Failed to attach skills",
          details: error instanceof Error ? error.message : undefined,
        },
      },
      { status: 500 }
    );
  }
};

export const DELETE: APIRoute = async ({ params, request, locals }): Promise<Response> => {
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

    // Validate profile ID
    const idResult = idSchema.safeParse(params.id);
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
    const bodyResult = skillsBodySchema.safeParse(body);
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

    // Detach skills
    try {
      const service = new ProfilesService(supabase);
      const data = await service.detachSkills(user.id, idResult.data, bodyResult.data.skill_ids);
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
      }
      throw error;
    }
  } catch (error) {
    console.error("Failed to detach skills:", error);
    return Response.json(
      {
        data: null,
        error: {
          code: "server_error",
          message: "Failed to detach skills",
          details: error instanceof Error ? error.message : undefined,
        },
      },
      { status: 500 }
    );
  }
};
