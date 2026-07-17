"use client";

/**
 * The logged-in dashboard chrome: a glassmorphic left sidebar (collapsible on
 * desktop, a drawer on mobile) around a content slot, over the ambient AuroraMesh.
 * Design is native to the iris/glass token system — inspired by 21st.dev's
 * "workbench" glass-sidebar pattern, not a stock shadcn shell. The sidebar is the
 * single global nav for every candidate/team surface.
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { AuroraMesh } from "@/components/background/AuroraMesh";
import { NAV, ROLE_LABEL, isNavActive, type DashboardRole, type NavItem } from "@/lib/dashboardNav";

const EASE = [0.16, 1, 0.3, 1] as const;

function NavList({
  role,
  pathname,
  collapsed,
  onNavigate,
}: {
  role: DashboardRole;
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label={`${ROLE_LABEL[role]} navigation`} className="flex flex-1 flex-col gap-1">
      {NAV[role].map((item: NavItem) => {
        const active = isNavActive(pathname, item, role);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            title={collapsed ? item.label : undefined}
            className="group relative flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-[14px] font-semibold transition-colors"
            style={
              active
                ? { background: "var(--iris-ghost)", color: "var(--iris-ink)" }
                : { color: "var(--ink-2)" }
            }
          >
            {active && (
              <motion.span
                layoutId={`nav-active-${role}`}
                className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full"
                style={{ background: "var(--iris)" }}
              />
            )}
            <Icon
              size={18}
              className="shrink-0 transition-transform group-hover:scale-110"
              style={{ color: active ? "var(--iris-ink)" : "var(--ink-3)" }}
            />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarInner({
  role,
  email,
  collapsed,
  pathname,
  onToggleCollapse,
  onNavigate,
}: {
  role: DashboardRole;
  email: string | null;
  collapsed: boolean;
  pathname: string;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div
      className="glass relative flex h-full flex-col overflow-hidden rounded-[26px] p-3"
      style={{ borderColor: "var(--glass-line)" }}
    >
      {/* iris glow at the top edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full"
        style={{ background: "var(--iris)", opacity: 0.16, filter: "blur(70px)" }}
      />

      <div className="relative flex items-center gap-2 px-2 py-2">
        <Link href="/" aria-label="Placedon home">
          <Logo size={30} showWordmark={!collapsed} />
        </Link>
      </div>

      {!collapsed && (
        <span
          className="relative mx-2 mb-2 mt-1 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider"
          style={{ background: "var(--mist)", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}
        >
          {ROLE_LABEL[role]}
        </span>
      )}

      <div className="relative mt-1 flex-1 px-1">
        <NavList role={role} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />
      </div>

      {/* footer: identity + sign out + collapse */}
      <div className="relative mt-2 flex flex-col gap-2 border-t px-1 pt-3" style={{ borderColor: "var(--glass-line)" }}>
        {!collapsed && email && (
          <p className="truncate px-2 text-[12px] text-[var(--ink-3)]" title={email}>
            {email}
          </p>
        )}
        <div className="flex items-center justify-between gap-2">
          {email ? (
            <SignOutButton className={collapsed ? "!px-2" : undefined} />
          ) : (
            <Link href="/login" className="chip cursor-pointer">
              Sign in
            </Link>
          )}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-[var(--r-chip)] border text-[var(--ink-3)] transition-colors hover:text-[var(--ink)] lg:grid"
              style={{ borderColor: "var(--glass-line)", background: "var(--glass-hi)" }}
            >
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function DashboardShellClient({
  role,
  email,
  children,
}: {
  role: DashboardRole;
  email: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);

  const width = collapsed ? "84px" : "252px";

  return (
    <div style={{ "--sb": width } as React.CSSProperties}>
      <AuroraMesh />

      {/* Desktop sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-[var(--z-nav)] hidden p-3 transition-[width] duration-300 lg:block"
        style={{ width }}
      >
        <SidebarInner
          role={role}
          email={email}
          collapsed={collapsed}
          pathname={pathname}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      </aside>

      {/* Mobile top bar */}
      <header
        className="glass fixed inset-x-3 top-3 z-[var(--z-nav)] flex items-center justify-between rounded-[var(--r-chip)] px-4 py-2.5 lg:hidden"
      >
        <Link href="/" aria-label="Placedon home">
          <Logo size={28} />
        </Link>
        <button
          type="button"
          onClick={() => setDrawer(true)}
          aria-label="Open navigation"
          className="grid h-10 w-10 cursor-pointer place-items-center rounded-[var(--r-chip)] border text-[var(--ink-2)]"
          style={{ borderColor: "var(--glass-line)", background: "var(--glass-hi)" }}
        >
          <Menu size={18} />
        </button>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              className="fixed inset-0 z-[var(--z-drawer)] bg-black/30 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-[calc(var(--z-drawer)+1)] w-[268px] p-3 lg:hidden"
              initial={reduce ? { opacity: 0 } : { x: "-100%" }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: "-100%" }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              <div className="relative h-full">
                <button
                  type="button"
                  onClick={() => setDrawer(false)}
                  aria-label="Close navigation"
                  className="absolute right-4 top-4 z-10 grid h-8 w-8 cursor-pointer place-items-center rounded-full text-[var(--ink-3)]"
                  style={{ background: "var(--glass-hi)", border: "1px solid var(--glass-line)" }}
                >
                  <X size={15} />
                </button>
                <SidebarInner
                  role={role}
                  email={email}
                  collapsed={false}
                  pathname={pathname}
                  onNavigate={() => setDrawer(false)}
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative min-h-screen pt-20 lg:pt-0" style={{ zIndex: "var(--z-base)" }}>
        <div className="transition-[padding] duration-300 lg:pl-[var(--sb)]">
          <main className="mx-auto w-full max-w-[1180px] px-4 pb-20 md:px-8 lg:pt-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
