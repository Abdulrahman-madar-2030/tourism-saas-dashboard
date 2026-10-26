import { SideBarLinkGroup } from "@/types/SideBarTypes";
import { AiFillHome } from "react-icons/ai";
import {
  FaSuitcase,
  FaBuilding,
  FaCity,
  FaRegFlag,
  FaTags,
  FaUserGroup,
  FaUserShield,
  FaMapLocationDot,
  FaWarehouse,
  FaChartLine,
  FaListCheck,
  FaStar,
  FaGear,
  FaHeadset,
  FaBullhorn,
  FaChartPie,
  FaTableCellsLarge,
} from "react-icons/fa6";
import { FaExclamationTriangle, FaClipboardList } from "react-icons/fa";
import { TfiMore } from "react-icons/tfi";
import { BsPostcardFill } from "react-icons/bs";
import { SlSocialInstagram } from "react-icons/sl";
import { TbSeo } from "react-icons/tb";
import { RiHotelLine } from "react-icons/ri";

export interface NavItem {
  link_name: string;
  path: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
  keywords?: string[];
  group_name: string;
}

export const linkGroups: SideBarLinkGroup[] = [
  {
    group_name: "الرئيسية",
    links: [
      {
        link_name: "لوحة التحكم الرئيسية",
        path: "/dashboard/home",
        icon: AiFillHome,
      },
    ],
  },
  {
    group_name: "إدارة المنصة",
    links: [
      {
        link_name: "SEO ومحركات البحث",
        path: "/dashboard/seo-pages",
        icon: TbSeo,
      },
      {
        link_name: "تتبع التحويلات (Pixel)",
        path: "/dashboard/pixel-tracking",
        icon: FaChartLine,
      },
    ],
  },
  {
    group_name: "إدارة الشركاء",
    links: [
      {
        link_name: "إدارة الشركات والوكالات",
        path: "/dashboard/companies",
        icon: FaBuilding,
        badge: "SaaS",
        badgeColor: "bg-emerald-50 text-emerald-600 border border-emerald-200",
      },
      {
        link_name: "مدراء ومستخدمي النظام",
        path: "/dashboard/users",
        icon: FaUserShield,
      },
      {
        link_name: "قاعدة بيانات العملاء",
        path: "/dashboard/clients",
        icon: FaUserGroup,
      },
    ],
  },
  {
    group_name: "إدارة الفنادق",
    links: [
      {
        link_name: "إدارة الفنادق والمنتجعات",
        path: "/dashboard/hotels",
        icon: RiHotelLine,
      },
      {
        link_name: "شبكة الفروع والمكاتب",
        path: "/dashboard/office-branches",
        icon: FaWarehouse,
      },
    ],
  },
  {
    group_name: "إدارة الجولات والرحلات",
    links: [
      {
        link_name: "إدارة كتالوج الباقات",
        path: "/dashboard/packages",
        icon: FaSuitcase,
      },
      {
        link_name: "تصنيفات وأنواع الباقات",
        path: "/dashboard/tourism-packages",
        icon: FaTags,
      },
      {
        link_name: "إدارة الجولات السياحية",
        path: "/dashboard/tours",
        icon: FaMapLocationDot,
      },
      {
        link_name: "طلبات وبلاغات الحجز",
        path: "/dashboard/booking-issues",
        icon: FaExclamationTriangle,
        badge: "Live",
        badgeColor: "bg-rose-50 text-rose-600 border border-rose-200",
      },
      {
        link_name: "محتوى ونصوص الحجز",
        path: "/dashboard/booking-content",
        icon: FaClipboardList,
      },
      {
        link_name: "المشتملات والاستثناءات",
        path: "/dashboard/package-inclusions",
        icon: FaListCheck,
      },
    ],
  },
  {
    group_name: "المحتوى والتسويق",
    links: [
      {
        link_name: "المدونات والمقالات الترويجية",
        path: "/dashboard/blogs",
        icon: BsPostcardFill,
      },
      {
        link_name: "الدول والدليل السياحي",
        path: "/dashboard/countries",
        icon: TfiMore,
      },
      {
        link_name: "الملف الشخصي",
        path: "/dashboard/profile",
        icon: FaGear,
      },
    ],
  },
  {
    group_name: "الدعم والمساعدة",
    links: [
      {
        link_name: "مركز الدعم والبلاغات",
        path: "/dashboard/booking-issues",
        icon: FaHeadset,
      },
    ],
  },
];

// Flat list of all links with group info
export const allNavLinks: NavItem[] = linkGroups.flatMap((group) =>
  group.links.map((link) => ({
    ...link,
    group_name: group.group_name,
  }))
);

export const findLinkByPath = (path: string): NavItem | undefined => {
  return allNavLinks.find(
    (item) => item.path === path || (path !== "/dashboard/home" && path.startsWith(item.path + "/"))
  );
};

export const isPathActive = (pathname: string, targetPath: string): boolean => {
  if (targetPath === "/dashboard/home") {
    return pathname === "/dashboard/home" || pathname === "/dashboard";
  }
  return pathname === targetPath || pathname.startsWith(targetPath + "/");
};
