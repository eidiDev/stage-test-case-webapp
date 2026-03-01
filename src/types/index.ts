// Enums
export enum ProcessStatus {
  ACTIVE = 'ACTIVE',
  IN_REVIEW = 'IN_REVIEW',
  CRITICAL = 'CRITICAL',
}

export enum ProcessType {
  SYSTEM = 'SYSTEM',
  MANUAL = 'MANUAL',
}

export enum ProcessPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

// Relation DTO
export interface RelationIdDto {
  id: string;
}

// Entities
export interface Area {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tool {
  id: string;
  name: string;
  description?: string;
  url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: string;
  name: string;
  email: string;
  role?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Process {
  id: string;
  name: string;
  description?: string;
  status: ProcessStatus;
  type: ProcessType;
  priority: ProcessPriority;
  is_active: boolean;
  area?: Area | RelationIdDto;
  parent?: Process | RelationIdDto | null;
  children?: Process[];
  tools?: Tool[] | RelationIdDto[];
  people?: Person[] | RelationIdDto[];
  documents?: Document[] | RelationIdDto[];
  created_at: string;
  updated_at: string;
}

export interface CreateProcessDto {
  name: string;
  description?: string;
  status: ProcessStatus;
  type: ProcessType;
  priority: ProcessPriority;
  area: RelationIdDto;
  parent?: RelationIdDto | null;
  children?: CreateProcessDto[];
  tools?: RelationIdDto[];
  people?: RelationIdDto[];
  documents?: RelationIdDto[];
}

export interface UpdateProcessDto {
  name?: string;
  description?: string;
  status?: ProcessStatus;
  type?: ProcessType;
  priority?: ProcessPriority;
  area?: RelationIdDto;
  parent?: RelationIdDto | null;
  tools?: RelationIdDto[];
  people?: RelationIdDto[];
  documents?: RelationIdDto[];
  // NEVER send children in PATCH
}

// Auth
export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

// Dashboard
export interface DashboardMetrics {
  totalProcesses: number;
  activeProcesses: number;
  criticalProcesses: number;
  totalAreas: number;
  totalPeople: number;
  totalDocuments: number;
}
