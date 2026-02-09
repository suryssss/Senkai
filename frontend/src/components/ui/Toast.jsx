"use client";

import { useEffect, useState } from "react";

const Toast = ({ message, type = "success", onClose, duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        setIsVisible(true);

        // Auto-close timer
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for exit animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const isSuccess = type === "success";
    const bg = isSuccess ? "var(--status-safe)" : "var(--status-danger)";
    const icon = isSuccess ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
    ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
    );

    return (
        <div
            style={{
                position: "fixed",
                bottom: "24px",
                right: "24px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 16px",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 1000,
                transform: isVisible ? "translateY(0)" : "translateY(20px)",
                opacity: isVisible ? 1 : 0,
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                pointerEvents: "none", // Avoid blocking clicks while fading out
            }}
        >
            <div
                style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: bg,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                {icon}
            </div>
            <span style={{ fontSize: "13px", fontWeight: "500" }}>{message}</span>
        </div>
    );
};

export default Toast;
