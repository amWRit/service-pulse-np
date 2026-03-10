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
  province?: Province;
  _count?: { constituencies: number };
}

export interface Constituency {
  id: string;
  name: string;
  nameNp: string;
  province?: string;
  districtId?: string;
  district?: { id: string; name: string; provinceId: string; province?: { id: string; name: string } };
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

export interface Report {
  id: string;
  constituencyId?: string;
  serviceTimeMinutes: number;
  rating: number;
  comment?: string;
  isHidden: boolean;
  isModerated: boolean;
  createdAt: string;
  publicService?: { name: string };
  user?: { name: string } | null;
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
