export interface SocialMedia {
  name: string;
  url: string;
  deskTopImage: string;
  mobileImage: string;
}

export interface ContactInfo {
  phones: Phone[];
  emails: Email[];
  addresses: string[];
}

export interface SocialMediaData {
  facebook: SocialMedia;
  instagram: SocialMedia;
  youtube: SocialMedia;
  twitter: SocialMedia;
  tiktok: SocialMedia;
  snapchat: SocialMedia;
  whatsApp: SocialMedia;
}

export interface Phone {
  number: string;
  label: string;
  isPrimary: boolean;
  isWhatsApp: boolean;
  countryCode: string;
  _id?: string;
}
export interface Email {
  email: string;
  label: string;
  isPrimary: boolean;
  department: string;
  _id?: string;
}
export interface SocialMediaPlatform {
  name: string;
  url: string;
  deskTopImage: { url: string; alt?: string } | string;
  mobileImage: { url: string; alt?: string } | string;
  _id?: string;
}
export interface SettingsData {
  _id?: string;
  contactInfo: {
    phones: Phone[];
    emails: Email[];
    addresses: string[];
  };
  socialMedia: SocialMediaPlatform[];
}
