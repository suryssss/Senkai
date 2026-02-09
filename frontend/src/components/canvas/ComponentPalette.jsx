"use client";

import { useTheme } from "@/context/ThemeContext";

const ComponentPalette = () => {
    const { theme } = useTheme();

    const sections = [
        {
            title: "Compute",
            items: [
                { type: "service", label: "Microservice", icon: <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />, color: "#10b981" },
                { type: "api", label: "API Service", icon: <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8.01 8.01 0 0 1-8 8" />, color: "#6366f1" },
                { type: "worker", label: "Worker", icon: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />, color: "#f59e0b" },
                { type: "serverless", label: "Serverless", icon: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />, color: "#ec4899" },
            ]
        },
        {
            title: "Data",
            items: [
                { type: "sql", label: "SQL Database", icon: <path d="M12 2c5.52 0 10 2.24 10 5s-4.48 5-10 5S2 9.76 2 7s4.48-5 10-5zm0 14c5.52 0 10 2.24 10 5v-6c0-1.56-1.42-3.41-4-4.29M2 7v10c0 2.76 4.48 5 10 5s10-2.24 10-5V7" />, color: "#3b82f6" },
                { type: "nosql", label: "NoSQL DB", icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" />, color: "#0ea5e9" },
                { type: "redis", label: "Redis", icon: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />, color: "#ef4444" }, // Reusing bolt
                { type: "objectstore", label: "Object Storage", icon: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12" />, color: "#8b5cf6" },
            ]
        },
        {
            title: "Network",
            items: [
                { type: "loadbalancer", label: "Load Balancer", icon: <path d="M6 9l6 6 6-6" />, color: "#14b8a6" }, // Simple split
                { type: "cdn", label: "CDN", icon: <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1 14.5v-3.32l-3-1.74v-3l3-1.73V3.53l4 2.3v3l-2.02 1.16v2L13 13.16v3.34z" />, color: "#06b6d4" }, // Pseudo mesh
            ]
        },
        {
            title: "Async",
            items: [
                { type: "queue", label: "Message Queue", icon: <path d="M4 6h16M4 12h16M4 18h16" />, color: "#a855f7" },
                { type: "kafka", label: "Event Bus", icon: <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22s1-1 4-1 5 2 8 2 4-1 4-1v-5s-1 1-4 1-5-2-8-2-4 1-4 1z" />, color: "#9333ea" }, // Wave
            ]
        },
        {
            title: "Security",
            items: [
                { type: "auth", label: "Auth Service", icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, color: "#f97316" },
                { type: "ratelimiter", label: "Rate Limiter", icon: <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8.01 8.01 0 0 1-8 8 M12 6v6l4 2" />, color: "#ef4444" }, // Clock
            ]
        }
    ];

    const onDragStart = (event, nodeType, label) => {
        event.dataTransfer.setData("application/reactflow", JSON.stringify({ type: nodeType, label }));
        event.dataTransfer.effectAllowed = "move";
    };

    return (
        <aside
            style={{
                width: "240px",
                height: "100%",
                background: "var(--bg-secondary)",
                borderRight: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                zIndex: 10,
            }}
        >
            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-secondary)" }}>
                <h2 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", letterSpacing: "-0.3px", textTransform: "uppercase", opacity: 0.9 }}>
                    Components
                </h2>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Drag to add services</p>
            </div>

            {/* Scrollable List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
                {sections.map((section, idx) => (
                    <div key={section.title} style={{ marginBottom: idx === sections.length - 1 ? 0 : "24px" }}>
                        <h3 style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px", paddingLeft: "8px" }}>
                            {section.title}
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
                            {section.items.map((item) => (
                                <div
                                    key={item.type}
                                    draggable
                                    onDragStart={(event) => onDragStart(event, item.type, item.label)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "10px 12px",
                                        background: "var(--bg-primary)",
                                        border: "1px solid var(--border-subtle)",
                                        borderRadius: "6px",
                                        cursor: "grab",
                                        transition: "all 0.2s ease",
                                        position: "relative",
                                        overflow: "hidden"
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.borderColor = "var(--border-default)";
                                        e.currentTarget.style.transform = "translateY(-1px)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                                        e.currentTarget.querySelector('.icon-box').style.background = `${item.color}20`; // 20% opacity
                                        e.currentTarget.querySelector('.icon-box').style.color = item.color;
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.borderColor = "var(--border-subtle)";
                                        e.currentTarget.style.transform = "none";
                                        e.currentTarget.style.boxShadow = "none";
                                        e.currentTarget.querySelector('.icon-box').style.background = "var(--bg-tertiary)";
                                        e.currentTarget.querySelector('.icon-box').style.color = "var(--text-secondary)";
                                    }}
                                >
                                    <div
                                        className="icon-box"
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "6px",
                                            background: "var(--bg-tertiary)",
                                            color: "var(--text-secondary)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginRight: "12px",
                                            transition: "background 0.2s, color 0.2s"
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            {item.icon}
                                        </svg>
                                    </div>
                                    <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-primary)" }}>
                                        {item.label}
                                    </span>
                                    <div style={{ marginLeft: "auto", display: "flex", gap: "2px", opacity: 0.3 }}>
                                        <div style={{ width: "2px", height: "12px", background: "currentColor", borderRadius: "1px" }} />
                                        <div style={{ width: "2px", height: "12px", background: "currentColor", borderRadius: "1px" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default ComponentPalette;
