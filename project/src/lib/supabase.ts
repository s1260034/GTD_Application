import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 型定義
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          timezone: string | null
          language: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          timezone?: string | null
          language?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          timezone?: string | null
          language?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          title: string
          description: string | null
          status: string
          priority: number | null
          time_estimate: number | null
          energy_level: string | null
          context: string | null
          assigned_to: string | null
          due_date: string | null
          scheduled_date: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          title: string
          description?: string | null
          status?: string
          priority?: number | null
          time_estimate?: number | null
          energy_level?: string | null
          context?: string | null
          assigned_to?: string | null
          due_date?: string | null
          scheduled_date?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          title?: string
          description?: string | null
          status?: string
          priority?: number | null
          time_estimate?: number | null
          energy_level?: string | null
          context?: string | null
          assigned_to?: string | null
          due_date?: string | null
          scheduled_date?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          deleted_at?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: string
          progress: number | null
          created_at: string
          updated_at: string
          completed_at: string | null
          archived_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: string
          progress?: number | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          archived_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: string
          progress?: number | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          archived_at?: string | null
        }
      }
    }
  }
}