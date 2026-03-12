export interface ServiceEntry {
  id: string;
  name: string;
  nameNp: string;
  type: string;
  avgRating: number;
  avgTime: number;
  reportCount: number;
  constituency: { name: string; nameNp: string };
}

export interface GlobalServiceEntry {
  id: string;
  name: string;
  nameNp: string;
  type: string;
  constituencyId?: string;
  avgRating?: number | null;
  avgTime?: number | null;
  reportCount?: number;
  constituency?: { name: string; nameNp: string };
}

export interface ConstituencyEntry {
  id: string;
  name: string;
  nameNp: string;
  province?: string | null;
  provinceNp?: string | null;
  _count: { services: number; reports: number };
}
