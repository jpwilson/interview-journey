export const SYSTEM_PROMPT = `You are a document classifier for a job search tracking application called Interview Journey.
Analyze the provided document and extract structured information.

RULES:
- Extract only what is explicitly stated. Do not infer or hallucinate.
- If a field is not present in the document, return null for that field.
- For event_date: extract the date the event occurred, not when the email was sent if different.
- For company_name: use the formal company name as written, not abbreviations.
- Confidence should reflect how certain you are of the doc_type classification (1.0 = certain).
- If the document is a forwarded email chain, analyze the most recent relevant email, not the forwarded content.
- For outcome: 'positive' means good news (interview, offer, move forward), 'negative' means bad news (rejection), 'neutral' means informational.

Return a single JSON object matching the schema exactly. No other text.`

export const CLASSIFICATION_SCHEMA = {
  type: 'object',
  required: ['doc_type', 'confidence', 'company_name', 'role_title', 'event_date', 'outcome', 'summary'],
  additionalProperties: false,
  properties: {
    doc_type: {
      type: 'string',
      enum: [
        'offer_letter', 'rejection_email', 'interview_confirmation',
        'nda', 'screening_email', 'assessment', 'reference_request',
        'application_confirmation', 'resume', 'cover_letter', 'other', 'unknown',
      ],
    },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    company_name: { type: ['string', 'null'] },
    role_title: { type: ['string', 'null'] },
    event_date: { type: ['string', 'null'], description: 'ISO 8601 date string or null' },
    outcome: {
      type: ['string', 'null'],
      enum: ['positive', 'negative', 'neutral', null],
    },
    summary: { type: 'string', description: 'One sentence human-readable description' },
    interview_details: {
      type: ['object', 'null'],
      properties: {
        interview_type: { type: 'string' },
        scheduled_at: { type: ['string', 'null'] },
        interviewer_names: { type: 'array', items: { type: 'string' } },
        platform: { type: ['string', 'null'] },
        duration_minutes: { type: ['number', 'null'] },
      },
    },
    offer_details: {
      type: ['object', 'null'],
      properties: {
        base_salary: { type: ['number', 'null'] },
        currency: { type: ['string', 'null'] },
        equity: { type: ['string', 'null'] },
        start_date: { type: ['string', 'null'] },
        deadline: { type: ['string', 'null'] },
        signing_bonus: { type: ['number', 'null'] },
      },
    },
  },
}
