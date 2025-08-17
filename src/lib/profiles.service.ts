import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import type { ListResult, ProfileDTO, ProfilesListQuery, CreateProfileCommand, UpdateProfileCommand } from "@/types";

export class ProfilesService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async list(userId: string, query: ProfilesListQuery): Promise<ListResult<ProfileDTO>> {
    const { limit = 20, offset = 0, sort_by = "created_at", sort_dir = "desc" } = query;

    // Start query builder
    const queryBuilder = this.supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order(sort_by, { ascending: sort_dir === "asc" })
      .range(offset, offset + limit - 1);

    // Execute query
    const { data: items, count: total, error } = await queryBuilder;

    if (error) {
      throw new Error(`Failed to fetch profiles: ${error.message}`);
    }

    return {
      items: items || [],
      total: total || 0,
    };
  }

  async getById(userId: string, id: string): Promise<ProfileDTO> {
    const { data: profile, error } = await this.supabase
      .from("profiles")
      .select("*, profile_skills(skill_id)")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Profile not found");
      }
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return profile;
  }

  async create(userId: string, cmd: CreateProfileCommand): Promise<ProfileDTO> {
    // Check for duplicate name
    const { data: existing, error: checkError } = await this.supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .eq("name", cmd.name)
      .maybeSingle();

    if (checkError) {
      throw new Error(`Failed to check profile name uniqueness: ${checkError.message}`);
    }

    if (existing) {
      throw new Error("Profile with this name already exists");
    }

    // If is_default is true, reset other profiles' is_default flag
    if (cmd.is_default) {
      const { error: updateError } = await this.supabase
        .from("profiles")
        .update({ is_default: false })
        .eq("user_id", userId);

      if (updateError) {
        throw new Error(`Failed to update default profile flags: ${updateError.message}`);
      }
    }

    // Create new profile
    const { data: profile, error: insertError } = await this.supabase
      .from("profiles")
      .insert({
        ...cmd,
        user_id: userId,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create profile: ${insertError.message}`);
    }

    return profile;
  }

  async update(userId: string, id: string, cmd: UpdateProfileCommand): Promise<ProfileDTO> {
    // Check if profile exists and belongs to user
    const { error: checkError } = await this.supabase
      .from("profiles")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (checkError) {
      if (checkError.code === "PGRST116") {
        throw new Error("Profile not found");
      }
      throw new Error(`Failed to check profile existence: ${checkError.message}`);
    }

    // If name is being updated, check for uniqueness
    if (cmd.name) {
      const { data: nameExists, error: nameError } = await this.supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .eq("name", cmd.name)
        .neq("id", id)
        .maybeSingle();

      if (nameError) {
        throw new Error(`Failed to check profile name uniqueness: ${nameError.message}`);
      }

      if (nameExists) {
        throw new Error("Profile with this name already exists");
      }
    }

    // If is_default is being set to true, reset other profiles
    if (cmd.is_default === true) {
      const { error: updateError } = await this.supabase
        .from("profiles")
        .update({ is_default: false })
        .eq("user_id", userId)
        .neq("id", id);

      if (updateError) {
        throw new Error(`Failed to update default profile flags: ${updateError.message}`);
      }
    }

    // Update profile
    const { data: profile, error: updateError } = await this.supabase
      .from("profiles")
      .update(cmd)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    return profile;
  }

  async remove(userId: string, id: string): Promise<void> {
    // Check if profile exists and belongs to user
    const { data: profile, error: checkError } = await this.supabase
      .from("profiles")
      .select("is_default")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (checkError) {
      if (checkError.code === "PGRST116") {
        throw new Error("Profile not found");
      }
      throw new Error(`Failed to check profile existence: ${checkError.message}`);
    }

    // Check for applications using this profile
    const { count, error: countError } = await this.supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", id);

    if (countError) {
      throw new Error(`Failed to check profile references: ${countError.message}`);
    }

    if (count && count > 0) {
      throw new Error("Profile is referenced by applications");
    }

    // If this is a default profile, check if there are other profiles that can be made default
    if (profile.is_default) {
      const { count: otherProfilesCount, error: otherProfilesError } = await this.supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .neq("id", id);

      if (otherProfilesError) {
        throw new Error(`Failed to check other profiles: ${otherProfilesError.message}`);
      }

      if (otherProfilesCount === 0) {
        throw new Error("Cannot delete the only profile");
      }

      // Make another profile default
      const { error: updateError } = await this.supabase
        .from("profiles")
        .update({ is_default: true })
        .eq("user_id", userId)
        .neq("id", id)
        .limit(1);

      if (updateError) {
        throw new Error(`Failed to update default profile: ${updateError.message}`);
      }
    }

    // Delete profile
    const { error: deleteError } = await this.supabase.from("profiles").delete().eq("id", id).eq("user_id", userId);

    if (deleteError) {
      throw new Error(`Failed to delete profile: ${deleteError.message}`);
    }
  }

  async attachSkills(userId: string, id: string, skillIds: string[]): Promise<{ attached: number }> {
    // Verify profile exists and belongs to user
    const { error: checkError } = await this.supabase
      .from("profiles")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (checkError) {
      if (checkError.code === "PGRST116") {
        throw new Error("Profile not found");
      }
      throw new Error(`Failed to check profile existence: ${checkError.message}`);
    }

    // Verify all skills exist
    const { data: skills, error: skillsError } = await this.supabase.from("skills").select("id").in("id", skillIds);

    if (skillsError) {
      throw new Error(`Failed to verify skills: ${skillsError.message}`);
    }

    const foundSkillIds = skills?.map((s) => s.id) || [];
    const invalidSkillIds = skillIds.filter((id) => !foundSkillIds.includes(id));
    if (invalidSkillIds.length > 0) {
      throw new Error(`Invalid skill IDs: ${invalidSkillIds.join(", ")}`);
    }

    // Get existing profile-skill relationships to avoid duplicates
    const { data: existing, error: existingError } = await this.supabase
      .from("profile_skills")
      .select("skill_id")
      .eq("profile_id", id)
      .in("skill_id", skillIds);

    if (existingError) {
      throw new Error(`Failed to check existing skills: ${existingError.message}`);
    }

    const existingSkillIds = existing?.map((e) => e.skill_id) || [];
    const newSkillIds = skillIds.filter((id) => !existingSkillIds.includes(id));

    if (newSkillIds.length === 0) {
      return { attached: 0 };
    }

    // Create new relationships
    const { error: insertError } = await this.supabase.from("profile_skills").insert(
      newSkillIds.map((skillId) => ({
        profile_id: id,
        skill_id: skillId,
      }))
    );

    if (insertError) {
      throw new Error(`Failed to attach skills: ${insertError.message}`);
    }

    return { attached: newSkillIds.length };
  }

  async detachSkills(userId: string, id: string, skillIds: string[]): Promise<{ detached: number }> {
    // Verify profile exists and belongs to user
    const { error: checkError } = await this.supabase
      .from("profiles")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (checkError) {
      if (checkError.code === "PGRST116") {
        throw new Error("Profile not found");
      }
      throw new Error(`Failed to check profile existence: ${checkError.message}`);
    }

    // Delete relationships
    const { error: deleteError } = await this.supabase
      .from("profile_skills")
      .delete()
      .eq("profile_id", id)
      .in("skill_id", skillIds);

    if (deleteError) {
      throw new Error(`Failed to detach skills: ${deleteError.message}`);
    }

    // Get count of affected rows (Supabase doesn't return count on delete)
    const { count, error: countError } = await this.supabase
      .from("profile_skills")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", id)
      .in("skill_id", skillIds);

    if (countError) {
      throw new Error(`Failed to count detached skills: ${countError.message}`);
    }

    return { detached: count || 0 };
  }
}
