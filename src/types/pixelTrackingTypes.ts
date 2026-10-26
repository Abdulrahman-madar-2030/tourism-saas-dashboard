export interface PixelTriggers {
  purchase?: boolean;
  pageView?: boolean;
  viewContent?: boolean;
  search?: boolean;
  lead?: boolean;
  completeRegistration?: boolean;
  addToCart?: boolean;
  initiateCheckout?: boolean;
  [key: string]: boolean | undefined;
}

export interface PixelConfigEvents {
  purchase?: string;
  lead?: string;
  [key: string]: string | undefined;
}

export interface PixelConfig {
  _id: string;
  id?: string;
  pixelConfigId?: string;
  name: string;
  platform: string;
  trackingId: string;
  events?: PixelConfigEvents;
  triggers?: PixelTriggers;
  isActive?: boolean;
  isTestMode?: boolean;
  targetPages?: string[];
  excludePages?: string[];
  description?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PixelConfigForm {
  _id?: string;
  name: string;
  platform: string;
  trackingId: string;
  description?: string;
  isActive?: boolean;
  isTestMode?: boolean;
  events?: {
    purchase?: string;
    lead?: string;
  };
  triggers?: PixelTriggers;
  targetPages?: string[] | string;
  excludePages?: string[] | string;
}

export interface PixelTrackingStats {
  _id?: string | null;
  totalHits?: number;
  uniqueHits?: number;
  totalConversions?: number;
  totalConversionValue?: number;
  uniqueUsers?: number;
  uniqueEmails?: number;
  totalEvents?: number;
  pageViews?: number;
  purchases?: number;
  leads?: number;
  conversions?: number;
  activePixels?: number;
  byPlatform?: Record<string, number>;
  byEvent?: Record<string, number>;
  [key: string]: any;
}

export interface PixelCampaign {
  _id?: string | null;
  id?: string;
  campaignId?: string | null;
  campaignName?: string;
  name?: string;
  platform?: string;
  source?: string;
  totalHits?: number;
  uniqueHits?: number;
  conversions?: number;
  conversionValue?: number;
  conversionRate?: number;
  uniqueUsers?: number;
  countries?: number;
  devices?: number;
  totalEvents?: number;
  clicks?: number;
  leads?: number;
  purchases?: number;
  revenue?: number;
  currency?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}
