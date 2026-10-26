import { Seo as BaseSeo } from "./seoTypes";

export interface Root {
  status: string;
  results: number;
  data: Data;
}

export interface Data {
  data: Tour[];
}

export interface Seo extends BaseSeo {
  slug: string;
}

export interface Tour {
  seo: Seo;
  _id: string;
  productCode?: string;
  title: string;
  description: string;
  shortDescription: string;
  rating?: Rating;
  price?: Price;
  duration: string;
  coverImage: CoverImage;
  city: City;
  country: Country;
  images: ImageItem[];
  cancellationPolicy?: CancellationPolicy;
  isInstantConfirmation: boolean;
  isFreeCancellation: boolean;
  timeZone?: string;
  pricingInfo?: PricingInfo;
  reviews?: Reviews;
  ticketInfo?: TicketInfo;
  supplier?: Supplier;
  bookingConfirmationSettings?: BookingConfirmationSettings;
  bookingRequirements?: BookingRequirements;
  inclusions: string[];
  exclusions: string[];
  additionalInfo?: string[];
  itinerary?: Itinerary;
  productOptions?: ProductOption[];
  logistics?: Logistics;
  tags?: string[];
  packages?: Package[];
  slug: string;
  alt: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  id: string;
  imageCover?: string;
  descText?: string;
}

export interface TourForm {
  seo?: Seo;
  _id?: string;
  productCode?: string;
  title?: string;
  description?: string;
  shortDescription?: string;
  duration?: string;
  slug?: string;
  alt?: string;
  coverImage?: CoverImage;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  city?: any;
  country?: string;
  price?: Price;
  cancellationPolicy?: CancellationPolicy;
  isInstantConfirmation?: boolean;
  isFreeCancellation?: boolean;
  timeZone?: string;
  pricingInfo?: PricingInfo;
  inclusions?: string[] | { value: string }[];
  exclusions?: string[] | { value: string }[];
  additionalInfo?: string[] | { value: string }[];
  itinerary?: Itinerary;
  productOptions?: ProductOption[];
  logistics?: Logistics;
  tags?: string[] | { value: string }[];
  packages?: Package[];
  imageCover?: File | CoverImage | null;
  imageCoverAlt?: string;
  images?: (File | ImageItem)[];
  id?: string;
}

export interface Rating {
  average: number;
  count: number;
}

export interface Price {
  amount: number;
  currency: string;
}

export interface CoverImage {
  url: string;
  alt: string;
}

export interface ImageItem {
  url: string;
  alt: string;
  isCover: boolean;
}

export interface CancellationPolicy {
  type: string;
  description: string;
}

export interface PricingInfo {
  type: string;
  ageBands: AgeBand[];
}

export interface AgeBand {
  ageBand: string;
  startAge: number;
  endAge: number;
  minTravelersPerBooking: number;
  maxTravelersPerBooking: number;
}

export interface Reviews {
  sources: ReviewSource[];
  reviewCountTotals: ReviewCountTotal[];
  totalReviews: number;
}

export interface ReviewSource {
  provider: string;
  reviewCounts: ReviewCountTotal[];
  totalCount: number;
  averageRating: number;
}

export interface ReviewCountTotal {
  rating: number;
  count: number;
}

export interface TicketInfo {
  ticketTypes: string[];
  ticketTypeDescription: string;
  ticketsPerBooking: string;
  ticketsPerBookingDescription: string;
}

export interface Supplier {
  name: string;
  reference: string;
}

export interface BookingConfirmationSettings {
  bookingCutoffType: string;
  bookingCutoffInMinutes: number;
  confirmationType: string;
}

export interface BookingRequirements {
  minTravelersPerBooking: number;
  maxTravelersPerBooking: number;
  requiresAdultForBooking: boolean;
}

export interface Itinerary {
  itineraryType: string;
  skipTheLine: boolean;
  privateTour: boolean;
  maxTravelersInSharedTour: number;
  duration: {
    fixedDurationInMinutes: number;
  };
  itineraryItems: ItineraryItem[];
}

export interface ItineraryItem {
  duration: {
    fixedDurationInMinutes: number;
  };
  passByWithoutStopping: boolean;
  admissionIncluded: string;
  description: string;
}

export interface ProductOption {
  productOptionCode: string;
  description: string;
  title: string;
  languageGuides: LanguageGuide[];
}

export interface LanguageGuide {
  type: string;
  language: string;
  legacyGuide: string;
}

export interface Logistics {
  start: { description: string }[];
  end: { description: string }[];
  redemption: {
    redemptionType: string;
    specialInstructions: string;
  };
  travelerPickup?: {
    pickupOptionType: string;
    allowCustomTravelerPickup: boolean;
    pickupInstructions?: string;
  };
}

export interface Package {
  _id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
}

export interface City {
  _id: string;
  name: string;
  slug: string;
  id?: string;
  coordinates?: {
    lat: string;
    lon: string;
  };
  country: {
    name: string;
    slug: string;
    _id?: string;
  };
}

export interface Country {
  _id: string;
  name: string;
  slug: string;
  id?: string;
}
