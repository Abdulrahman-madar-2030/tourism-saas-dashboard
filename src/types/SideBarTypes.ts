import { IconType } from "react-icons";

export interface SideBarLinkGroup {
    group_name: string;
    links: Links[];
}

export interface Links {
  link_name: string;
  path: string;
  icon: IconType;
  badge?: string;
  badgeColor?: string;
}