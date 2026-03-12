export interface Service {
  id: string;
  name: string;
  nameNp: string;
  type: string;
  location?: string;
  constituencyId: string;
  avgRating?: number | null;
  avgTime?: number | null;
  reportCount?: number;
}

export interface SummaryCard {
  key: string;
  title: string;
  service: Service | null;
  value: string | null;
  accent: string;
}
