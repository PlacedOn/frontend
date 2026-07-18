import {
  LayoutDashboard,
  UserRound,
  Sparkles,
  BriefcaseBusiness,
  Send,
  SlidersHorizontal,
  Search,
  Users,
  MessagesSquare,
  Plus,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";

export type DashboardRole = "candidate" | "employer";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

// The role's home route — used so the "Home/Overview" item only matches exactly
// (every other item matches on prefix).
export const ROLE_HOME: Record<DashboardRole, string> = {
  candidate: "/candidate",
  employer: "/employer",
};

export const ROLE_LABEL: Record<DashboardRole, string> = {
  candidate: "Candidate",
  employer: "Hiring team",
};

const CANDIDATE_NAV: NavItem[] = [
  { label: "Home", href: "/candidate", icon: LayoutDashboard },
  { label: "Profile", href: "/candidate/profile", icon: UserRound },
  { label: "Growth", href: "/candidate/growth", icon: Sparkles },
  { label: "Passport", href: "/candidate/passport", icon: BadgeCheck },
  { label: "Matches", href: "/candidate/matches", icon: BriefcaseBusiness },
  { label: "Applications", href: "/candidate/applications", icon: Send },
  { label: "Preferences", href: "/candidate/preferences", icon: SlidersHorizontal },
];

const EMPLOYER_NAV: NavItem[] = [
  { label: "Overview", href: "/employer", icon: LayoutDashboard },
  { label: "Post a role", href: "/employer/jobs/new", icon: Plus },
  { label: "Search", href: "/employer/search", icon: Search },
  { label: "Team", href: "/employer/team", icon: Users },
  { label: "Introductions", href: "/intros", icon: MessagesSquare },
];

export const NAV: Record<DashboardRole, NavItem[]> = {
  candidate: CANDIDATE_NAV,
  employer: EMPLOYER_NAV,
};

/** Active when the path is the item exactly, or (for non-home items) nested under it. */
export function isNavActive(pathname: string, item: NavItem, role: DashboardRole): boolean {
  if (item.href === ROLE_HOME[role]) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
