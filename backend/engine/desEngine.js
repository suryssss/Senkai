"use strict";

class MinHeap {
    constructor() { this._data = []; }
    get size() { return this._data.length; }

    push(item) {
        this._data.push(item);
        this._bubbleUp(this._data.length - 1);
    }

    pop() {
        if (this._data.length === 0) return null;
        const top = this._data[0];
        const last = this._data.pop();
        if (this._data.length > 0) {
            this._data[0] = last;
            this._siftDown(0);
        }
        return top;
    }

    _bubbleUp(i) {
        while (i > 0) {
            const p = (i - 1) >> 1;
            if (this._data[p].time <= this._data[i].time) break;
            [this._data[p], this._data[i]] = [this._data[i], this._data[p]];
            i = p;
        }
    }

    _siftDown(i) {
        const n = this._data.length;
        while (true) {
            let s = i;
            const l = 2 * i + 1, r = 2 * i + 2;
            if (l < n && this._data[l].time < this._data[s].time) s = l;
            if (r < n && this._data[r].time < this._data[s].time) s = r;
            if (s === i) break;
            [this._data[s], this._data[i]] = [this._data[i], this._data[s]];
            i = s;
        }
    }
}

const HEALTH = Object.freeze({
    HEALTHY: "healthy",
    DEGRADED: "degraded",
    CRITICAL: "critical",
    TRIPPED: "tripped",
});

const MAX_EVENTS_PER_TICK = 500;

function buildServiceStates(nodes) {
    const map = new Map();
    for (const node of nodes) {
        const capacity = Math.max(1, Number(node.capacity) || 100);
        const maxQueue = Math.max(0, Number(node.max_queue) || capacity * 2);
        const baseLatency = Math.max(0, Number(node.base_latency) || 10);
        const timeoutMs = Math.max(1, Number(node.timeout_ms) || 2000);

        map.set(node.id, {
            id: node.id,
            capacity,
            maxQueue,
            baseLatency,
            timeoutMs,
            inFlight: 0,
            queueDepth: 0,
            totalServed: 0,
            totalDropped: 0,
            totalTimeout: 0,
            totalRetried: 0,
            health: HEALTH.HEALTHY,
            failureWindow: [],
            cbFailureThreshold: Number(node.cb_failure_rate) || 0.5,
            cbWindowMs: Number(node.cb_window_ms) || 5000,
            cbResetAfterMs: Number(node.cb_reset_ms) || 10000,
            latencySamples: [],
            peakInFlight: 0,
            peakQueueDepth: 0,
            peakRealRps: 0,
        });
    }
    return map;
}

function buildAdjacency(nodes, edges) {
    const adj = new Map();
    for (const n of nodes) adj.set(n.id, []);
    for (const edge of edges) {
        const from = edge.source ?? edge.from;
        const to = edge.target ?? edge.to;
        if (!from || !to) continue;
        const weight = Math.max(0, Number(edge.percentage ?? edge.data?.percentage) || 0);
        if (!adj.has(from)) adj.set(from, []);
        adj.get(from).push({ to, weight });
    }
    return adj;
}

function normaliseWeights(adj) {
    for (const [, neighbours] of adj) {
        const total = neighbours.reduce((s, n) => s + n.weight, 0);
        if (total > 0) for (const nb of neighbours) nb.weight = (nb.weight / total) * 100;
    }
}

function computeHealth(state) {
    if (state.health === HEALTH.TRIPPED) return HEALTH.TRIPPED;
    const util = state.inFlight / state.capacity;
    const queueRatio = state.queueDepth / Math.max(1, state.maxQueue);
    if (util >= 1.2 || queueRatio >= 1.0) return HEALTH.CRITICAL;
    if (util >= 0.8 || queueRatio >= 0.5) return HEALTH.DEGRADED;
    return HEALTH.HEALTHY;
}

function rollingFailureRate(state, now) {
    const cutoff = now - state.cbWindowMs;
    state.failureWindow = state.failureWindow.filter(t => t >= cutoff);
    const recentFailed = state.failureWindow.length;
    const recentTotal = state.totalServed + recentFailed;
    return recentTotal === 0 ? 0 : recentFailed / recentTotal;
}

