// Auto-generate with: npx supabase gen types typescript --local > src/lib/supabase/types.ts
// Until then, this hand-crafted version mirrors the migrations.

export type ApplicationStage =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn'

export type TimelineEventType =
  | 'applied'
  | 'screening_scheduled'
  | 'screening_completed'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'technical_assessment'
  | 'offer_received'
  | 'offer_accepted'
  | 'offer_declined'
  | 'offer_rescinded'
  | 'rejected'
  | 'withdrawn'
  | 'reference_check'
  | 'nda_signed'
  | 'document_added'
  | 'note_added'
  | 'stage_changed'

export type DocumentType =
  | 'offer_letter'
  | 'rejection_email'
  | 'interview_confirmation'
  | 'nda'
  | 'screening_email'
  | 'assessment'
  | 'reference_request'
  | 'application_confirmation'
  | 'resume'
  | 'cover_letter'
  | 'other'
  | 'unknown'

export type ClassificationStatus = 'pending' | 'processing' | 'classified' | 'failed'
export type SubscriptionTier = 'free' | 'pro'
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing'

export interface Database {
  public: {
    Views: Record<string, never>
    Functions: Record<string, never>
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          display_name?: string | null
          avatar_url?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_sub_id: string | null
          tier: SubscriptionTier
          status: SubscriptionStatus
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          tier?: SubscriptionTier
          status?: SubscriptionStatus
          stripe_customer_id?: string | null
          stripe_sub_id?: string | null
          current_period_end?: string | null
        }
        Update: {
          stripe_customer_id?: string | null
          stripe_sub_id?: string | null
          tier?: SubscriptionTier
          status?: SubscriptionStatus
          current_period_end?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          id: string
          user_id: string
          name: string
          domain: string | null
          logo_url: string | null
          website: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          name: string
          domain?: string | null
          logo_url?: string | null
          website?: string | null
          notes?: string | null
        }
        Update: {
          name?: string
          domain?: string | null
          logo_url?: string | null
          website?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          id: string
          user_id: string
          company_id: string
          role_title: string
          stage: ApplicationStage
          kanban_order: number
          job_url: string | null
          salary_min: number | null
          salary_max: number | null
          currency: string
          location: string | null
          remote_type: 'remote' | 'hybrid' | 'onsite' | null
          source: string | null
          notes: string | null
          applied_at: string | null
          offer_deadline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          company_id: string
          role_title: string
          stage?: ApplicationStage
          kanban_order?: number
          job_url?: string | null
          salary_min?: number | null
          salary_max?: number | null
          currency?: string
          location?: string | null
          remote_type?: 'remote' | 'hybrid' | 'onsite' | null
          source?: string | null
          notes?: string | null
          applied_at?: string | null
          offer_deadline?: string | null
        }
        Update: {
          role_title?: string
          stage?: ApplicationStage
          kanban_order?: number
          job_url?: string | null
          salary_min?: number | null
          salary_max?: number | null
          currency?: string
          location?: string | null
          remote_type?: 'remote' | 'hybrid' | 'onsite' | null
          source?: string | null
          notes?: string | null
          applied_at?: string | null
          offer_deadline?: string | null
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          id: string
          user_id: string
          application_id: string
          event_type: TimelineEventType
          event_date: string
          title: string
          description: string | null
          metadata: Record<string, unknown>
          source: 'manual' | 'ai_parsed' | 'inferred'
          created_at: string
        }
        Insert: {
          user_id: string
          application_id: string
          event_type: TimelineEventType
          event_date?: string
          title: string
          description?: string | null
          metadata?: Record<string, unknown>
          source?: 'manual' | 'ai_parsed' | 'inferred'
        }
        Update: {
          title?: string
          description?: string | null
          event_date?: string
          metadata?: Record<string, unknown>
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          user_id: string
          application_id: string | null
          timeline_event_id: string | null
          storage_path: string
          file_name: string
          file_type: string
          file_size_bytes: number | null
          doc_type: DocumentType | null
          classification_status: ClassificationStatus
          ai_raw_response: Record<string, unknown> | null
          ai_confidence: number | null
          extracted_company: string | null
          extracted_role: string | null
          extracted_date: string | null
          extracted_outcome: string | null
          extracted_summary: string | null
          needs_review: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          storage_path: string
          file_name: string
          file_type: string
          file_size_bytes?: number | null
          application_id?: string | null
          classification_status?: ClassificationStatus
        }
        Update: {
          application_id?: string | null
          timeline_event_id?: string | null
          doc_type?: DocumentType | null
          classification_status?: ClassificationStatus
          ai_raw_response?: Record<string, unknown> | null
          ai_confidence?: number | null
          extracted_company?: string | null
          extracted_role?: string | null
          extracted_date?: string | null
          extracted_outcome?: string | null
          extracted_summary?: string | null
          needs_review?: boolean
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          id: string
          event_name: string
          page_path: string | null
          user_id: string | null
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: {
          event_name: string
          page_path?: string | null
          user_id?: string | null
          metadata?: Record<string, unknown>
        }
        Update: {
          event_name?: string
        }
        Relationships: []
      }
    }
  }
}

// Convenience row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type Company = Database['public']['Tables']['companies']['Row']
export type Application = Database['public']['Tables']['applications']['Row']
export type TimelineEvent = Database['public']['Tables']['timeline_events']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row']

// Joined types used in UI
export type ApplicationWithCompany = Application & { company: Company }
