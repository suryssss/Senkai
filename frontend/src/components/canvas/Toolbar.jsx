"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

const RiskMeter = ({ score, risk }) => {
    const getColor = () => {
        if (score > 70) return { primary: "#ef4444", glow: "rgba(239, 68, 68, 0.3)" };
        if (score > 40) return { primary: "#f59e0b", glow: "rgba(245, 158, 11, 0.25)" };
        return { primary: "#10b981", glow: "rgba(16, 185, 129, 0.25)" };
    };

    const colors = getColor();
    const circumference = 2 * Math.PI * 18;
    const progress = ((100 - Math.min(score, 100)) / 100) * circumference;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ position: "relative", width: "44px", height: "44px" }}>
                <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="22" cy="22" r="18" fill="none" stroke="var(--border-subtle)" strokeWidth="3" />
                    <circle cx="22" cy="22" r="18" fill="none" stroke={colors.primary} strokeWidth="3" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={progress} style={{ transition: "stroke-dashoffset 0.8s ease", filter: `drop-shadow(0 0 4px ${colors.glow})` }} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: colors.primary }}>{score}</span>
                </div>
            </div>
            <div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.5px", marginBottom: "2px" }}>Risk Score</div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: colors.primary, textTransform: "uppercase" }}>{risk}</div>
            </div>
        </div>
    );
};

