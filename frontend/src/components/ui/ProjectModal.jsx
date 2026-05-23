import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const SaveProjectModal = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState("");

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', width: '400px', border: '1px solid var(--border-subtle)', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text-primary)' }}>Save Project</h2>
                <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Enter project name..."
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-primary)', marginBottom: '16px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={() => { onSave(name); setName(""); }} disabled={!name} style={{ padding: '8px 16px', background: 'var(--accent-primary)', border: 'none', color: '#fff', borderRadius: '6px', cursor: name ? 'pointer' : 'not-allowed', opacity: name ? 1 : 0.5 }}>Save</button>
                </div>
            </div>
        </div>
    );
};

import { useAuth } from '@clerk/nextjs';

export const LoadProjectModal = ({ isOpen, onClose, onLoad }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getToken } = useAuth();

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            getToken().then(token => {
                axios.get(`${API_BASE_URL}/api/projects`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                .then(res => setProjects(res.data.projects || []))
                .catch(err => console.error("Failed to load projects", err))
                .finally(() => setLoading(false));
            });
        }
    }, [isOpen, getToken]);

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', width: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-subtle)', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text-primary)' }}>Load Project</h2>
                
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading projects...</div>
                    ) : projects.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No saved projects found.</div>
                    ) : (
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                            {projects.map(p => (
                                <li key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                    <button 
                                        onClick={() => onLoad(p.id)}
                                        style={{ width: '100%', padding: '12px 16px', textAlign: 'left', background: 'transparent', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                        onMouseOver={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{p.name}</span>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                </div>
            </div>
        </div>
    );
};
