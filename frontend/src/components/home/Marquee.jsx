"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function Marquee() {
    const marqueeRef = useRef(null);
    const track1Ref = useRef(null);
    const track2Ref = useRef(null);

    useEffect(() => {
        if (!marqueeRef.current || !track1Ref.current || !track2Ref.current) return;

        const ctx = gsap.context(() => {
            const tween1 = gsap.to(track1Ref.current, {
                xPercent: -50,
                ease: "none",
                duration: 60,
                repeat: -1,
            });
            const tween2 = gsap.fromTo(track2Ref.current,
                { xPercent: -50 },
                {
                    xPercent: 0,
                    ease: "none",
                    duration: 60,
                    repeat: -1,
                }
            );

            ScrollTrigger.create({
                trigger: marqueeRef.current,
                start: "top bottom",
                end: "bottom top",
                onUpdate: (self) => {
                    const velocity = Math.abs(self.getVelocity()) / 1000;
                    gsap.to([tween1, tween2], {
                        timeScale: 1 + velocity * 0.5,
                        duration: 0.8,
                    });
                },
            });
        }, marqueeRef);

        return () => ctx.revert();
    }, []);

    const words1 = ["BOTTLENECK DETECTION", "•", "FAILURE SIMULATION", "•", "AI INSIGHTS", "•", "RISK ANALYSIS", "•"];
    const words2 = ["SYSTEM DESIGN", "◦", "ARCHITECTURE REVIEW", "◦", "LOAD TESTING", "◦", "CASCADE ANALYSIS", "◦"];

    return (
        <section
            ref={marqueeRef}
            style={{
                padding: "80px 0",
                borderTop: "1px solid #e5e5e5",
                borderBottom: "1px solid #e5e5e5",
                background: "#f5f5f5",
                overflow: "hidden",
            }}
        >
            <div style={{ overflow: "hidden", marginBottom: "20px" }}>
                <div
                    ref={track1Ref}
                    style={{
                        display: "flex",
                        gap: "60px",
                        whiteSpace: "nowrap",
                        width: "fit-content",
                    }}
                >
                    {[...words1, ...words1, ...words1, ...words1].map((word, i) => (
                        <span
                            key={i}
                            style={{
                                fontSize: "clamp(32px, 5vw, 64px)",
                                fontWeight: "500",
                                color: word === "•" ? "#d4d4d4" : "#0a0a0a",
                                letterSpacing: "-1px",
                            }}
                        >
                            {word}
                        </span>
                    ))}
                </div>
            </div>
            <div style={{ overflow: "hidden" }}>
                <div
                    ref={track2Ref}
                    style={{
                        display: "flex",
                        gap: "60px",
                        whiteSpace: "nowrap",
                        width: "fit-content",
                    }}
                >
                    {[...words2, ...words2, ...words2, ...words2].map((word, i) => (
                        <span
                            key={i}
                            style={{
                                fontSize: "clamp(32px, 5vw, 64px)",
                                fontWeight: "500",
                                color: word === "◦" ? "#d4d4d4" : "transparent",
                                WebkitTextStroke: word === "◦" ? "none" : "1px #a3a3a3",
                                letterSpacing: "-1px",
                            }}
                        >
                            {word}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
