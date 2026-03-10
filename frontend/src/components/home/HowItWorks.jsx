"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CopyPlus, Activity, Zap, ShieldCheck } from "lucide-react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const steps = [
    {
        title: "1. Build Architecture",
        desc: "Drag and drop high-performance nodes like API Gateways, Microservices, Databases, and Redis clusters to mirror your real or planned production infrastructure.",
        icon: CopyPlus,
        color: "#3b82f6"
    },
    {
        title: "2. Define Physics & Traffic",
        desc: "Set real-world variables. Define capacity, base latency, and timeout thresholds. Then, configure traffic spikes representing up to millions of requests per second.",
        icon: Activity,
        color: "#8b5cf6"
    },
    {
        title: "3. Run Discrete Event Simulation",
        desc: "Watch the execution in real-time. Our hybrid engine simulates queue depth, circuit breaker trips, backpressure, and cascading failures visually down to the millisecond.",
        icon: Zap,
        color: "#eab308"
    },
    {
        title: "4. Identify & Iterate",
        desc: "Find your system's exact breaking point before writing any code. Adjust capacities, add caching layers, and re-simulate instantly to validate your architecture.",
        icon: ShieldCheck,
        color: "#10b981"
    }
];

export default function HowItWorks() {
    const sectionRef = useRef(null);
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);
    const cardsRef = useRef([]);

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
            gsap.fromTo(
                titleRef.current,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: titleRef.current,
                        start: "top 85%",
                        toggleActions: "play none none reverse",
                    }
                }
            );

            gsap.fromTo(
                subtitleRef.current,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    delay: 0.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: titleRef.current,
                        start: "top 85%",
                        toggleActions: "play none none reverse",
                    }
                }
            );

            cardsRef.current.forEach((card, index) => {
                gsap.fromTo(
                    card,
                    { opacity: 0, y: 50, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.6,
                        ease: "back.out(1.2)",
                        scrollTrigger: {
                            trigger: card,
                            start: "top 85%",
                            toggleActions: "play none none reverse",
                        }
                    }
                );
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            style={{
                backgroundColor: "#fafafa",
                padding: isMobile ? "80px 24px" : "120px 48px",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <div style={{
                position: "absolute",
                top: 0,
                left: "20%",
                width: "60%",
                height: "800px",
                background: "radial-gradient(circle, rgba(139, 92, 246, 0.04) 0%, rgba(250, 250, 250, 0) 70%)",
                pointerEvents: "none",
                zIndex: 0
            }} />

            <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
                <div style={{ textAlign: "center", marginBottom: isMobile ? "64px" : "96px" }}>
                    <h2
                        ref={titleRef}
                        style={{
                            fontSize: isMobile ? "36px" : "56px",
                            fontWeight: "600",
                            letterSpacing: "-0.03em",
                            color: "#0a0a0a",
                            marginBottom: "24px",
                            lineHeight: 1.1
                        }}
                    >
                        How Senkai Works
                    </h2>
                    <p
                        ref={subtitleRef}
                        style={{
                            fontSize: isMobile ? "18px" : "22px",
                            color: "#737373",
                            maxWidth: "700px",
                            margin: "0 auto",
                            lineHeight: 1.6
                        }}
                    >
                        Stop guessing about system limits. Senkai brings highly accurate network simulation directly to your browser layout.
                    </p>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr 1fr",
                        gap: "32px",
                        position: "relative"
                    }}
                >
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            ref={el => (cardsRef.current[index] = el)}
                            style={{
                                background: "#ffffff",
                                border: "1px solid rgba(0, 0, 0, 0.06)",
                                borderRadius: "24px",
                                padding: "32px 24px",
                                display: "flex",
                                flexDirection: "column",
                                transition: "all 0.3s ease",
                                cursor: "default",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-8px)";
                                e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.06)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.02)";
                            }}
                        >
                            <div style={{
                                width: "56px",
                                height: "56px",
                                borderRadius: "16px",
                                background: `${step.color}15`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: "24px",
                            }}>
                                <step.icon style={{ color: step.color }} size={28} />
                            </div>
                            <h3 style={{
                                fontSize: "20px",
                                fontWeight: "600",
                                color: "#0a0a0a",
                                marginBottom: "16px",
                                letterSpacing: "-0.01em"
                            }}>
                                {step.title}
                            </h3>
                            <p style={{
                                fontSize: "15px",
                                color: "#525252",
                                lineHeight: 1.6,
                                mragin: 0
                            }}>
                                {step.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
