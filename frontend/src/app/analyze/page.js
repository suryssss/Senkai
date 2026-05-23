"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useNodesState, useEdgesState, addEdge } from "@xyflow/react";
import axios from "axios";

import Toolbar from "@/components/canvas/Toolbar";
import Canvas from "@/components/canvas/Canvas";
import Sidebar from "@/components/canvas/Sidebar";
import ComponentPalette from "@/components/canvas/ComponentPalette";
import Toast from "@/components/ui/Toast";
import { useTheme } from "@/context/ThemeContext";
import { SaveProjectModal, LoadProjectModal } from "@/components/ui/ProjectModal";
import { useAuth } from "@clerk/nextjs";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const initialNodes = [
    { id: "cdn-edge", type: "serviceNode", position: { x: -50, y: 250 }, data: { label: "CDN / WAF", type: "cdn", capacity: 50000, load: 1200 } },
    { id: "load-balancer", type: "serviceNode", position: { x: 220, y: 250 }, data: { label: "Nginx Load Balancer", type: "loadbalancer", capacity: 10000, load: 1200 } },
    { id: "api-gateway", type: "serviceNode", position: { x: 500, y: 250 }, data: { label: "API Gateway", type: "api", capacity: 5000, load: 1200 } },
    { id: "auth-service", type: "serviceNode", position: { x: 800, y: 50 }, data: { label: "Auth Mesh", type: "auth", capacity: 2000, load: 450 } },
    { id: "user-service", type: "serviceNode", position: { x: 800, y: 180 }, data: { label: "User Service", type: "service", capacity: 1500, load: 380 } },
    { id: "order-service", type: "serviceNode", position: { x: 800, y: 320 }, data: { label: "Order Service", type: "service", capacity: 1200, load: 240 } },
    { id: "search-service", type: "serviceNode", position: { x: 800, y: 460 }, data: { label: "Search Service", type: "service", capacity: 2500, load: 120 } },
    { id: "redis-cluster", type: "serviceNode", position: { x: 1100, y: 50 }, data: { label: "Redis Cluster", type: "cache", capacity: 20000, load: 1500 } },
    { id: "postgres-primary", type: "serviceNode", position: { x: 1100, y: 200 }, data: { label: "PostgreSQL Primary", type: "database", capacity: 2000, load: 850 } },
    { id: "elasticsearch", type: "serviceNode", position: { x: 1100, y: 460 }, data: { label: "ElasticSearch", type: "database", capacity: 5000, load: 300 } },
    { id: "kafka-bus", type: "serviceNode", position: { x: 1100, y: 330 }, data: { label: "Kafka Event Bus", type: "queue", capacity: 15000, load: 800 } },
    { id: "inventory-worker", type: "serviceNode", position: { x: 1400, y: 330 }, data: { label: "Inventory Worker", type: "worker", capacity: 1000, load: 150 } },
];

const initialEdges = [
    { id: "e-cdn-lb", source: "cdn-edge", target: "load-balancer", data: { latency: 45, percentage: 100 } },
    { id: "e-lb-gtw", source: "load-balancer", target: "api-gateway", data: { latency: 5, percentage: 100 } },
    { id: "e-gtw-auth", source: "api-gateway", target: "auth-service", data: { latency: 12, percentage: 100 } },
    { id: "e-gtw-user", source: "api-gateway", target: "user-service", data: { latency: 15, percentage: 60 } },
    { id: "e-gtw-order", source: "api-gateway", target: "order-service", data: { latency: 20, percentage: 30 } },
    { id: "e-gtw-search", source: "api-gateway", target: "search-service", data: { latency: 50, percentage: 10 } },
    { id: "e-auth-redis", source: "auth-service", target: "redis-cluster", data: { latency: 2, percentage: 100 } },
    { id: "e-user-db", source: "user-service", target: "postgres-primary", data: { latency: 25, percentage: 100 } },
    { id: "e-order-db", source: "order-service", target: "postgres-primary", data: { latency: 30, percentage: 100 } },
    { id: "e-order-kafka", source: "order-service", target: "kafka-bus", data: { latency: 5, percentage: 100 } },
    { id: "e-search-es", source: "search-service", target: "elasticsearch", data: { latency: 40, percentage: 100 } },
    { id: "e-kafka-worker", source: "kafka-bus", target: "inventory-worker", data: { latency: 2, percentage: 100 } },
];

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: { "Content-Type": "application/json" },
});