const Toolbar = ({
    onAddService,
    onSave,
    onLoad,
    onDownloadReport,
    onAnalyze,
    onClear,
    isAnalyzing,
    nodeCount,
    analysisResults,
    totalTraffic,
    onTotalTrafficChange,
    entryNodeId,
    onEntryNodeChange,
    nodes,
}) => {
    const { theme, toggleTheme } = useTheme();
    const riskScore = analysisResults?.overallRisk?.riskScore ?? null;
    const riskLevel = analysisResults?.overallRisk?.overallRisk ?? null;

    // Local string state to avoid leading-zero artifacts while typing
    const [trafficInput, setTrafficInput] = useState(
        totalTraffic != null ? String(totalTraffic) : ""
    );

    useEffect(() => {
        // Keep local display in sync when parent updates totalTraffic (e.g. load preset)
        setTrafficInput(totalTraffic != null ? String(totalTraffic) : "");
    }, [totalTraffic]);

    return (
        <header style={{ height: "56px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", position: "relative", zIndex: 100 }}>

            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
                        Senkai
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "400" }}>
                        Architecture Analyzer
                    </span>
                </div>

                <div style={{ height: "24px", width: "1px", background: "var(--border-subtle)" }} />

                {/* Quick Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>

                    <button
                        onClick={onAddService}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "7px 12px",
                            fontSize: "12px",
                            fontWeight: "500",
                            color: "var(--text-secondary)",
                            background: "transparent",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = "var(--bg-tertiary)"; e.currentTarget.style.borderColor = "var(--border-default)"; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border-subtle)"; }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        Add Node
                    </button>

                    <div style={{ height: "16px", width: "1px", background: "var(--border-subtle)", margin: "0 2px" }} />

                    <button
                        onClick={onSave}
                        title="Save layout to browser storage"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "7px 12px",
                            fontSize: "12px",
                            fontWeight: "500",
                            color: "var(--text-secondary)",
                            background: "transparent",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = "var(--bg-tertiary)"; e.currentTarget.style.borderColor = "var(--border-default)"; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border-subtle)"; }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                        Save
                    </button>

                    <button
                        onClick={onLoad}
                        title="Load layout from browser storage"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "7px 12px",
                            fontSize: "12px",
                            fontWeight: "500",
                            color: "var(--text-secondary)",
                            background: "transparent",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = "var(--bg-tertiary)"; e.currentTarget.style.borderColor = "var(--border-default)"; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border-subtle)"; }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        Load
                    </button>

                    <div style={{ height: "16px", width: "1px", background: "var(--border-subtle)", margin: "0 2px" }} />

                    <button
                        onClick={onClear}
                        disabled={nodeCount === 0}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "7px 12px",
                            fontSize: "12px",
                            fontWeight: "500",
                            color: nodeCount === 0 ? "var(--text-muted)" : "var(--status-danger)",
                            background: "transparent",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "6px",
                            cursor: nodeCount === 0 ? "not-allowed" : "pointer",
                            opacity: nodeCount === 0 ? 0.5 : 1,
                            transition: "all 0.15s ease",
                        }}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        Clear
                    </button>
                </div>
            </div>

            {/* Analyze Controls */}
            <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "10px" }}>
                {/* Traffic input + entry node selector */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", background: "var(--bg-tertiary)", borderRadius: "999px", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Traffic</span>
                        <input
                            type="text"
                            value={trafficInput}
                            onChange={(e) => {
                                // Strip non-digits
                                let raw = e.target.value.replace(/[^\d]/g, "");
                                // Remove leading zeros (keep single zero if that's all)
                                if (raw.length > 1) {
                                    raw = raw.replace(/^0+/, "");
                                }
                                setTrafficInput(raw);

                                const numeric = raw === "" ? 0 : parseInt(raw, 10);
                                onTotalTrafficChange(Number.isNaN(numeric) ? 0 : numeric);
                            }}
                            style={{
                                width: "90px",
                                padding: "4px 8px",
                                fontSize: "11px",
                                color: "var(--text-primary)",
                                background: "var(--bg-primary)",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: "999px",
                                outline: "none",
                            }}
                        />
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>req/s</span>
                    </div>
                    <div style={{ width: "1px", height: "18px", background: "var(--border-subtle)" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Entry</span>
                        <select
                            value={entryNodeId || ""}
                            onChange={(e) => onEntryNodeChange(e.target.value)}
                            style={{
                                maxWidth: "150px",
                                padding: "4px 8px",
                                fontSize: "11px",
                                color: "var(--text-primary)",
                                background: "var(--bg-primary)",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: "999px",
                                outline: "none",
                                cursor: "pointer",
                            }}
                        >
                            {(nodes || []).map((n) => (
                                <option key={n.id} value={n.id}>
                                    {n.data?.label || n.id}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={onAnalyze}
                    disabled={isAnalyzing || nodeCount === 0}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "9px 20px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "white",
                        background: isAnalyzing ? "var(--accent-primary)" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        border: "none",
                        borderRadius: "8px",
                        cursor: isAnalyzing || nodeCount === 0 ? "not-allowed" : "pointer",
                        opacity: nodeCount === 0 ? 0.5 : 1,
                        boxShadow: "0 2px 8px rgba(99, 102, 241, 0.25)",
                        transition: "all 0.2s ease",
                    }}
                >
                    {isAnalyzing ? (
                        <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                            Analyze System
                        </>
                    )}
                </button>

                <button
                    onClick={onDownloadReport}
                    disabled={nodeCount === 0 || !analysisResults}
                    title="Download PDF Report"
                    style={{
                        marginLeft: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "36px",
                        height: "36px",
                        background: "var(--bg-tertiary)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                        cursor: nodeCount === 0 || !analysisResults ? "not-allowed" : "pointer",
                        color: "var(--text-secondary)",
                        opacity: nodeCount === 0 || !analysisResults ? 0.5 : 1,
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                </button>
            </div>

            {/* Risk & Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {riskScore !== null ? (
                    <RiskMeter score={riskScore} risk={riskLevel} />
                ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "12px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--status-safe)", boxShadow: "0 0 6px var(--status-safe)" }} />
                        {nodeCount} nodes
                    </div>
                )}

                <div style={{ height: "24px", width: "1px", background: "var(--border-subtle)" }} />

                <button
                    onClick={toggleTheme}
                    style={{
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "transparent",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                        transition: "all 0.15s ease",
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = "var(--bg-tertiary)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                    title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                >
                    {theme === "dark" ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                    )}
                </button>
            </div>
        </header>
    );
};

export default Toolbar;