function snapshotServices(t, states, multiplier) {
    const services = [];
    for (const [id, state] of states) {
        const util = state.capacity > 0 ? state.inFlight / state.capacity : 0;
        const avgLatency = state.latencySamples.length > 0
            ? state.latencySamples.reduce((a, b) => a + b, 0) / state.latencySamples.length
            : 0;

        const realInFlight = Math.round(state.inFlight * multiplier);
        const realQueue = Math.round(state.queueDepth * multiplier);
        const realDropped = Math.round(state.totalDropped * multiplier);
        const realServed = Math.round(state.totalServed * multiplier);
        const realTimeout = Math.round(state.totalTimeout * multiplier);

        state.peakInFlight = Math.max(state.peakInFlight, realInFlight);
        state.peakQueueDepth = Math.max(state.peakQueueDepth, realQueue);

        services.push({
            id,
            health: state.health,
            inFlight: realInFlight,
            queueDepth: realQueue,
            capacity: state.capacity,
            utilization: parseFloat((util * 100).toFixed(1)),
            avgLatencyMs: parseFloat(avgLatency.toFixed(2)),
            totalServed: realServed,
            totalDropped: realDropped,
            totalTimeout: realTimeout,
            totalRetried: Math.round(state.totalRetried * multiplier),
            peakInFlight: state.peakInFlight,
            peakQueueDepth: state.peakQueueDepth,
        });

        state.latencySamples = [];
    }
    return { t, services };
}

function buildResult(timeline, eventLog, serviceStates, finalSimTime, multiplier, peakDesiredRps) {
    let totalServed = 0, totalDropped = 0, totalTimeout = 0, totalRetried = 0;
    const serviceSummaries = [];

    for (const [id, state] of serviceStates) {
        const realServed = Math.round(state.totalServed * multiplier);
        const realDropped = Math.round(state.totalDropped * multiplier);
        const realTimeout = Math.round(state.totalTimeout * multiplier);
        const realRetried = Math.round(state.totalRetried * multiplier);

        totalServed += realServed;
        totalDropped += realDropped;
        totalTimeout += realTimeout;
        totalRetried += realRetried;

        const util = state.capacity > 0 ? state.inFlight / state.capacity : 0;
        serviceSummaries.push({
            id,
            finalHealth: state.health,
            finalUtil: parseFloat((util * 100).toFixed(1)),
            totalServed: realServed,
            totalDropped: realDropped,
            totalTimeout: realTimeout,
            totalRetried: realRetried,
            peakInFlight: state.peakInFlight,
            peakQueueDepth: state.peakQueueDepth,
        });
    }

    const firstFailureEvent = eventLog.find(e => ["TIMEOUT", "DROP", "CB_TRIP"].includes(e.type)) || null;
    const cascadeEvents = eventLog.filter(e => e.type === "CB_TRIP");

    return {
        mode: "hybrid_bundle_des",
        trafficMultiplier: multiplier,
        peakDesiredRps,
        finalSimTimeMs: parseFloat(finalSimTime.toFixed(2)),
        timeline,
        eventLog,
        summary: {
            totalServed,
            totalDropped,
            totalTimeout,
            totalRetried,
            dropRate: totalServed + totalDropped > 0
                ? parseFloat(((totalDropped / (totalServed + totalDropped)) * 100).toFixed(2))
                : 0,
        },
        firstFailure: firstFailureEvent
            ? { time: firstFailureEvent.time, nodeId: firstFailureEvent.nodeId, reason: firstFailureEvent.type }
            : null,
        cascadeEvents,
        serviceSummaries,
    };
}

