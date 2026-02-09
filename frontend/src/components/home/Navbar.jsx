"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            padding: "0 10vw",
            height: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: scrolled ? "rgba(250, 250, 250, 0.85)" : "transparent",
            backdropFilter: scrolled ? "blur(20px)" : "none",
            borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
            transition: "all 0.3s ease",
        }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
                <span style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "#0a0a0a",
                    letterSpacing: "-0.5px",
                }}>
                    Senkai
                </span>
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "48px" }}>
                {[
                    { label: "Features", href: "#features" },
                    { label: "How it works", href: "#livedemo" },
                    { label: "Github", href: "https://github.com/suryssss/Senkai", external: true }
                ].map((item, i) => (
                    <a
                        key={i}
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        style={{
                            fontSize: "16px",
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

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <Link
                    href="/analyze"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "14px 28px",
                        background: "#0a0a0a",
                        color: "#fafafa",
                        fontSize: "15px",
                        fontWeight: "600",
                        borderRadius: "100px",
                        textDecoration: "none",
                        transition: "all 0.2s ease",
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                    }}
                >
                    Open Canvas
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                </Link>
            </div>
        </nav>
    );
}
