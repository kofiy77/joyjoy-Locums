// Document Storage Schema for Supabase
// Comprehensive solution for handling document uploads across the platform

export interface DocumentStorageConfig {
  // Storage buckets for different document types
  buckets: {
    'staff-documents': {
      description: 'Staff personal documents (DBS, CV, certificates, ID)',
      maxFileSize: '10MB',
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    },
    'care-home-documents': {
      description: 'Care home compliance and operational documents',
      maxFileSize: '25MB',
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/csv', 'application/vnd.ms-excel']
    },
    'admin-documents': {
      description: 'Administrative documents, reports, invoices',
      maxFileSize: '50MB',
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/csv', 'application/vnd.ms-excel']
    },
    'system-documents': {
      description: 'System-generated reports and backups',
      maxFileSize: '100MB',
      allowedTypes: ['application/pdf', 'text/csv', 'application/json', 'application/zip']
    }
  }
}

// Document metadata table structure
export interface DocumentMetadata {
  id: string;
  storage_bucket: 'staff-documents' | 'care-home-documents' | 'admin-documents' | 'system-documents';
  storage_path: string; // Full path in bucket
  entity_type: 'staff' | 'care_home' | 'admin' | 'invoice' | 'feedback' | 'certificate' | 'report';
  entity_id: string; // UUID of related entity
  document_type: string; // Specific document type
  title: string;
  description?: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string; // User ID who uploaded
  uploaded_at: Date;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: Date;
  expiry_date?: Date; // For documents that expire
  is_confidential: boolean;
  access_level: 'public' | 'internal' | 'restricted' | 'confidential';
  tags: string[]; // For categorization and search
  version: number; // Document versioning
  parent_document_id?: string; // For document versions
  checksum: string; // File integrity verification
  ocr_text?: string; // Extracted text for searchability
  created_at: Date;
  updated_at: Date;
}

// Document access permissions
export interface DocumentAccess {
  id: string;
  document_id: string;
  user_id?: string;
  role?: 'admin' | 'care_home' | 'staff' | 'business_support';
  care_home_id?: string; // For care home specific access
  permission_type: 'read' | 'write' | 'delete' | 'admin';
  granted_by: string;
  granted_at: Date;
  expires_at?: Date;
  is_active: boolean;
}

// Document categories for organization
export const DOCUMENT_CATEGORIES = {
  STAFF: {
    IDENTITY: ['passport', 'driving_license', 'national_id', 'visa'],
    QUALIFICATIONS: ['degree', 'diploma', 'certificate', 'training_record'],
    COMPLIANCE: ['dbs_check', 'right_to_work', 'references', 'medical_clearance'],
    EMPLOYMENT: ['cv', 'cover_letter', 'employment_history', 'contract'],
    PERSONAL: ['photo', 'emergency_contacts', 'next_of_kin']
  },
  CARE_HOME: {
    REGISTRATION: ['cqc_certificate', 'registration_documents', 'license'],
    INSURANCE: ['liability_insurance', 'professional_indemnity', 'property_insurance'],
    POLICIES: ['safeguarding_policy', 'health_safety_policy', 'gdpr_policy'],
    COMPLIANCE: ['fire_safety_certificate', 'food_hygiene_certificate', 'risk_assessments'],
    CONTRACTS: ['service_agreements', 'supplier_contracts', 'staff_contracts'],
    FINANCIAL: ['accounts', 'audit_reports', 'tax_documents']
  },
  ADMIN: {
    INVOICES: ['monthly_invoice', 'annual_statement', 'payment_receipt'],
    REPORTS: ['performance_report', 'compliance_report', 'incident_report'],
    FEEDBACK: ['care_home_feedback', 'staff_feedback', 'client_feedback'],
    SYSTEM: ['backup_files', 'audit_logs', 'system_reports'],
    LEGAL: ['contracts', 'agreements', 'legal_notices']
  }
} as const;

// Storage path structure for organization
export const STORAGE_PATHS = {
  staff: (staffId: string, category: string, filename: string) => 
    `staff/${staffId}/${category}/${Date.now()}-${filename}`,
  
  careHome: (careHomeId: string, category: string, filename: string) => 
    `care-homes/${careHomeId}/${category}/${Date.now()}-${filename}`,
  
  admin: (category: string, subcategory: string, filename: string) => 
    `admin/${category}/${subcategory}/${Date.now()}-${filename}`,
  
  system: (category: string, filename: string) => 
    `system/${category}/${new Date().toISOString().split('T')[0]}/${filename}`
} as const;

// File validation rules
export const FILE_VALIDATION = {
  maxSizes: {
    'staff-documents': 10 * 1024 * 1024, // 10MB
    'care-home-documents': 25 * 1024 * 1024, // 25MB
    'admin-documents': 50 * 1024 * 1024, // 50MB
    'system-documents': 100 * 1024 * 1024 // 100MB
  },
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ],
  requiredFields: ['title', 'document_type', 'entity_type', 'entity_id'],
  virusScanning: true,
  ocrProcessing: true
} as const;