"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function Statement() {
    const sectionRef = useRef(null);
    const containerRef = useRef(null);
    const wordsRef = useRef([]);
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

        const validWords = wordsRef.current.filter(el => el !== null);
        if (validWords.length === 0) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(validWords,
                {
                    opacity: 0,
                    y: 60,
                    filter: "blur(10px)",
                    rotateX: 45
                },
                {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    rotateX: 0,
                    duration: 1,
                    stagger: 0.1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 75%",
                        end: "bottom center",
                        toggleActions: "play none none reverse",
                    },
                }
            );
            gsap.to(sectionRef.current, {
                backgroundPosition: "50% 100%",
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1,
                },
            });

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const sentence = [
        { text: "Most", highlight: false },
        { text: "systems", highlight: false },
        { text: "fail", highlight: false },
        { text: "in", highlight: false },
        { text: "architecture,", highlight: true, color: "#ef4444" }, // Red for fail/danger
        { text: "not", highlight: false },
        { text: "code.", highlight: true, color: "#10b981" }, // Green for code/safe
    ];

    return (
        <section
            ref={sectionRef}
            style={{
                minHeight: isMobile ? "60vh" : isTablet ? "70vh" : "80vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: isMobile ? "60px 20px" : isTablet ? "80px 40px" : "100px 80px",
                position: "relative",
                background: "#ffffff",
                overflow: "hidden",
            }}
        >
            <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: isMobile ? "100%" : isTablet ? "90%" : "80%",
                height: isMobile ? "60%" : "80%",
                maxWidth: "800px",
                maxHeight: "400px",
                background: "radial-gradient(ellipse at center, rgba(124, 58, 237, 0.15) 0%, rgba(59, 130, 246, 0.05) 40%, transparent 70%)",
                filter: "blur(60px)",
                zIndex: 0,
                pointerEvents: "none",
            }} />

            {/* Background pattern */}
            <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "radial-gradient(#e5e5e5 1px, transparent 1px)",
                backgroundSize: isMobile ? "24px 24px" : "32px 32px",
                opacity: 0.4,
                maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
                zIndex: 1,
            }} />

            <div ref={containerRef} style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: "1200px" }}>
                <h2 style={{
                    fontSize: isMobile ? "clamp(32px, 9vw, 48px)" : isTablet ? "clamp(48px, 8vw, 72px)" : "clamp(48px, 6vw, 96px)",
                    fontWeight: "500",
                    lineHeight: 1.1,
                    letterSpacing: isMobile ? "-0.02em" : "-0.03em",
                    color: "#0a0a0a",
                }}>
                    {sentence.map((word, i) => (
                        <span
                            key={i}
                            ref={(el) => wordsRef.current[i] = el}
                            style={{
                                display: "inline-block",
                                marginRight: "0.25em",
                                color: word.highlight ? word.color : "inherit",
                                transformStyle: "preserve-3d",
                                willChange: "transform, opacity, filter",
                            }}
                        >
                            {word.text}
                        </span>
                    ))}
                </h2>

                <p style={{
                    fontSize: isMobile ? "16px" : isTablet ? "18px" : "20px",
                    color: "#737373",
                    maxWidth: "600px",
                    margin: isMobile ? "32px auto 0" : "48px auto 0",
                    lineHeight: 1.6,
                    opacity: 0,
                    animation: "fadeIn 1s ease 1s forwards",
                }}>
                    Architectural decisions are expensive to change. <br />
                    Validate them before writing a single line of code.
                </p>
                <style jsx>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        </section>
    );
}
