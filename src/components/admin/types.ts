export interface ServiceTypeConfig {
  id: string;
  slug: string;
  name: string;
  nameNp: string;
  icon: string;
  _count?: { services: number };
}

export interface Province {
  id: string;
  name: string;
  nameNp: string;
  _count?: { districts: number };
}

export interface District {
  id: string;
  name: string;
  nameNp: string;
  provinceId: string;
  province?: { id: string; name: string; nameNp: string };
  _count?: { constituencies: number };
}

export interface Constituency {
  id: string;
  name: string;
  nameNp: string;
  province?: string;
  provinceNp?: string | null;
  districtId?: string;
  district?: {
    id: string;
    name: string;
    nameNp: string;
    provinceId: string;
    province?: { id: string; name: string; nameNp: string };
  };
  imageUrl?: string;
  description?: string;
  _count?: { services: number; reports: number };
}

export interface Service {
  id: string;
  name: string;
  nameNp: string;
  type: string;
  location?: string;
  description?: string;
  descriptionNp?: string;
  constituencyId: string;
  constituency?: { name: string };
  reportCount?: number;
}

export interface ServiceRequest {
  id: string;
  name: string;
  description?: string | null;
  constituencyId: string;
  status: "pending" | "approved" | "rejected";
  approvedServiceId?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  constituency?: { id: string; name: string; nameNp: string };
  approvedService?: { id: string; name: string; nameNp: string } | null;
  reviewedBy?: { id: string; name?: string | null; email?: string | null } | null;
}

export interface Report {
  id: string;
  constituencyId?: string;
  serviceTimeMinutes: number;
  rating: number;
  comment?: string;
  isHidden: boolean;
  isModerated: boolean;
  createdAt: string;
  publicService?: { name: string; type?: string };
  user?: { name: string } | null;
}

export type Tab = "constituencies" | "services" | "serviceRequests" | "serviceTypes" | "reports" | "provinces" | "districts";
export type SidebarNav = "manage" | "settings";

export interface TabCounts {
  constituencies: number;
  services: number;
  serviceRequests: number;
  serviceTypes: number;
  reports: number;
  provinces: number;
  districts: number;
}

export interface ConstituencyFormData {
  name: string;
  nameNp: string;
  districtId: string;
  imageUrl: string;
  description: string;
}

export interface ServiceFormData {
  name: string;
  nameNp: string;
  type: string;
  location: string;
  description: string;
  descriptionNp: string;
  constituencyId: string;
}
