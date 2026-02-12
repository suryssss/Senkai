"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactFlowProvider } from "@xyflow/react";
import HeroFlow from "./HeroFlow";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function Hero() {
    const containerRef = useRef(null);
    const headlineRef = useRef(null);
    const subRef = useRef(null);
    const ctaRef = useRef(null);
    const visualRef = useRef(null);
    const lineRefs = useRef([]);
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
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            const validLines = lineRefs.current.filter(el => el !== null);

            if (validLines.length > 0) {
                const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

                tl.from(validLines, {
                    y: 120,
                    opacity: 0,
                    rotationX: -40,
                    stagger: 0.15,
                    duration: 1.2,
                });

                if (subRef.current) {
                    tl.from(subRef.current, {
                        y: 40,
                        opacity: 0,
                        duration: 1,
                    }, "-=0.6");
                }

                if (ctaRef.current) {
                    tl.from(ctaRef.current, {
                        y: 30,
                        opacity: 0,
                        duration: 0.8,
                    }, "-=0.5");
                }

                if (visualRef.current) {
                    tl.from(visualRef.current, {
                        scale: 0.8,
                        opacity: 0,
                        duration: 1.2,
                        ease: "power3.out",
                    }, "-=1");
                }
            }
            if (!isMobile && !isTablet && visualRef.current) {
                gsap.to(visualRef.current, {
                    y: 100,
                    ease: "none",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top top",
                        end: "bottom top",
                        scrub: 1,
                    },
                });
            }

            if (headlineRef.current) {
                gsap.to(headlineRef.current, {
                    opacity: 0,
                    y: -50,
                    ease: "none",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top top",
                        end: "40% top",
                        scrub: 1,
                    },
                });
            }

        }, containerRef);

        return () => ctx.revert();
    }, [isMobile, isTablet]);

    return (
        <section
            ref={containerRef}
            style={{
                minHeight: isMobile ? "auto" : "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: isMobile || isTablet ? "flex-start" : "center",
                alignItems: isMobile || isTablet ? "center" : "flex-start",
                padding: isMobile ? "100px 20px 60px" : isTablet ? "120px 40px 80px" : "0 80px",
                position: "relative",
                overflow: "hidden",
                background: "linear-gradient(180deg, #ffffff 0%, #f8f8f8 100%)",
            }}
        >
            <div style={{
                position: "absolute",
                top: "10%",
                right: isMobile ? "0%" : "15%",
                width: isMobile ? "300px" : "600px",
                height: isMobile ? "300px" : "600px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)",
                filter: "blur(60px)",
                pointerEvents: "none",
            }} />
            <div style={{
                position: "absolute",
                bottom: "20%",
                left: "5%",
                width: isMobile ? "200px" : "400px",
                height: isMobile ? "200px" : "400px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)",
                filter: "blur(80px)",
                pointerEvents: "none",
            }} />

            <div ref={headlineRef} style={{
                position: "relative",
                zIndex: 10,
                maxWidth: isMobile ? "100%" : "1000px",
                textAlign: isMobile || isTablet ? "center" : "left",
                marginTop: isTablet ? "40px" : "0",
            }}>
                <div style={{
                    marginBottom: isMobile ? "24px" : "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isMobile || isTablet ? "center" : "flex-start",
                    gap: "12px"
                }}>
                    <div style={{
                        width: isMobile ? "30px" : "40px",
                        height: "1px",
                        background: "#d4d4d4",
                    }} />
                    <span style={{
                        fontSize: isMobile ? "10px" : "12px",
                        color: "#737373",
                        letterSpacing: "3px",
                        textTransform: "uppercase",
                        fontWeight: "500",
                    }}>
                        Architecture Intelligence
                    </span>
                </div>
                <h1 style={{
                    fontSize: isMobile ? "clamp(32px, 10vw, 48px)" : isTablet ? "clamp(48px, 8vw, 64px)" : "clamp(40px, 7vw, 96px)",
                    fontWeight: "500",
                    lineHeight: 0.95,
                    color: "#0a0a0a",
                    letterSpacing: isMobile ? "-2px" : "-4px",
                    marginBottom: isMobile ? "28px" : "48px",
                }}>
                    <div style={{ overflow: "hidden" }}>
                        <span ref={(el) => lineRefs.current[0] = el} style={{ display: "block" }}>
                            See where
                        </span>
                    </div>
                    <div style={{ overflow: "hidden" }}>
                        <span
                            ref={(el) => lineRefs.current[1] = el}
                            style={{
                                display: "block",
                                color: "transparent",
                                WebkitTextStroke: isMobile ? "1px #4f46e5" : "1.5px #4f46e5",
                            }}
                        >
                            systems break
                        </span>
                    </div>
                </h1>
                <p
                    ref={subRef}
                    style={{
                        fontSize: isMobile ? "15px" : "18px",
                        color: "#737373",
                        lineHeight: 1.7,
                        maxWidth: isMobile ? "100%" : "420px",
                        marginBottom: isMobile ? "32px" : "48px",
                        marginLeft: isMobile || isTablet ? "auto" : "0",
                        marginRight: isMobile || isTablet ? "auto" : "0",
                        fontWeight: "400",
                    }}
                >
                    Visualize backend architectures. Simulate failures before they happen.
                    Get AI-powered insights in seconds.
                </p>
                <div ref={ctaRef} style={{
                    display: "flex",
                    gap: "24px",
                    alignItems: "center",
                    justifyContent: isMobile || isTablet ? "center" : "flex-start",
                }}>
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
                    >
                        Start Designing
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                    </Link>
                </div>
            </div>
            <div
                ref={visualRef}
                style={{
                    position: isMobile || isTablet ? "relative" : "absolute",
                    right: isMobile || isTablet ? "auto" : "5vw",
                    top: isMobile || isTablet ? "auto" : "50%",
                    transform: isMobile || isTablet ? "none" : "translateY(-50%)",
                    width: isMobile ? "100%" : isTablet ? "80%" : "45vw",
                    maxWidth: isMobile ? "100%" : "600px",
                    height: isMobile ? "350px" : isTablet ? "450px" : "500px",
                    zIndex: 20,
                    marginTop: isMobile || isTablet ? "60px" : "0",
                    marginLeft: isMobile || isTablet ? "auto" : "0",
                    marginRight: isMobile || isTablet ? "auto" : "0",
                }}
            >
                <div style={{
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'auto',
                    border: '1px solid #e5e5e5',
                    borderRadius: isMobile ? '16px' : '24px',
                    background: '#ffffff',
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)',
                    overflow: 'hidden'
                }}>
                    <ReactFlowProvider>
                        <HeroFlow />
                    </ReactFlowProvider>
                </div>
            </div>
            {!isMobile && !isTablet && (
                <div style={{
                    position: "absolute",
                    bottom: "60px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px",
                }}>
                    <div style={{
                        width: "1px",
                        height: "60px",
                        background: "linear-gradient(to bottom, #a3a3a3, transparent)",
                        animation: "scrollPulse 2s ease-in-out infinite",
                    }} />
                </div>
            )}

        </section>
    );
}
