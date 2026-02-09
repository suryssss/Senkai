"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) setMenuOpen(false);
        };
        handleResize();

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const navLinks = [
        { label: "Features", href: "#features" },
        { label: "How it works", href: "#livedemo" },
        { label: "Github", href: "https://github.com/suryssss/Senkai", external: true }
    ];

    return (
        <>
            <nav style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                padding: isMobile ? "0 20px" : "0 40px",
                height: isMobile ? "60px" : "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: scrolled || menuOpen ? "rgba(250, 250, 250, 0.95)" : "transparent",
                backdropFilter: scrolled || menuOpen ? "blur(20px)" : "none",
                borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
                transition: "all 0.3s ease",
            }}>
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", zIndex: 1001 }}>
                    <span style={{
                        fontSize: isMobile ? "20px" : "22px",
                        fontWeight: "700",
                        color: "#0a0a0a",
                        letterSpacing: "-0.5px",
                    }}>
                        Senkai
                    </span>
                </Link>
                {!isMobile && (
                    <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                        {navLinks.map((item, i) => (
                            <a
                                key={i}
                                href={item.href}
                                target={item.external ? "_blank" : undefined}
                                rel={item.external ? "noopener noreferrer" : undefined}
                                style={{
                                    fontSize: "15px",
                                    color: "#525252",
                                    textDecoration: "none",
                                    fontWeight: "500",
                                    transition: "color 0.2s ease",
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = "#0a0a0a"}
                                onMouseOut={(e) => e.currentTarget.style.color = "#525252"}
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "16px", zIndex: 1001 }}>
                    <Link
                        href="/analyze"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: isMobile ? "6px" : "10px",
                            padding: isMobile ? "8px 16px" : "10px 24px",
                            background: "#0a0a0a",
                            color: "#fafafa",
                            fontSize: isMobile ? "13px" : "15px",
                            fontWeight: "600",
                            borderRadius: "100px",
                            textDecoration: "none",
                            transition: "all 0.2s ease",
                        }}
                    >
                        {isMobile ? "Open" : "Open Canvas"}
                        <svg width={isMobile ? "14" : "16"} height={isMobile ? "14" : "16"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                    </Link>
                    {isMobile && (
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            style={{
                                background: "none",
                                border: "none",
                                padding: "8px",
                                cursor: "pointer",
                                color: "#0a0a0a",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {menuOpen ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                            )}
                        </button>
                    )}
                </div>
            </nav>
            {isMobile && menuOpen && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "#ffffff",
                    zIndex: 999,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "32px",
                    padding: "20px",
                }}>
                    {navLinks.map((item, i) => (
                        <a
                            key={i}
                            href={item.href}
                            target={item.external ? "_blank" : undefined}
                            rel={item.external ? "noopener noreferrer" : undefined}
                            onClick={() => setMenuOpen(false)}
                            style={{
                                fontSize: "24px",
                                color: "#0a0a0a",
                                textDecoration: "none",
                                fontWeight: "600",
                            }}
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            )}
        </>
    );
}
