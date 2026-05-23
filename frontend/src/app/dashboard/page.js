"use client";

import { useEffect, useState } from "react";
import { UserProfile, useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!isLoaded) return;
        if (!isSignedIn) {
            router.push("/");
            return;
        }

        const fetchProjects = async () => {
            try {
                const token = await getToken();
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/projects`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProjects(res.data.projects || []);
            } catch (error) {
                console.error("Failed to fetch projects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [isLoaded, isSignedIn, getToken, router]);

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: "40px 20px" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 3fr", gap: "40px" }}>
                
                {/* Left Sidebar: Clerk Profile */}
                <div>
                    <button 
                        onClick={() => router.push("/analyze")}
                        style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "8px 16px", marginBottom: "20px",
                            background: "transparent", border: "1px solid var(--border-subtle)",
                            borderRadius: "8px", color: "var(--text-primary)", cursor: "pointer"
                        }}
                    >
                        ← Back to Canvas
                    </button>
                    <UserProfile routing="hash" />
                </div>

                {/* Right Content: Projects Gallery */}
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
                        My Architectures
                    </h1>
                    <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>
                        Manage your saved system designs.
                    </p>

                    {loading ? (
                        <p style={{ color: "var(--text-muted)" }}>Loading projects...</p>
                    ) : projects.length === 0 ? (
                        <div style={{ 
                            padding: "60px 40px", 
                            background: "var(--bg-secondary)", 
                            border: "1px dashed var(--border-subtle)", 
                            borderRadius: "12px", 
                            textAlign: "center" 
                        }}>
                            <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>You haven't saved any projects yet.</p>
                            <button 
                                onClick={() => router.push("/analyze")}
                                style={{
                                    padding: "10px 20px", background: "var(--accent-primary)",
                                    color: "white", border: "none", borderRadius: "8px", cursor: "pointer"
                                }}
                            >
                                Build an Architecture
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                            {projects.map((proj) => (
                                <div key={proj.id} style={{
                                    background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
                                    borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column",
                                    gap: "12px", transition: "transform 0.2s ease, border-color 0.2s ease",
                                    cursor: "pointer"
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--border-default)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                                onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.transform = "none"; }}
                                onClick={() => router.push(`/analyze?load=${proj.id}`)}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>{proj.name}</h3>
                                    </div>
                                    <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                                        Saved {new Date(proj.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
