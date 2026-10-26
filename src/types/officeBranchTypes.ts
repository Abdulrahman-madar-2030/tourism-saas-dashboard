export interface OfficeBranchWorkingHours {
  from: string;
  to: string;
}

export interface OfficeBranchCoordinates {
  lat: number;
  lng: number;
}

export interface OfficeBranchImageCover {
  url: string;
  alt?: string;
  publicId?: string;
}

export interface OfficeBranch {
  _id: string;
  name: string;
  country: string | { _id: string; name: string; slug?: string; imageCover?: any };
  city?: string | { _id: string; name: string };
  address: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  workingHours?: OfficeBranchWorkingHours;
  status?: "open" | "closed";
  isActive?: boolean;
  openTime?: string;
  closeTime?: string;
  lat?: number | string;
  lng?: number | string;
  image?: any;
  imageCover?: OfficeBranchImageCover;
  images?: any[];
  coordinates?: OfficeBranchCoordinates;
  mapUrl?: string;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OfficeBranchForm {
  _id?: string;
  name: string;
  country: string;
  city?: string;
  address: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  openTime?: string;
  closeTime?: string;
  status?: "open" | "closed";
  isActive?: boolean;
  lat?: string | number;
  lng?: string | number;
  mapUrl?: string;
  displayOrder?: number;
  image?: File | string | OfficeBranchImageCover | null;
}
