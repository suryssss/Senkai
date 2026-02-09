"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function LiveDemo() {
    const sectionRef = useRef(null);
    const cardRef = useRef(null);
    const videoRef = useRef(null);
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
        if (!sectionRef.current || !cardRef.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(cardRef.current,
                { y: 60, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 70%",
                    },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="livedemo"
            style={{
                padding: isMobile ? "60px 20px 80px" : isTablet ? "100px 40px 120px" : "120px 80px 160px",
                background: "#ffffff",
            }}
        >
            <h2 style={{
                fontSize: isMobile ? "clamp(22px, 6vw, 28px)" : isTablet ? "clamp(26px, 5vw, 36px)" : "clamp(28px, 4vw, 44px)",
                fontWeight: "500",
                color: "#0a0a0a",
                letterSpacing: isMobile ? "-0.5px" : "-1.5px",
                lineHeight: 1.3,
                marginBottom: isMobile ? "32px" : "60px",
                maxWidth: "600px",
            }}>
                Design, analyze, and optimize from first idea to production
            </h2>

            <div
                ref={cardRef}
                style={{
                    borderRadius: isMobile ? "12px" : "16px",
                    overflow: "hidden",
                    background: "#fafafa",
                    border: "1px solid #e5e5e5",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.06)",
                }}
            >
                <div style={{
                    overflow: "hidden",
                    marginBottom: isMobile ? "-30px" : "-60px",
                    paddingBottom: "0",
                }}>
                    <video
                        ref={videoRef}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                        }}
                    >
                        <source src="/landing_video.mp4" type="video/mp4" />
                    </video>
                </div>
            </div>

            <div style={{ marginTop: isMobile ? "28px" : "40px" }}>
                <Link
                    href="/analyze"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: isMobile ? "12px 22px" : "14px 28px",
                        background: "#0a0a0a",
                        color: "#fafafa",
                        fontSize: "14px",
                        fontWeight: "600",
                        borderRadius: "10px",
                        textDecoration: "none",
                        transition: "all 0.2s ease",
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                    }}
                >
                    Try it yourself
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </section>
    );
}
