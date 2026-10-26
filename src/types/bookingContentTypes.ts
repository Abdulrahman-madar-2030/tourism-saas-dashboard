export interface BookingStep {
  step: number;
  badge: string;
  title: string;
  description: string;
  footer: string;
}

export interface BookingGuarantee {
  badge: string;
  title: string;
  description: string;
  benefits: string[];
}

export interface PopulatedPackage {
  _id: string;
  name?: string;
  title?: string;
  slug?: string;
}
  
export interface BookingContent {
  _id: string;
  package?: string | PopulatedPackage;
  currency?: string;
  depositAmount: number;
  steps: BookingStep[];
  guarantee?: BookingGuarantee;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface BookingContentForm {
  package?: string;
  depositAmount: number;
  steps: BookingStep[];
  guarantee?: BookingGuarantee;
}
