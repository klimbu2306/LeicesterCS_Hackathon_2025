"use client";
import { FiSettings } from "react-icons/fi";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ToggleButton } from "@once-ui-system/core";

export const Header = () => {
  const pathname = usePathname() ?? "";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-black/40 border-b border-zinc-200 dark:border-zinc-800" style={{height: "5dvh"}}>
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Left: Title */}
        <span className="font-semibold text-lg">FindMeParking</span>

        {/* Middle: Desktop navigation */}
        <nav className="hidden sm:flex items-center gap-4">
          <ToggleButton href="/" label="Home" selected={pathname === "/"}  />
          <ToggleButton href="/map" label="Map" selected={pathname.startsWith("/map")}  />
        </nav>

        {/* Right: Settings & Mobile menu */}
        <div className="flex items-center gap-4">
            <ToggleButton
                label={<FiSettings className="w-5 h-5" />}
                href="/settings"
            />

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200/30 dark:hover:bg-gray-700/30"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="sr-only">Open menu</span>
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
                <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
                <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="sm:hidden bg-white dark:bg-black/80 border-t border-zinc-200 dark:border-zinc-800">
          <ToggleButton href="/" label="Home" selected={pathname === "/"}   />
          <ToggleButton href="/map" label="Map" selected={pathname.startsWith("/map")}   />
          <ToggleButton prefixIcon="settings" href="/settings"   />
        </nav>
      )}
    </header>
  );
};
