export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string
          user_id: string
          name: string
          webhook_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          webhook_url: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          webhook_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      chats: {
        Row: {
          id: string
          user_id: string
          agent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          agent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          agent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          user_id: string | null
          sender_type: 'user' | 'agent'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          user_id?: string | null
          sender_type: 'user' | 'agent'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          user_id?: string | null
          sender_type?: 'user' | 'agent'
          content?: string
          created_at?: string
        }
      }
    }
  }
}
