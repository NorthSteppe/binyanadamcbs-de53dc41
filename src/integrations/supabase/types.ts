export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      act_matrix_entries: {
        Row: {
          avoidance_behaviours: string
          committed_actions: string
          created_at: string
          filled_by: string
          id: string
          internal_obstacles: string
          notes: string
          user_id: string
          values_text: string
        }
        Insert: {
          avoidance_behaviours?: string
          committed_actions?: string
          created_at?: string
          filled_by: string
          id?: string
          internal_obstacles?: string
          notes?: string
          user_id: string
          values_text?: string
        }
        Update: {
          avoidance_behaviours?: string
          committed_actions?: string
          created_at?: string
          filled_by?: string
          id?: string
          internal_obstacles?: string
          notes?: string
          user_id?: string
          values_text?: string
        }
        Relationships: []
      }
      assistant_collected_data: {
        Row: {
          conversation_id: string
          created_at: string
          field_name: string
          field_value: string
          id: string
          source: string
          user_id: string | null
        }
        Insert: {
          conversation_id: string
          created_at?: string
          field_name: string
          field_value?: string
          id?: string
          source?: string
          user_id?: string | null
        }
        Update: {
          conversation_id?: string
          created_at?: string
          field_name?: string
          field_value?: string
          id?: string
          source?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assistant_collected_data_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "assistant_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_config: {
        Row: {
          auto_popup_delay_seconds: number
          collect_data_fields: Json
          created_at: string
          id: string
          is_enabled: boolean
          system_prompt: string
          updated_at: string
          user_greeting: string
          visitor_greeting: string
        }
        Insert: {
          auto_popup_delay_seconds?: number
          collect_data_fields?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          system_prompt?: string
          updated_at?: string
          user_greeting?: string
          visitor_greeting?: string
        }
        Update: {
          auto_popup_delay_seconds?: number
          collect_data_fields?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          system_prompt?: string
          updated_at?: string
          user_greeting?: string
          visitor_greeting?: string
        }
        Relationships: []
      }
      assistant_conversations: {
        Row: {
          created_at: string
          flow_id: string | null
          id: string
          messages: Json
          source_page: string
          status: string
          updated_at: string
          user_id: string | null
          visitor_fingerprint: string | null
        }
        Insert: {
          created_at?: string
          flow_id?: string | null
          id?: string
          messages?: Json
          source_page?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          visitor_fingerprint?: string | null
        }
        Update: {
          created_at?: string
          flow_id?: string | null
          id?: string
          messages?: Json
          source_page?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          visitor_fingerprint?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assistant_conversations_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "assistant_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_flows: {
        Row: {
          created_at: string
          created_by: string
          description: string
          display_order: number
          flow_steps: Json
          id: string
          is_active: boolean
          name: string
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string
          display_order?: number
          flow_steps?: Json
          id?: string
          is_active?: boolean
          name: string
          trigger_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          display_order?: number
          flow_steps?: Json
          id?: string
          is_active?: boolean
          name?: string
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      assistant_knowledge: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content?: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_authors: {
        Row: {
          avatar_url: string | null
          bio: string
          created_at: string
          id: string
          name: string
          role: string
          slug: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          id?: string
          name: string
          role?: string
          slug: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          id?: string
          name?: string
          role?: string
          slug?: string
          user_id?: string | null
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string
          display_order: number
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_post_tags: {
        Row: {
          id: string
          post_id: string
          tag_id: string
        }
        Insert: {
          id?: string
          post_id: string
          tag_id: string
        }
        Update: {
          id?: string
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          abstract: string
          audience: string
          author_id: string | null
          category_id: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          id: string
          is_featured: boolean
          is_practical_priority: boolean
          meta_description: string
          meta_title: string
          og_image_url: string | null
          published_at: string | null
          reading_time_minutes: number
          scheduled_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          abstract?: string
          audience?: string
          author_id?: string | null
          category_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          is_practical_priority?: boolean
          meta_description?: string
          meta_title?: string
          og_image_url?: string | null
          published_at?: string | null
          reading_time_minutes?: number
          scheduled_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          abstract?: string
          audience?: string
          author_id?: string | null
          category_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          is_practical_priority?: boolean
          meta_description?: string
          meta_title?: string
          og_image_url?: string | null
          published_at?: string | null
          reading_time_minutes?: number
          scheduled_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "blog_authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      business_entries: {
        Row: {
          amount_cents: number
          category: string
          client_id: string | null
          created_at: string
          created_by: string
          description: string
          entry_date: string
          entry_type: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          category?: string
          client_id?: string | null
          created_at?: string
          created_by: string
          description?: string
          entry_date?: string
          entry_type?: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          category?: string
          client_id?: string | null
          created_at?: string
          created_by?: string
          description?: string
          entry_date?: string
          entry_type?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      business_plans: {
        Row: {
          content: string
          created_at: string
          created_by: string
          goals: Json
          id: string
          shared_with_team: boolean
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          created_by: string
          goals?: Json
          id?: string
          shared_with_team?: boolean
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          goals?: Json
          id?: string
          shared_with_team?: boolean
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      calendar_shares: {
        Row: {
          can_view_focus: boolean
          can_view_sessions: boolean
          can_view_tasks: boolean
          created_at: string
          id: string
          owner_id: string
          shared_with_id: string
        }
        Insert: {
          can_view_focus?: boolean
          can_view_sessions?: boolean
          can_view_tasks?: boolean
          created_at?: string
          id?: string
          owner_id: string
          shared_with_id: string
        }
        Update: {
          can_view_focus?: boolean
          can_view_sessions?: boolean
          can_view_tasks?: boolean
          created_at?: string
          id?: string
          owner_id?: string
          shared_with_id?: string
        }
        Relationships: []
      }
      client_assignments: {
        Row: {
          assignee_id: string
          client_id: string
          created_at: string
          id: string
        }
        Insert: {
          assignee_id: string
          client_id: string
          created_at?: string
          id?: string
        }
        Update: {
          assignee_id?: string
          client_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      client_documents: {
        Row: {
          client_id: string | null
          created_at: string
          file_name: string
          file_type: string
          file_url: string
          id: string
          manual_client_id: string | null
          notes: string
          uploaded_by: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          file_name: string
          file_type?: string
          file_url: string
          id?: string
          manual_client_id?: string | null
          notes?: string
          uploaded_by: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          manual_client_id?: string | null
          notes?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_manual_client_id_fkey"
            columns: ["manual_client_id"]
            isOneToOne: false
            referencedRelation: "manual_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_journal_entries: {
        Row: {
          client_id: string
          content: string
          created_at: string
          id: string
          is_shared_with_therapist: boolean
          mood: string
          related_session_id: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          content?: string
          created_at?: string
          id?: string
          is_shared_with_therapist?: boolean
          mood?: string
          related_session_id?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          content?: string
          created_at?: string
          id?: string
          is_shared_with_therapist?: boolean
          mood?: string
          related_session_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      client_notes: {
        Row: {
          author_id: string
          category: string
          client_id: string | null
          content: string
          created_at: string
          id: string
          manual_client_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category?: string
          client_id?: string | null
          content?: string
          created_at?: string
          id?: string
          manual_client_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string
          client_id?: string | null
          content?: string
          created_at?: string
          id?: string
          manual_client_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_manual_client_id_fkey"
            columns: ["manual_client_id"]
            isOneToOne: false
            referencedRelation: "manual_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_overview: {
        Row: {
          client_id: string
          created_at: string
          internal_summary: string
          risk_level: string
          risk_note: string
          stage: string
          tags: string[]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          internal_summary?: string
          risk_level?: string
          risk_note?: string
          stage?: string
          tags?: string[]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          internal_summary?: string
          risk_level?: string
          risk_note?: string
          stage?: string
          tags?: string[]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      client_pathway_steps: {
        Row: {
          client_id: string
          completed_at: string | null
          created_at: string
          description: string
          display_order: number
          icon: string
          id: string
          label: string
          link: string
          notes: string
          pathway_kind: string
          status: string
          step_type: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          created_at?: string
          description?: string
          display_order?: number
          icon?: string
          id?: string
          label: string
          link?: string
          notes?: string
          pathway_kind?: string
          status?: string
          step_type?: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string
          display_order?: number
          icon?: string
          id?: string
          label?: string
          link?: string
          notes?: string
          pathway_kind?: string
          status?: string
          step_type?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_pathway_steps_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "pathway_step_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profile_extras: {
        Row: {
          child_name: string
          client_id: string
          created_at: string
          date_of_birth: string | null
          diagnosis: string
          email: string
          notes: string
          parent_name: string
          phone: string
          photo_url: string
          updated_at: string
        }
        Insert: {
          child_name?: string
          client_id: string
          created_at?: string
          date_of_birth?: string | null
          diagnosis?: string
          email?: string
          notes?: string
          parent_name?: string
          phone?: string
          photo_url?: string
          updated_at?: string
        }
        Update: {
          child_name?: string
          client_id?: string
          created_at?: string
          date_of_birth?: string | null
          diagnosis?: string
          email?: string
          notes?: string
          parent_name?: string
          phone?: string
          photo_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_todos: {
        Row: {
          client_id: string | null
          created_at: string
          created_by: string
          description: string
          due_date: string | null
          id: string
          is_completed: boolean
          manual_client_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          created_by: string
          description?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean
          manual_client_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          created_by?: string
          description?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean
          manual_client_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_todos_manual_client_id_fkey"
            columns: ["manual_client_id"]
            isOneToOne: false
            referencedRelation: "manual_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_entries: {
        Row: {
          client_id: string | null
          created_at: string
          entry_data: Json
          entry_date: string
          filled_by: string
          id: string
          manual_client_id: string | null
          notes: string
          tool_type: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          entry_data?: Json
          entry_date?: string
          filled_by: string
          id?: string
          manual_client_id?: string | null
          notes?: string
          tool_type: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          entry_data?: Json
          entry_date?: string
          filled_by?: string
          id?: string
          manual_client_id?: string | null
          notes?: string
          tool_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_entries_manual_client_id_fkey"
            columns: ["manual_client_id"]
            isOneToOne: false
            referencedRelation: "manual_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      content_overrides: {
        Row: {
          content_key: string
          content_type: string
          content_value: string
          created_at: string
          id: string
          image_url: string
          style_json: Json
          updated_at: string
        }
        Insert: {
          content_key: string
          content_type?: string
          content_value?: string
          created_at?: string
          id?: string
          image_url?: string
          style_json?: Json
          updated_at?: string
        }
        Update: {
          content_key?: string
          content_type?: string
          content_value?: string
          created_at?: string
          id?: string
          image_url?: string
          style_json?: Json
          updated_at?: string
        }
        Relationships: []
      }
      course_lessons: {
        Row: {
          course_id: string
          created_at: string
          description: string
          display_order: number
          duration_minutes: number
          id: string
          is_preview: boolean
          title: string
          video_url: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string
          display_order?: number
          duration_minutes?: number
          id?: string
          is_preview?: boolean
          title: string
          video_url?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string
          display_order?: number
          duration_minutes?: number
          id?: string
          is_preview?: boolean
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_purchases: {
        Row: {
          course_id: string
          id: string
          purchased_at: string
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          id?: string
          purchased_at?: string
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          id?: string
          purchased_at?: string
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_purchases_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_resources: {
        Row: {
          course_id: string
          created_at: string
          file_type: string
          file_url: string
          id: string
          lesson_id: string | null
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          file_type?: string
          file_url: string
          id?: string
          lesson_id?: string | null
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          file_type?: string
          file_url?: string
          id?: string
          lesson_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_resources_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_resources_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string
          display_order: number
          id: string
          is_active: boolean
          is_featured: boolean
          is_subscription_included: boolean
          long_description: string
          price_cents: number
          slug: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_subscription_included?: boolean
          long_description?: string
          price_cents?: number
          slug: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_subscription_included?: boolean
          long_description?: string
          price_cents?: number
          slug?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_plans: {
        Row: {
          created_at: string
          id: string
          plan_data: Json
          plan_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_data?: Json
          plan_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_data?: Json
          plan_date?: string
          user_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      fba_intake_assignments: {
        Row: {
          assigned_by: string
          child_name: string
          client_id: string
          created_at: string
          id: string
          notes: string
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          assigned_by: string
          child_name?: string
          client_id: string
          created_at?: string
          id?: string
          notes?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          assigned_by?: string
          child_name?: string
          client_id?: string
          created_at?: string
          id?: string
          notes?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fba_intake_responses: {
        Row: {
          assignment_id: string
          client_id: string
          created_at: string
          id: string
          responses: Json
          updated_at: string
        }
        Insert: {
          assignment_id: string
          client_id: string
          created_at?: string
          id?: string
          responses?: Json
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          client_id?: string
          created_at?: string
          id?: string
          responses?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fba_intake_responses_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: true
            referencedRelation: "fba_intake_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          category: string
          created_at: string
          description: string
          display_order: number
          is_system: boolean
          key: string
          label: string
          path: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string
          display_order?: number
          is_system?: boolean
          key: string
          label: string
          path?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          display_order?: number
          is_system?: boolean
          key?: string
          label?: string
          path?: string | null
        }
        Relationships: []
      }
      focus_blocks: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_recurring: boolean
          recurrence_rule: string | null
          start_time: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_recurring?: boolean
          recurrence_rule?: string | null
          start_time: string
          title?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_recurring?: boolean
          recurrence_rule?: string | null
          start_time?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      hero_images: {
        Row: {
          alt_text: string
          created_at: string
          display_order: number
          id: string
          image_url: string
          interval_seconds: number
          is_active: boolean
          quote_author: string
          quote_text: string
          updated_at: string
        }
        Insert: {
          alt_text?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          interval_seconds?: number
          is_active?: boolean
          quote_author?: string
          quote_text?: string
          updated_at?: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          interval_seconds?: number
          is_active?: boolean
          quote_author?: string
          quote_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      manual_clients: {
        Row: {
          client_type: string
          created_at: string
          created_by: string
          email: string
          full_name: string
          id: string
          linked_user_id: string | null
          notes: string
          phone: string
          updated_at: string
          xero_contact_id: string | null
        }
        Insert: {
          client_type?: string
          created_at?: string
          created_by: string
          email?: string
          full_name: string
          id?: string
          linked_user_id?: string | null
          notes?: string
          phone?: string
          updated_at?: string
          xero_contact_id?: string | null
        }
        Update: {
          client_type?: string
          created_at?: string
          created_by?: string
          email?: string
          full_name?: string
          id?: string
          linked_user_id?: string | null
          notes?: string
          phone?: string
          updated_at?: string
          xero_contact_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      note_templates: {
        Row: {
          created_at: string
          created_by: string
          description: string
          id: string
          is_shared: boolean
          template_content: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string
          id?: string
          is_shared?: boolean
          template_content?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          is_shared?: boolean
          template_content?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_badges: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      pathway_quiz_slides: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_start: boolean
          options: Json
          order_index: number
          question: string
          subtitle: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_start?: boolean
          options?: Json
          order_index?: number
          question: string
          subtitle?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_start?: boolean
          options?: Json
          order_index?: number
          question?: string
          subtitle?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pathway_step_templates: {
        Row: {
          created_at: string
          description: string
          display_order: number
          icon: string
          id: string
          is_active: boolean
          label: string
          link: string
          pathway_kind: string
          step_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          display_order?: number
          icon?: string
          id?: string
          is_active?: boolean
          label: string
          link?: string
          pathway_kind?: string
          step_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          icon?: string
          id?: string
          is_active?: boolean
          label?: string
          link?: string
          pathway_kind?: string
          step_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_secrets: {
        Row: {
          calendar_feed_token: string | null
          created_at: string
          telegram_chat_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calendar_feed_token?: string | null
          created_at?: string
          telegram_chat_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calendar_feed_token?: string | null
          created_at?: string
          telegram_chat_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          updated_at: string
          xero_contact_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id: string
          updated_at?: string
          xero_contact_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          xero_contact_id?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          external_url: string | null
          file_url: string | null
          id: string
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          external_url?: string | null
          file_url?: string | null
          id?: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          external_url?: string | null
          file_url?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      role_feature_access: {
        Row: {
          enabled: boolean
          feature_key: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          enabled?: boolean
          feature_key: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          enabled?: boolean
          feature_key?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_feature_access_feature_key_fkey"
            columns: ["feature_key"]
            isOneToOne: false
            referencedRelation: "feature_flags"
            referencedColumns: ["key"]
          },
        ]
      }
      service_options: {
        Row: {
          created_at: string
          description: string
          display_order: number
          duration_minutes: number
          id: string
          is_active: boolean
          name: string
          price_cents: number
          stripe_price_id: string | null
          therapist_rate_cents: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          display_order?: number
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name: string
          price_cents?: number
          stripe_price_id?: string | null
          therapist_rate_cents?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name?: string
          price_cents?: number
          stripe_price_id?: string | null
          therapist_rate_cents?: number
          updated_at?: string
        }
        Relationships: []
      }
      session_topics: {
        Row: {
          client_id: string
          content: string
          created_at: string
          id: string
          is_addressed: boolean
          session_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          content?: string
          created_at?: string
          id?: string
          is_addressed?: boolean
          session_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          content?: string
          created_at?: string
          id?: string
          is_addressed?: boolean
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          actual_end_at: string | null
          actual_start_at: string | null
          attendee_ids: string[] | null
          client_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_paid: boolean
          live_notes: string | null
          manual_client_id: string | null
          meeting_platform: string | null
          meeting_url: string | null
          notes: string | null
          paid_at: string | null
          paid_confirmed_by: string | null
          payment_method: string
          plaud_recording_id: string | null
          price_cents: number
          recurrence_parent_id: string | null
          service_option_id: string | null
          session_date: string
          status: string
          therapist_id: string | null
          therapist_paid: boolean
          therapist_paid_at: string | null
          therapist_paid_by: string | null
          therapist_payout_batch_id: string | null
          therapist_payout_method: string
          therapist_rate_cents: number
          title: string
        }
        Insert: {
          actual_end_at?: string | null
          actual_start_at?: string | null
          attendee_ids?: string[] | null
          client_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_paid?: boolean
          live_notes?: string | null
          manual_client_id?: string | null
          meeting_platform?: string | null
          meeting_url?: string | null
          notes?: string | null
          paid_at?: string | null
          paid_confirmed_by?: string | null
          payment_method?: string
          plaud_recording_id?: string | null
          price_cents?: number
          recurrence_parent_id?: string | null
          service_option_id?: string | null
          session_date: string
          status?: string
          therapist_id?: string | null
          therapist_paid?: boolean
          therapist_paid_at?: string | null
          therapist_paid_by?: string | null
          therapist_payout_batch_id?: string | null
          therapist_payout_method?: string
          therapist_rate_cents?: number
          title: string
        }
        Update: {
          actual_end_at?: string | null
          actual_start_at?: string | null
          attendee_ids?: string[] | null
          client_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_paid?: boolean
          live_notes?: string | null
          manual_client_id?: string | null
          meeting_platform?: string | null
          meeting_url?: string | null
          notes?: string | null
          paid_at?: string | null
          paid_confirmed_by?: string | null
          payment_method?: string
          plaud_recording_id?: string | null
          price_cents?: number
          recurrence_parent_id?: string | null
          service_option_id?: string | null
          session_date?: string
          status?: string
          therapist_id?: string | null
          therapist_paid?: boolean
          therapist_paid_at?: string | null
          therapist_paid_by?: string | null
          therapist_payout_batch_id?: string | null
          therapist_payout_method?: string
          therapist_rate_cents?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_manual_client_id_fkey"
            columns: ["manual_client_id"]
            isOneToOne: false
            referencedRelation: "manual_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_recurrence_parent_id_fkey"
            columns: ["recurrence_parent_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_service_option_id_fkey"
            columns: ["service_option_id"]
            isOneToOne: false
            referencedRelation: "service_options"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          alt_text: string
          created_at: string
          id: string
          image_url: string
          page_key: string
          quote_author: string
          quote_text: string
          section_key: string
          updated_at: string
        }
        Insert: {
          alt_text?: string
          created_at?: string
          id?: string
          image_url?: string
          page_key: string
          quote_author?: string
          quote_text?: string
          section_key?: string
          updated_at?: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          id?: string
          image_url?: string
          page_key?: string
          quote_author?: string
          quote_text?: string
          section_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_integrations: {
        Row: {
          access_token: string
          account_email: string
          account_name: string
          created_at: string
          extra_data: Json
          id: string
          provider: string
          refresh_token: string
          scope: string
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          account_email?: string
          account_name?: string
          created_at?: string
          extra_data?: Json
          id?: string
          provider: string
          refresh_token?: string
          scope?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          account_email?: string
          account_name?: string
          created_at?: string
          extra_data?: Json
          id?: string
          provider?: string
          refresh_token?: string
          scope?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      staff_todos: {
        Row: {
          assigned_to: string
          created_at: string
          created_by: string
          description: string
          due_date: string | null
          id: string
          is_completed: boolean
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to: string
          created_at?: string
          created_by: string
          description?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string
          created_at?: string
          created_by?: string
          description?: string
          due_date?: string | null
          id?: string
          is_completed?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      story_sources: {
        Row: {
          created_at: string
          error_message: string | null
          file_name: string
          file_path: string
          file_size_bytes: number
          generated_post_id: string | null
          id: string
          processed_at: string | null
          status: string
          updated_at: string
          uploaded_by: string
          voice_used: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          file_name: string
          file_path: string
          file_size_bytes?: number
          generated_post_id?: string | null
          id?: string
          processed_at?: string | null
          status?: string
          updated_at?: string
          uploaded_by: string
          voice_used?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          file_name?: string
          file_path?: string
          file_size_bytes?: number
          generated_post_id?: string | null
          id?: string
          processed_at?: string | null
          status?: string
          updated_at?: string
          uploaded_by?: string
          voice_used?: string | null
        }
        Relationships: []
      }
      supervisee_case_logs: {
        Row: {
          client_age: string
          client_name: string
          client_response: string
          created_at: string
          data_summary: string
          diagnosis: string
          duration_minutes: number
          id: string
          interventions_used: string
          next_steps: string
          session_date: string
          session_type: string
          setting: string
          status: string
          supervisee_id: string
          supervision_notes: string
          targets_addressed: string
          updated_at: string
        }
        Insert: {
          client_age?: string
          client_name?: string
          client_response?: string
          created_at?: string
          data_summary?: string
          diagnosis?: string
          duration_minutes?: number
          id?: string
          interventions_used?: string
          next_steps?: string
          session_date?: string
          session_type?: string
          setting?: string
          status?: string
          supervisee_id: string
          supervision_notes?: string
          targets_addressed?: string
          updated_at?: string
        }
        Update: {
          client_age?: string
          client_name?: string
          client_response?: string
          created_at?: string
          data_summary?: string
          diagnosis?: string
          duration_minutes?: number
          id?: string
          interventions_used?: string
          next_steps?: string
          session_date?: string
          session_type?: string
          setting?: string
          status?: string
          supervisee_id?: string
          supervision_notes?: string
          targets_addressed?: string
          updated_at?: string
        }
        Relationships: []
      }
      supervision_competencies: {
        Row: {
          can_break_down: boolean
          created_at: string
          definition: string
          display_order: number
          domain: string
          id: string
          name: string
          number: string
          parent_id: string | null
          supervisee_id: string
          supervisor_id: string
          updated_at: string
        }
        Insert: {
          can_break_down?: boolean
          created_at?: string
          definition?: string
          display_order?: number
          domain?: string
          id?: string
          name: string
          number?: string
          parent_id?: string | null
          supervisee_id: string
          supervisor_id: string
          updated_at?: string
        }
        Update: {
          can_break_down?: boolean
          created_at?: string
          definition?: string
          display_order?: number
          domain?: string
          id?: string
          name?: string
          number?: string
          parent_id?: string | null
          supervisee_id?: string
          supervisor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supervision_competencies_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "supervision_competencies"
            referencedColumns: ["id"]
          },
        ]
      }
      supervision_journal: {
        Row: {
          author_id: string
          author_role: string
          conclusion: string
          created_at: string
          description: string
          entry_date: string
          entry_type: string
          evidence: string
          id: string
          next_check_date: string | null
          notes: string
          related_competency_id: string | null
          supervisee_id: string
          supervisee_task: string
          supervisor_task: string
          updated_at: string
        }
        Insert: {
          author_id: string
          author_role: string
          conclusion?: string
          created_at?: string
          description?: string
          entry_date?: string
          entry_type?: string
          evidence?: string
          id?: string
          next_check_date?: string | null
          notes?: string
          related_competency_id?: string | null
          supervisee_id: string
          supervisee_task?: string
          supervisor_task?: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          author_role?: string
          conclusion?: string
          created_at?: string
          description?: string
          entry_date?: string
          entry_type?: string
          evidence?: string
          id?: string
          next_check_date?: string | null
          notes?: string
          related_competency_id?: string | null
          supervisee_id?: string
          supervisee_task?: string
          supervisor_task?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supervision_journal_related_competency_id_fkey"
            columns: ["related_competency_id"]
            isOneToOne: false
            referencedRelation: "supervision_competencies"
            referencedColumns: ["id"]
          },
        ]
      }
      supervision_supervisee_input: {
        Row: {
          competency_id: string
          created_at: string
          evidence: string
          id: string
          notes: string
          observations_count: number
          self_assessment_level: Database["public"]["Enums"]["supervision_level"]
          supervisee_id: string
          updated_at: string
        }
        Insert: {
          competency_id: string
          created_at?: string
          evidence?: string
          id?: string
          notes?: string
          observations_count?: number
          self_assessment_level?: Database["public"]["Enums"]["supervision_level"]
          supervisee_id: string
          updated_at?: string
        }
        Update: {
          competency_id?: string
          created_at?: string
          evidence?: string
          id?: string
          notes?: string
          observations_count?: number
          self_assessment_level?: Database["public"]["Enums"]["supervision_level"]
          supervisee_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supervision_supervisee_input_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: true
            referencedRelation: "supervision_competencies"
            referencedColumns: ["id"]
          },
        ]
      }
      supervision_supervisor_input: {
        Row: {
          competency_id: string
          created_at: string
          final_level: Database["public"]["Enums"]["supervision_level"]
          id: string
          next_goal: string
          notes: string
          status: string
          supervisee_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          competency_id: string
          created_at?: string
          final_level?: Database["public"]["Enums"]["supervision_level"]
          id?: string
          next_goal?: string
          notes?: string
          status?: string
          supervisee_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          competency_id?: string
          created_at?: string
          final_level?: Database["public"]["Enums"]["supervision_level"]
          id?: string
          next_goal?: string
          notes?: string
          status?: string
          supervisee_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supervision_supervisor_input_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: true
            referencedRelation: "supervision_competencies"
            referencedColumns: ["id"]
          },
        ]
      }
      support_agreements: {
        Row: {
          body: string
          client_id: string
          created_at: string
          created_by: string | null
          id: string
          signature_data_url: string
          signed_at: string | null
          signed_name: string
          signed_pdf_url: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          client_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          signature_data_url?: string
          signed_at?: string | null
          signed_name?: string
          signed_pdf_url?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Update: {
          body?: string
          client_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          signature_data_url?: string
          signed_at?: string | null
          signed_name?: string
          signed_pdf_url?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          avatar_url: string | null
          bio: string
          created_at: string
          credentials: string
          default_session_rate_cents: number
          display_order: number
          id: string
          initials: string
          is_active: boolean
          long_bio: string
          name: string
          profile_image_url: string | null
          role: string
          signature_url: string | null
          slug: string | null
          social_linkedin: string
          social_twitter: string
          social_website: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          credentials?: string
          default_session_rate_cents?: number
          display_order?: number
          id?: string
          initials?: string
          is_active?: boolean
          long_bio?: string
          name: string
          profile_image_url?: string | null
          role?: string
          signature_url?: string | null
          slug?: string | null
          social_linkedin?: string
          social_twitter?: string
          social_website?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          credentials?: string
          default_session_rate_cents?: number
          display_order?: number
          id?: string
          initials?: string
          is_active?: boolean
          long_bio?: string
          name?: string
          profile_image_url?: string | null
          role?: string
          signature_url?: string | null
          slug?: string | null
          social_linkedin?: string
          social_twitter?: string
          social_website?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      team_requests: {
        Row: {
          created_at: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      therapist_payout_batches: {
        Row: {
          created_at: string
          created_by: string
          id: string
          notes: string
          payment_date: string
          payment_method: string
          reference: string
          therapist_id: string
          total_cents: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          notes?: string
          payment_date?: string
          payment_method?: string
          reference?: string
          therapist_id: string
          total_cents?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          notes?: string
          payment_date?: string
          payment_method?: string
          reference?: string
          therapist_id?: string
          total_cents?: number
          updated_at?: string
        }
        Relationships: []
      }
      typing_status: {
        Row: {
          conversation_with: string
          id: string
          is_typing: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_with: string
          id?: string
          is_typing?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_with?: string
          id?: string
          is_typing?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_projects: {
        Row: {
          color: string
          created_at: string
          id: string
          is_archived: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          is_archived?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_archived?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string
          due_date: string | null
          estimated_minutes: number
          id: string
          is_completed: boolean
          labels: string[]
          priority: string
          project_id: string | null
          scheduled_end: string | null
          scheduled_start: string | null
          sort_order: number
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          estimated_minutes?: number
          id?: string
          is_completed?: boolean
          labels?: string[]
          priority?: string
          project_id?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          estimated_minutes?: number
          id?: string
          is_completed?: boolean
          labels?: string[]
          priority?: string
          project_id?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      xero_connection: {
        Row: {
          access_token: string
          connected_by: string | null
          created_at: string
          expires_at: string
          id: string
          last_synced_at: string | null
          refresh_token: string
          scope: string | null
          tenant_id: string
          tenant_name: string | null
          updated_at: string
        }
        Insert: {
          access_token: string
          connected_by?: string | null
          created_at?: string
          expires_at: string
          id?: string
          last_synced_at?: string | null
          refresh_token: string
          scope?: string | null
          tenant_id: string
          tenant_name?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          connected_by?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          last_synced_at?: string | null
          refresh_token?: string
          scope?: string | null
          tenant_id?: string
          tenant_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      xero_invoices: {
        Row: {
          amount_due: number | null
          amount_paid: number | null
          contact_name: string | null
          created_at: string
          currency_code: string | null
          due_date: string | null
          fully_paid_on_date: string | null
          id: string
          invoice_number: string | null
          issue_date: string | null
          raw: Json | null
          status: string | null
          sub_total: number | null
          synced_at: string
          total: number | null
          total_tax: number | null
          type: string | null
          updated_at: string
          xero_invoice_id: string
        }
        Insert: {
          amount_due?: number | null
          amount_paid?: number | null
          contact_name?: string | null
          created_at?: string
          currency_code?: string | null
          due_date?: string | null
          fully_paid_on_date?: string | null
          id?: string
          invoice_number?: string | null
          issue_date?: string | null
          raw?: Json | null
          status?: string | null
          sub_total?: number | null
          synced_at?: string
          total?: number | null
          total_tax?: number | null
          type?: string | null
          updated_at?: string
          xero_invoice_id: string
        }
        Update: {
          amount_due?: number | null
          amount_paid?: number | null
          contact_name?: string | null
          created_at?: string
          currency_code?: string | null
          due_date?: string | null
          fully_paid_on_date?: string | null
          id?: string
          invoice_number?: string | null
          issue_date?: string | null
          raw?: Json | null
          status?: string | null
          sub_total?: number | null
          synced_at?: string
          total?: number | null
          total_tax?: number | null
          type?: string | null
          updated_at?: string
          xero_invoice_id?: string
        }
        Relationships: []
      }
      xero_pnl_monthly: {
        Row: {
          created_at: string
          currency_code: string | null
          expenses: number | null
          id: string
          month_start: string
          net_profit: number | null
          revenue: number | null
          synced_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency_code?: string | null
          expenses?: number | null
          id?: string
          month_start: string
          net_profit?: number | null
          revenue?: number | null
          synced_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency_code?: string | null
          expenses?: number | null
          id?: string
          month_start?: string
          net_profit?: number | null
          revenue?: number | null
          synced_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      team_members_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          credentials: string | null
          display_order: number | null
          id: string | null
          initials: string | null
          is_active: boolean | null
          long_bio: string | null
          name: string | null
          profile_image_url: string | null
          role: string | null
          signature_url: string | null
          slug: string | null
          social_linkedin: string | null
          social_twitter: string | null
          social_website: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          credentials?: string | null
          display_order?: number | null
          id?: string | null
          initials?: string | null
          is_active?: boolean | null
          long_bio?: string | null
          name?: string | null
          profile_image_url?: string | null
          role?: string | null
          signature_url?: string | null
          slug?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          social_website?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          credentials?: string | null
          display_order?: number | null
          id?: string | null
          initials?: string | null
          is_active?: boolean | null
          long_bio?: string | null
          name?: string | null
          profile_image_url?: string | null
          role?: string | null
          signature_url?: string | null
          slug?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          social_website?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_notification: {
        Args: {
          _link?: string
          _message: string
          _title: string
          _type: string
          _user_id: string
        }
        Returns: undefined
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_public_assistant_config: {
        Args: never
        Returns: {
          auto_popup_delay_seconds: number
          is_enabled: boolean
          user_greeting: string
          visitor_greeting: string
        }[]
      }
      get_safe_profiles: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          full_name: string
          id: string
          updated_at: string
        }[]
      }
      get_team_member_rate: {
        Args: { _team_member_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      link_manual_client_to_user: {
        Args: { _manual_client_id: string; _target_user_id: string }
        Returns: undefined
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      publish_scheduled_posts: { Args: never; Returns: undefined }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "client" | "team_member" | "supervisee" | "supervisor"
      supervision_level:
        | "not_started"
        | "beginning"
        | "developing_with_support"
        | "independent"
        | "leading"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "client", "team_member", "supervisee", "supervisor"],
      supervision_level: [
        "not_started",
        "beginning",
        "developing_with_support",
        "independent",
        "leading",
      ],
    },
  },
} as const
