import { pgTable, text, uuid, integer, boolean, timestamp, decimal, jsonb, date, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Legacy users table for backward compatibility
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  type: text("type").notNull(), // 'admin' | 'care_home' | 'staff' | 'business_support'
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  dateOfBirth: timestamp("date_of_birth"),
  address: text("address"),
  postcode: text("postcode"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  nationalInsuranceNumber: text("national_insurance_number"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User profiles that extend users with application-specific data
export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  supabaseUserId: uuid("supabase_user_id").notNull().unique(), // Supabase auth user ID
  userType: text("user_type").notNull(), // 'care_home' | 'staff' | 'admin' | 'business_support'
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  dateOfBirth: timestamp("date_of_birth"),
  address: text("address"),
  postcode: text("postcode"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  nationalInsuranceNumber: text("national_insurance_number"),
  registrationStatus: text("registration_status").default("pending_documents"), // 'pending_documents' | 'documents_submitted' | 'under_review' | 'approved' | 'rejected'
  rejectionReason: text("rejection_reason"),
  approvedAt: timestamp("approved_at"),
  approvedBy: uuid("approved_by"),
  isActive: boolean("is_active").default(false), // Changed default to false for new registrations
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Practice groups for multi-location organizations
export const practiceGroups = pgTable("practice_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  headOfficeAddress: text("head_office_address"),
  headOfficePostcode: text("head_office_postcode"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  primaryContactName: text("primary_contact_name"),
  primaryContactRole: text("primary_contact_role"),
  companyRegistrationNumber: text("company_registration_number"),
  vatNumber: text("vat_number"),
  totalLocations: integer("total_locations").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// GP Practices
export const practices = pgTable("practices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userProfileId: uuid("user_profile_id").references(() => userProfiles.id),
  name: text("name").notNull(),
  facilityType: text("facility_type"), // Nursing, Residential, Dementia
  cqcRating: text("cqc_rating"), // Outstanding, Good, Requires Improvement, Inadequate
  cqcRegistrationNumber: text("cqc_registration_number"),
  address: text("address").notNull(),
  city: text("city"),
  postcode: text("postcode").notNull(),
  mainPhone: text("main_phone").notNull(),
  emergencyPhone: text("emergency_phone"),
  emailAddress: text("email_address"),
  primaryContactName: text("primary_contact_name").notNull(),
  primaryContactRole: text("primary_contact_role"),
  groupId: uuid("group_id").references(() => practiceGroups.id),
  groupAffiliation: text("group_affiliation"),
  localAuthorityRegion: text("local_authority_region"),
  locationCode: text("location_code"), // Unique identifier within group
  isHeadOffice: boolean("is_head_office").default(false),
  notes: text("notes"),
  
  // Contract & Compliance
  contractStatus: text("contract_status").default('lead'), // lead, proposal_sent, negotiation, active, suspended, expired
  contractType: text("contract_type"), // framework, spot, sla
  contractStartDate: date("contract_start_date"),
  contractEndDate: date("contract_end_date"),
  renewalRequired: boolean("renewal_required").default(false),
  autoRenewal: boolean("auto_renewal").default(false),
  contractDocumentUrl: text("contract_document_url"),
  
  // Compliance Information
  cqcRegistrationChecked: boolean("cqc_registration_checked").default(false),
  cqcLastCheckDate: date("cqc_last_check_date"),
  safeguardingPolicyReceived: boolean("safeguarding_policy_received").default(false),
  insuranceDocumentationReceived: boolean("insurance_documentation_received").default(false),
  gdprAgreementOnFile: boolean("gdpr_agreement_on_file").default(false),
  complianceNotes: text("compliance_notes"),
  followUpDate: date("follow_up_date"),
  
  // Service Allocation
  minimumNoticeHours: integer("minimum_notice_hours").default(24),
  preferredStaffingPatterns: text("preferred_staffing_patterns"),
  
  // Geographic Information for Map View
  latitude: decimal("latitude"),
  longitude: decimal("longitude"),
  region: text("region"), // Scotland, Wales, Northern Ireland, England
  county: text("county"), // County or NHS region
  
  // Engagement Level for Map Visualization
  engagementLevel: text("engagement_level").default("no_engagement"), // 'no_engagement' | 'some_engagement' | 'full_engagement'
  lastContactedDate: date("last_contacted_date"),
  engagementNotes: text("engagement_notes"),
  
  // Invoicing
  billingContactName: text("billing_contact_name"),
  billingContactEmail: text("billing_contact_email"),
  billingCycle: text("billing_cycle").default('monthly'), // weekly, bi_weekly, monthly
  paymentTermsDays: integer("payment_terms_days").default(30),
  vatRegistered: boolean("vat_registered").default(false),
  invoicePrefix: text("invoice_prefix"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff members
export const staff = pgTable("staff", {
  id: uuid("id").primaryKey().defaultRandom(),
  userProfileId: uuid("user_profile_id").references(() => userProfiles.id),
  role: text("role").notNull(), // Must match rate card roles
  experience: integer("experience"), // years
  hourlyRate: decimal("hourly_rate", { precision: 5, scale: 2 }),
  cvUrl: text("cv_url"),
  postcode: text("postcode"), // Staff member's postcode for distance calculation
  preferredLocations: jsonb("preferred_locations").$type<string[]>(),
  availability: jsonb("availability").$type<{
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  }>(),
  maxDistance: integer("max_distance").default(10), // miles
  isAvailable: boolean("is_available").default(true),
  
  // Geographic Information for Map View
  latitude: decimal("latitude"),
  longitude: decimal("longitude"),
  region: text("region"), // Scotland, Wales, Northern Ireland, England
  county: text("county"), // County or NHS region
  
  // Additional registration fields
  additionalSkills: text("additional_skills"),
  previousExperience: text("previous_experience"),
  references: text("references"),
  
  // Consent tracking
  consentReferenceChecks: boolean("consent_reference_checks").default(false),
  consentDbsChecks: boolean("consent_dbs_checks").default(false),
  consentUmbrellaCompany: boolean("consent_umbrella_company").default(false),
  agreeTermsConditions: boolean("agree_terms_conditions").default(false),
  consentTimestamp: timestamp("consent_timestamp"),
  
  // Registration metadata
  registrationSource: text("registration_source").default("website"), // 'website' | 'admin_created' | 'import'
  registrationComplete: boolean("registration_complete").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff certifications - Enhanced for both DBS and general compliance
export const certifications = pgTable("certifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  staffId: uuid("staff_id").references(() => staff.id),
  type: text("type").notNull(), // 'dbs_enhanced_check' | 'right_to_work' | 'medical_indemnity_insurance' | 'discharge_medicine_service' | etc.
  title: text("title").notNull(),
  
  // Core dates matching the image format
  issueDate: date("issue_date"), // When credential is valid from
  expiryDate: date("expiry_date"), // When credential expires
  
  // Document upload (optional as per image)
  documentUrl: text("document_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  extractedText: text("extracted_text"),
  
  // Verification and status
  verificationStatus: text("verification_status").default("evidence_not_provided"), // 'evidence_not_provided' | 'pending' | 'verified' | 'rejected' | 'expired'
  verifiedBy: uuid("verified_by").references(() => userProfiles.id),
  verifiedAt: timestamp("verified_at"),
  rejectionReason: text("rejection_reason"),
  
  // Required by organization (matching image)
  requiredBy: text("required_by"), // e.g., "Enimed Limited"
  isRequired: boolean("is_required").default(true), // Mandatory vs optional
  isMandatory: boolean("is_mandatory").default(false), // For medical mandatory documents
  
  // Additional compliance fields
  complianceCategory: text("compliance_category"), // 'legal_safety' | 'insurance_protection' | 'clinical_training' | 'supplementary'
  reminderService: boolean("reminder_service").default(true), // Help ensure credentials are in date
  
  // DBS-specific fields for DBS Enhanced Check documents
  dbsUpdateService: boolean("dbs_update_service"), // Whether staff is on DBS Update Service
  dbsCertificateNumber: text("dbs_certificate_number"), // DBS Certificate Number
  dbsUpdateServiceId: text("dbs_update_service_id"), // DBS Update Service ID
  
  // Metadata
  isValid: boolean("is_valid").default(true),
  uploadedBy: uuid("uploaded_by").references(() => userProfiles.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_certifications_staff_id").on(table.staffId),
  index("idx_certifications_type").on(table.type),
  index("idx_certifications_expiry").on(table.expiryDate),
  index("idx_certifications_verification_status").on(table.verificationStatus),
  index("idx_certifications_required").on(table.isRequired),
]);

// Enhanced DBS compliance table for comprehensive DBS checking
export const dbsCompliance = pgTable("dbs_compliance", {
  id: uuid("id").primaryKey().defaultRandom(),
  staffId: uuid("staff_id").references(() => staff.id).notNull(),
  certificationId: uuid("certification_id").references(() => certifications.id),
  
  // DBS Certificate Details (from attached image)
  dbsCertificateNumber: text("dbs_certificate_number").notNull(),
  dbsUpdateServiceId: text("dbs_update_service_id"),
  isOnUpdateService: boolean("is_on_update_service").default(false),
  
  // Dates
  issueDate: date("issue_date").notNull(),
  expiryDate: date("expiry_date").notNull(),
  
  // Document Upload
  documentUrl: text("document_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  
  // Verification Status
  verificationStatus: text("verification_status").default("pending"), // 'pending' | 'verified' | 'rejected' | 'expired'
  verifiedBy: uuid("verified_by").references(() => userProfiles.id),
  verifiedAt: timestamp("verified_at"),
  rejectionReason: text("rejection_reason"),
  
  // Additional Information
  requestedBy: text("requested_by"), // Organization that requested the DBS check
  checkLevel: text("check_level").default("enhanced"), // 'basic' | 'standard' | 'enhanced' | 'enhanced_with_barred_lists'
  workforceType: text("workforce_type").default("adult"), // 'adult' | 'child' | 'both'
  
  // Compliance Notes
  notes: text("notes"),
  complianceAlerts: jsonb("compliance_alerts").$type<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    createdAt: string;
  }[]>(),
  
  // Metadata
  uploadedBy: uuid("uploaded_by").references(() => userProfiles.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_dbs_compliance_staff_id").on(table.staffId),
  index("idx_dbs_compliance_certificate_number").on(table.dbsCertificateNumber),
  index("idx_dbs_compliance_expiry").on(table.expiryDate),
  index("idx_dbs_compliance_verification_status").on(table.verificationStatus),
]);

// Shifts
export const shifts = pgTable("shifts", {
  id: uuid("id").primaryKey().defaultRandom(),
  shiftRef: text("shift_ref").notNull().unique(), // User-friendly reference like "SH-2025-001"
  practiceId: uuid("practice_id").references(() => practices.id),
  staffId: uuid("staff_id").references(() => staff.id), // For direct booking by locums
  role: text("role").notNull(),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"), // For overnight shifts that span multiple days
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 5, scale: 2 }).notNull(),
  requiredSkills: jsonb("required_skills").$type<string[]>(),
  additionalNotes: text("additional_notes"),
  staffRequired: integer("staff_required").notNull().default(1),
  batchId: uuid("batch_id"), // Groups related shifts when multiple staff requested
  status: text("status").notNull().default('open'), // 'open' | 'pending' | 'confirmed' | 'declined' | 'completed'
  createdAt: timestamp("created_at").defaultNow(),
});

// Shift assignments
export const shiftAssignments = pgTable("shift_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  shiftId: uuid("shift_id").references(() => shifts.id),
  staffId: uuid("staff_id").references(() => staff.id),
  status: text("status").notNull().default('pending'), // 'pending' | 'accepted' | 'declined' | 'expired'
  assignedAt: timestamp("assigned_at").defaultNow(),
  responseAt: timestamp("response_at"),
  timeoutAt: timestamp("timeout_at"),
  smsStatus: text("sms_status"), // 'sent' | 'delivered' | 'failed'
  smsId: text("sms_id"),
});

// SMS messages
export const smsMessages = pgTable("sms_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  shiftAssignmentId: uuid("shift_assignment_id").references(() => shiftAssignments.id),
  userProfileId: uuid("user_profile_id").references(() => userProfiles.id),
  phoneNumber: text("phone_number").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull(), // 'sent' | 'delivered' | 'failed'
  messageType: text("message_type").default("shift_notification"),
  twilioSid: text("twilio_sid"),
  sentAt: timestamp("sent_at").defaultNow(),
  deliveredAt: timestamp("delivered_at"),
});

// Audit logs
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminUserProfileId: uuid("admin_user_profile_id").references(() => userProfiles.id).notNull(),
  action: text("action").notNull(), // 'create' | 'update' | 'delete' | 'assign' | 'approve'
  entityType: text("entity_type").notNull(), // 'user' | 'shift' | 'staff' | 'care_home'
  entityId: uuid("entity_id").notNull(),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Support tickets
export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userProfileId: uuid("user_profile_id").references(() => userProfiles.id).notNull(),
  adminUserProfileId: uuid("admin_user_profile_id").references(() => userProfiles.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").default("open"), // 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: text("priority").default("medium"), // 'low' | 'medium' | 'high' | 'urgent'
  tags: jsonb("tags").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document requirements for staff onboarding
export const documentRequirements = pgTable("document_requirements", {
  id: uuid("id").primaryKey().defaultRandom(),
  userProfileId: uuid("user_profile_id").references(() => userProfiles.id),
  documentType: text("document_type").notNull(), // 'id_document' | 'right_to_work' | 'dbs_check'
  isRequired: boolean("is_required").default(true),
  isSubmitted: boolean("is_submitted").default(false),
  documentUrl: text("document_url"),
  submittedAt: timestamp("submitted_at"),
  verificationStatus: text("verification_status").default("pending"), // 'pending' | 'approved' | 'rejected'
  verificationNotes: text("verification_notes"),
  verifiedBy: uuid("verified_by").references(() => userProfiles.id),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Staff onboarding progress tracking
export const staffOnboarding = pgTable("staff_onboarding", {
  id: uuid("id").primaryKey().defaultRandom(),
  userProfileId: uuid("user_profile_id").references(() => userProfiles.id),
  currentStep: text("current_step").default("documents"), // 'documents' | 'review' | 'approved' | 'rejected'
  documentsComplete: boolean("documents_complete").default(false),
  adminNotes: text("admin_notes"),
  completionDate: timestamp("completion_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System settings
export const systemSettings = pgTable("system_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  category: text("category").default("general"), // 'general' | 'matching' | 'notifications' | 'compliance'
  updatedBy: uuid("updated_by").references(() => userProfiles.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Compliance reports
export const complianceReports = pgTable("compliance_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  generatedBy: uuid("generated_by").references(() => userProfiles.id).notNull(),
  reportType: text("report_type").notNull(), // 'dbs_expiry' | 'training_status' | 'staff_activity'
  filters: jsonb("filters"),
  fileUrl: text("file_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Local authorities lookup
export const localAuthorities = pgTable("local_authorities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  region: text("region").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Practice documents
export const practiceDocuments = pgTable("practice_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  practiceId: uuid("practice_id").references(() => practices.id).notNull(),
  documentType: text("document_type").notNull(), // contract, safeguarding_policy, insurance, etc.
  title: text("title").notNull(),
  documentUrl: text("document_url").notNull(),
  uploadedBy: uuid("uploaded_by").references(() => userProfiles.id).notNull(),
  version: integer("version").default(1),
  isActive: boolean("is_active").default(true),
  expiryDate: date("expiry_date"),
  tags: jsonb("tags").$type<string[]>(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Base rate cards - UK Locum medical professional rates
export const baseRateCards = pgTable("base_rate_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  role: text("role").notNull().unique(), // 'GP Locum (via agency)', 'Nurse Practitioner (via NHS framework)', 'Agency Nurse (private/NHS)'
  workerPayRateMin: decimal("worker_pay_rate_min", { precision: 6, scale: 2 }).notNull(), // Minimum hourly rate paid to locum
  workerPayRateMax: decimal("worker_pay_rate_max", { precision: 6, scale: 2 }).notNull(), // Maximum hourly rate paid to locum
  clientBillRateMin: decimal("client_bill_rate_min", { precision: 6, scale: 2 }).notNull(), // Minimum rate charged to client
  clientBillRateMax: decimal("client_bill_rate_max", { precision: 6, scale: 2 }).notNull(), // Maximum rate charged to client
  agencyMarkupMin: decimal("agency_markup_min", { precision: 5, scale: 2 }), // Minimum markup percentage (e.g., 20.00 for 20%)
  agencyMarkupMax: decimal("agency_markup_max", { precision: 5, scale: 2 }), // Maximum markup percentage (e.g., 75.00 for 75%)
  notes: text("notes"), // Additional context about rates, regions, demand factors
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Rate multipliers - Dynamic calculation rules
export const rateMultipliers = pgTable("rate_multipliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(), // 'night_shift', 'weekend', 'bank_holiday', 'overtime'
  description: text("description").notNull(),
  multiplier: decimal("multiplier", { precision: 4, scale: 3 }).notNull(), // e.g., 1.200, 1.500, 1.800
  priority: integer("priority").notNull().default(1), // Higher priority multipliers apply first
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// UK Bank holidays lookup table
export const bankHolidays = pgTable("bank_holidays", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  date: date("date").notNull().unique(),
  region: text("region").default('england-and-wales'), // 'england-and-wales', 'scotland', 'northern-ireland'
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: text("recurring_pattern"), // 'first-monday-may', 'last-monday-may', etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Shift time definitions
export const shiftTimeDefinitions = pgTable("shift_time_definitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  shiftType: text("shift_type").notNull().unique(), // 'day', 'night', 'evening'
  startTime: text("start_time").notNull(), // '06:00'
  endTime: text("end_time").notNull(), // '18:00'
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Rate calculation logs for audit
export const rateCalculationLogs = pgTable("rate_calculation_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  shiftId: uuid("shift_id").references(() => shifts.id),
  role: text("role").notNull(),
  shiftDate: date("shift_date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  shiftDurationHours: decimal("shift_duration_hours", { precision: 4, scale: 2 }).notNull(),
  baseInternalRate: decimal("base_internal_rate", { precision: 6, scale: 2 }).notNull(),
  baseExternalRate: decimal("base_external_rate", { precision: 6, scale: 2 }).notNull(),
  appliedMultipliers: jsonb("applied_multipliers").$type<{
    name: string;
    multiplier: number;
    reason: string;
  }[]>(),
  finalInternalRate: decimal("final_internal_rate", { precision: 6, scale: 2 }).notNull(),
  finalExternalRate: decimal("final_external_rate", { precision: 6, scale: 2 }).notNull(),
  totalInternalCost: decimal("total_internal_cost", { precision: 8, scale: 2 }).notNull(),
  totalExternalCost: decimal("total_external_cost", { precision: 8, scale: 2 }).notNull(),
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

// Invoices
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  practiceId: uuid("practice_id").references(() => practices.id).notNull(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date").notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default('draft'), // draft, sent, paid, overdue, cancelled
  paidDate: date("paid_date"),
  pdfUrl: text("pdf_url"),
  emailSentAt: timestamp("email_sent_at"),
  remindersSent: integer("reminders_sent").default(0),
  lastReminderSent: timestamp("last_reminder_sent"),
  generatedBy: uuid("generated_by").references(() => userProfiles.id).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoice line items
export const invoiceLineItems = pgTable("invoice_line_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").references(() => invoices.id).notNull(),
  shiftId: uuid("shift_id").references(() => shifts.id),
  staffId: uuid("staff_id").references(() => staff.id),
  description: text("description").notNull(),
  date: date("date").notNull(),
  hoursWorked: decimal("hours_worked", { precision: 4, scale: 2 }).notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 6, scale: 2 }).notNull(),
  lineTotal: decimal("line_total", { precision: 8, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Practice communications
export const practiceCommunications = pgTable("practice_communications", {
  id: uuid("id").primaryKey().defaultRandom(),
  practiceId: uuid("practice_id").references(() => practices.id).notNull(),
  communicationType: text("communication_type").notNull(), // email, phone, meeting, note
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  direction: text("direction").notNull(), // inbound, outbound
  contactPerson: text("contact_person"),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: date("follow_up_date"),
  assignedTo: uuid("assigned_to").references(() => userProfiles.id),
  tags: jsonb("tags").$type<string[]>(),
  attachments: jsonb("attachments").$type<string[]>(),
  createdBy: uuid("created_by").references(() => userProfiles.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Business support permissions
export const businessSupportPermissions = pgTable("business_support_permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userProfileId: uuid("user_profile_id").references(() => userProfiles.id).notNull(),
  practiceId: uuid("practice_id").references(() => practices.id),
  practiceGroupId: uuid("practice_group_id").references(() => practiceGroups.id),
  permissionType: text("permission_type").notNull(), // 'read' | 'write' | 'admin'
  resourceType: text("resource_type").notNull(), // 'shifts' | 'staff' | 'invoices' | 'reports' | 'all'
  grantedBy: uuid("granted_by").references(() => userProfiles.id).notNull(),
  grantedAt: timestamp("granted_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => userProfiles.id).notNull(),
  updatedBy: uuid("updated_by").references(() => userProfiles.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Timesheets for comprehensive timesheet management
export const timesheets = pgTable("timesheets", {
  id: uuid("id").primaryKey().defaultRandom(),
  staffId: uuid("staff_id").references(() => userProfiles.id).notNull(),
  practiceId: uuid("practice_id").references(() => practices.id).notNull(),
  weekStart: date("week_start").notNull(),
  weekEnd: date("week_end").notNull(),
  dailyHours: jsonb("daily_hours").notNull().$type<{
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  }>(),
  totalHours: decimal("total_hours", { precision: 5, scale: 2 }).notNull().default('0'),
  status: text("status").notNull().default('draft'), // 'draft' | 'pending_manager_approval' | 'approved' | 'rejected'
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  approvedBy: uuid("approved_by").references(() => userProfiles.id),
  approvedNotes: text("approved_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_timesheets_staff_id").on(table.staffId),
  index("idx_timesheets_practice_id").on(table.practiceId),
  index("idx_timesheets_week_start").on(table.weekStart),
  index("idx_timesheets_status").on(table.status),
]);

// Documents table for comprehensive document management with compliance tracking
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: text("entity_type").notNull(), // 'staff', 'practice', 'admin'
  entityId: uuid("entity_id").notNull(), // References user_profiles.id or practices.id
  documentType: text("document_type").notNull(), // 'dbs_check', 'first_aid', 'right_to_work', etc.
  title: text("title").notNull(),
  filename: text("filename").notNull(),
  filePath: text("file_path").notNull(), // Path in Supabase storage
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  status: text("status").default('pending'), // 'pending', 'approved', 'rejected'
  category: text("category").default('mandatory'), // 'mandatory', 'supplementary'
  issueDate: date("issue_date"), // When the credential was issued
  expiryDate: date("expiry_date"), // When the credential expires
  verificationStatus: text("verification_status").default('pending'), // 'pending', 'verified', 'rejected'
  verifiedBy: uuid("verified_by").references(() => userProfiles.id),
  verifiedAt: timestamp("verified_at"),
  rejectionReason: text("rejection_reason"),
  notes: text("notes"),
  tags: jsonb("tags").$type<string[]>(),
  accessLevel: text("access_level").default('restricted'), // 'public', 'restricted', 'confidential'
  uploadedBy: uuid("uploaded_by").references(() => userProfiles.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_documents_entity").on(table.entityType, table.entityId),
  index("idx_documents_type").on(table.documentType),
  index("idx_documents_status").on(table.status),
  index("idx_documents_expiry").on(table.expiryDate),
]);

// Zod schemas for validation
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPracticeSchema = createInsertSchema(practices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCertificationSchema = createInsertSchema(certifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDbsComplianceSchema = createInsertSchema(dbsCompliance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShiftSchema = createInsertSchema(shifts).omit({
  id: true,
  createdAt: true,
}).extend({
  // Allow shiftRef to be optional since it will be auto-generated
  shiftRef: z.string().optional(),
  // Convert string dates to Date objects for proper validation
  date: z.string().or(z.date()).transform((val) => typeof val === 'string' ? new Date(val) : val),
  endDate: z.string().or(z.date()).transform((val) => typeof val === 'string' ? new Date(val) : val).optional(),
});

export const insertShiftAssignmentSchema = createInsertSchema(shiftAssignments).omit({
  id: true,
  assignedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertComplianceReportSchema = createInsertSchema(complianceReports).omit({
  id: true,
  createdAt: true,
});

export const insertLocalAuthoritySchema = createInsertSchema(localAuthorities).omit({
  id: true,
  createdAt: true,
});

export const insertPracticeGroupSchema = createInsertSchema(practiceGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPracticeDocumentSchema = createInsertSchema(practiceDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBaseRateCardSchema = createInsertSchema(baseRateCards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRateMultiplierSchema = createInsertSchema(rateMultipliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBankHolidaySchema = createInsertSchema(bankHolidays).omit({
  id: true,
  createdAt: true,
});

export const insertShiftTimeDefinitionSchema = createInsertSchema(shiftTimeDefinitions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRateCalculationLogSchema = createInsertSchema(rateCalculationLogs).omit({
  id: true,
  calculatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems).omit({
  id: true,
  createdAt: true,
});

export const insertPracticeCommunicationSchema = createInsertSchema(practiceCommunications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBusinessSupportPermissionSchema = createInsertSchema(businessSupportPermissions).omit({
  id: true,
  grantedAt: true,
  createdAt: true,
  updatedAt: true,
});



export const insertDocumentRequirementSchema = createInsertSchema(documentRequirements).omit({
  id: true,
  createdAt: true,
});

export const insertStaffOnboardingSchema = createInsertSchema(staffOnboarding).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimesheetSchema = createInsertSchema(timesheets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type Timesheet = typeof timesheets.$inferSelect;
export type InsertTimesheet = z.infer<typeof insertTimesheetSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

// User type for authentication compatibility
export interface User {
  id: string;
  email: string;
  type: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  dateOfBirth: Date | null;
  address: string | null;
  postcode: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  nationalInsuranceNumber: string | null;
  isActive: boolean;
  createdAt: Date;
}

export type Practice = typeof practices.$inferSelect;
export type InsertPractice = z.infer<typeof insertPracticeSchema>;

export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;

export type Certification = typeof certifications.$inferSelect;
export type InsertCertification = z.infer<typeof insertCertificationSchema>;

export type DbsCompliance = typeof dbsCompliance.$inferSelect;
export type InsertDbsCompliance = z.infer<typeof insertDbsComplianceSchema>;

export type Shift = typeof shifts.$inferSelect;
export type InsertShift = z.infer<typeof insertShiftSchema>;

export type ShiftAssignment = typeof shiftAssignments.$inferSelect;
export type InsertShiftAssignment = z.infer<typeof insertShiftAssignmentSchema>;

export type SMSMessage = typeof smsMessages.$inferSelect;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;

export type ComplianceReport = typeof complianceReports.$inferSelect;
export type InsertComplianceReport = z.infer<typeof insertComplianceReportSchema>;

export type LocalAuthority = typeof localAuthorities.$inferSelect;
export type InsertLocalAuthority = z.infer<typeof insertLocalAuthoritySchema>;

export type PracticeGroup = typeof practiceGroups.$inferSelect;
export type InsertPracticeGroup = z.infer<typeof insertPracticeGroupSchema>;

export type PracticeDocument = typeof practiceDocuments.$inferSelect;
export type InsertPracticeDocument = z.infer<typeof insertPracticeDocumentSchema>;

export type BaseRateCard = typeof baseRateCards.$inferSelect;
export type InsertBaseRateCard = z.infer<typeof insertBaseRateCardSchema>;

export type RateMultiplier = typeof rateMultipliers.$inferSelect;
export type InsertRateMultiplier = z.infer<typeof insertRateMultiplierSchema>;

export type BankHoliday = typeof bankHolidays.$inferSelect;
export type InsertBankHoliday = z.infer<typeof insertBankHolidaySchema>;

export type ShiftTimeDefinition = typeof shiftTimeDefinitions.$inferSelect;
export type InsertShiftTimeDefinition = z.infer<typeof insertShiftTimeDefinitionSchema>;

export type RateCalculationLog = typeof rateCalculationLogs.$inferSelect;
export type InsertRateCalculationLog = z.infer<typeof insertRateCalculationLogSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;

export type PracticeCommunication = typeof practiceCommunications.$inferSelect;
export type InsertPracticeCommunication = z.infer<typeof insertPracticeCommunicationSchema>;

export type BusinessSupportPermission = typeof businessSupportPermissions.$inferSelect;
export type InsertBusinessSupportPermission = z.infer<typeof insertBusinessSupportPermissionSchema>;

export type DocumentRequirement = typeof documentRequirements.$inferSelect;
export type InsertDocumentRequirement = z.infer<typeof insertDocumentRequirementSchema>;

export type StaffOnboarding = typeof staffOnboarding.$inferSelect;
export type InsertStaffOnboarding = z.infer<typeof insertStaffOnboardingSchema>;

// Practice enquiries for tracking partnership requests
export const practiceEnquiries = pgTable("practice_enquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  managerName: text("manager_name").notNull(),
  email: text("email").notNull(),
  practiceName: text("practice_name").notNull(),
  numberOfBeds: integer("number_of_beds").notNull(),
  location: text("location").notNull(),
  contactPhone: text("contact_phone").notNull(),
  additionalInfo: text("additional_info"),
  status: text("status").notNull().default("new"), // 'new' | 'contacted' | 'in_progress' | 'approved' | 'rejected' | 'completed'
  assignedTo: uuid("assigned_to").references(() => userProfiles.id),
  notes: text("notes"),
  followUpDate: timestamp("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPracticeEnquirySchema = createInsertSchema(practiceEnquiries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PracticeEnquiry = typeof practiceEnquiries.$inferSelect;
export type InsertPracticeEnquiry = z.infer<typeof insertPracticeEnquirySchema>;

// Business Support Permissions for granular tab-by-tab access control
export const businessSupportTabPermissions = pgTable("business_support_tab_permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  tabId: text("tab_id").notNull(), // 'dashboard' | 'shifts' | 'users' | 'practices' | 'timesheets' | 'documents' | 'reports' | 'settings'
  accessLevel: text("access_level").notNull().default("read"), // 'read' | 'write' | 'admin'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBusinessSupportTabPermissionSchema = createInsertSchema(businessSupportTabPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type BusinessSupportTabPermission = typeof businessSupportTabPermissions.$inferSelect;
export type InsertBusinessSupportTabPermission = z.infer<typeof insertBusinessSupportTabPermissionSchema>;

// Allied Healthcare Professional Registrations
export const alliedHealthcareRegistrations = pgTable("allied_healthcare_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  profession: text("profession").notNull(), // Physiotherapy, Occupational Therapy, Speech & Language Therapy, etc.
  professionalRegistrationNumber: text("professional_registration_number"),
  professionalRegistrationBody: text("professional_registration_body"), // HCPC, RCCP, RCSLT, etc.
  nhsBand: text("nhs_band").notNull(), // Band 5, Band 6, Band 7, Band 8a, Band 8b, Band 8c, Band 8d, Band 9
  experience: text("experience").notNull(), // Junior (0-2 years), Mid-level (3-5 years), Senior (6+ years), Specialist (10+ years)
  availableLocations: text("available_locations").array().notNull(),
  specializations: text("specializations").array(),
  additionalSkills: text("additional_skills"),
  previousNHSExperience: boolean("previous_nhs_experience").default(false),
  consentDataProcessing: boolean("consent_data_processing").notNull(),
  consentReferenceChecks: boolean("consent_reference_checks").notNull(),
  consentTermsConditions: boolean("consent_terms_conditions").notNull(),
  registrationStatus: text("registration_status").default("pending"), // pending, approved, rejected
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// PCN Manager Job Posts
export const pcnJobPosts = pgTable("pcn_job_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  pcnName: text("pcn_name").notNull(),
  contactPersonName: text("contact_person_name").notNull(),
  contactPersonRole: text("contact_person_role").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  location: text("location").notNull(),
  postcode: text("postcode").notNull(),
  jobTitle: text("job_title").notNull(),
  jobRole: text("job_role").notNull(), // From lookup table or free text
  nhsBand: text("nhs_band").notNull(), // Band 2, Band 3, Band 4, Band 5, Band 6, Band 7, Band 8a, Band 8b, Band 8c, Band 8d, Band 9
  contractType: text("contract_type").notNull(), // Permanent, Fixed-term, Locum
  hoursPerWeek: integer("hours_per_week"),
  salary: text("salary"), // e.g., "£25,000 - £30,000 per annum"
  jobDescription: text("job_description").notNull(),
  essentialRequirements: text("essential_requirements").array().notNull(),
  desirableRequirements: text("desirable_requirements").array(),
  benefits: text("benefits").array(),
  startDate: date("start_date"),
  applicationDeadline: date("application_deadline"),
  additionalInfo: text("additional_info"),
  status: text("status").default("active"), // active, filled, expired, withdrawn
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Primary Care Roles Lookup Table
export const primaryCareRoles = pgTable("primary_care_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  roleName: text("role_name").notNull().unique(),
  roleCategory: text("role_category").notNull(), // Clinical, Administrative, Support, Management
  typicalNhsBands: text("typical_nhs_bands").array(), // Typical bands for this role
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ====================================
// SELF-BILLING & INVOICING ENGINE
// ====================================

// Invoice generation settings and configuration
export const invoiceSettings = pgTable("invoice_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  billingFrequency: text("billing_frequency").notNull().default("weekly"), // 'weekly' | 'fortnightly' | 'monthly'
  clientInvoicePrefix: text("client_invoice_prefix").default("JJC-"),
  paystreamInvoicePrefix: text("paystream_invoice_prefix").default("PYS-"),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).default("20.00"),
  isVatRegistered: boolean("is_vat_registered").default(true),
  vatNumber: text("vat_number").default("GB123456789"),
  companyRegistrationNumber: text("company_registration_number").default("12345678"),
  nextClientInvoiceNumber: integer("next_client_invoice_number").default(1000),
  nextPaystreamInvoiceNumber: integer("next_paystream_invoice_number").default(2000),
  paymentTermsDays: integer("payment_terms_days").default(30),
  roundToQuarterHour: boolean("round_to_quarter_hour").default(true),
  autoEmailEnabled: boolean("auto_email_enabled").default(false),
  paystreamApiEndpoint: text("paystream_api_endpoint"),
  paystreamApiKey: text("paystream_api_key"),
  invoiceFooterText: text("invoice_footer_text").default("Thank you for choosing JoyJoy Locums - Professional Medical Staffing Solutions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Main invoices table for both client and PayStream invoices
export const selfBillingInvoices = pgTable("self_billing_invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  invoiceType: text("invoice_type").notNull(), // 'client' | 'paystream'
  status: text("status").default("draft"), // 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  
  // Client/Practice Information (for client invoices)
  clientId: uuid("client_id").references(() => practices.id),
  clientName: text("client_name"),
  clientAddress: text("client_address"),
  clientPostcode: text("client_postcode"),
  clientVatNumber: text("client_vat_number"),
  clientContactEmail: text("client_contact_email"),
  clientContactPhone: text("client_contact_phone"),
  
  // PayStream Information (for payroll invoices)
  paystreamReference: text("paystream_reference"),
  
  // Invoice Dates
  invoiceDate: date("invoice_date").notNull(),
  periodStartDate: date("period_start_date").notNull(),
  periodEndDate: date("period_end_date").notNull(),
  dueDate: date("due_date").notNull(),
  
  // Financial Totals
  subtotalAmount: decimal("subtotal_amount", { precision: 10, scale: 2 }).notNull(),
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  
  // Additional Fields
  notes: text("notes"),
  isSelfBilled: boolean("is_self_billed").default(false), // True for PayStream invoices
  selfBillingReference: text("self_billing_reference"),
  
  // File Storage
  pdfUrl: text("pdf_url"),
  csvUrl: text("csv_url"),
  
  // Audit Trail
  generatedBy: uuid("generated_by").references(() => userProfiles.id),
  sentAt: timestamp("sent_at"),
  paidAt: timestamp("paid_at"),
  cancelledAt: timestamp("cancelled_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_self_billing_invoices_invoice_number").on(table.invoiceNumber),
  index("idx_self_billing_invoices_client_id").on(table.clientId),
  index("idx_self_billing_invoices_period").on(table.periodStartDate, table.periodEndDate),
  index("idx_self_billing_invoices_status").on(table.status),
  index("idx_self_billing_invoices_type").on(table.invoiceType),
]);

// Invoice line items for detailed breakdown
export const selfBillingInvoiceItems = pgTable("self_billing_invoice_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").references(() => selfBillingInvoices.id).notNull(),
  
  // Staff Information
  staffId: uuid("staff_id").references(() => staff.id),
  staffName: text("staff_name").notNull(),
  staffPaystreamId: text("staff_paystream_id"),
  staffNiNumber: text("staff_ni_number"),
  
  // Shift Information
  shiftId: uuid("shift_id").references(() => shifts.id),
  shiftRef: text("shift_ref"),
  shiftDate: date("shift_date").notNull(),
  role: text("role").notNull(),
  
  // Time and Rate Information
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  totalHours: decimal("total_hours", { precision: 5, scale: 2 }).notNull(),
  billableHours: decimal("billable_hours", { precision: 5, scale: 2 }).notNull(), // After rounding
  
  // Rates
  internalRate: decimal("internal_rate", { precision: 8, scale: 2 }).notNull(), // Staff pay rate
  externalRate: decimal("external_rate", { precision: 8, scale: 2 }).notNull(), // Client bill rate
  rateUsed: decimal("rate_used", { precision: 8, scale: 2 }).notNull(), // Actual rate applied
  
  // Line Totals
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(),
  
  // Practice/Location Information
  locationName: text("location_name"),
  locationType: text("location_type"), // 'care_home' | 'gp_practice'
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_self_billing_invoice_items_invoice_id").on(table.invoiceId),
  index("idx_self_billing_invoice_items_staff_id").on(table.staffId),
  index("idx_self_billing_invoice_items_shift_id").on(table.shiftId),
  index("idx_self_billing_invoice_items_shift_date").on(table.shiftDate),
]);

// PayStream staff configuration for self-billing
export const paystreamStaffConfig = pgTable("paystream_staff_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  staffId: uuid("staff_id").references(() => staff.id).notNull(),
  paystreamId: text("paystream_id").notNull().unique(),
  bankAccountName: text("bank_account_name").notNull(),
  bankSortCode: text("bank_sort_code").notNull(),
  bankAccountNumber: text("bank_account_number").notNull(),
  taxCode: text("tax_code").default("1257L"),
  studentLoan: boolean("student_loan").default(false),
  pensionOptOut: boolean("pension_opt_out").default(false),
  selfBillingAgreementSigned: boolean("self_billing_agreement_signed").default(false),
  selfBillingAgreementDate: date("self_billing_agreement_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_paystream_staff_config_staff_id").on(table.staffId),
  index("idx_paystream_staff_config_paystream_id").on(table.paystreamId),
]);

// Billing periods for automated invoice generation
export const billingPeriods = pgTable("billing_periods", {
  id: uuid("id").primaryKey().defaultRandom(),
  periodName: text("period_name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: text("status").default("open"), // 'open' | 'closed'
  clientInvoicesGenerated: boolean("client_invoices_generated").default(false),
  paystreamInvoicesGenerated: boolean("paystream_invoices_generated").default(false),
  totalShifts: integer("total_shifts").default(0),
  totalHours: decimal("total_hours", { precision: 10, scale: 2 }).default("0.00"),
  totalClientAmount: decimal("total_client_amount", { precision: 12, scale: 2 }).default("0.00"),
  totalPaystreamAmount: decimal("total_paystream_amount", { precision: 12, scale: 2 }).default("0.00"),
  notes: text("notes"),
  closedAt: timestamp("closed_at"),
  closedBy: uuid("closed_by").references(() => userProfiles.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_billing_periods_period").on(table.startDate, table.endDate),
  index("idx_billing_periods_status").on(table.status),
]);

// Create insert schemas
export const insertInvoiceSettingsSchema = createInsertSchema(invoiceSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSelfBillingInvoiceSchema = createInsertSchema(selfBillingInvoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSelfBillingInvoiceItemSchema = createInsertSchema(selfBillingInvoiceItems).omit({
  id: true,
  createdAt: true,
});

export const insertPaystreamStaffConfigSchema = createInsertSchema(paystreamStaffConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBillingPeriodSchema = createInsertSchema(billingPeriods).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export types
export type InvoiceSettings = typeof invoiceSettings.$inferSelect;
export type InsertInvoiceSettings = z.infer<typeof insertInvoiceSettingsSchema>;

export type SelfBillingInvoice = typeof selfBillingInvoices.$inferSelect;
export type InsertSelfBillingInvoice = z.infer<typeof insertSelfBillingInvoiceSchema>;

export type SelfBillingInvoiceItem = typeof selfBillingInvoiceItems.$inferSelect;
export type InsertSelfBillingInvoiceItem = z.infer<typeof insertSelfBillingInvoiceItemSchema>;

export type PaystreamStaffConfig = typeof paystreamStaffConfig.$inferSelect;
export type InsertPaystreamStaffConfig = z.infer<typeof insertPaystreamStaffConfigSchema>;

export type BillingPeriod = typeof billingPeriods.$inferSelect;
export type InsertBillingPeriod = z.infer<typeof insertBillingPeriodSchema>;

// New registration form schemas
export const insertAlliedHealthcareRegistrationSchema = createInsertSchema(alliedHealthcareRegistrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPcnJobPostSchema = createInsertSchema(pcnJobPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPrimaryCareRoleSchema = createInsertSchema(primaryCareRoles).omit({
  id: true,
  createdAt: true,
});

// New registration form types
export type AlliedHealthcareRegistration = typeof alliedHealthcareRegistrations.$inferSelect;
export type InsertAlliedHealthcareRegistration = z.infer<typeof insertAlliedHealthcareRegistrationSchema>;

export type PcnJobPost = typeof pcnJobPosts.$inferSelect;
export type InsertPcnJobPost = z.infer<typeof insertPcnJobPostSchema>;

export type PrimaryCareRole = typeof primaryCareRoles.$inferSelect;
export type InsertPrimaryCareRole = z.infer<typeof insertPrimaryCareRoleSchema>;