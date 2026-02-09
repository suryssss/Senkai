"use client";

import React, { useCallback } from 'react';
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
    Controls,
    Background,
    Handle,
    Position,
    MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
const CustomNode = ({ data }) => {
    return (
        <div style={{
            padding: '16px 24px',
            borderRadius: '12px',
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '160px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#171717',
        }}>
            <Handle type="target" position={Position.Top} style={{ background: '#a3a3a3', width: '8px', height: '8px' }} />
            <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: data.color || '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: data.iconColor || '#4b5563',
            }}>
                {data.icon}
            </div>
            <div>
                <div style={{ lineHeight: '1.2' }}>{data.label}</div>
                <div style={{ fontSize: '11px', color: '#737373', fontWeight: '400' }}>{data.subLabel}</div>
            </div>
            <Handle type="source" position={Position.Bottom} style={{ background: '#a3a3a3', width: '8px', height: '8px' }} />
        </div>
    );
};

const nodeTypes = {
    custom: CustomNode,
};

const initialNodes = [
    {
        id: '1',
        type: 'custom',
        position: { x: 100, y: 0 },
        data: {
            label: 'Client App',
            subLabel: 'Request initiated',
            color: '#eff6ff',
            iconColor: '#3b82f6',
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
            ),
        },
    },
    {
        id: '2',
        type: 'custom',
        position: { x: 0, y: 150 },
        data: {
            label: 'API Gateway',
            subLabel: 'Processing...',
            color: '#f5f3ff',
            iconColor: '#8b5cf6',
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
            ),
        },
    },
    {
        id: '3',
        type: 'custom',
        position: { x: 200, y: 150 },
        data: {
            label: 'Auth Service',
            subLabel: 'Verifying token',
            color: '#ecfdf5',
            iconColor: '#10b981',
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
            ),
        },
    },
    {
        id: '4',
        type: 'custom',
        position: { x: 100, y: 300 },
        data: {
            label: 'Database',
            subLabel: 'Store data',
            color: '#fffbeb',
            iconColor: '#f59e0b',
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                </svg>
            ),
        },
    },
];

const initialEdges = [
    {
        id: 'e1-2',
        source: '1',
        target: '2',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
    },
    {
        id: 'e1-3',
        source: '1',
        target: '3',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
    },
    {
        id: 'e2-4',
        source: '2',
        target: '4',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
    },
    {
        id: 'e3-4',
        source: '3',
        target: '4',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
    },
];

export default function HeroFlow() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } }, eds)),
        [setEdges],
    );

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                proOptions={{ hideAttribution: true }}
                attributionPosition="bottom-right"
                zoomOnScroll={false}
                zoomOnPinch={false}
                panOnDrag={false}
                preventScrolling={false}
            >
                <Background color="#e5e5e5" gap={20} size={1} />
            </ReactFlow>
        </div>
    );
}
