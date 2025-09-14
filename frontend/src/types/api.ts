export interface ShortenRequest {
  originalUrl: string;
  customAlias?: string;
  expiresAt?: string | null; // ISO
}

export interface ShortenResponse {
  code: string;
  shortUrl: string;
  expiresAt?: string | null;
}

export interface UrlItemDto {
  code: string;
  originalUrl: string;
  createdAt: string; // ISO
  expiresAt?: string | null;
  totalClicks: number;
  shortUrl: string;
}

export interface ClickDto {
  clickedAt: string; // ISO
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface StatsResponse {
  code: string;
  originalUrl: string;
  createdAt: string;
  expiresAt?: string | null;
  totalClicks: number;
  lastClicks: ClickDto[];
}
