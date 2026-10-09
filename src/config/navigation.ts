import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Menu as MenuIcon,
  QrCode,
  UtensilsCrossed,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Admin panel navigation — used by the sidebar layout.
 */
export const adminNavItems: NavItem[] = [
  { label: "Live Orders", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Menu Management", href: "/admin/menu", icon: MenuIcon },
  { label: "Tables", href: "/admin/tables", icon: UtensilsCrossed },
  { label: "QR Codes", href: "/admin/qr-codes", icon: QrCode },
];
