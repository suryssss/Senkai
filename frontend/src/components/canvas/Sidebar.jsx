"use client";

import { useState, useEffect } from "react";

const Sidebar = ({ selectedNode, selectedEdge, analysisResults, onUpdateNode, onUpdateEdge, onDeleteNode, onDeleteEdge, onStressTest, onCascadeSimulation, activeSimulation }) => {
    const [nodeForm, setNodeForm] = useState({ label: "", type: "api", capacity: 100, load: 0 });
    const [edgeLatency, setEdgeLatency] = useState(10);
    const [edgePercentage, setEdgePercentage] = useState(100);
    const [activeTab, setActiveTab] = useState("properties");

    useEffect(() => {
        if (selectedNode) {
            setNodeForm({ label: selectedNode.data.label || "", type: selectedNode.data.type || "api", capacity: selectedNode.data.capacity || 100, load: selectedNode.data.load || 0 });
            setActiveTab("properties");
        }
    }, [selectedNode]);

    useEffect(() => {
        if (selectedEdge) {
            setEdgeLatency(selectedEdge.data?.latency || 10);
            setEdgePercentage(
                typeof selectedEdge.data?.percentage === "number"
                    ? selectedEdge.data.percentage
                    : 100
            );
            setActiveTab("properties");
        }
    }, [selectedEdge]);

    useEffect(() => {
        if (analysisResults) setActiveTab("results");
    }, [analysisResults]);

    const handleNodeUpdate = () => { if (selectedNode) onUpdateNode(selectedNode.id, nodeForm); };
    const handleEdgeUpdate = () => {
        if (selectedEdge) {
            onUpdateEdge(selectedEdge.id, {
                latency: edgeLatency,
                percentage: edgePercentage,
            });
        }
    };

    const serviceTypes = [
        { value: "service", label: "Microservice" },
        { value: "api", label: "API Service" },
        { value: "worker", label: "Worker" },
        { value: "serverless", label: "Serverless" },
        { value: "sql", label: "SQL Database" },
        { value: "nosql", label: "NoSQL DB" },
        { value: "redis", label: "Redis" },
        { value: "objectstore", label: "Object Storage" },
        { value: "loadbalancer", label: "Load Balancer" },
        { value: "cdn", label: "CDN" },
        { value: "queue", label: "Message Queue" },
        { value: "kafka", label: "Event Bus" },
        { value: "auth", label: "Auth Service" },
        { value: "ratelimiter", label: "Rate Limiter" },
    ];

    const tabs = [
        {
            id: "properties", label: "Properties", icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
            )
        },
        {
            id: "results", label: "Analysis", icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
            ), dot: !!analysisResults
        },
        {
            id: "advisor", label: "AI Advisor", icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" /></svg>
            ), dot: !!analysisResults?.aiAdvice?.enabled, color: "#8b5cf6"
        },
        {
            id: "simulate", label: "Simulate", icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            )
        },
    ];

    const getUtilColor = (util) => {
        if (util >= 85) return "var(--status-danger)";
        if (util >= 60) return "var(--status-warning)";
        return "var(--status-safe)";
    };

    const utilization = nodeForm.capacity ? Math.round((nodeForm.load / nodeForm.capacity) * 100) : 0;

    const SectionHeader = ({ children }) => (
        <div style={{ fontSize: "10px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px" }}>
            {children}
        </div>
    );

    const Card = ({ children, style = {} }) => (
        <div style={{ padding: "16px", background: "var(--bg-tertiary)", borderRadius: "10px", border: "1px solid var(--border-subtle)", ...style }}>
            {children}
        </div>
    );

    const StatusBadge = ({ status }) => {
        const colors = {
            safe: { bg: "rgba(16, 185, 129, 0.12)", text: "#10b981" },
            warning: { bg: "rgba(245, 158, 11, 0.12)", text: "#f59e0b" },
            danger: { bg: "rgba(239, 68, 68, 0.12)", text: "#ef4444" },
            low: { bg: "rgba(16, 185, 129, 0.12)", text: "#10b981" },
            high: { bg: "rgba(239, 68, 68, 0.12)", text: "#ef4444" },
            critical: { bg: "rgba(220, 38, 38, 0.15)", text: "#dc2626" },
            crashed: { bg: "rgba(220, 38, 38, 0.15)", text: "#dc2626" },
        };
        const c = colors[status] || colors.safe;
        return (
            <span style={{ fontSize: "10px", fontWeight: "600", color: c.text, background: c.bg, padding: "4px 8px", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                {status}
            </span>
        );
    };

    const SeverityBadge = ({ severity }) => {
        const colors = {
            critical: { bg: "linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(185, 28, 28, 0.1) 100%)", text: "#dc2626", border: "rgba(220, 38, 38, 0.3)" },
            high: { bg: "linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.08) 100%)", text: "#ef4444", border: "rgba(239, 68, 68, 0.25)" },
            medium: { bg: "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.08) 100%)", text: "#f59e0b", border: "rgba(245, 158, 11, 0.25)" },
            low: { bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)", text: "#10b981", border: "rgba(16, 185, 129, 0.25)" },
        };
        const c = colors[severity] || colors.medium;
        return (
            <span style={{ fontSize: "9px", fontWeight: "700", color: c.text, background: c.bg, padding: "4px 8px", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.5px", border: `1px solid ${c.border}` }}>
                {severity}
            </span>
        );
    };

    const EmptyState = ({ icon, title, subtitle }) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "280px", textAlign: "center", padding: "20px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", border: "1px solid var(--border-subtle)" }}>
                {icon}
            </div>
            <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "6px" }}>{title}</p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5, maxWidth: "200px" }}>{subtitle}</p>
        </div>
    );

    const inputStyle = {
        width: "100%",
        padding: "10px 12px",
        fontSize: "13px",
        color: "var(--text-primary)",
        background: "var(--bg-primary)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "8px",
        outline: "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
    };

    const labelStyle = {
        fontSize: "11px",
        fontWeight: "500",
        color: "var(--text-muted)",
        display: "block",
        marginBottom: "6px",
    };

    return (
        <aside style={{ width: "340px", height: "100%", background: "var(--bg-secondary)", display: "flex", flexDirection: "column", borderLeft: "1px solid var(--border-subtle)" }}>

            {/* Tab Navigation */}
            <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", gap: "4px" }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: "10px 6px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "10px",
                                fontWeight: activeTab === tab.id ? "600" : "500",
                                color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-muted)",
                                background: activeTab === tab.id ? "var(--bg-tertiary)" : "transparent",
                                border: activeTab === tab.id ? "1px solid var(--border-subtle)" : "1px solid transparent",
                                borderRadius: "8px",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                position: "relative",
                            }}
                        >
                            <span style={{ color: activeTab === tab.id ? (tab.color || "var(--accent-primary)") : "var(--text-muted)", transition: "color 0.2s" }}>
                                {tab.icon}
                            </span>
                            <span>{tab.label}</span>
                            {tab.dot && (
                                <span style={{
                                    position: "absolute",
                                    top: "6px",
                                    right: "6px",
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    background: tab.color || "var(--accent-primary)",
                                    boxShadow: `0 0 8px ${tab.color || "var(--accent-primary)"}`,
                                }} />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>

                {/* Properties Tab */}
                {activeTab === "properties" && (
                    <>
                        {selectedNode && (
                            <div className="animate-fadeIn">
                                {/* Node Header */}
                                <Card style={{ marginBottom: "16px", background: "linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-primary) 100%)" }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                                        <div>
                                            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                                                {nodeForm.label || "Untitled Node"}
                                            </h3>
                                            <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "capitalize" }}>
                                                {serviceTypes.find(t => t.value === nodeForm.type)?.label || nodeForm.type}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => onDeleteNode(selectedNode.id)}
                                            style={{ fontSize: "11px", color: "var(--status-danger)", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", fontWeight: "500", transition: "all 0.2s" }}
                                        >
                                            Delete
                                        </button>
                                    </div>

                                    {/* Metrics */}
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                                        <div style={{ textAlign: "center", padding: "12px", background: "var(--bg-primary)", borderRadius: "8px" }}>
                                            <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)" }}>{nodeForm.load}</div>
                                            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>Load</div>
                                        </div>
                                        <div style={{ textAlign: "center", padding: "12px", background: "var(--bg-primary)", borderRadius: "8px" }}>
                                            <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)" }}>{nodeForm.capacity}</div>
                                            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>Capacity</div>
                                        </div>
                                        <div style={{ textAlign: "center", padding: "12px", background: "var(--bg-primary)", borderRadius: "8px" }}>
                                            <div style={{ fontSize: "20px", fontWeight: "700", color: getUtilColor(utilization) }}>{utilization}%</div>
                                            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>Usage</div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div style={{ marginTop: "12px", height: "4px", background: "var(--bg-primary)", borderRadius: "2px", overflow: "hidden" }}>
                                        <div style={{ width: `${Math.min(utilization, 100)}%`, height: "100%", background: getUtilColor(utilization), borderRadius: "2px", transition: "width 0.3s ease" }} />
                                    </div>
                                </Card>

                                {/* Edit Form */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                    <div>
                                        <label style={labelStyle}>Service Name</label>
                                        <input type="text" value={nodeForm.label} onChange={(e) => setNodeForm({ ...nodeForm, label: e.target.value })} onBlur={handleNodeUpdate} placeholder="Enter service name" style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Service Type</label>
                                        <select value={nodeForm.type} onChange={(e) => { setNodeForm({ ...nodeForm, type: e.target.value }); setTimeout(handleNodeUpdate, 0); }} style={{ ...inputStyle, cursor: "pointer" }}>
                                            {serviceTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                        <div>
                                            <label style={labelStyle}>Capacity</label>
                                            <input type="number" value={nodeForm.capacity === 0 ? "" : nodeForm.capacity} onChange={(e) => setNodeForm({ ...nodeForm, capacity: e.target.value === "" ? 0 : parseInt(e.target.value, 10) || 0 })} onBlur={handleNodeUpdate} min="0" style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Current Load</label>
                                            <input type="number" value={nodeForm.load === 0 ? "" : nodeForm.load} onChange={(e) => setNodeForm({ ...nodeForm, load: e.target.value === "" ? 0 : parseInt(e.target.value, 10) || 0 })} onBlur={handleNodeUpdate} min="0" style={inputStyle} />
                                        </div>
                                    </div>
                                    <button onClick={handleNodeUpdate} style={{ width: "100%", marginTop: "4px", padding: "12px", fontSize: "13px", fontWeight: "600", color: "white", background: "linear-gradient(135deg, var(--accent-primary) 0%, #4f46e5 100%)", border: "none", borderRadius: "8px", cursor: "pointer", boxShadow: "0 2px 8px rgba(99, 102, 241, 0.25)", transition: "all 0.2s" }}>
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}

                        {selectedEdge && !selectedNode && (
                            <div className="animate-fadeIn">
                                <Card style={{ marginBottom: "16px" }}>
                                    <SectionHeader>Connection Details</SectionHeader>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                        <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--accent-primary)" }}>{selectedEdge.source}</span>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                        <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--accent-primary)" }}>{selectedEdge.target}</span>
                                    </div>
                                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Data flows from source to target</div>
                                </Card>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                                    <div>
                                        <label style={labelStyle}>Latency (ms)</label>
                                        <input
                                            type="number"
                                            value={edgeLatency}
                                            onChange={(e) => setEdgeLatency(parseInt(e.target.value, 10) || 0)}
                                            onBlur={handleEdgeUpdate}
                                            min="0"
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Traffic Share (%)</label>
                                        <input
                                            type="number"
                                            value={edgePercentage}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value, 10);
                                                setEdgePercentage(Number.isNaN(value) ? 0 : Math.min(Math.max(value, 0), 100));
                                            }}
                                            onBlur={handleEdgeUpdate}
                                            min="0"
                                            max="100"
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button onClick={handleEdgeUpdate} style={{ flex: 1, padding: "12px", fontSize: "13px", fontWeight: "600", color: "white", background: "linear-gradient(135deg, var(--accent-primary) 0%, #4f46e5 100%)", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                                        Update
                                    </button>
                                    <button onClick={() => onDeleteEdge(selectedEdge.id)} style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "500", color: "var(--status-danger)", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", cursor: "pointer" }}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}

                        {!selectedNode && !selectedEdge && (
                            <EmptyState
                                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>}
                                title="No Selection"
                                subtitle="Click on a node or connection to view and edit its properties"
                            />
                        )}
                    </>
                )}

                {/* Results Tab */}
                {activeTab === "results" && (
                    <>
                        {analysisResults ? (
                            <div className="animate-fadeIn">
                                {/* Risk Score */}
                                <Card style={{ marginBottom: "16px", textAlign: "center", background: "linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-primary) 100%)" }}>
                                    <div style={{ fontSize: "48px", fontWeight: "800", color: analysisResults.overallRisk?.riskScore > 70 ? "var(--status-danger)" : analysisResults.overallRisk?.riskScore > 40 ? "var(--status-warning)" : "var(--status-safe)", lineHeight: 1, marginBottom: "4px" }}>
                                        {analysisResults.overallRisk?.riskScore || 0}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Risk Score</div>
                                    <div style={{ marginTop: "12px", height: "6px", background: "var(--bg-primary)", borderRadius: "3px", overflow: "hidden" }}>
                                        <div style={{ width: `${analysisResults.overallRisk?.riskScore || 0}%`, height: "100%", background: analysisResults.overallRisk?.riskScore > 70 ? "var(--status-danger)" : analysisResults.overallRisk?.riskScore > 40 ? "var(--status-warning)" : "var(--status-safe)", borderRadius: "3px", transition: "width 0.5s ease" }} />
                                    </div>
                                </Card>

                                {/* Key Metrics */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                                    {analysisResults.weakestPoint && (
                                        <Card style={{ padding: "12px" }}>
                                            <div style={{ fontSize: "10px", color: "var(--status-danger)", fontWeight: "600", marginBottom: "4px" }}>WEAKEST</div>
                                            <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{analysisResults.weakestPoint.weakestService}</div>
                                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{analysisResults.weakestPoint.utilization}</div>
                                        </Card>
                                    )}
                                    {analysisResults.latencyRiskResult && (
                                        <Card style={{ padding: "12px" }}>
                                            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "600", marginBottom: "4px" }}>LATENCY</div>
                                            <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{analysisResults.latencyRiskResult.criticalPathLatency}ms</div>
                                            <div style={{ marginTop: "4px" }}><StatusBadge status={analysisResults.latencyRiskResult.risk} /></div>
                                        </Card>
                                    )}
                                </div>

                                {/* Services */}
                                {analysisResults.bottleneckResult?.length > 0 && (
                                    <div style={{ marginBottom: "16px" }}>
                                        <SectionHeader>Service Health</SectionHeader>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                            {analysisResults.bottleneckResult.map((b, i) => (
                                                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "var(--bg-tertiary)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                                                    <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-primary)" }}>{b.service}</span>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{b.utilization}</span>
                                                        <StatusBadge status={b.status} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Suggestions */}
                                {analysisResults.suggestions?.length > 0 && (
                                    <div>
                                        <SectionHeader>Recommendations</SectionHeader>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                            {analysisResults.suggestions.slice(0, 3).map((s, i) => (
                                                <div key={i} style={{ padding: "12px", background: "rgba(99, 102, 241, 0.06)", borderRadius: "8px", borderLeft: "3px solid var(--accent-primary)", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                                                    {s}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <EmptyState
                                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>}
                                title="No Analysis Yet"
                                subtitle="Click 'Analyze System' to run a comprehensive architecture analysis"
                            />
                        )}
                    </>
                )}

                {/* AI Advisor Tab */}
                {activeTab === "advisor" && (
                    <div className="animate-fadeIn">
                        {analysisResults?.aiAdvice?.enabled ? (
                            <>
                                <Card style={{ marginBottom: "16px", background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)" }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" /></svg>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>AI Architect</div>
                                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Powered by Groq • Llama 3.3</div>
                                        </div>
                                    </div>
                                </Card>

                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {analysisResults.aiAdvice.suggestions.map((suggestion, i) => (
                                        <Card key={i} style={{ padding: "0", overflow: "hidden", border: "none" }}>
                                            <div style={{ padding: "14px 16px", background: suggestion.severity === "critical" ? "rgba(220, 38, 38, 0.08)" : suggestion.severity === "high" ? "rgba(239, 68, 68, 0.06)" : suggestion.severity === "medium" ? "rgba(245, 158, 11, 0.06)" : "rgba(16, 185, 129, 0.06)", borderLeft: `4px solid ${suggestion.severity === "critical" ? "#dc2626" : suggestion.severity === "high" ? "#ef4444" : suggestion.severity === "medium" ? "#f59e0b" : "#10b981"}` }}>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                                                    <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>{suggestion.title}</span>
                                                    <SeverityBadge severity={suggestion.severity} />
                                                </div>

                                                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "10px", lineHeight: 1.6 }}>
                                                    <span style={{ color: "var(--text-muted)", fontWeight: "500" }}>Issue: </span>{suggestion.problem}
                                                </div>

                                                <div style={{ fontSize: "12px", color: "var(--status-warning)", marginBottom: "10px", lineHeight: 1.6 }}>
                                                    <span style={{ fontWeight: "500" }}>⚠️ Risk: </span>{suggestion.risk}
                                                </div>

                                                <div style={{ fontSize: "12px", color: "var(--status-safe)", lineHeight: 1.6 }}>
                                                    <span style={{ fontWeight: "500" }}>✓ Fix: </span>{suggestion.solution}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <EmptyState
                                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.5"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" /></svg>}
                                title="AI Advisor"
                                subtitle={analysisResults?.aiAdvice?.message || "Run analysis to get AI-powered architecture suggestions"}
                            />
                        )}
                    </div>
                )}

                {/* Simulate Tab */}
                {activeTab === "simulate" && (
                    <div className="animate-fadeIn">
                        <Card style={{ marginBottom: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>Stress Test</div>
                                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Simulate load increases</div>
                                </div>
                            </div>
                            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "12px" }}>
                                Test your architecture under 20%, 50%, and 100% traffic increases to identify breaking points.
                            </p>
                            <button onClick={onStressTest} disabled={!!activeSimulation} style={{ width: "100%", padding: "11px", fontSize: "13px", fontWeight: "600", color: "white", background: activeSimulation ? "var(--text-muted)" : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", border: "none", borderRadius: "8px", cursor: activeSimulation ? "not-allowed" : "pointer", boxShadow: activeSimulation ? "none" : "0 2px 8px rgba(245, 158, 11, 0.25)" }}>
                                {activeSimulation === 'stress' ? "Running..." : "Run Stress Test"}
                            </button>
                        </Card>

                        <Card>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                </div>
                                <div>
                                    <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>Cascade Failure</div>
                                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Visualize failure propagation</div>
                                </div>
                            </div>
                            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "12px" }}>
                                See how failures spread through your system starting from the weakest service.
                            </p>
                            <button onClick={onCascadeSimulation} disabled={!!activeSimulation} style={{ width: "100%", padding: "11px", fontSize: "13px", fontWeight: "600", color: "white", background: activeSimulation ? "var(--text-muted)" : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", border: "none", borderRadius: "8px", cursor: activeSimulation ? "not-allowed" : "pointer", boxShadow: activeSimulation ? "none" : "0 2px 8px rgba(239, 68, 68, 0.25)" }}>
                                {activeSimulation === 'cascade' ? "Running..." : "Simulate Cascade"}
                            </button>
                        </Card>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
