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
  Radar,
  Hexagon,
  Accessibility,
  Sparkle,
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

/** A role's nav, split into the few daily doors (primary) and the occasional
 *  surfaces (secondary), so a first-time candidate isn't met with a flat wall of
 *  nine items. Everything stays one click away — grouped, never hidden. */
export type NavGroups = { primary: NavItem[]; secondary: NavItem[] };

// Candidate's four daily doors: what to do now, what I've proven, jobs, what
// others see. The rest — guidance, tracking, the claims builder, settings —
// sit under a divider, reachable but out of the way.
const CANDIDATE_NAV: NavGroups = {
  primary: [
    { label: "Home", href: "/candidate", icon: LayoutDashboard },
    { label: "Assistant", href: "/candidate/assistant", icon: Sparkle },
    { label: "Workshop", href: "/candidate/workshop", icon: Hexagon },
    { label: "Matches", href: "/candidate/matches", icon: BriefcaseBusiness },
    { label: "Passport", href: "/candidate/passport", icon: BadgeCheck },
  ],
  secondary: [
    { label: "Growth", href: "/candidate/growth", icon: Sparkles },
    { label: "Applications", href: "/candidate/applications", icon: Send },
    { label: "Network", href: "/candidate/network", icon: Radar },
    { label: "Profile", href: "/candidate/profile", icon: UserRound },
    { label: "Accommodations", href: "/accommodations", icon: Accessibility },
    { label: "Preferences", href: "/candidate/preferences", icon: SlidersHorizontal },
  ],
};

const EMPLOYER_NAV: NavGroups = {
  primary: [
    { label: "Overview", href: "/employer", icon: LayoutDashboard },
    { label: "Search", href: "/employer/search", icon: Search },
    { label: "Team", href: "/employer/team", icon: Users },
    { label: "Introductions", href: "/intros", icon: MessagesSquare },
  ],
  secondary: [],
};

export const NAV: Record<DashboardRole, NavGroups> = {
  candidate: CANDIDATE_NAV,
  employer: EMPLOYER_NAV,
};

/** The one persistent primary action per role — pinned above the nav, the way a
 * command-center rail always keeps its main verb one tap away. */
export const PRIMARY_CTA: Record<DashboardRole, NavItem> = {
  candidate: { label: "Take interview", href: "/pre-interview", icon: Sparkles },
  employer: { label: "Post a role", href: "/employer/jobs/new", icon: Plus },
};

/** Active when the path is the item exactly, or (for non-home items) nested under it. */
export function isNavActive(pathname: string, item: NavItem, role: DashboardRole): boolean {
  if (item.href === ROLE_HOME[role]) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
