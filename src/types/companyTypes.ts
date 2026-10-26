export interface Company {
  _id: string;
  name: string;
  slug?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: "active" | "inactive" | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyForm {
  _id?: string;
  name: string;
  slug?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: "active" | "inactive";
}
