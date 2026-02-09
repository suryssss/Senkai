"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useNodesState, useEdgesState, addEdge } from "@xyflow/react";
import axios from "axios";

import Toolbar from "@/components/canvas/Toolbar";
import Canvas from "@/components/canvas/Canvas";
import Sidebar from "@/components/canvas/Sidebar";
import ComponentPalette from "@/components/canvas/ComponentPalette";
import Toast from "@/components/ui/Toast";
import { useTheme } from "@/context/ThemeContext";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const initialNodes = [
    { id: "api-gateway", type: "serviceNode", position: { x: 100, y: 200 }, data: { label: "API Gateway", type: "api", capacity: 1000, load: 450 } },
    { id: "user-service", type: "serviceNode", position: { x: 420, y: 80 }, data: { label: "User Service", type: "service", capacity: 500, load: 320 } },
    { id: "auth-service", type: "serviceNode", position: { x: 420, y: 320 }, data: { label: "Auth Service", type: "auth", capacity: 300, load: 180 } },
    { id: "database", type: "serviceNode", position: { x: 750, y: 200 }, data: { label: "PostgreSQL", type: "database", capacity: 800, load: 680 } },
    { id: "redis-cache", type: "serviceNode", position: { x: 750, y: 380 }, data: { label: "Redis Cache", type: "cache", capacity: 2000, load: 400 } },
];

const initialEdges = [
    { id: "e1", source: "api-gateway", target: "user-service", data: { latency: 15 } },
    { id: "e2", source: "api-gateway", target: "auth-service", data: { latency: 10 } },
    { id: "e3", source: "user-service", target: "database", data: { latency: 25 } },
    { id: "e4", source: "auth-service", target: "database", data: { latency: 20 } },
    { id: "e5", source: "auth-service", target: "redis-cache", data: { latency: 5 } },
];

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: { "Content-Type": "application/json" },
});

