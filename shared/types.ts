// Basic types for PostgreSQL authentication system

export interface User {
  id: string;
  email: string;
  type: 'admin' | 'care_home' | 'staff' | 'business_support';
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  postcode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Shift {
  id: string;
  careHomeId: string;
  role: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: 'open' | 'assigned' | 'accepted';
  staffId?: string;
  requiredSkills: string[];
  notes?: string;
  internalRate?: number;
  externalRate?: number;
  shiftRef?: string;
}

export interface CareHome {
  id: string;
  name: string;
  address: string;
  postcode: string;
  phone: string;
  managerId: string;
}

export interface Staff {
  id: string;
  userId: string;
  role: string;
  skills: string[];
  isAvailable: boolean;
  workload: number;
}

export interface Certification {
  id: string;
  staffId: string;
  type: string;
  isValid: boolean;
  expiryDate?: Date;
}

export interface ShiftAssignment {
  id: string;
  shiftId: string;
  staffId: string;
  status: 'assigned' | 'accepted' | 'declined';
  assignedAt: Date;
  responseAt?: Date;
}