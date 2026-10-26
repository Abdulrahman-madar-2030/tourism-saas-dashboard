import { Tour } from "./toursTypes";

export interface Branch {
  _id?: string;
  package: string;
  name?: string;
  daysCount?: number;
  nightsCount?: number;
  price?: number;
  includes: string[] | { value: string }[];
  excludes: string[] | { value: string }[];
  days: Day[];
}

export interface Day {
  dayNumber: number;
  type: "TOUR" | "CUSTOM";
  customTitle?: string;
  customDescription?: string;
  tour?: Tour;
}
