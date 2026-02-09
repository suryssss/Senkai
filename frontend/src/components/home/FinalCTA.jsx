"use client";

import { useEffect, useRef } from "react";
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

            // Animate line first
            if (lineRef.current) {
                tl.fromTo(lineRef.current,
                    { scaleX: 0 },
                    { scaleX: 1, duration: 0.8, ease: "power3.inOut" }
                );
            }

            // Then headline
            if (headlineRef.current) {
                tl.fromTo(headlineRef.current,
                    { y: 40, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
                    "-=0.4"
                );
            }

            // Then subtitle
            if (subRef.current) {
                tl.fromTo(subRef.current,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
                    "-=0.4"
                );
            }

            // Then button
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
                padding: "160px 10vw 120px",
                background: "#fafafa",
                textAlign: "center",
            }}
        >
            {/* Top line accent */}
            <div
                ref={lineRef}
                style={{
                    width: "60px",
                    height: "2px",
                    background: "#4f46e5",
                    margin: "0 auto 48px",
                    transformOrigin: "center",
                }}
            />

            {/* Headline */}
            <h2
                ref={headlineRef}
                style={{
                    fontSize: "clamp(32px, 5vw, 56px)",
                    fontWeight: "500",
                    color: "#0a0a0a",
                    letterSpacing: "-2px",
                    lineHeight: 1.15,
                    marginBottom: "20px",
                    maxWidth: "600px",
                    margin: "0 auto 20px",
                }}
            >
                Start designing your architecture
            </h2>

            {/* Subtitle */}
            <p
                ref={subRef}
                style={{
                    fontSize: "17px",
                    color: "#737373",
                    marginBottom: "40px",
                    maxWidth: "400px",
                    margin: "0 auto 40px",
                    lineHeight: 1.6,
                }}
            >
                No signup required. Open the canvas and begin.
            </p>

            {/* CTA Button */}
            <Link
                ref={buttonRef}
                href="/analyze"
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "18px 36px",
                    background: "#0a0a0a",
                    color: "#fafafa",
                    fontSize: "15px",
                    fontWeight: "600",
                    borderRadius: "12px",
                    textDecoration: "none",
                    transition: "all 0.25s ease",
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.15)";
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                }}
            >
                Open Canvas
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </Link>
        </section>
    );
}
