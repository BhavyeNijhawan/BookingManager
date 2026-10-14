import {
  Bell,
  BedDouble,
  CalendarDays,
  ChartColumn,
  Ellipsis,
  House,
  IndianRupee,
  MessageCircle,
  Palette,
  RefreshCw,
  Sun,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type BadgeKind = "attention" | "action-count" | "unread";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: BadgeKind;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Today", icon: Sun, badge: "attention" },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/bookings", label: "Bookings", icon: BedDouble, badge: "action-count" },
  { href: "/messages", label: "Messages", icon: MessageCircle, badge: "unread" },
];

export const MANAGE_NAV: NavItem[] = [
  { href: "/more/automations", label: "Automations", icon: Zap },
  { href: "/more/platforms", label: "Platforms and sync", icon: RefreshCw },
  { href: "/more/reports", label: "Reports", icon: ChartColumn },
  { href: "/more/payments", label: "Payments", icon: IndianRupee },
];

export const SETTINGS_NAV: NavItem[] = [
  { href: "/more/property", label: "Property and people", icon: House },
  { href: "/more/notifications", label: "Notifications", icon: Bell },
  { href: "/more/appearance", label: "Appearance", icon: Palette },
];

export const TAB_NAV: NavItem[] = [...PRIMARY_NAV, { href: "/more", label: "More", icon: Ellipsis }];

export const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