export default function AnalyzePage() {
    const { theme } = useTheme();
    const { getToken, isSignedIn } = useAuth();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        const savedNodes = localStorage.getItem("structflow_nodes");
        const savedEdges = localStorage.getItem("structflow_edges");

        if (savedNodes && savedEdges) {
            try {
                setNodes(JSON.parse(savedNodes));
                setEdges(JSON.parse(savedEdges));
                return;
            } catch (e) {
                console.error("Failed to load saved state:", e);
            }
        }

        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [setNodes, setEdges]);

    useEffect(() => {
        if (nodes.length > 0) {
            localStorage.setItem("structflow_nodes", JSON.stringify(nodes));
        }
        if (edges.length > 0) {
            localStorage.setItem("structflow_edges", JSON.stringify(edges));
        }
    }, [nodes, edges]);

    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedEdge, setSelectedEdge] = useState(null);
    const [analysisResults, setAnalysisResults] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [activeSimulation, setActiveSimulation] = useState(null);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [totalTraffic, setTotalTraffic] = useState(10000);
    const [entryNodeId, setEntryNodeId] = useState(initialNodes[0]?.id || "");
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
    const isAnalyzingRef = useRef(false);
    const historyRef = useRef([{ nodes: initialNodes, edges: initialEdges }]);
    const historyIndexRef = useRef(0);
    const isUndoRedoRef = useRef(false);

    const saveToHistory = useCallback((newNodes, newEdges) => {
        if (isUndoRedoRef.current) {
            isUndoRedoRef.current = false;
            return;
        }
        const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
        newHistory.push({ nodes: JSON.parse(JSON.stringify(newNodes)), edges: JSON.parse(JSON.stringify(newEdges)) });
        if (newHistory.length > 50) newHistory.shift();
        historyRef.current = newHistory;
        historyIndexRef.current = newHistory.length - 1;
    }, []);

    const handleUndo = useCallback(() => {
        if (historyIndexRef.current > 0) {
            isUndoRedoRef.current = true;
            historyIndexRef.current -= 1;
            const prevState = historyRef.current[historyIndexRef.current];
            setNodes(prevState.nodes);
            setEdges(prevState.edges);
            setToast({ message: "Undo", type: "info" });
        }
    }, [setNodes, setEdges]);

    const handleRedo = useCallback(() => {
        if (historyIndexRef.current < historyRef.current.length - 1) {
            isUndoRedoRef.current = true;
            historyIndexRef.current += 1;
            const nextState = historyRef.current[historyIndexRef.current];
            setNodes(nextState.nodes);
            setEdges(nextState.edges);
            setToast({ message: "Redo", type: "info" });
        }
    }, [setNodes, setEdges]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                handleUndo();
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                handleRedo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo]);

    const saveTimeoutRef = useRef(null);
    useEffect(() => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            if (!isUndoRedoRef.current) {
                saveToHistory(nodes, edges);
            }
        }, 300);
        return () => clearTimeout(saveTimeoutRef.current);
    }, [nodes, edges, saveToHistory]);

    const onConnect = useCallback((params) => {
        const newEdge = {
            ...params,
            id: `e-${params.source}-${params.target}-${Date.now()}`,
            data: { latency: 10, percentage: 100 },
        };
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
        if (!isSignedIn) {
            setToast({ message: "Please sign in to save your architecture.", type: "error" });
            return;
        }
        setIsSaveModalOpen(true);
    }, [isSignedIn]);

    const handleSaveSubmit = useCallback(async (name) => {
        try {
            const data = { nodes, edges };
            const payload = {
                name,
                data,
                analysisData: analysisResults,
                aiInsights: analysisResults?.aiAdvice
            };
            const token = await getToken();
            await api.post("/api/projects", payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setToast({ message: "Project saved successfully to database!", type: "success" });
            setIsSaveModalOpen(false);
        } catch (e) {
            console.error("Save failed:", e);
            setToast({ message: "Failed to save project.", type: "error" });
        }
    }, [nodes, edges, analysisResults, getToken]);

    const handleLoad = useCallback(() => {
        if (!isSignedIn) {
            setToast({ message: "Please sign in to load your architectures.", type: "error" });
            return;
        }
        setIsLoadModalOpen(true);
    }, [isSignedIn]);

    const handleLoadSubmit = useCallback(async (id) => {
        try {
            const token = await getToken();
            const res = await api.get(`/api/projects/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const project = res.data.project;
            if (!project) throw new Error("Not found");
            const parsedData = typeof project.data === 'string' ? JSON.parse(project.data) : project.data;
            const { nodes: loadedNodes, edges: loadedEdges } = parsedData;
            setNodes(loadedNodes || []);
            setEdges(loadedEdges || []);
            
            let loadedAnalysis = null;
            if (project.analysisData) {
                loadedAnalysis = typeof project.analysisData === 'string' ? JSON.parse(project.analysisData) : project.analysisData;
            }
            setAnalysisResults(loadedAnalysis);
            clearSimulationState();
            setToast({ message: `Loaded project "${project.name}"!`, type: "success" });
            setIsLoadModalOpen(false);
        } catch (e) {
            console.error("Load failed:", e);
            setToast({ message: "Failed to load project.", type: "error" });
        }
    }, [setNodes, setEdges, clearSimulationState, getToken]);

    useEffect(() => {
        if (typeof window !== "undefined" && isSignedIn) {
            const params = new URLSearchParams(window.location.search);
            const loadId = params.get("load");
            if (loadId) {
                handleLoadSubmit(loadId);
            }
        }
    }, [isSignedIn, handleLoadSubmit]);

    const handleAnalyze = useCallback(async () => {
        if (nodes.length === 0 || isAnalyzingRef.current) return;
        isAnalyzingRef.current = true;
        setIsAnalyzing(true);
        setError(null);
        clearSimulationState();

        try {
            const trafficPayload = {
                total_traffic: Number(totalTraffic) || 0,
                entry_node: entryNodeId || nodes[0]?.id,
                nodes: nodes.map((n) => ({
                    id: n.id,
                    type: n.data.type,
                    capacity: Number(n.data.capacity) || 0,
                })),
                edges: edges.map((e) => ({
                    from: e.source,
                    to: e.target,
                    percentage: Number(e.data?.percentage) || 0,
                })),
            };

            const trafficResponse = await api.post("/api/traffic", trafficPayload);
            if (!trafficResponse.data?.success) {
                throw new Error(trafficResponse.data?.message || "Traffic simulation failed");
            }

            const { node_results: nodeResults } = trafficResponse.data;
            const nodesWithTraffic = nodes.map((node) => {
                const summary = nodeResults?.find((r) => r.id === node.id);
                const load = Number(summary?.incoming_traffic) || 0;
                const utilizationPercent = Number.isFinite(summary?.utilization)
                    ? Number((summary.utilization * 100).toFixed(1))
                    : null;

                return {
                    ...node,
                    data: {
                        ...node.data,
                        load,
                        trafficStatus: summary?.status || null,
                        trafficUtilization: utilizationPercent,
                    },
                };
            });

            setNodes(nodesWithTraffic);
            const analyzePayload = {
                entryNodeId: entryNodeId || nodes[0]?.id,
                nodes: nodesWithTraffic.map((n) => ({
                    id: n.id,
                    capacity: Number(n.data.capacity) || 0,
                    load: Number(n.data.load) || 0,
                })),
                edges: edges.map((e) => ({
                    source: e.source,
                    target: e.target,
                    latency: Number(e.data?.latency) || 10,
                })),
            };

            const response = await api.post("/api/analyze", analyzePayload);
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
    }, [nodes, edges, totalTraffic, entryNodeId, setNodes, clearSimulationState]);

    const handleStressTest = useCallback(async () => {
        if (nodes.length === 0 || activeSimulation) return;
        setActiveSimulation("stress");
        clearSimulationState();

        try {
            const trafficSteps = [
                { t: 0, total_traffic: Math.max(1000, (Number(totalTraffic) || 0) * 0.1) },
                { t: 5, total_traffic: Math.max(5000, (Number(totalTraffic) || 0) * 0.5) },
                { t: 10, total_traffic: Math.max(20000, (Number(totalTraffic) || 0) * 2.0) },
                { t: 15, total_traffic: Math.max(50000, (Number(totalTraffic) || 0) * 5.0) },
            ];

            const timelinePayload = {
                entry_node: entryNodeId || nodes[0]?.id,
                nodes: nodes.map((n) => ({
                    id: n.id,
                    capacity: Number(n.data.capacity) || 0,
                    base_latency: 50,
                })),
                edges: edges.map((e) => ({
                    from: e.source,
                    to: e.target,
                    percentage: Number(e.data?.percentage) || 0,
                })),
                traffic_steps: trafficSteps,
                timeout_ms: 2000,
                retry_rate: 1.0,
                failure_rate: 0.3,
            };

            const res = await api.post("/api/traffic/timeline", timelinePayload);
            if (!res.data?.success) {
                throw new Error(res.data?.message || "Stress test simulation failed");
            }

            const { steps, first_failure } = res.data;
            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                await new Promise((r) => setTimeout(r, i === 0 ? 300 : 1200));

                setNodes((nds) =>
                    nds.map((node) => {
                        const summary = step.node_results.find((n) => n.id === node.id);
                        const simulatedLoad = summary?.incoming_traffic ?? node.data.load;
                        const util = (simulatedLoad / (node.data.capacity || 1)) * 100;
                        let status = "safe";
                        if (util >= 120 || summary?.status === "critical") status = "crashed";
                        else if (util >= 85 || summary?.status === "overloaded") status = "danger";
                        else if (util >= 60 || summary?.status === "warning") status = "warning";

                        return {
                            ...node,
                            data: {
                                ...node.data,
                                simulatedLoad,
                                simulationStatus: status,
                                simulationDuration: 8000,
                            },
                        };
                    })
                );
            }

            if (first_failure) {
                setToast({
                    message: `First failure: ${first_failure.node_id} at ~${first_failure.at_traffic} req/s (${first_failure.reason})`,
                    type: "error",
                });
            }
        } catch (err) {
            console.error("Stress test failed:", err);
            setToast({
                message: err.response?.data?.message || err.message || "Stress test failed",
                type: "error",
            });
        } finally {
            setTimeout(() => {
                clearSimulationState();
                setActiveSimulation(null);
            }, 4000);
        }
    }, [nodes, edges, totalTraffic, entryNodeId, activeSimulation, setNodes, clearSimulationState]);

    const handleDESSimulation = useCallback(async () => {
        if (nodes.length === 0 || activeSimulation) return;
        setActiveSimulation('cascade');
        clearSimulationState();

        try {
            const entryCap = nodes.find(n => n.id === (entryNodeId || nodes[0]?.id))?.data?.capacity || 5000;

            const trafficWave = [
                { t: 0, arrivals: Math.round(entryCap * 0.5) },
                { t: 1000, arrivals: Math.round(entryCap * 1.0) },
                { t: 2000, arrivals: Math.round(entryCap * 2.0) },
                { t: 3000, arrivals: Math.round(entryCap * 5.0) },
                { t: 4000, arrivals: Math.round(entryCap * 10.0) },
            ];

            const desPayload = {
                entry_node: entryNodeId || nodes[0]?.id,
                nodes: nodes.map((n) => ({
                    id: n.id,
                    capacity: Number(n.data.capacity) || 0,
                    base_latency: 50,
                    max_queue: Number(n.data.capacity) * 2 || 200,
                    cb_failure_rate: 0.5,
                })),
                edges: edges.map((e) => ({
                    source: e.source,
                    target: e.target,
                    percentage: Number(e.data?.percentage) || 0,
                })),
                traffic_wave: trafficWave,
                tick_ms: 1000,
                max_sim_ms: 6000,
                retry_attempts: 2,
            };

            const res = await api.post("/api/traffic/des", desPayload);
            if (!res.data?.success) {
                throw new Error(res.data?.error || "DES simulation failed");
            }

            const { timeline, firstFailure, cascadeEvents, trafficMultiplier, peakDesiredRps } = res.data;

            for (let i = 0; i < timeline.length; i++) {
                const tick = timeline[i];
                await new Promise((r) => setTimeout(r, 1000));

                setNodes((nds) =>
                    nds.map((node) => {
                        const summary = tick.services.find((n) => n.id === node.id);
                        if (!summary) return node;

                        let status = "safe";
                        if (summary.health === "critical" || summary.health === "tripped") status = "crashed";
                        else if (summary.health === "degraded") status = "danger";
                        else if (summary.utilization >= 85) status = "warning";

                        return {
                            ...node,
                            data: {
                                ...node.data,
                                simulatedLoad: summary.inFlight,
                                simulatedQueue: summary.queueDepth,
                                simulatedLatency: summary.avgLatencyMs,
                                simulationStatus: status,
                                simulationDuration: 8000,
                                isWeakest: firstFailure?.nodeId === node.id,
                                isCascadeAffected: cascadeEvents.some(e => e.nodeId === node.id),
                            },
                        };
                    })
                );
            }

            const multiplierLabel = trafficMultiplier > 1
                ? ` (1 sim-event = ${Math.round(trafficMultiplier).toLocaleString()} real req)`
                : "";
            const peakLabel = peakDesiredRps
                ? `Peak: ${peakDesiredRps.toLocaleString()} RPS${multiplierLabel}. `
                : "";

            if (firstFailure) {
                setToast({
                    message: `${peakLabel}First failure: ${firstFailure.nodeId} (${firstFailure.reason.toLowerCase()})`,
                    type: "error",
                });
            } else {
                setToast({
                    message: `${peakLabel}System survived the traffic spike!`,
                    type: "success",
                });
            }

        } catch (err) {
            console.error("DES simulation failed:", err);
            setToast({
                message: err.message || "Simulation failed",
                type: "error",
            });
        } finally {
            setTimeout(() => {
                clearSimulationState();
                setActiveSimulation(null);
            }, 5000);
        }
    }, [nodes, edges, totalTraffic, entryNodeId, activeSimulation, setNodes, clearSimulationState]);

    const handleUpdateNode = useCallback((nodeId, updates) => {
        setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...updates } } : n));
        setSelectedNode((prev) => prev?.id === nodeId ? { ...prev, data: { ...prev.data, ...updates } } : prev);
    }, [setNodes]);

    const handleUpdateEdge = useCallback((edgeId, updates) => {
        setEdges((eds) =>
            eds.map((e) =>
                e.id === edgeId ? { ...e, data: { ...e.data, ...updates } } : e
            )
        );
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
        <div className="analyze-page" style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg-primary)", transition: "background 0.3s ease" }}>
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
                totalTraffic={totalTraffic}
                onTotalTrafficChange={setTotalTraffic}
                entryNodeId={entryNodeId}
                onEntryNodeChange={setEntryNodeId}
                nodes={nodes}
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
                                onCascadeSimulation={handleDESSimulation}
                                activeSimulation={activeSimulation}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <SaveProjectModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} onSave={handleSaveSubmit} />
            <LoadProjectModal isOpen={isLoadModalOpen} onClose={() => setIsLoadModalOpen(false)} onLoad={handleLoadSubmit} />
        </div>
    );
}
