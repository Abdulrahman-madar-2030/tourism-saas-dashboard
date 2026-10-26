// ─── Tour reference inside an itinerary day ─────────────────────────────────
export interface VariantTour {
  _id: string;
  title: string;
  slug: string;
  description: string;
  duration: string;
  price: { amount: number; currency: string };
  rating: { average: number; count: number };
  images: { url: string; alt: string }[];
  inclusions: string[];
  exclusions: string[];
}

// ─── Itinerary day types ──────────────────────────────────────────────────────
export interface CustomActivity {
  title: string;
  description: string;
  duration: { timeFrom: string; timeTo: string };
}

export interface ItineraryDay {
  day: number;
  date?: string;
  type: "CUSTOM" | "TOUR";
  title?: string;
  description?: string;
  activity: CustomActivity[];
  tour?: VariantTour;
}

// ─── Package Variant ──────────────────────────────────────────────────────────
export interface VariantCity {
  _id: string;
  name: string;
  slug: string;
  imageCover: string | null;
}

export interface PackageVariant {
  _id?: string;
  package?: string | PackageInfo;
  name: string;
  slug?: string;
  description: string;
  cities: string[] | VariantCity[];
  duration: { days: number; nights: number };
  price: number;
  currency: string;
  itinerary: ItineraryDay[];
  isActive?: boolean;
  basePrice?: number;
  toursPrice?: number;
  seo?: {
    keywords: string[];
    priority: number;
    changeFrequency: string;
    noIndex: string;
    noFollow: string;
    noArchive: string;
    noSnippet: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface PackageServiceItem {
  _id: string;
  name: string;
  image?: { url: string; alt?: string };
  slug?: string;
  description?: string;
  method?: string;
}

// ─── Package Info (pkg) ───────────────────────────────────────────────────────
export interface PackageInfo {
  _id: string;
  name: string;
  slug: string;
  packageType?: {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    imageCover?: { url: string; alt?: string };
  };
  country?: {
    _id: string;
    name: string;
    imageCover?: { url?: string; alt?: string } | string | null;
    slug?: string;
    continent?: string;
    currency?: string;
    language?: string;
    description?: string;
    shortDescription?: string;
    bestTimeToVisit?: string;
    VisaRequirements?: string;
    tripDuration?: string;
    tourGuide?: string;
    countryInfo?: Array<{
      _id?: string;
      title?: string;
      solution?: string;
      description?: string;
    }>;
  };
  description: string;
  imageCover?: { url: string; alt?: string };
  images?: { url: string; alt?: string }[];
  includes: Array<string | PackageServiceItem>;
  excludes: Array<string | PackageServiceItem>;
  offer?: {
    oldPrice?: number;
    newPrice?: number;
    startDate?: string;
    endDate?: string;
  };
  hotels?: Array<{
    _id?: string;
    hotel?: string;
    name: string;
    link?: string;
    meals?: string[];
    city?: string;
    stars?: number;
    rating?: number;
    type?: string;
    view?: string;
    description?: string;
    image?: string;
    hasJacuzzi?: boolean;
    hasPrivatePool?: boolean;
  }>;
  hotelIds?: Array<{
    _id?: string;
    hotelId?: string;
    name: string;
    type?: "hotel" | "cabin" | "villa" | string;
    view?: string;
    mealPlan?: string;
    hasJacuzzi?: boolean;
    hasPrivatePool?: boolean;
    description?: string;
    cityId?: string;
    city?: string;
    image?: string;
    rating?: number;
    stars?: number;
    address?: string;
    url?: string;
    price?: number;
    currency?: string;
  }>;
  flights?: Array<{
    _id?: string;
    airline?: {
      _id?: string;
      name: string;
      imageCover?: { url: string; alt?: string };
      slug?: string;
    } | string;
    flightNumber?: string;
    from?: string;
    to?: string;
    departureDate?: string;
    departureTime?: string;
    arrivalDate?: string;
    arrivalTime?: string;
  }>;
  practicalInfo?: Array<{
    _id?: string;
    title: string;
    value: string;
    icon?: string;
  }>;
  isActive?: boolean;
  seo?: {
    title?: string;
    metaTitle?: string;
    description?: string;
    metaDescription?: string;
    slugUrl?: string;
    keywords?: string[];
    priority?: number;
    changeFrequency?: string;
    noIndex?: string | boolean;
    noFollow?: string | boolean;
    noArchive?: string | boolean;
    noSnippet?: string | boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

// ─── Form types for variant creation/editing ─────────────────────────────────
export interface VariantFormActivity {
  title: string;
  description: string;
  timeFrom: string;
  timeTo: string;
}

export interface VariantFormItineraryDay {
  day: number;
  type: "CUSTOM" | "TOUR";
  date?: string;
  title?: string;
  description?: string;
  activities: VariantFormActivity[];
  tour?: string; // tour ID
}

// City option used inside the variant form
export interface VariantFormCity {
  _id: string;
  name: string;
  slug: string;
}

export interface VariantForm {
  name: string;
  description: string;
  cities: VariantFormCity[]; // array of { _id, name, slug } objects
  duration: { days: number; nights: number };
  price: number | string; // string to support decimal text input
  currency: string;
  itinerary: VariantFormItineraryDay[];
  isActive: boolean;
}
