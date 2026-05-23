const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

// Protect all project routes
router.use(ClerkExpressRequireAuth());

// Create or save project
router.post('/', async (req, res) => {
    try {
        const { name, data, analysisData, aiInsights } = req.body;
        const userId = req.auth.userId;

        if (!name || !data) {
            return res.status(400).json({ error: "Name and data are required" });
        }

        const project = await prisma.project.create({
            data: {
                userId,
                name,
                data: typeof data === 'string' ? data : JSON.stringify(data),
                analysisData: analysisData ? (typeof analysisData === 'string' ? analysisData : JSON.stringify(analysisData)) : null,
                aiInsights: aiInsights ? (typeof aiInsights === 'string' ? aiInsights : JSON.stringify(aiInsights)) : null,
            }
        });

        res.status(201).json({ success: true, project });
    } catch (error) {
        console.error("Error saving project:", error);
        res.status(500).json({ error: "Failed to save project" });
    }
});

// Get all projects for the logged-in user
router.get('/', async (req, res) => {
    try {
        const userId = req.auth.userId;
        const projects = await prisma.project.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, createdAt: true, updatedAt: true } // Don't fetch full data for list
        });
        res.json({ success: true, projects });
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
});

// Get single project
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.auth.userId;
        
        const project = await prisma.project.findUnique({
            where: { id }
        });

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        if (project.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized access to project" });
        }

        res.json({ success: true, project });
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ error: "Failed to fetch project" });
    }
});

// Update project
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, data, analysisData, aiInsights } = req.body;
        const userId = req.auth.userId;

        const existingProject = await prisma.project.findUnique({ where: { id } });
        if (!existingProject) {
            return res.status(404).json({ error: "Project not found" });
        }
        if (existingProject.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized access to project" });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (data) updateData.data = typeof data === 'string' ? data : JSON.stringify(data);
        if (analysisData !== undefined) updateData.analysisData = typeof analysisData === 'string' ? analysisData : JSON.stringify(analysisData);
        if (aiInsights !== undefined) updateData.aiInsights = typeof aiInsights === 'string' ? aiInsights : JSON.stringify(aiInsights);

        const project = await prisma.project.update({
            where: { id },
            data: updateData
        });

        res.json({ success: true, project });
    } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ error: "Failed to update project" });
    }
});

// Delete project
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.auth.userId;

        const existingProject = await prisma.project.findUnique({ where: { id } });
        if (!existingProject) {
            return res.status(404).json({ error: "Project not found" });
        }
        if (existingProject.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized access to project" });
        }

        await prisma.project.delete({
            where: { id }
        });
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ error: "Failed to delete project" });
    }
});

module.exports = router;
