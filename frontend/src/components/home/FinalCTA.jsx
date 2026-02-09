"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function FinalCTA() {
    const sectionRef = useRef(null);
    const headlineRef = useRef(null);
    const subRef = useRef(null);
    const buttonRef = useRef(null);
    const lineRef = useRef(null);
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
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 70%",
                    end: "top 30%",
                    toggleActions: "play none none reverse",
                },
            });
            if (lineRef.current) {
                tl.fromTo(lineRef.current,
                    { scaleX: 0 },
                    { scaleX: 1, duration: 0.8, ease: "power3.inOut" }
                );
            }
            if (headlineRef.current) {
                tl.fromTo(headlineRef.current,
                    { y: 40, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
                    "-=0.4"
                );
            }
            if (subRef.current) {
                tl.fromTo(subRef.current,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
                    "-=0.4"
                );
            }
            if (buttonRef.current) {
                tl.fromTo(buttonRef.current,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
                    "-=0.3"
                );
            }

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            style={{
                padding: isMobile ? "80px 20px 60px" : isTablet ? "100px 40px 80px" : "160px 80px 120px",
                background: "#fafafa",
                textAlign: "center",
            }}
        >
            <div
                ref={lineRef}
                style={{
                    width: isMobile ? "40px" : "60px",
                    height: "2px",
                    background: "#4f46e5",
                    margin: isMobile ? "0 auto 32px" : "0 auto 48px",
                    transformOrigin: "center",
                }}
            />
            <h2
                ref={headlineRef}
                style={{
                    fontSize: isMobile ? "clamp(24px, 7vw, 32px)" : isTablet ? "clamp(28px, 6vw, 40px)" : "clamp(32px, 5vw, 56px)",
                    fontWeight: "500",
                    color: "#0a0a0a",
                    letterSpacing: isMobile ? "-1px" : "-2px",
                    lineHeight: 1.15,
                    marginBottom: "20px",
                    maxWidth: isMobile || isTablet ? "100%" : "600px",
                    margin: "0 auto 20px",
                }}
            >
                Start building resilient systems today
            </h2>
            <p
                ref={subRef}
                style={{
                    fontSize: isMobile ? "15px" : "18px",
                    color: "#737373",
                    lineHeight: 1.7,
                    maxWidth: "400px",
                    margin: "0 auto 40px",
                }}
            >
                Join thousands of engineers who trust Senkai to visualize and optimize their cloud architecture.
            </p>
            <div
                ref={buttonRef}
                style={{
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Link
                    href="/analyze"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: isMobile ? "12px" : "16px",
                        padding: isMobile ? "16px 28px" : "20px 40px",
                        background: "#0a0a0a",
                        color: "#fafafa",
                        fontSize: "14px",
                        fontWeight: "600",
                        borderRadius: "100px",
                        textDecoration: "none",
                        letterSpacing: "0.5px",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.2)";
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                    }}
                >
                    Start Designing Free
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                </Link>
            </div>
        </section>
    );
}
