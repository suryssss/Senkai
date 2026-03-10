"use client";

import { memo, useEffect, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import {
    Server,
    Database,
    Globe,
    Wifi,
    HardDrive,
    Cpu,
    Zap,
    Layers,
    Activity,
    Clock,
    AlignJustify
} from "lucide-react";

const getIcon = (type) => {
    switch (type?.toLowerCase()) {
        case "api": return <Globe size={16} />;
        case "database": return <Database size={16} />;
        case "cdn": return <Wifi size={16} />;
        case "loadbalancer": return <Layers size={16} />;
        case "cache": return <Zap size={16} />;
        case "auth": return <Cpu size={16} />;
        case "worker": return <HardDrive size={16} />;
        default: return <Server size={16} />;
    }
};

const ServiceNode = memo(({ data, selected }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [showLabel, setShowLabel] = useState(false);

    useEffect(() => {
        if (data.analysisStatus || data.simulationStatus) {
            setIsAnimating(true);
            if (data.isWeakest || data.simulationStatus === "crashed") {
                const labelTimer = setTimeout(() => setShowLabel(true), 300);
                return () => clearTimeout(labelTimer);
            }
            const timer = setTimeout(() => {
                setIsAnimating(false);
                setShowLabel(false);
            }, data.simulationDuration || 4000);
            return () => clearTimeout(timer);
        }
    }, [data.analysisStatus, data.simulationStatus, data.isWeakest, data.simulationDuration]);

    const getUtilization = () => {
        if (!data.capacity || data.capacity === 0) return 0;
        const load = data.simulatedLoad ?? data.load;
        return (load / data.capacity) * 100;
    };

    const utilization = getUtilization();

    const getStatus = () => {
        if (data.simulationStatus) return data.simulationStatus;
        if (data.analysisStatus) return data.analysisStatus;
        if (utilization >= 100) return "crashed";
        if (utilization >= 85) return "danger";
        if (utilization >= 60) return "warning";
        return "safe";
    };

    const status = getStatus();

    const statusColors = {
        safe: { primary: "#10b981", glow: "rgba(16, 185, 129, 0.2)", bg: "rgba(16, 185, 129, 0.05)" },
        warning: { primary: "#f59e0b", glow: "rgba(245, 158, 11, 0.25)", bg: "rgba(245, 158, 11, 0.05)" },
        danger: { primary: "#ef4444", glow: "rgba(239, 68, 68, 0.3)", bg: "rgba(239, 68, 68, 0.05)" },
        critical: { primary: "#dc2626", glow: "rgba(220, 38, 38, 0.35)", bg: "rgba(220, 38, 38, 0.05)" },
        crashed: { primary: "#dc2626", glow: "rgba(220, 38, 38, 0.4)", bg: "rgba(220, 38, 38, 0.1)" },
    };

    const currentStatus = statusColors[status] || statusColors.safe;

    const getAnimationClass = () => {
        if (!isAnimating && !data.isCascadeAffected) return "";
        if (status === "crashed" || data.isCascadeAffected) return "animate-crashed";
        if (data.isWeakest) return "animate-weakest-glow";
        if (status === "danger" || status === "critical") return "animate-danger-pulse";
        if (status === "warning") return "animate-warning-pulse";
        return "";
    };

    const displayLoad = data.simulatedLoad ?? data.load;

    return (
        <div
            className={`service-node ${getAnimationClass()}`}
            style={{
                background: status === "safe" ? "var(--bg-secondary)" : currentStatus.bg,
                border: `1px solid ${selected ? "var(--accent-primary)" : isAnimating ? currentStatus.primary + "60" : "var(--border-subtle)"}`,
                borderRadius: "12px",
                padding: "16px",
                minWidth: "200px",
                boxShadow: selected
                    ? `0 0 0 2px var(--accent-glow), 0 8px 16px rgba(0,0,0,0.1)`
                    : isAnimating && status !== "safe"
                        ? `0 4px 20px ${currentStatus.glow}`
                        : "0 2px 8px rgba(0,0,0,0.05)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                position: "relative",
            }}
        >
            {(data.isWeakest || status === "crashed") && showLabel && (
                <div
                    style={{
                        position: "absolute",
                        top: "-12px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: currentStatus.primary,
                        color: "white",
                        fontSize: "10px",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        whiteSpace: "nowrap",
                        zIndex: 100,
                        boxShadow: `0 2px 8px ${currentStatus.glow}`
                    }}
                >
                    {status === "crashed" ? "CRASHED" : data.cascadeOrder ? `CASCADE #${data.cascadeOrder}` : "WEAK POINT"}
                </div>
            )}

            <Handle type="target" position={Position.Left} style={{ background: currentStatus.primary, border: "2px solid var(--bg-secondary)", width: "10px", height: "10px" }} />
            <Handle type="source" position={Position.Right} style={{ background: currentStatus.primary, border: "2px solid var(--bg-secondary)", width: "10px", height: "10px" }} />

            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "14px" }}>
                <div
                    style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: selected ? "var(--accent-primary)" : `${currentStatus.primary}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: selected ? "white" : currentStatus.primary,
                        transition: "all 0.2s ease"
                    }}
                >
                    {getIcon(data.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {data.label || "Service"}
                    </div>
                </div>
                <div
                    style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: currentStatus.primary,
                        boxShadow: isAnimating ? `0 0 10px ${currentStatus.primary}` : "none",
                    }}
                />
            </div>

            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "14px",
                padding: "8px",
                background: "rgba(0,0,0,0.02)",
                borderRadius: "8px"
            }}>
                <div>
                    <div style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: displayLoad > 0 ? currentStatus.primary : "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                    }}>
                        <Activity size={12} strokeWidth={3} />
                        {displayLoad || 0}
                    </div>
                    <div style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.05em" }}>Load</div>
                </div>
                <div>
                    <div style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                    }}>
                        <Clock size={12} strokeWidth={3} />
                        {data.simulatedLatency ? `${data.simulatedLatency.toFixed(0)} ms` : "—"}
                    </div>
                    <div style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.05em" }}>Latency</div>
                </div>
            </div>

            <div style={{ marginBottom: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "10px", fontWeight: "600", color: "var(--text-muted)" }}>Storage/CPU</span>
                    <span style={{ fontSize: "10px", fontWeight: "700", color: currentStatus.primary }}>{utilization.toFixed(0)}%</span>
                </div>
                <div style={{ background: "var(--bg-primary)", borderRadius: "10px", height: "6px", overflow: "hidden" }}>
                    <div
                        style={{
                            width: `${Math.min(utilization, 100)}%`,
                            height: "100%",
                            background: currentStatus.primary,
                            borderRadius: "10px",
                            transition: "width 0.3s ease",
                        }}
                    />
                </div>
            </div>

            {data.simulatedQueue > 0 && (
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "8px",
                    padding: "4px 8px",
                    background: "#fef3c7",
                    borderRadius: "6px",
                    border: "1px solid #fde68a"
                }}>
                    <AlignJustify size={10} color="#b45309" strokeWidth={3} />
                    <span style={{ fontSize: "9px", fontWeight: "700", color: "#b45309" }}>
                        QUEUE: {data.simulatedQueue} req
                    </span>
                </div>
            )}
        </div>
    );
});

ServiceNode.displayName = "ServiceNode";

export default ServiceNode;
