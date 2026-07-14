"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummary = getDashboardSummary;
exports.toggleBookmark = toggleBookmark;
exports.updateProgress = updateProgress;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function getDashboardSummary(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Get all assessments for history
        const allAssessments = await prisma.assessment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                recommendations: {
                    orderBy: { rank: 'asc' },
                    include: {
                        course: true,
                    },
                },
                careerReport: true,
                roadmap: true,
                traitScores: {
                    include: {
                        trait: true,
                    },
                },
            },
        });
        const latestAssessment = allAssessments.find((a) => a.status === 'COMPLETED');
        let formattedLatestAssessment = null;
        if (latestAssessment) {
            let parsedReport = null;
            if (latestAssessment.careerReport) {
                parsedReport = {
                    ...latestAssessment.careerReport,
                    strengths: JSON.parse(latestAssessment.careerReport.strengths),
                    weaknesses: JSON.parse(latestAssessment.careerReport.weaknesses),
                    courseFitExplanations: JSON.parse(latestAssessment.careerReport.courseFitExplanations),
                    skillsToImprove: JSON.parse(latestAssessment.careerReport.skillsToImprove),
                    weeklyStudyPlan: JSON.parse(latestAssessment.careerReport.weeklyStudyPlan || '[]'),
                    resumeTips: JSON.parse(latestAssessment.careerReport.resumeTips || '[]'),
                    interviewPrep: JSON.parse(latestAssessment.careerReport.interviewPrep || '[]'),
                };
            }
            let parsedRoadmap = null;
            if (latestAssessment.roadmap) {
                parsedRoadmap = {
                    ...latestAssessment.roadmap,
                    stages: JSON.parse(latestAssessment.roadmap.stages),
                };
            }
            formattedLatestAssessment = {
                ...latestAssessment,
                careerReport: parsedReport,
                roadmap: parsedRoadmap,
            };
        }
        // Get user bookmarks
        const bookmarks = await prisma.bookmark.findMany({
            where: { userId },
            include: {
                course: true,
            },
        });
        // Get progress tracker metrics for this assessment
        let progress = [];
        if (latestAssessment) {
            progress = await prisma.progress.findMany({
                where: { assessmentId: latestAssessment.id },
            });
        }
        res.json({
            latestAssessment: formattedLatestAssessment,
            history: allAssessments.map((a) => ({
                id: a.id,
                status: a.status,
                createdAt: a.createdAt,
                topMatch: a.recommendations[0]?.course.name || 'N/A',
            })),
            bookmarks: bookmarks.map((b) => b.course),
            progress,
        });
    }
    catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
}
async function toggleBookmark(req, res) {
    try {
        const userId = req.user?.id;
        const { courseId } = req.body;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!courseId) {
            return res.status(400).json({ error: 'Course ID is required' });
        }
        const existingBookmark = await prisma.bookmark.findUnique({
            where: {
                userId_courseId: { userId, courseId },
            },
        });
        if (existingBookmark) {
            await prisma.bookmark.delete({
                where: {
                    userId_courseId: { userId, courseId },
                },
            });
            return res.json({ bookmarked: false, message: 'Bookmark removed successfully' });
        }
        else {
            await prisma.bookmark.create({
                data: { userId, courseId },
            });
            return res.json({ bookmarked: true, message: 'Bookmark added successfully' });
        }
    }
    catch (error) {
        console.error('Error toggling bookmark:', error);
        res.status(500).json({ error: 'Failed to toggle bookmark' });
    }
}
async function updateProgress(req, res) {
    try {
        const { assessmentId, courseId, stageName, isCompleted } = req.body;
        if (!assessmentId || !courseId || !stageName) {
            return res.status(400).json({ error: 'Assessment ID, Course ID and Stage Name are required' });
        }
        const updatedProgress = await prisma.progress.upsert({
            where: {
                assessmentId_courseId_stageName: { assessmentId, courseId, stageName },
            },
            update: {
                isCompleted: !!isCompleted,
            },
            create: {
                assessmentId,
                courseId,
                stageName,
                isCompleted: !!isCompleted,
            },
        });
        res.json(updatedProgress);
    }
    catch (error) {
        console.error('Error updating progress tracker:', error);
        res.status(500).json({ error: 'Failed to update progress milestone' });
    }
}
