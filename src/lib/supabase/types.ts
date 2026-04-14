// Auto-generate with: npx supabase gen types typescript --local > src/lib/supabase/types.ts
// Until then, this hand-crafted version mirrors the migrations.

export type RoleStage =
  | 'exploring'
  | 'applied'
  | 'screening'
  | 'interviewing'
  | 'offer'
  | 'negotiating'
  | 'resolved'

export type RoleResolution =
  | 'hired'
  | 'rejected'
  | 'withdrew'
  | 'offer_declined'
  | 'ghosted'
  | 'on_hold'

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
          industry: string | null
          size: string | null
          times_applied: number
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
          industry?: string | null
          size?: string | null
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
      roles: {
        Row: {
          id: string
          user_id: string
          company_id: string
          role_title: string
          stage: RoleStage
          resolution: RoleResolution | null
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
          ghosted_at: string | null
          engaged_at: string | null
          resolved_at: string | null
          excitement_score: number | null
          last_contact_at: string | null
          referrer_contact_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          company_id: string
          role_title: string
          stage?: RoleStage
          resolution?: RoleResolution | null
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
          ghosted_at?: string | null
          engaged_at?: string | null
          resolved_at?: string | null
          excitement_score?: number | null
          last_contact_at?: string | null
          referrer_contact_id?: string | null
        }
        Update: {
          role_title?: string
          stage?: RoleStage
          resolution?: RoleResolution | null
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
          ghosted_at?: string | null
          engaged_at?: string | null
          resolved_at?: string | null
          excitement_score?: number | null
          last_contact_at?: string | null
          referrer_contact_id?: string | null
        }
        Relationships: []
      }
      role_events: {
        Row: {
          id: string
          user_id: string
          role_id: string
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
          role_id: string
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
          role_id: string | null
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
          role_id?: string | null
          classification_status?: ClassificationStatus
        }
        Update: {
          role_id?: string | null
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
      contacts: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          linkedin_url: string | null
          title: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          linkedin_url?: string | null
          title?: string | null
          notes?: string | null
        }
        Update: {
          name?: string
          email?: string | null
          phone?: string | null
          linkedin_url?: string | null
          title?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      role_contacts: {
        Row: {
          id: string
          role_id: string
          contact_id: string
          relationship: string | null
          created_at: string
        }
        Insert: {
          role_id: string
          contact_id: string
          relationship?: string | null
        }
        Update: {
          relationship?: string | null
        }
        Relationships: []
      }
      meetings: {
        Row: {
          id: string
          user_id: string
          role_id: string
          type: string
          round_number: number | null
          scheduled_at: string
          duration_minutes: number | null
          format: string | null
          platform: string | null
          location: string | null
          prep_notes: string | null
          questions_to_ask: string | null
          outcome: string | null
          outcome_notes: string | null
          follow_up_sent_at: string | null
          calendar_event_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          role_id: string
          type: string
          scheduled_at: string
          round_number?: number | null
          duration_minutes?: number | null
          format?: string | null
          platform?: string | null
          location?: string | null
          prep_notes?: string | null
          questions_to_ask?: string | null
          outcome?: string | null
          outcome_notes?: string | null
        }
        Update: {
          type?: string
          scheduled_at?: string
          round_number?: number | null
          duration_minutes?: number | null
          format?: string | null
          platform?: string | null
          location?: string | null
          prep_notes?: string | null
          questions_to_ask?: string | null
          outcome?: string | null
          outcome_notes?: string | null
          follow_up_sent_at?: string | null
        }
        Relationships: []
      }
      meeting_contacts: {
        Row: {
          id: string
          meeting_id: string
          contact_id: string
          created_at: string
        }
        Insert: {
          meeting_id: string
          contact_id: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      offers: {
        Row: {
          id: string
          user_id: string
          role_id: string
          base_salary: number | null
          currency: string
          equity: string | null
          signing_bonus: number | null
          total_comp: number | null
          start_date: string | null
          deadline: string | null
          received_at: string
          status: 'pending' | 'accepted' | 'declined' | 'rescinded'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          role_id: string
          base_salary?: number | null
          currency?: string
          equity?: string | null
          signing_bonus?: number | null
          total_comp?: number | null
          start_date?: string | null
          deadline?: string | null
          received_at?: string
          status?: 'pending' | 'accepted' | 'declined' | 'rescinded'
          notes?: string | null
        }
        Update: {
          base_salary?: number | null
          currency?: string
          equity?: string | null
          signing_bonus?: number | null
          total_comp?: number | null
          start_date?: string | null
          deadline?: string | null
          status?: 'pending' | 'accepted' | 'declined' | 'rescinded'
          notes?: string | null
        }
        Relationships: []
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          name: string
          storage_path: string
          file_name: string
          file_type: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          name: string
          storage_path: string
          file_name: string
          file_type: string
          is_default?: boolean
        }
        Update: {
          name?: string
          is_default?: boolean
        }
        Relationships: []
      }
      role_resumes: {
        Row: {
          id: string
          role_id: string
          resume_id: string
          created_at: string
        }
        Insert: {
          role_id: string
          resume_id: string
        }
        Update: Record<string, never>
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
export type Role = Database['public']['Tables']['roles']['Row']
export type RoleEvent = Database['public']['Tables']['role_events']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type Contact = Database['public']['Tables']['contacts']['Row']
export type Meeting = Database['public']['Tables']['meetings']['Row']
export type Offer = Database['public']['Tables']['offers']['Row']
export type Resume = Database['public']['Tables']['resumes']['Row']
export type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row']

// Joined types used in UI
export type RoleWithCompany = Role & { company: Company }

// Legacy aliases — keep for gradual migration
/** @deprecated Use Role instead */
export type Application = Role
/** @deprecated Use RoleStage instead */
export type ApplicationStage = RoleStage
/** @deprecated Use RoleWithCompany instead */
export type ApplicationWithCompany = RoleWithCompany
/** @deprecated Use RoleEvent instead */
export type TimelineEvent = RoleEvent
