"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProfileControls } from "./profile/profileControls";
import Image from "next/image";

const NAV_ITEMS = [
  { label: "Markets", href: "/" },
  { label: "Create", href: "/create" },
  { label: "How it works", href: "/learn" },
];

export default function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Desktop header - minimal, only sign in */}
            <nav className="hidden lg:block bg-white border-b border-[rgba(15,23,42,0.04)] sticky top-0 z-40" aria-label="Main navigation">
                <div className="max-w-300 mx-auto px-4 h-16 flex items-center justify-end relative">
                    <ProfileControls variant="desktop" />
                </div>
            </nav>

            {/* Mobile navbar */}
            <nav className="lg:hidden bg-white border-b border-[rgba(15,23,42,0.04)] sticky top-0 z-40" aria-label="Main navigation">
                <div className="px-4 h-16 flex items-center justify-between relative">
                    <Link href="/" className="inline-flex items-center no-underline text-[#0f172a] font-semibold text-lg" aria-label="RangeZone home">
                        <Image src="/rangezone-logo.svg" alt="RangeZone Logo" width={60} height={60} className="w-10 h-10 md:w-[60px] md:h-[60px]" />
                    </Link>

                    <div className="flex items-center gap-3">
                        <button
                            className="md:hidden inline-flex bg-transparent border-0 p-1.5 rounded-md cursor-pointer"
                            aria-label={open ? "Close menu" : "Open menu"}
                            onClick={() => setOpen((s) => !s)}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                {open ? (
                                    <path d="M6 6L18 18M6 18L18 6" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
                                ) : (
                                    <path d="M3 7H21M3 12H21M3 17H21" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
                                )}
                            </svg>
                        </button>
                        <div className="hidden md:block">
                            <ProfileControls variant="desktop" />
                        </div>
                    </div>
                </div>

                {/* Mobile dropdown menu */}
                <div className={`${open ? "block" : "hidden"} w-full bg-white border-t border-[rgba(15,23,42,0.04)] md:hidden`}>
                    <ul className="list-none m-0 p-3 px-4 flex flex-col gap-2">
                        {NAV_ITEMS.map((it) => (
                            <li key={it.href}>
                                <Link
                                    href={it.href}
                                    onClick={() => setOpen(false)}
                                    className="text-[#0f172a] p-2.5 rounded-lg block bg-transparent hover:bg-[rgba(15,23,42,0.04)]"
                                >
                                    {it.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="p-3 px-4 pb-4">
                        <ProfileControls variant="mobile" />
                    </div>
                </div>
            </nav>
        </>
    );
}
