"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

import {
  Navbar,
  Hero,
  Marquee,
  LiveDemo,
  Features,
  Statement,
  FinalCTA,
  Footer
} from "@/components/home";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const containerRef = useRef(null);

  useEffect(() => {
    const isWindows = typeof navigator !== "undefined" && navigator.platform.indexOf("Win") > -1;
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: isWindows ? 1 : 2.5,
      smoothTouch: false,
      touchMultiplier: 2,
    });
    lenis.on('scroll', ScrollTrigger.update);

    const rafCallback = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);

    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("load", handleLoad);
      gsap.ticker.remove(rafCallback);
      lenis.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        color: "#0a0a0a",
        fontFamily: "'Inter', -apple-system, sans-serif",
        overflowX: "hidden",
      }}
    >
      <Navbar />
      <Hero />
      <Marquee />
      <LiveDemo />
      <Features />
      <Statement />
      <FinalCTA />
      <Footer />
    </div>
  );
}
