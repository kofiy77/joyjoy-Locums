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

// User profiles that extend auth.users with application-specific data
export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  supabaseUserId: uuid("supabase_user_id").notNull().unique(), // References auth.users.id
  userType: text("user_type").notNull(), // 'care_home' | 'staff' | 'admin' | 'business_support'
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Care home groups for multi-location organizations
export const careHomeGroups = pgTable("care_home_groups", {
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

// Care homes
export const careHomes = pgTable("care_homes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userProfileId: uuid("user_profile_id").references(() => userProfiles.id),
  name: text("name").notNull(),
  facilityType: text("facility_type"), // Nursing, Residential, Dementia
  cqcRating: text("cqc_rating"), // Outstanding, Good, Requires Improvement, Inadequate
  cqcRegistrationNumber: text("cqc_registration_number"),
  address: text("address").notNull(),
  postcode: text("postcode").notNull(),
  mainPhone: text("main_phone").notNull(),
  emergencyPhone: text("emergency_phone"),
  emailAddress: text("email_address"),
  primaryContactName: text("primary_contact_name").notNull(),
  primaryContactRole: text("primary_contact_role"),
  groupId: uuid("group_id").references(() => careHomeGroups.id),
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
  createdAt: timestamp("created_at").defaultNow(),
});

// Staff certifications
export const certifications = pgTable("certifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  staffId: uuid("staff_id").references(() => staff.id),
  type: text("type").notNull(), // 'dbs_check' | 'moving_handling' | 'safeguarding' | etc.
  title: text("title").notNull(),
  issueDate: timestamp("issue_date"),
  expiryDate: timestamp("expiry_date"),
  documentUrl: text("document_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  extractedText: text("extracted_text"),
  verificationStatus: text("verification_status").default("pending"),
  verifiedBy: uuid("verified_by").references(() => userProfiles.id),
  verifiedAt: timestamp("verified_at"),
  isValid: boolean("is_valid").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shifts
export const shifts = pgTable("shifts", {
  id: uuid("id").primaryKey().defaultRandom(),
  careHomeId: uuid("care_home_id").references(() => careHomes.id),
  role: text("role").notNull(),
  date: timestamp("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 5, scale: 2 }).notNull(),
  requiredSkills: jsonb("required_skills").$type<string[]>(),
  additionalNotes: text("additional_notes"),
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

// Care home documents
export const careHomeDocuments = pgTable("care_home_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  careHomeId: uuid("care_home_id").references(() => careHomes.id).notNull(),
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

// Rate cards
export const rateCards = pgTable("rate_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  careHomeId: uuid("care_home_id").references(() => careHomes.id).notNull(),
  role: text("role").notNull(),
  dayType: text("day_type").notNull(), // weekday, weekend, bank_holiday
  shiftType: text("shift_type").notNull(), // day, night, evening
  internalRate: decimal("internal_rate", { precision: 6, scale: 2 }).notNull(),
  externalRate: decimal("external_rate", { precision: 6, scale: 2 }).notNull(),
  overtimeMultiplier: decimal("overtime_multiplier", { precision: 3, scale: 2 }).default('1.5'),
  nightShiftMultiplier: decimal("night_shift_multiplier", { precision: 3, scale: 2 }).default('1.2'),
  weekendMultiplier: decimal("weekend_multiplier", { precision: 3, scale: 2 }).default('1.3'),
  bankHolidayMultiplier: decimal("bank_holiday_multiplier", { precision: 3, scale: 2 }).default('2.0'),
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").references(() => userProfiles.id).notNull(),
  updatedBy: uuid("updated_by").references(() => userProfiles.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoices
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  careHomeId: uuid("care_home_id").references(() => careHomes.id).notNull(),
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

// Care home communications
export const careHomeCommunications = pgTable("care_home_communications", {
  id: uuid("id").primaryKey().defaultRandom(),
  careHomeId: uuid("care_home_id").references(() => careHomes.id).notNull(),
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
  careHomeId: uuid("care_home_id").references(() => careHomes.id),
  careHomeGroupId: uuid("care_home_group_id").references(() => careHomeGroups.id),
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

// Zod schemas for validation
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCareHomeSchema = createInsertSchema(careHomes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
});

export const insertCertificationSchema = createInsertSchema(certifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShiftSchema = createInsertSchema(shifts).omit({
  id: true,
  createdAt: true,
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

export const insertCareHomeGroupSchema = createInsertSchema(careHomeGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCareHomeDocumentSchema = createInsertSchema(careHomeDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRateCardSchema = createInsertSchema(rateCards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export const insertCareHomeCommunicationSchema = createInsertSchema(careHomeCommunications).omit({
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

// Type exports
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export type CareHome = typeof careHomes.$inferSelect;
export type InsertCareHome = z.infer<typeof insertCareHomeSchema>;

export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;

export type Certification = typeof certifications.$inferSelect;
export type InsertCertification = z.infer<typeof insertCertificationSchema>;

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

export type CareHomeGroup = typeof careHomeGroups.$inferSelect;
export type InsertCareHomeGroup = z.infer<typeof insertCareHomeGroupSchema>;

export type CareHomeDocument = typeof careHomeDocuments.$inferSelect;
export type InsertCareHomeDocument = z.infer<typeof insertCareHomeDocumentSchema>;

export type RateCard = typeof rateCards.$inferSelect;
export type InsertRateCard = z.infer<typeof insertRateCardSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;

export type CareHomeCommunication = typeof careHomeCommunications.$inferSelect;
export type InsertCareHomeCommunication = z.infer<typeof insertCareHomeCommunicationSchema>;

export type BusinessSupportPermission = typeof businessSupportPermissions.$inferSelect;
export type InsertBusinessSupportPermission = z.infer<typeof insertBusinessSupportPermissionSchema>;