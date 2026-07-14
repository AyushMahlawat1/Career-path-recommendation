"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAssessment = startAssessment;
exports.postAnswerAndGetNext = postAnswerAndGetNext;
exports.completeAssessment = completeAssessment;
const client_1 = require("@prisma/client");
const scoring_service_1 = require("../services/scoring.service");
const ai_service_1 = require("../services/ai.service");
const prisma = new client_1.PrismaClient();
// 1. Start Assessment - Creates assessment and writes Q1
async function startAssessment(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Deactivate previous active assessments
        await prisma.assessment.updateMany({
            where: { userId, status: 'STARTED' },
            data: { status: 'ABANDONED' },
        });
        const assessment = await prisma.assessment.create({
            data: {
                userId,
                status: 'STARTED',
            },
        });
        // Fetch the first fixed question
        const q1 = await prisma.question.findFirst({
            where: { orderIndex: 1 },
        });
        if (!q1) {
            return res.status(500).json({ error: 'Fixed questions are not seeded.' });
        }
        // Save Q1 in conversation log
        const conversation = await prisma.aIConversation.create({
            data: {
                assessmentId: assessment.id,
                role: 'assistant',
                text: q1.text,
                type: q1.type,
                options: q1.options,
            },
        });
        res.status(201).json({
            assessmentId: assessment.id,
            question: {
                id: q1.id,
                text: q1.text,
                type: q1.type,
                options: JSON.parse(q1.options),
            },
            questionIndex: 1,
            totalQuestionsAnswered: 0,
        });
    }
    catch (error) {
        console.error('Error starting assessment:', error);
        res.status(500).json({ error: 'Failed to initialize assessment' });
    }
}
// 2. Submit Answer & Fetch Next Question (Dynamic Loop)
async function postAnswerAndGetNext(req, res) {
    try {
        const { assessmentId, questionText, answerText } = req.body;
        if (!assessmentId || !questionText || !answerText) {
            return res.status(400).json({ error: 'assessmentId, questionText and answerText are required' });
        }
        const assessment = await prisma.assessment.findUnique({
            where: { id: assessmentId },
        });
        if (!assessment || assessment.status !== 'STARTED') {
            return res.status(404).json({ error: 'Active assessment session not found' });
        }
        // Save user response in conversation log
        await prisma.aIConversation.create({
            data: {
                assessmentId,
                role: 'user',
                text: answerText,
            },
        });
        // Also store in response table for record keeping
        await prisma.assessmentResponse.create({
            data: {
                assessmentId,
                questionText,
                answerText,
            },
        });
        // Count user answers
        const userAnswers = await prisma.assessmentResponse.findMany({
            where: { assessmentId },
        });
        const answersCount = userAnswers.length;
        // Check if we need to return the next fixed question (Index 2 to 5)
        if (answersCount < 5) {
            const nextIndex = answersCount + 1;
            const nextFixedQ = await prisma.question.findFirst({
                where: { orderIndex: nextIndex },
            });
            if (nextFixedQ) {
                await prisma.aIConversation.create({
                    data: {
                        assessmentId,
                        role: 'assistant',
                        text: nextFixedQ.text,
                        type: nextFixedQ.type,
                        options: nextFixedQ.options,
                    },
                });
                return res.json({
                    question: {
                        id: nextFixedQ.id,
                        text: nextFixedQ.text,
                        type: nextFixedQ.type,
                        options: JSON.parse(nextFixedQ.options),
                    },
                    questionIndex: nextIndex,
                    totalQuestionsAnswered: answersCount,
                });
            }
        }
        // If answersCount >= 5: Call adaptive question generator
        const conversationLogs = await prisma.aIConversation.findMany({
            where: { assessmentId },
            orderBy: { createdAt: 'asc' },
        });
        const chatHistory = conversationLogs.map((log) => ({
            role: log.role,
            text: log.text,
        }));
        const nextAIQuestion = await (0, ai_service_1.generateNextQuestion)(chatHistory);
        // Save generated question in conversation log
        await prisma.aIConversation.create({
            data: {
                assessmentId,
                role: 'assistant',
                text: nextAIQuestion.text,
                type: nextAIQuestion.type,
                options: JSON.stringify(nextAIQuestion.options),
            },
        });
        res.json({
            question: {
                text: nextAIQuestion.text,
                type: nextAIQuestion.type,
                options: nextAIQuestion.options,
            },
            questionIndex: answersCount + 1,
            totalQuestionsAnswered: answersCount,
        });
    }
    catch (error) {
        console.error('Error posting answer and getting next question:', error);
        res.status(500).json({ error: 'Failed to process answer and fetch next step' });
    }
}
// 3. Complete Assessment - Triggers trait extraction and report generation
async function completeAssessment(req, res) {
    try {
        const { assessmentId } = req.body;
        if (!assessmentId) {
            return res.status(400).json({ error: 'assessmentId is required' });
        }
        const assessment = await prisma.assessment.findUnique({
            where: { id: assessmentId },
            include: {
                user: { select: { fullName: true, email: true } },
            },
        });
        if (!assessment || assessment.status !== 'STARTED') {
            return res.status(404).json({ error: 'Active assessment session not found' });
        }
        // Fetch conversation log
        const conversationLogs = await prisma.aIConversation.findMany({
            where: { assessmentId },
            orderBy: { createdAt: 'asc' },
        });
        const chatHistory = conversationLogs.map((log) => ({
            role: log.role,
            text: log.text,
        }));
        // A. Extract Traits Scores
        const extracted = await prisma.$transaction(async (tx) => {
            const traitResult = await (0, ai_service_1.extractTraits)(chatHistory);
            const dbTraits = await tx.trait.findMany();
            for (const [traitName, scoreValue] of Object.entries(traitResult.traits)) {
                const targetTrait = dbTraits.find((t) => t.name === traitName);
                if (targetTrait) {
                    await tx.traitScore.create({
                        data: {
                            assessmentId,
                            traitId: targetTrait.id,
                            score: parseFloat(scoreValue.toString()),
                        },
                    });
                }
            }
            return traitResult.traits;
        });
        // B. Calculate recommendations scores using trait weights mapping
        const courseRankings = await (0, scoring_service_1.calculateCourseScores)(assessmentId);
        // Save recommendations
        for (const ranking of courseRankings) {
            await prisma.recommendation.create({
                data: {
                    assessmentId,
                    courseId: ranking.courseId,
                    score: ranking.score,
                    rank: ranking.rank,
                },
            });
        }
        // Get Course details for top matched courses
        const topCourseIds = courseRankings.map((cr) => cr.courseId);
        const dbCourses = await prisma.course.findMany({
            where: { id: { in: topCourseIds } },
        });
        const orderedCourses = courseRankings
            .map((cr) => dbCourses.find((dbc) => dbc.id === cr.courseId))
            .filter(Boolean);
        // C. Invoke Career Analysis Report Generator
        const aiAnalysis = await (0, ai_service_1.generateAnalysisReportAndRoadmap)(assessment.user, extracted, orderedCourses);
        // D. Persist Upgraded Career Report in Database
        const report = await prisma.careerReport.create({
            data: {
                assessmentId,
                summary: aiAnalysis.summary,
                personalityInsights: aiAnalysis.personalityInsights,
                strengths: JSON.stringify(aiAnalysis.strengths),
                weaknesses: JSON.stringify(aiAnalysis.weaknesses),
                courseFitExplanations: JSON.stringify(aiAnalysis.courseFitExplanations),
                skillsToImprove: JSON.stringify(aiAnalysis.skillsToImprove),
                personalMotivation: aiAnalysis.personalMotivation,
                weeklyStudyPlan: JSON.stringify(aiAnalysis.weeklyStudyPlan),
                internshipStrategy: aiAnalysis.internshipStrategy,
                resumeTips: JSON.stringify(aiAnalysis.resumeTips),
                interviewPrep: JSON.stringify(aiAnalysis.interviewPrep),
                comparisonTop3: aiAnalysis.comparisonTop3,
            },
        });
        // E. Persist Personalized Roadmap stages
        const roadmap = await prisma.roadmap.create({
            data: {
                assessmentId,
                stages: JSON.stringify(aiAnalysis.roadmap),
            },
        });
        // F. Initialize progress tracker checkpoints for the top recommended track
        const topCourse = orderedCourses[0];
        if (topCourse && aiAnalysis.roadmap) {
            const progressData = aiAnalysis.roadmap.map((stage) => ({
                assessmentId,
                courseId: topCourse.id,
                stageName: stage.title,
                isCompleted: false,
            }));
            await prisma.progress.createMany({
                data: progressData,
            });
        }
        // G. Mark Assessment status COMPLETED
        await prisma.assessment.update({
            where: { id: assessmentId },
            data: { status: 'COMPLETED' },
        });
        // Format response values
        const parsedReport = {
            ...report,
            strengths: JSON.parse(report.strengths),
            weaknesses: JSON.parse(report.weaknesses),
            courseFitExplanations: JSON.parse(report.courseFitExplanations),
            skillsToImprove: JSON.parse(report.skillsToImprove),
            weeklyStudyPlan: JSON.parse(report.weeklyStudyPlan),
            resumeTips: JSON.parse(report.resumeTips),
            interviewPrep: JSON.parse(report.interviewPrep),
        };
        const parsedRoadmap = {
            ...roadmap,
            stages: JSON.parse(roadmap.stages),
        };
        res.status(201).json({
            assessmentId,
            recommendations: courseRankings,
            report: parsedReport,
            roadmap: parsedRoadmap,
        });
    }
    catch (error) {
        console.error('Error completing assessment:', error);
        res.status(500).json({ error: 'Failed to analyze assessment and compile recommendations' });
    }
}
