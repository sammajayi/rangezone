"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProfileControls } from "./profile/profileControls";
import Image from "next/image";

const NAV_ITEMS = [
  { label: "Markets", href: "/" },
  { label: "Create", href: "/create" },
  { label: "Learn", href: "/learn" },
];

export default function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <nav className="bg-white border-b border-[rgba(15,23,42,0.04)] sticky top-0 z-40" aria-label="Main navigation">
                <div className="max-w-300 mx-auto px-4 h-16 flex items-center justify-between relative">
                    <Link href="/" className="inline-flex items-center  no-underline text-[#0f172a] font-semibold text-lg" aria-label="RangeZone home">
                        
                        <Image src="/rangezone-logo.svg" alt="RangeZone Logo" width={60} height={60} />
                        <span className="leading-none text-xl">RangeZone</span>
                    </Link>

                    <ul className="hidden md:flex gap-6 absolute left-1/2 transform -translate-x-1/2">
                        {NAV_ITEMS.map((it) => (
                            <li key={it.href}>
                                <Link href={it.href} className="text-[#64748b] no-underline py-2 px-1.5 rounded-md font-medium hover:text-[#0f172a] hover:bg-[rgba(15,23,42,0.04)]">
                                    {it.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:block">
                            <ProfileControls variant="desktop" />
                        </div>

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
                    </div>
                </div>

                {/* Mobile dropdown */}
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
