export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  graphql_public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
  public: {
    Tables: {
      application_notes: {
        Row: {
          application_id: string;
          content: string;
          created_at: string | null;
          id: string;
          user_id: string;
        };
        Insert: {
          application_id: string;
          content: string;
          created_at?: string | null;
          id?: string;
          user_id: string;
        };
        Update: {
          application_id?: string;
          content?: string;
          created_at?: string | null;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "application_notes_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
        ];
      };
      applications: {
        Row: {
          company_name: string;
          created_at: string | null;
          id: string;
          job_description: string | null;
          job_link: string;
          position: number | null;
          position_title: string;
          profile_id: string;
          rejection_reason: string | null;
          salary_currency: string | null;
          salary_max: number | null;
          salary_min: number | null;
          salary_period: Database["public"]["Enums"]["salary_period"] | null;
          salary_source_snippet: string | null;
          selected_cv_document_id: string | null;
          status: Database["public"]["Enums"]["application_status"] | null;
          updated_at: string | null;
          user_id: string;
          version: number | null;
        };
        Insert: {
          company_name: string;
          created_at?: string | null;
          id?: string;
          job_description?: string | null;
          job_link: string;
          position?: number | null;
          position_title: string;
          profile_id: string;
          rejection_reason?: string | null;
          salary_currency?: string | null;
          salary_max?: number | null;
          salary_min?: number | null;
          salary_period?: Database["public"]["Enums"]["salary_period"] | null;
          salary_source_snippet?: string | null;
          selected_cv_document_id?: string | null;
          status?: Database["public"]["Enums"]["application_status"] | null;
          updated_at?: string | null;
          user_id: string;
          version?: number | null;
        };
        Update: {
          company_name?: string;
          created_at?: string | null;
          id?: string;
          job_description?: string | null;
          job_link?: string;
          position?: number | null;
          position_title?: string;
          profile_id?: string;
          rejection_reason?: string | null;
          salary_currency?: string | null;
          salary_max?: number | null;
          salary_min?: number | null;
          salary_period?: Database["public"]["Enums"]["salary_period"] | null;
          salary_source_snippet?: string | null;
          selected_cv_document_id?: string | null;
          status?: Database["public"]["Enums"]["application_status"] | null;
          updated_at?: string | null;
          user_id?: string;
          version?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "applications_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applications_salary_currency_fkey";
            columns: ["salary_currency"];
            isOneToOne: false;
            referencedRelation: "currencies";
            referencedColumns: ["code"];
          },
          {
            foreignKeyName: "fk_selected_cv_document";
            columns: ["selected_cv_document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
        ];
      };
      currencies: {
        Row: {
          code: string;
          fraction_digits: number | null;
          name: string;
          numeric_code: number | null;
        };
        Insert: {
          code: string;
          fraction_digits?: number | null;
          name: string;
          numeric_code?: number | null;
        };
        Update: {
          code?: string;
          fraction_digits?: number | null;
          name?: string;
          numeric_code?: number | null;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          application_id: string;
          content: string;
          created_at: string | null;
          id: string;
          title: string | null;
          type: Database["public"]["Enums"]["document_type"];
          updated_at: string | null;
          user_id: string;
          version: number | null;
        };
        Insert: {
          application_id: string;
          content: string;
          created_at?: string | null;
          id?: string;
          title?: string | null;
          type: Database["public"]["Enums"]["document_type"];
          updated_at?: string | null;
          user_id: string;
          version?: number | null;
        };
        Update: {
          application_id?: string;
          content?: string;
          created_at?: string | null;
          id?: string;
          title?: string | null;
          type?: Database["public"]["Enums"]["document_type"];
          updated_at?: string | null;
          user_id?: string;
          version?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "documents_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_skills: {
        Row: {
          created_at: string | null;
          profile_id: string;
          skill_id: string;
        };
        Insert: {
          created_at?: string | null;
          profile_id: string;
          skill_id: string;
        };
        Update: {
          created_at?: string | null;
          profile_id?: string;
          skill_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_skills_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profile_skills_skill_id_fkey";
            columns: ["skill_id"];
            isOneToOne: false;
            referencedRelation: "skills";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string | null;
          id: string;
          is_default: boolean | null;
          master_cv: string | null;
          name: string;
          pref_salary_currency: string | null;
          pref_salary_max: number | null;
          pref_salary_min: number | null;
          pref_salary_period: Database["public"]["Enums"]["salary_period"] | null;
          updated_at: string | null;
          user_id: string;
          version: number | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_default?: boolean | null;
          master_cv?: string | null;
          name: string;
          pref_salary_currency?: string | null;
          pref_salary_max?: number | null;
          pref_salary_min?: number | null;
          pref_salary_period?: Database["public"]["Enums"]["salary_period"] | null;
          updated_at?: string | null;
          user_id: string;
          version?: number | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_default?: boolean | null;
          master_cv?: string | null;
          name?: string;
          pref_salary_currency?: string | null;
          pref_salary_max?: number | null;
          pref_salary_min?: number | null;
          pref_salary_period?: Database["public"]["Enums"]["salary_period"] | null;
          updated_at?: string | null;
          user_id?: string;
          version?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_pref_salary_currency_fkey";
            columns: ["pref_salary_currency"];
            isOneToOne: false;
            referencedRelation: "currencies";
            referencedColumns: ["code"];
          },
        ];
      };
      skills: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      status_history: {
        Row: {
          application_id: string;
          changed_at: string | null;
          id: string;
          to_status: Database["public"]["Enums"]["application_status"];
          user_id: string;
        };
        Insert: {
          application_id: string;
          changed_at?: string | null;
          id?: string;
          to_status: Database["public"]["Enums"]["application_status"];
          user_id: string;
        };
        Update: {
          application_id?: string;
          changed_at?: string | null;
          id?: string;
          to_status?: Database["public"]["Enums"]["application_status"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "status_history_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_generation_logs: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          type: Database["public"]["Enums"]["ai_generation_type"];
          model: string | null;
          prompt_tokens: number | null;
          completion_tokens: number | null;
          total_tokens: number | null;
          latency_ms: number | null;
          status: Database["public"]["Enums"]["ai_generation_status"];
          error_message: string | null;
          output_document_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          type: Database["public"]["Enums"]["ai_generation_type"];
          model?: string | null;
          prompt_tokens?: number | null;
          completion_tokens?: number | null;
          total_tokens?: number | null;
          latency_ms?: number | null;
          status?: Database["public"]["Enums"]["ai_generation_status"];
          error_message?: string | null;
          output_document_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          application_id?: string;
          type?: Database["public"]["Enums"]["ai_generation_type"];
          model?: string | null;
          prompt_tokens?: number | null;
          completion_tokens?: number | null;
          total_tokens?: number | null;
          latency_ms?: number | null;
          status?: Database["public"]["Enums"]["ai_generation_status"];
          error_message?: string | null;
          output_document_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_generation_logs_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ai_generation_logs_output_document_id_fkey";
            columns: ["output_document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      application_status: "planned" | "sent" | "response" | "interview" | "offer" | "rejection";
      document_type: "cv" | "cover_letter";
      salary_period: "monthly" | "yearly" | "hourly";
      ai_generation_type: "generate_cv" | "generate_cover_letter";
      ai_generation_status: "success" | "error";
    };
    CompositeTypes: Record<never, never>;
  };
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      application_status: ["planned", "sent", "response", "interview", "offer", "rejection"],
      document_type: ["cv", "cover_letter"],
      salary_period: ["monthly", "yearly", "hourly"],
      ai_generation_type: ["generate_cv", "generate_cover_letter"],
      ai_generation_status: ["success", "error"],
    },
  },
} as const;
