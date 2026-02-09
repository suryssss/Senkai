"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function Statement() {
    const sectionRef = useRef(null);
    const containerRef = useRef(null);
    const wordsRef = useRef([]);

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
                minHeight: "80vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "100px 10vw",
                position: "relative",
                background: "#ffffff",
                overflow: "hidden",
            }}
        >
            {/* Soft Radial Gradient Glow - "Vercel/Stripe style" */}
            <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "80%",
                height: "80%",
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
                backgroundSize: "32px 32px",
                opacity: 0.4,
                maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
                zIndex: 1,
            }} />

            <div ref={containerRef} style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: "1200px" }}>
                <h2 style={{
                    fontSize: "clamp(48px, 6vw, 96px)",
                    fontWeight: "500",
                    lineHeight: 1.1,
                    letterSpacing: "-0.03em",
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
                    marginTop: "40px",
                    fontSize: "clamp(18px, 2vw, 24px)",
                    color: "#737373",
                    maxWidth: "700px",
                    margin: "40px auto 0",
                    lineHeight: 1.6,
                    opacity: 0,
                    animation: "fadeInUp 1s ease 1s forwards"
                }}>
                    Stop guessing. Start simulating.
                </p>
                <style jsx>{`
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        </section>
    );
}
