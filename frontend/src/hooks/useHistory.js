"use client";

import { useState, useCallback, useRef } from "react";

const MAX_HISTORY = 50;

export function useHistory(initialNodes, initialEdges) {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);

    const historyRef = useRef([{ nodes: initialNodes, edges: initialEdges }]);
    const indexRef = useRef(0);
    const isUndoRedoRef = useRef(false);
    const saveState = useCallback((newNodes, newEdges) => {
        if (isUndoRedoRef.current) {
            isUndoRedoRef.current = false;
            return;
        }

        const currentIndex = indexRef.current;
        const newHistory = historyRef.current.slice(0, currentIndex + 1);

        newHistory.push({ nodes: newNodes, edges: newEdges });

        if (newHistory.length > MAX_HISTORY) {
            newHistory.shift();
        } else {
            indexRef.current = newHistory.length - 1;
        }

        historyRef.current = newHistory;
    }, []);

    // Undo action
    const undo = useCallback(() => {
        const currentIndex = indexRef.current;
        if (currentIndex > 0) {
            isUndoRedoRef.current = true;
            indexRef.current = currentIndex - 1;
            const prevState = historyRef.current[indexRef.current];
            setNodes(prevState.nodes);
            setEdges(prevState.edges);
            return true;
        }
        return false;
    }, []);

    // Redo action
    const redo = useCallback(() => {
        const currentIndex = indexRef.current;
        const historyLength = historyRef.current.length;
        if (currentIndex < historyLength - 1) {
            isUndoRedoRef.current = true;
            indexRef.current = currentIndex + 1;
            const nextState = historyRef.current[indexRef.current];
            setNodes(nextState.nodes);
            setEdges(nextState.edges);
            return true;
        }
        return false;
    }, []);
    const setNodesWithHistory = useCallback((updater) => {
        setNodes((prevNodes) => {
            const newNodes = typeof updater === "function" ? updater(prevNodes) : updater;
            setTimeout(() => saveState(newNodes, edges), 0);
            return newNodes;
        });
    }, [edges, saveState]);
    const setEdgesWithHistory = useCallback((updater) => {
        setEdges((prevEdges) => {
            const newEdges = typeof updater === "function" ? updater(prevEdges) : updater;
            setTimeout(() => saveState(nodes, newEdges), 0);
            return newEdges;
        });
    }, [nodes, saveState]);

    const canUndo = indexRef.current > 0;
    const canRedo = indexRef.current < historyRef.current.length - 1;

    return {
        nodes,
        edges,
        setNodes: setNodesWithHistory,
        setEdges: setEdgesWithHistory,
        undo,
        redo,
        canUndo,
        canRedo,
    };
}