export default function AnalyzePage() {
    const { theme } = useTheme();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedEdge, setSelectedEdge] = useState(null);
    const [analysisResults, setAnalysisResults] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [activeSimulation, setActiveSimulation] = useState(null);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const isAnalyzingRef = useRef(false);

    const formatPayload = useMemo(() => ({
        nodes: nodes.map((n) => ({ id: n.id, capacity: Number(n.data.capacity) || 0, load: Number(n.data.load) || 0 })),
        edges: edges.map((e) => ({ source: e.source, target: e.target, latency: Number(e.data?.latency) || 10 })),
    }), [nodes, edges]);

    const onConnect = useCallback((params) => {
        const newEdge = { ...params, id: `e-${params.source}-${params.target}-${Date.now()}`, data: { latency: 10 } };
        setEdges((eds) => addEdge(newEdge, eds));
    }, [setEdges]);

    const onNodeClick = useCallback((_, node) => { setSelectedNode(node); setSelectedEdge(null); setIsSidebarOpen(true); }, []);
    const onEdgeClick = useCallback((_, edge) => { setSelectedEdge(edge); setSelectedNode(null); setIsSidebarOpen(true); }, []);
    const onPaneClick = useCallback(() => { setSelectedNode(null); setSelectedEdge(null); }, []);

    const handleAddService = useCallback(() => {
        const id = `service-${Date.now()}`;
        setNodes((nds) => [...nds, {
            id,
            type: "serviceNode",
            position: { x: Math.random() * 400 + 150, y: Math.random() * 300 + 100 },
            data: { label: "New Service", type: "service", capacity: 100, load: 0 },
        }]);
    }, [setNodes]);

    const handleClearCanvas = useCallback(() => {
        setNodes([]);
        setEdges([]);
        setSelectedNode(null);
        setSelectedEdge(null);
        setAnalysisResults(null);
        setError(null);
    }, [setNodes, setEdges]);

    const clearSimulationState = useCallback(() => {
        setNodes((nds) => nds.map((node) => ({
            ...node,
            data: { ...node.data, analysisStatus: null, isWeakest: false, simulationStatus: null, simulatedLoad: null, isCascadeAffected: false, cascadeOrder: null },
        })));
    }, [setNodes]);

    const handleSave = useCallback(() => {
        try {
            const data = JSON.stringify({ nodes, edges });
            localStorage.setItem("structflow_layout", data);
            setToast({ message: "Layout saved successfully!", type: "success" });
        } catch (e) {
            console.error("Save failed:", e);
            setToast({ message: "Failed to save layout.", type: "error" });
        }
    }, [nodes, edges]);

    const handleLoad = useCallback(() => {
        try {
            const data = localStorage.getItem("structflow_layout");
            if (!data) {
                setToast({ message: "No saved layout found.", type: "error" });
                return;
            }
            const { nodes: loadedNodes, edges: loadedEdges } = JSON.parse(data);
            setNodes(loadedNodes || []);
            setEdges(loadedEdges || []);
            setAnalysisResults(null);
            clearSimulationState();
            setToast({ message: "Layout loaded successfully!", type: "success" });
        } catch (e) {
            console.error("Load failed:", e);
            setToast({ message: "Failed to load layout.", type: "error" });
        }
    }, [setNodes, setEdges, clearSimulationState]);

    const handleAnalyze = useCallback(async () => {
        if (nodes.length === 0 || isAnalyzingRef.current) return;
        isAnalyzingRef.current = true;
        setIsAnalyzing(true);
        setError(null);
        clearSimulationState();

        try {
            const response = await api.post("/api/analyze", formatPayload);
            const results = response.data;

            if (!results.success) {
                throw new Error(results.message || "Analysis failed");
            }

            setAnalysisResults(results);

            const weakestId = results.weakestPoint?.weakestService;
            const bottleneckMap = {};
            results.bottleneckResult?.forEach((b) => { bottleneckMap[b.service] = b.status; });

            setNodes((nds) => nds.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    analysisStatus: bottleneckMap[node.id] || "safe",
                    isWeakest: node.id === weakestId,
                    simulationDuration: 4000,
                },
            })));
            setTimeout(clearSimulationState, 4500);

        } catch (err) {
            console.error("Analysis failed:", err);
            setError(err.response?.data?.message || err.message || "Failed to connect to backend");
        } finally {
            isAnalyzingRef.current = false;
            setIsAnalyzing(false);
        }
    }, [nodes.length, formatPayload, setNodes, clearSimulationState]);

    const handleStressTest = useCallback(async () => {
        if (nodes.length === 0 || activeSimulation) return;
        setActiveSimulation('stress');
        clearSimulationState();

        const multipliers = [1.2, 1.5, 2.0];

        for (let i = 0; i < multipliers.length; i++) {
            await new Promise((r) => setTimeout(r, i === 0 ? 300 : 1200));

            setNodes((nds) => {
                const updated = nds.map((node) => {
                    const simulatedLoad = Math.round(node.data.load * multipliers[i]);
                    const util = (simulatedLoad / node.data.capacity) * 100;
                    const status = util >= 100 ? "crashed" : util >= 85 ? "danger" : util >= 60 ? "warning" : "safe";

                    return { ...node, data: { ...node.data, simulatedLoad, simulationStatus: status, simulationDuration: 8000 } };
                });

                const crashed = updated.find((n) => n.data.simulationStatus === "crashed");
                if (crashed) return updated.map((n) => n.id === crashed.id ? { ...n, data: { ...n.data, isWeakest: true } } : n);
                return updated;
            });
        }

        setTimeout(() => { clearSimulationState(); setActiveSimulation(null); }, 4000);
    }, [nodes.length, activeSimulation, setNodes, clearSimulationState]);

    // Cascade Failure 
    const handleCascadeSimulation = useCallback(async () => {
        if (nodes.length === 0 || activeSimulation) return;
        setActiveSimulation('cascade');
        clearSimulationState();

        // Find weakest node
        const weakest = nodes.reduce((w, n) => {
            const util = (n.data.load / n.data.capacity) * 100;
            return util > (w?.util || 0) ? { node: n, util } : w;
        }, null)?.node;

        if (!weakest) { setActiveSimulation(null); return; }
        const dependents = {};
        edges.forEach((e) => { dependents[e.target] = [...(dependents[e.target] || []), e.source]; });

        const cascadeOrder = [{ id: weakest.id, order: 1 }];
        const crashed = new Set([weakest.id]);
        let queue = [weakest.id], order = 2;

        while (queue.length) {
            const next = [];
            queue.forEach((id) => (dependents[id] || []).forEach((dep) => {
                if (!crashed.has(dep)) { crashed.add(dep); cascadeOrder.push({ id: dep, order: order }); next.push(dep); }
            }));
            queue = next;
            order++;
        }
        for (const { id, order: num } of cascadeOrder) {
            await new Promise((r) => setTimeout(r, num === 1 ? 400 : 700));
            setNodes((nds) => nds.map((n) => n.id === id ? {
                ...n,
                data: { ...n.data, simulationStatus: "crashed", isCascadeAffected: true, cascadeOrder: num, isWeakest: num === 1, simulationDuration: 10000 },
            } : n));
        }

        setTimeout(() => { clearSimulationState(); setActiveSimulation(null); }, 5000);
    }, [nodes, edges, activeSimulation, setNodes, clearSimulationState]);

    const handleUpdateNode = useCallback((nodeId, updates) => {
        setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...updates } } : n));
        setSelectedNode((prev) => prev?.id === nodeId ? { ...prev, data: { ...prev.data, ...updates } } : prev);
    }, [setNodes]);

    const handleUpdateEdge = useCallback((edgeId, updates) => {
        setEdges((eds) => eds.map((e) => e.id === edgeId ? { ...e, data: { ...e.data, ...updates } } : e));
    }, [setEdges]);

    const handleDeleteNode = useCallback((nodeId) => {
        setNodes((nds) => nds.filter((n) => n.id !== nodeId));
        setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
        setSelectedNode(null);
    }, [setNodes, setEdges]);

    const handleDeleteEdge = useCallback((edgeId) => {
        setEdges((eds) => eds.filter((e) => e.id !== edgeId));
        setSelectedEdge(null);
    }, [setEdges]);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((event) => {
        event.preventDefault();

        const typeStr = event.dataTransfer.getData("application/reactflow");
        if (typeof typeStr === 'undefined' || !typeStr) return;

        const data = JSON.parse(typeStr);
        if (typeof data === 'undefined' || !data) return;

        const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });

        const defaults = {
            api: { capacity: 1000, type: "api" },
            service: { capacity: 500, type: "service" },
            worker: { capacity: 200, type: "worker" },
            serverless: { capacity: 100, type: "serverless" },
            sql: { capacity: 800, type: "database" },
            nosql: { capacity: 1500, type: "database" },
            redis: { capacity: 2000, type: "cache" },
            objectstore: { capacity: 5000, type: "storage" },
            loadbalancer: { capacity: 10000, type: "loadbalancer" },
            cdn: { capacity: 50000, type: "cdn" },
            queue: { capacity: 5000, type: "queue" },
            kafka: { capacity: 10000, type: "queue" },
            auth: { capacity: 300, type: "auth" },
            ratelimiter: { capacity: 1000, type: "security" },
        };

        const config = defaults[data.type] || { capacity: 100, type: "service" };

        const newNode = {
            id: `${data.type}-${Date.now()}`,
            type: 'serviceNode',
            position,
            data: { label: data.label, type: config.type, capacity: config.capacity, load: 0 },
        };

        setNodes((nds) => nds.concat(newNode));
        setToast({ message: `Added ${data.label}`, type: "success" });
    }, [reactFlowInstance, setNodes]);

    const downloadReport = useCallback(async () => {
        const input = document.getElementById("report-container");
        if (!input) return;

        setToast({ message: "Generating report...", type: "success" });

        try {
            const imgData = await toPng(input, { cacheBust: true, pixelRatio: 2, backgroundColor: "#ffffff" });

            const pdf = new jsPDF("landscape", "px", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgProps = pdf.getImageProperties(imgData);
            const ratio = imgProps.width / imgProps.height;
            let imgWidth = pdfWidth - 40;
            let imgHeight = imgWidth / ratio;

            if (imgHeight > pdfHeight - 40) {
                imgHeight = pdfHeight - 40;
                imgWidth = imgHeight * ratio;
            }

            pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);

            if (analysisResults) {
                pdf.addPage();
                pdf.setFontSize(22);
                pdf.text("Architecture Risk Report", 20, 40);

                pdf.setFontSize(14);
                pdf.text(`Overall Risk Score: ${analysisResults.overallRisk?.riskScore || 0}`, 20, 70);

                if (analysisResults.suggestions?.length > 0) {
                    pdf.text("Key Recommendations:", 20, 100);
                    pdf.setFontSize(12);
                    let y = 120;
                    analysisResults.suggestions.forEach(s => {
                        const splitText = pdf.splitTextToSize(`• ${s}`, pdfWidth - 40);
                        pdf.text(splitText, 30, y);
                        y += (splitText.length * 15) + 5;
                    });
                }

                if (analysisResults.aiAdvice?.suggestions?.length > 0) {
                    pdf.addPage();
                    pdf.setFontSize(18);
                    pdf.text("AI Architect Suggestions", 20, 40);
                    let y = 70;
                    pdf.setFontSize(12);

                    analysisResults.aiAdvice.suggestions.forEach(s => {
                        pdf.setFont("helvetica", "bold");
                        pdf.text(`${s.title} (${s.severity})`, 20, y);
                        y += 15;
                        pdf.setFont("helvetica", "normal");

                        const problem = pdf.splitTextToSize(`Problem: ${s.problem}`, pdfWidth - 40);
                        pdf.text(problem, 20, y);
                        y += (problem.length * 14) + 5;

                        const solution = pdf.splitTextToSize(`Solution: ${s.solution}`, pdfWidth - 40);
                        pdf.text(solution, 20, y);
                        y += (solution.length * 14) + 15;

                        if (y > pdfHeight - 40) {
                            pdf.addPage();
                            y = 40;
                        }
                    });
                }
            }

            pdf.save("architecture_report.pdf");
            setToast({ message: "Report downloaded!", type: "success" });
        } catch (e) {
            console.error("PDF generation failed:", e);
            setToast({ message: "Failed to generate report", type: "error" });
        }
    }, [analysisResults]);

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg-primary)", transition: "background 0.3s ease" }}>
            <Toolbar
                onAddService={handleAddService}
                onSave={handleSave}
                onLoad={handleLoad}
                onDownloadReport={downloadReport}
                onAnalyze={handleAnalyze}
                onClear={handleClearCanvas}
                isAnalyzing={isAnalyzing}
                nodeCount={nodes.length}
                analysisResults={analysisResults}
            />
            {error && (
                <div style={{ padding: "12px 24px", background: "var(--status-danger-bg)", borderBottom: "1px solid rgba(239,68,68,0.3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--status-danger)", fontSize: "13px" }}>⚠️ {error}</span>
                    <button onClick={() => setError(null)} style={{ background: "none", border: "none", color: "var(--status-danger)", cursor: "pointer", fontSize: "18px" }}>×</button>
                </div>
            )}

            <div id="report-container" style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
                <ComponentPalette />
                <Canvas
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onEdgeClick={onEdgeClick}
                    onPaneClick={onPaneClick}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                />
                <div style={{ display: "flex", position: "relative" }}>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                        style={{
                            position: "absolute",
                            left: "-24px",
                            top: "16px",
                            width: "24px",
                            height: "32px",
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border-subtle)",
                            borderRight: "none",
                            borderRadius: "6px 0 0 6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "var(--text-secondary)",
                            zIndex: 50,
                            transition: "all 0.2s ease",
                        }}
                    >
                        {isSidebarOpen ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                        )}
                    </button>
                    {/* Sidebar */}
                    <div style={{
                        width: isSidebarOpen ? "340px" : "0px",
                        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        overflow: "hidden",
                        background: "var(--bg-secondary)",
                        borderLeft: "1px solid var(--border-subtle)",
                    }}>
                        <div style={{ width: "340px", height: "100%" }}>
                            <Sidebar
                                isOpen={isSidebarOpen}
                                selectedNode={selectedNode}
                                selectedEdge={selectedEdge}
                                analysisResults={analysisResults}
                                onUpdateNode={handleUpdateNode}
                                onUpdateEdge={handleUpdateEdge}
                                onDeleteNode={handleDeleteNode}
                                onDeleteEdge={handleDeleteEdge}
                                onStressTest={handleStressTest}
                                onCascadeSimulation={handleCascadeSimulation}
                                activeSimulation={activeSimulation}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
