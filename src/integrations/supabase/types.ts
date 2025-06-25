export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      checkin_history: {
        Row: {
          bonus_points: number | null
          checkin_date: string
          created_at: string
          id: string
          points_earned: number
          streak_day: number
          wallet_address: string
        }
        Insert: {
          bonus_points?: number | null
          checkin_date?: string
          created_at?: string
          id?: string
          points_earned: number
          streak_day: number
          wallet_address: string
        }
        Update: {
          bonus_points?: number | null
          checkin_date?: string
          created_at?: string
          id?: string
          points_earned?: number
          streak_day?: number
          wallet_address?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_checkin_date: string
          total_points: number
          updated_at: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_checkin_date?: string
          total_points?: number
          updated_at?: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_checkin_date?: string
          total_points?: number
          updated_at?: string
          wallet_address?: string
        }
        Relationships: []
      }
      user_posts: {
        Row: {
          content: string
          created_at: string
          engagement_score: number | null
          id: string
          likes_count: number | null
          points_earned: number | null
          posted_at: string
          replies_count: number | null
          retweets_count: number | null
          wallet_address: string
          x_post_id: string
        }
        Insert: {
          content: string
          created_at?: string
          engagement_score?: number | null
          id?: string
          likes_count?: number | null
          points_earned?: number | null
          posted_at: string
          replies_count?: number | null
          retweets_count?: number | null
          wallet_address: string
          x_post_id: string
        }
        Update: {
          content?: string
          created_at?: string
          engagement_score?: number | null
          id?: string
          likes_count?: number | null
          points_earned?: number | null
          posted_at?: string
          replies_count?: number | null
          retweets_count?: number | null
          wallet_address?: string
          x_post_id?: string
        }
        Relationships: []
      }
      x_accounts: {
        Row: {
          access_token: string
          connected_at: string
          id: string
          refresh_token: string | null
          updated_at: string
          wallet_address: string
          x_display_name: string | null
          x_profile_image_url: string | null
          x_user_id: string
          x_username: string
        }
        Insert: {
          access_token: string
          connected_at?: string
          id?: string
          refresh_token?: string | null
          updated_at?: string
          wallet_address: string
          x_display_name?: string | null
          x_profile_image_url?: string | null
          x_user_id: string
          x_username: string
        }
        Update: {
          access_token?: string
          connected_at?: string
          id?: string
          refresh_token?: string | null
          updated_at?: string
          wallet_address?: string
          x_display_name?: string | null
          x_profile_image_url?: string | null
          x_user_id?: string
          x_username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_checkin_reward: {
        Args: { streak_day: number }
        Returns: {
          base_points: number
          bonus_points: number
        }[]
      }
      has_x_account: {
        Args: { user_wallet_address: string }
        Returns: boolean
      }
      process_daily_checkin: {
        Args: { user_wallet_address: string }
        Returns: {
          success: boolean
          message: string
          points_earned: number
          bonus_points: number
          new_streak: number
          total_points: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
