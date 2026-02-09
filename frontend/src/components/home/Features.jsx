"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function Features() {
    const sectionRef = useRef(null);
    const cursorRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState(-1);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const featureRefs = useRef([]);

    const features = [
        {
            num: "01",
            title: "Detect",
            subtitle: "Bottlenecks",
            description: "Identify overloaded services and potential failure points before they impact production.",
            color: "#dc2626",
        },
        {
            num: "02",
            title: "Simulate",
            subtitle: "Failures",
            description: "Watch how a single service crash cascades through your entire system architecture.",
            color: "#d97706",
        },
        {
            num: "03",
            title: "Analyze",
            subtitle: "Risk",
            description: "Get an instant risk score with actionable recommendations to strengthen your design.",
            color: "#059669",
        },
        {
            num: "04",
            title: "AI",
            subtitle: "Advisor",
            description: "Receive intelligent suggestions powered by LLMs that understand system architecture.",
            color: "#7c3aed",
        },
    ];

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

        const validRefs = featureRefs.current.filter(el => el !== null);
        if (validRefs.length === 0) return;

        const ctx = gsap.context(() => {
            validRefs.forEach((feature, i) => {
                gsap.fromTo(feature,
                    { opacity: 0, x: -60 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: feature,
                            start: "top 80%",
                            end: "top 50%",
                            toggleActions: "play none none reverse",
                        },
                    }
                );

                ScrollTrigger.create({
                    trigger: feature,
                    start: "top center",
                    end: "bottom center",
                    onEnter: () => setActiveIndex(i),
                    onEnterBack: () => setActiveIndex(i),
                });
            });

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        if (!sectionRef.current || !cursorRef.current || isMobile || isTablet) return;

        const section = sectionRef.current;
        const cursor = cursorRef.current;

        const moveCursor = (e) => {
            const rect = section.getBoundingClientRect();
            gsap.to(cursor, {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                duration: 0.5,
                ease: "power2.out",
            });
        };

        section.addEventListener("mousemove", moveCursor);
        return () => section.removeEventListener("mousemove", moveCursor);
    }, [isMobile, isTablet]);

    return (
        <section
            ref={sectionRef}
            id="features"
            style={{
                background: "#f8f8f8",
                padding: isMobile ? "60px 20px" : isTablet ? "100px 40px" : "160px 80px",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <div style={{
                position: "absolute",
                top: "20%",
                left: "-10%",
                width: isMobile ? "200px" : "500px",
                height: isMobile ? "200px" : "500px",
                background: "radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)",
                filter: "blur(60px)",
                borderRadius: "50%",
                zIndex: 0,
            }} />
            {!isMobile && !isTablet && (
                <div
                    ref={cursorRef}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: hoveredIndex >= 0 ? "80px" : "0px",
                        height: hoveredIndex >= 0 ? "80px" : "0px",
                        borderRadius: "50%",
                        background: hoveredIndex >= 0 ? features[hoveredIndex]?.color : "#4f46e5",
                        opacity: hoveredIndex >= 0 ? 0.15 : 0,
                        pointerEvents: "none",
                        transform: "translate(-50%, -50%)",
                        transition: "width 0.3s ease, height 0.3s ease, opacity 0.3s ease, background 0.3s ease",
                        zIndex: 1,
                    }}
                />
            )}

            <div style={{ marginBottom: isMobile ? "40px" : isTablet ? "80px" : "120px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: isMobile ? "16px" : "32px" }}>
                    <span style={{
                        fontSize: isMobile ? "11px" : "12px",
                        color: "#a3a3a3",
                        letterSpacing: "3px",
                        textTransform: "uppercase",
                    }}>
                        Capabilities
                    </span>
                    <div style={{ flex: 1, height: "1px", background: "#e5e5e5" }} />
                </div>
                <h2 style={{
                    fontSize: isMobile ? "clamp(28px, 8vw, 36px)" : isTablet ? "clamp(32px, 6vw, 48px)" : "clamp(36px, 5vw, 56px)",
                    fontWeight: "500",
                    color: "#0a0a0a",
                    letterSpacing: isMobile ? "-1px" : "-2px",
                    lineHeight: 1.1,
                }}>
                    Everything you need to<br />
                    <span style={{ color: "#4f46e5" }}>understand your architecture</span>
                </h2>
            </div>

            <div style={{ display: "flex", gap: isMobile || isTablet ? "0" : "80px" }}>
                {!isMobile && !isTablet && (
                    <div style={{
                        width: "60px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "40px",
                        position: "sticky",
                        top: "40vh",
                        height: "fit-content",
                    }}>
                        {features.map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    width: "100%",
                                    height: "2px",
                                    background: i === activeIndex ? features[i].color : "#e5e5e5",
                                    transition: "background 0.3s ease",
                                }}
                            />
                        ))}
                    </div>
                )}

                <div style={{ flex: 1, position: "relative", zIndex: 2 }}>
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            ref={(el) => featureRefs.current[i] = el}
                            onMouseEnter={() => !isMobile && !isTablet && setHoveredIndex(i)}
                            onMouseLeave={() => !isMobile && !isTablet && setHoveredIndex(-1)}
                            style={{
                                padding: isMobile ? "24px 0" : isTablet ? "40px 0" : "60px 0",
                                borderBottom: i < features.length - 1 ? "1px solid #f0f0f0" : "none",
                                cursor: isMobile || isTablet ? "default" : "pointer",
                            }}
                        >
                            <div style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: isMobile ? "16px" : isTablet ? "24px" : "40px",
                                flexDirection: isMobile ? "column" : "row",
                            }}>
                                <span style={{
                                    fontSize: isMobile ? "12px" : "14px",
                                    color: feature.color,
                                    fontWeight: "500",
                                    fontFamily: "monospace",
                                    transition: "transform 0.3s ease",
                                    transform: hoveredIndex === i ? "scale(1.2)" : "scale(1)",
                                }}>
                                    {feature.num}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        fontSize: isMobile ? "clamp(24px, 7vw, 32px)" : "clamp(32px, 4vw, 48px)",
                                        fontWeight: "500",
                                        color: "#0a0a0a",
                                        letterSpacing: "-1px",
                                        marginBottom: "8px",
                                        transition: "transform 0.3s ease",
                                        transform: hoveredIndex === i ? "translateX(10px)" : "translateX(0)",
                                    }}>
                                        {feature.title}{" "}
                                        <span style={{
                                            color: "transparent",
                                            WebkitTextStroke: `1px ${feature.color}`,
                                            transition: "all 0.3s ease",
                                            ...(hoveredIndex === i && {
                                                color: feature.color,
                                                WebkitTextStroke: "none",
                                            }),
                                        }}>
                                            {feature.subtitle}
                                        </span>
                                    </h3>
                                    <p style={{
                                        fontSize: isMobile ? "14px" : "16px",
                                        color: "#737373",
                                        lineHeight: 1.6,
                                        maxWidth: "500px",
                                        transition: "opacity 0.3s ease",
                                        opacity: isMobile || isTablet ? 1 : (hoveredIndex === i ? 1 : 0.7),
                                    }}>
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
