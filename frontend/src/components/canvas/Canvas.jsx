"use client";

import { useMemo } from "react";
import { ReactFlow, Background, Controls, MiniMap, MarkerType } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import ServiceNode from "./ServiceNode";
import { useTheme } from "@/context/ThemeContext";

const Canvas = ({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodeClick, onEdgeClick, onPaneClick, onInit, onDrop, onDragOver }) => {
    const { theme } = useTheme();
    const nodeTypes = useMemo(() => ({ serviceNode: ServiceNode }), []);

    const isDark = theme === "dark";
    const edgeColor = isDark ? "#4a4a55" : "#a3a3a3";
    const gridColor = isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.04)";
    const canvasBg = isDark ? "#09090b" : "#f8f8f8";

    const defaultEdgeOptions = useMemo(() => ({
        type: "smoothstep",
        animated: true,
        style: {
            stroke: edgeColor,
            strokeWidth: 2.5,
            filter: `drop-shadow(0 0 6px ${isDark ? "rgba(99, 102, 241, 0.15)" : "rgba(79, 70, 229, 0.1)"})`,
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor, width: 18, height: 18 },
    }), [edgeColor, isDark]);

    return (
        <div style={{ flex: 1, height: "100%", position: "relative" }}>
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: isDark
                        ? "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)"
                        : "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(79, 70, 229, 0.04) 0%, transparent 50%)",
                    pointerEvents: "none",
                    zIndex: 1,
                }}
            />

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                onPaneClick={onPaneClick}
                onInit={onInit}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                snapToGrid
                snapGrid={[20, 20]}
                connectionLineStyle={{ stroke: "#6366f1", strokeWidth: 2.5 }}
                connectionLineType="smoothstep"
                deleteKeyCode={["Backspace", "Delete"]}
                panOnScroll
                panOnDrag={[1, 2]}
                minZoom={0.1}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
            >
                <Background
                    variant="dots"
                    gap={24}
                    size={1.5}
                    color={gridColor}
                    style={{ background: canvasBg, transition: "background 0.3s ease" }}
                />
                <Controls
                    position="bottom-left"
                    showInteractive={false}
                    style={{ marginBottom: "24px", marginLeft: "24px" }}
                />
                <MiniMap
                    nodeColor={(node) => {
                        const utilization = node.data?.load / node.data?.capacity || 0;
                        if (utilization >= 0.85) return "#ef4444";
                        if (utilization >= 0.6) return "#f59e0b";
                        return "#10b981";
                    }}
                    maskColor={isDark ? "rgba(0, 0, 0, 0.85)" : "rgba(255, 255, 255, 0.85)"}
                    position="bottom-right"
                    style={{ marginBottom: "24px", marginRight: "24px", borderRadius: "12px" }}
                    pannable
                    zoomable
                />
            </ReactFlow>
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "120px",
                    background: isDark
                        ? "linear-gradient(180deg, transparent 0%, rgba(9, 9, 11, 0.5) 100%)"
                        : "linear-gradient(180deg, transparent 0%, rgba(248, 248, 248, 0.4) 100%)",
                    pointerEvents: "none",
                    zIndex: 1,
                }}
            />
        </div>
    );
};

export default Canvas;
