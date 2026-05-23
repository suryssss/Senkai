"use client";

import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
    const router = useRouter();

    return (
        <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-primary)" }}>
            
            {/* Left side: Branding / Visuals */}
            <div style={{ 
                flex: 1, 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "center", 
                padding: "60px",
                background: "linear-gradient(135deg, var(--bg-primary) 0%, #1a1a2e 100%)",
                borderRight: "1px solid var(--border-subtle)",
                position: "relative",
                overflow: "hidden"
            }}>
                {/* Decorative background elements */}
                <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "300px", height: "300px", background: "rgba(99, 102, 241, 0.15)", filter: "blur(100px)", borderRadius: "50%" }} />
                <div style={{ position: "absolute", bottom: "10%", right: "10%", width: "400px", height: "400px", background: "rgba(139, 92, 246, 0.1)", filter: "blur(120px)", borderRadius: "50%" }} />

                <div style={{ position: "relative", zIndex: 10, maxWidth: "500px", margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", cursor: "pointer" }} onClick={() => router.push("/")}>
                        <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
                        </div>
                        <span style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
                            Senkai
                        </span>
                    </div>

                    <h1 style={{ fontSize: "42px", fontWeight: "700", color: "var(--text-primary)", lineHeight: "1.2", marginBottom: "20px" }}>
                        Join the Senkai Network
                    </h1>
                    <p style={{ fontSize: "18px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "40px" }}>
                        Create an account to save your architectures, run advanced stress tests, and unlock AI-powered system recommendations.
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg-secondary)", border: "2px solid var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3 }}><span style={{ fontSize: "10px" }}>🛡️</span></div>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg-secondary)", border: "2px solid var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: "-10px", zIndex: 2 }}><span style={{ fontSize: "10px" }}>⚡</span></div>
                        </div>
                        <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Secure & lightning fast</span>
                    </div>
                </div>
            </div>

            {/* Right side: Clerk Form */}
            <div style={{ 
                flex: "0 0 500px", 
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "center", 
                alignItems: "center",
                padding: "40px",
                background: "var(--bg-primary)"
            }}>
                <div style={{ width: "100%", maxWidth: "400px" }}>
                    <div style={{ marginBottom: "32px" }}>
                        <button 
                            onClick={() => router.push("/")}
                            style={{
                                display: "flex", alignItems: "center", gap: "8px",
                                background: "transparent", border: "none",
                                color: "var(--text-muted)", fontSize: "14px", cursor: "pointer",
                                padding: 0
                            }}
                        >
                            ← Back to home
                        </button>
                    </div>

                    <SignUp 
                        routing="hash"
                        afterSignUpUrl="/analyze" 
                        signInUrl="/sign-in"
                    />
                </div>
            </div>

        </div>
    );
}