function runDES({
    nodes,
    edges,
    entryNode,
    trafficWave,
    tickMs = 1000,
    maxSimMs = 6000,
    retryAttempts = 2,
    retryDelayMs = 500,
}) {
    if (!Array.isArray(nodes) || nodes.length === 0) throw new Error("nodes must be a non-empty array");
    if (!Array.isArray(edges)) throw new Error("edges must be an array");
    if (!entryNode) throw new Error("entryNode is required");
    if (!Array.isArray(trafficWave) || trafficWave.length === 0) throw new Error("trafficWave must be a non-empty array");

    const nodeIds = new Set(nodes.map(n => n.id));
    if (!nodeIds.has(entryNode)) throw new Error(`entryNode '${entryNode}' not found in nodes`);

    const peakDesiredRps = Math.max(...trafficWave.map(s => Number(s.arrivals) || 0));
    const peakSimEvents = Math.min(peakDesiredRps, MAX_EVENTS_PER_TICK * trafficWave.length);
    const multiplier = peakDesiredRps > 0 ? peakDesiredRps / Math.max(1, peakSimEvents / trafficWave.length) : 1;

    const scaledNodes = nodes.map(n => ({
        ...n,
        capacity: Math.max(1, Math.round((Number(n.capacity) || 100) / multiplier)),
        max_queue: Math.max(1, Math.round(((Number(n.max_queue) || Number(n.capacity) * 2 || 200)) / multiplier)),
    }));

    const scaledWave = trafficWave.map(s => ({
        t: Math.max(0, Number(s.t) || 0),
        arrivals: Math.max(0, Math.round((Number(s.arrivals) || 0) / multiplier)),
    }));

    const serviceStates = buildServiceStates(scaledNodes);
    const adj = buildAdjacency(scaledNodes, edges);
    normaliseWeights(adj);

    const eventQueue = new MinHeap();
    let requestSeq = 0;

    const timeline = [];
    const eventLog = [];
    const MAX_LOG = 500;

    function logEvent(time, type, detail) {
        if (eventLog.length < MAX_LOG) eventLog.push({ time, type, ...detail });
    }

    for (const step of scaledWave) {
        const { t, arrivals } = step;
        if (t > maxSimMs) continue;
        for (let i = 0; i < arrivals; i++) {
            const jitter = arrivals > 1 ? (tickMs / arrivals) * i : 0;
            eventQueue.push({
                time: t + jitter,
                type: "ARRIVE",
                requestId: `req_${++requestSeq}`,
                nodeId: entryNode,
                retriesLeft: retryAttempts,
                startTime: t + jitter,
                hopLatency: 0,
                hopCount: 0,
            });
        }
    }

    const snapshotTimes = new Set(trafficWave.map(s => Number(s.t)));
    const sortedSnaps = Array.from(snapshotTimes).sort((a, b) => a - b);
    let simTime = 0;
    let nextSnapIdx = 0;

    while (eventQueue.size > 0) {
        const evt = eventQueue.pop();
        if (!evt) break;
        if (evt.time > maxSimMs) break;

        simTime = evt.time;

        while (nextSnapIdx < sortedSnaps.length && sortedSnaps[nextSnapIdx] <= simTime) {
            timeline.push(snapshotServices(sortedSnaps[nextSnapIdx], serviceStates, multiplier));
            nextSnapIdx++;
        }

        switch (evt.type) {
            case "ARRIVE": handleArrive(evt); break;
            case "DEPART": handleDepart(evt); break;
            case "TIMEOUT": handleTimeout(evt); break;
            case "CB_RESET": handleCbReset(evt); break;
        }
    }

    while (nextSnapIdx < sortedSnaps.length) {
        timeline.push(snapshotServices(sortedSnaps[nextSnapIdx], serviceStates, multiplier));
        nextSnapIdx++;
    }

    return buildResult(timeline, eventLog, serviceStates, simTime, multiplier, peakDesiredRps);

    function handleArrive(evt) {
        const state = serviceStates.get(evt.nodeId);
        if (!state) return;

        if (state.health === HEALTH.TRIPPED) {
            state.totalDropped++;
            logEvent(evt.time, "CB_REJECT", { requestId: evt.requestId, nodeId: evt.nodeId });
            if (evt.retriesLeft > 0) {
                state.totalRetried++;
                eventQueue.push({
                    ...evt,
                    time: evt.time + retryDelayMs + state.cbResetAfterMs * 0.5,
                    retriesLeft: evt.retriesLeft - 1,
                });
            }
            return;
        }

        if (state.queueDepth >= state.maxQueue) {
            state.totalDropped++;
            state.failureWindow.push(evt.time);
            logEvent(evt.time, "DROP", { requestId: evt.requestId, nodeId: evt.nodeId, reason: "queue_full" });
            checkCircuitBreaker(state, evt.time, evt.nodeId);
            return;
        }

        if (state.inFlight < state.capacity) {
            state.inFlight++;
            state.health = computeHealth(state);

            const util = state.inFlight / state.capacity;
            const congestionExtra = util >= 0.8 ? state.baseLatency * util * 1.5 : 0;
            const serviceTime = state.baseLatency + congestionExtra;
            const departTime = evt.time + serviceTime;

            if (serviceTime > state.timeoutMs) {
                eventQueue.push({
                    time: evt.time + state.timeoutMs,
                    type: "TIMEOUT",
                    requestId: evt.requestId,
                    nodeId: evt.nodeId,
                    startTime: evt.startTime,
                    retriesLeft: evt.retriesLeft,
                    hopLatency: evt.hopLatency,
                    hopCount: evt.hopCount,
                });
            } else {
                eventQueue.push({
                    time: departTime,
                    type: "DEPART",
                    requestId: evt.requestId,
                    nodeId: evt.nodeId,
                    startTime: evt.startTime,
                    hopLatency: evt.hopLatency + serviceTime,
                    retriesLeft: evt.retriesLeft,
                    hopCount: evt.hopCount,
                });
            }
        } else {
            state.queueDepth++;
            state.health = computeHealth(state);
            logEvent(evt.time, "QUEUED", {
                requestId: evt.requestId,
                nodeId: evt.nodeId,
                queueDepth: Math.round(state.queueDepth * multiplier),
            });

            const estimatedWaitMs = (state.queueDepth / state.capacity) * state.baseLatency;
            const serviceTime = state.baseLatency * 2.5;
            const totalWait = estimatedWaitMs + serviceTime;

            if (totalWait > state.timeoutMs) {
                eventQueue.push({
                    time: evt.time + state.timeoutMs,
                    type: "TIMEOUT",
                    requestId: evt.requestId,
                    nodeId: evt.nodeId,
                    startTime: evt.startTime,
                    retriesLeft: evt.retriesLeft,
                    hopLatency: evt.hopLatency,
                    hopCount: evt.hopCount,
                    fromQueue: true,
                });
            } else {
                eventQueue.push({
                    time: evt.time + totalWait,
                    type: "DEPART",
                    requestId: evt.requestId,
                    nodeId: evt.nodeId,
                    startTime: evt.startTime,
                    hopLatency: evt.hopLatency + totalWait,
                    retriesLeft: evt.retriesLeft,
                    hopCount: evt.hopCount,
                    fromQueue: true,
                });
            }
        }
    }

    function handleDepart(evt) {
        const state = serviceStates.get(evt.nodeId);
        if (!state) return;

        if (evt.fromQueue) state.queueDepth = Math.max(0, state.queueDepth - 1);
        else state.inFlight = Math.max(0, state.inFlight - 1);

        state.totalServed++;
        state.latencySamples.push(evt.hopLatency);
        state.health = computeHealth(state);

        const neighbours = adj.get(evt.nodeId) || [];
        for (const nb of neighbours) {
            if (!nb.weight || nb.weight <= 0) continue;

            const hopCount = (evt.hopCount || 0) + 1;
            if (hopCount > 50) {
                logEvent(evt.time, "DROP", { requestId: evt.requestId, nodeId: evt.nodeId, reason: "loop_guard" });
                continue;
            }

            const roll = Math.random() * 100;
            if (roll <= nb.weight) {
                eventQueue.push({
                    time: evt.time,
                    type: "ARRIVE",
                    requestId: evt.requestId,
                    nodeId: nb.to,
                    startTime: evt.startTime,
                    hopLatency: evt.hopLatency,
                    retriesLeft: evt.retriesLeft,
                    hopCount,
                });
            }
        }
    }

    function handleTimeout(evt) {
        const state = serviceStates.get(evt.nodeId);
        if (!state) return;

        state.totalTimeout++;
        state.failureWindow.push(evt.time);

        if (evt.fromQueue) state.queueDepth = Math.max(0, state.queueDepth - 1);
        else state.inFlight = Math.max(0, state.inFlight - 1);

        state.health = computeHealth(state);
        logEvent(evt.time, "TIMEOUT", { requestId: evt.requestId, nodeId: evt.nodeId });
        checkCircuitBreaker(state, evt.time, evt.nodeId);

        if (evt.retriesLeft > 0) {
            state.totalRetried++;
            eventQueue.push({
                ...evt,
                time: evt.time + retryDelayMs,
                type: "ARRIVE",
                retriesLeft: evt.retriesLeft - 1,
                fromQueue: false,
            });
        }
    }

    function handleCbReset(evt) {
        const state = serviceStates.get(evt.nodeId);
        if (!state) return;

        const rate = rollingFailureRate(state, evt.time);
        if (rate < state.cbFailureThreshold) {
            state.health = HEALTH.HEALTHY;
            logEvent(evt.time, "CB_RESET", { nodeId: evt.nodeId });
        } else {
            logEvent(evt.time, "CB_STILL_TRIPPED", { nodeId: evt.nodeId, failureRate: rate.toFixed(2) });
            eventQueue.push({
                time: evt.time + state.cbResetAfterMs,
                type: "CB_RESET",
                nodeId: evt.nodeId,
            });
        }
    }

    function checkCircuitBreaker(state, now, nodeId) {
        const rate = rollingFailureRate(state, now);
        if (rate >= state.cbFailureThreshold && state.health !== HEALTH.TRIPPED) {
            state.health = HEALTH.TRIPPED;
            logEvent(now, "CB_TRIP", { nodeId, failureRate: rate.toFixed(2) });
            eventQueue.push({
                time: now + state.cbResetAfterMs,
                type: "CB_RESET",
                nodeId,
            });
        }
    }
}

module.exports = { runDES };
