"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function Footer() {
    const footerRef = useRef(null);
    const contentRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (!footerRef.current || !contentRef.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(contentRef.current.children,
                { y: 40, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: footerRef.current,
                        start: "top 90%",
                    },
                }
            );
        }, footerRef);

        return () => ctx.revert();
    }, []);

    const links = {
        Navigation: [
            { label: "Home", href: "/" },
            { label: "Features", href: "#features" },
            { label: "How it Works", href: "#livedemo" },
            { label: "Open Canvas", href: "/analyze" },
        ],
        Socials: [
            { label: "Linkedin", href: "https://www.linkedin.com/in/rithwik-surya-aaa25932a" },
            { label: "X", href: "https://x.com/surys_2511" },
            { label: "Github", href: "https://github.com/suryssss/Senkai" },
            { label: "Portfolio", href: "https://rithwiksurya.info" }

        ]
    };

    return (
        <footer
            ref={footerRef}
            style={{
                background: "#050505",
                borderTop: "1px solid #262626",
                padding: isMobile ? "60px 20px 30px" : isTablet ? "80px 40px 40px" : "100px 80px 40px",
                position: "relative",
                overflow: "hidden",
                color: "#fafafa",
            }}
        >
            <div ref={contentRef} style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "2fr 1fr 1fr",
                    gap: isMobile ? "40px" : isTablet ? "40px" : "60px",
                    marginBottom: isMobile ? "40px" : "80px",
                    textAlign: isMobile || isTablet ? "center" : "left",
                }}>
                    <div style={{ gridColumn: isTablet ? "1 / -1" : "auto" }}>
                        <Link href="/" style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: isMobile || isTablet ? "center" : "flex-start",
                            gap: "10px",
                            textDecoration: "none",
                            marginBottom: "24px"
                        }}>
                            <span style={{ fontSize: "20px", fontWeight: "700", color: "#fafafa", letterSpacing: "-0.5px" }}>
                                Senkai
                            </span>
                        </Link>
                        <p style={{
                            fontSize: isMobile ? "14px" : "15px",
                            color: "#a3a3a3",
                            lineHeight: 1.6,
                            marginBottom: "32px",
                            maxWidth: isMobile || isTablet ? "100%" : "300px",
                            margin: isMobile || isTablet ? "0 auto 32px" : "0 0 32px 0",
                        }}>
                            The first intelligent architecture visualization tool for modern engineering teams.
                        </p>
                    </div>
                    {Object.entries(links).map(([category, items]) => (
                        <div key={category}>
                            <h4 style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#fafafa",
                                textTransform: "capitalize",
                                marginBottom: isMobile ? "16px" : "24px",
                            }}>
                                {category}
                            </h4>
                            <ul style={{
                                listStyle: "none",
                                padding: 0,
                                margin: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: isMobile ? "12px" : "16px",
                                alignItems: isMobile || isTablet ? "center" : "flex-start",
                            }}>
                                {items.map((item, i) => (
                                    <li key={i}>
                                        <Link
                                            href={item.href}
                                            style={{
                                                fontSize: "14px",
                                                color: "#a3a3a3",
                                                textDecoration: "none",
                                                transition: "color 0.2s ease",
                                            }}
                                            onMouseOver={(e) => e.target.style.color = "#fafafa"}
                                            onMouseOut={(e) => e.target.style.color = "#a3a3a3"}
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div style={{
                    paddingTop: isMobile ? "24px" : "40px",
                    borderTop: "1px solid #262626",
                    display: "flex",
                    justifyContent: isMobile || isTablet ? "center" : "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "20px",
                }}>
                    <div style={{ fontSize: isMobile ? "12px" : "13px", color: "#737373" }}>
                        © 2026 Senkai Inc. All rights reserved.
                    </div>
                </div>

            </div>
        </footer>
    );
}
