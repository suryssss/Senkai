"use client";

import { memo, useEffect, useState } from "react";
import { Handle, Position } from "@xyflow/react";

const ServiceNode = memo(({ data, selected }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [showLabel, setShowLabel] = useState(false);

    useEffect(() => {
        if (data.analysisStatus || data.simulationStatus) {
            setIsAnimating(true);
            if (data.isWeakest || data.simulationStatus === "crashed") {
                setTimeout(() => setShowLabel(true), 300);
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
        safe: { primary: "#10b981", glow: "rgba(16, 185, 129, 0.2)" },
        warning: { primary: "#f59e0b", glow: "rgba(245, 158, 11, 0.25)" },
        danger: { primary: "#ef4444", glow: "rgba(239, 68, 68, 0.3)" },
        critical: { primary: "#dc2626", glow: "rgba(220, 38, 38, 0.35)" },
        crashed: { primary: "#dc2626", glow: "rgba(220, 38, 38, 0.4)" },
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
                background: "var(--bg-secondary)",
                border: `1px solid ${selected ? "var(--accent-primary)" : isAnimating ? currentStatus.primary + "60" : "var(--border-subtle)"}`,
                borderRadius: "10px",
                padding: "14px 16px",
                minWidth: "180px",
                boxShadow: selected
                    ? `0 0 0 2px var(--accent-glow), 0 4px 12px rgba(0,0,0,0.15)`
                    : isAnimating && status !== "safe"
                        ? `0 4px 20px ${currentStatus.glow}`
                        : "0 2px 8px rgba(0,0,0,0.1)",
                transition: "all 0.2s ease",
                cursor: "pointer",
                position: "relative",
            }}
        >
            {/* Failure Label */}
            {(data.isWeakest || status === "crashed") && showLabel && (
                <div
                    style={{
                        position: "absolute",
                        top: "-28px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: currentStatus.primary,
                        color: "white",
                        fontSize: "10px",
                        fontWeight: "600",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        whiteSpace: "nowrap",
                        zIndex: 100,
                    }}
                >
                    {status === "crashed" ? "CRASHED" : data.cascadeOrder ? `CASCADE #${data.cascadeOrder}` : "WEAK POINT"}
                </div>
            )}

            <Handle type="target" position={Position.Left} style={{ background: currentStatus.primary, border: "2px solid var(--bg-secondary)", width: "10px", height: "10px" }} />
            <Handle type="source" position={Position.Right} style={{ background: currentStatus.primary, border: "2px solid var(--bg-secondary)", width: "10px", height: "10px" }} />

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "2px" }}>
                        {data.label || "Service"}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "capitalize" }}>
                        {data.type || "service"}
                    </div>
                </div>
                <div
                    style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: currentStatus.primary,
                        boxShadow: isAnimating ? `0 0 8px ${currentStatus.primary}` : "none",
                        marginTop: "4px",
                    }}
                />
            </div>

            {/* Stats Row */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "10px" }}>
                <div>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: data.simulatedLoad ? currentStatus.primary : "var(--text-primary)", lineHeight: 1 }}>
                        {displayLoad || 0}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>load</div>
                </div>
                <div>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", lineHeight: 1 }}>
                        {data.capacity || 0}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>capacity</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ flex: 1, background: "var(--bg-primary)", borderRadius: "3px", height: "4px", overflow: "hidden" }}>
                    <div
                        style={{
                            width: `${Math.min(utilization, 100)}%`,
                            height: "100%",
                            background: currentStatus.primary,
                            borderRadius: "3px",
                            transition: "width 0.3s ease",
                        }}
                    />
                </div>
                <span style={{ fontSize: "11px", fontWeight: "600", color: currentStatus.primary, minWidth: "36px", textAlign: "right" }}>
                    {utilization.toFixed(0)}%
                </span>
            </div>
        </div>
    );
});

ServiceNode.displayName = "ServiceNode";

export default ServiceNode;
