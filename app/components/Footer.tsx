
"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";

export const Footer = () => {
  const pathname = usePathname() ?? "";

  return (
    <footer className="bg-neutral-primary-soft rounded-base shadow-xs border border-default m-4">
        <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm text-body sm:text-center">© 2025 FindMeParking. All Rights Reserved.</span>
        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-body sm:mt-0">
            <li>
                <a href="/" className="hover:underline me-4 md:me-6">Home</a>
            </li>
            <li>
                <a href="/map" className="hover:underline me-4 md:me-6">Map</a>
            </li>
            <li>
                <a href="/settings" className="hover:underline me-4 md:me-6">Settings</a>
            </li>
        </ul>
        </div>
    </footer>

  );
};

