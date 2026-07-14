import { Router } from 'express';
import { register, login, getMe } from './controllers/auth.controller';
import { startAssessment, postAnswerAndGetNext, completeAssessment } from './controllers/assessment.controller';
import { getDashboardSummary, toggleBookmark, updateProgress } from './controllers/dashboard.controller';
import { authMiddleware, adminMiddleware } from './middlewares/auth.middleware';
import * as adminController from './controllers/admin.controller';

const router = Router();

// --- Public Authentication Routes ---
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authMiddleware, getMe);

// --- Assessment Routes ---
router.post('/assessment/start', authMiddleware, startAssessment);
router.post('/assessment/answer', authMiddleware, postAnswerAndGetNext);
router.post('/assessment/complete', authMiddleware, completeAssessment);

// --- Student Dashboard Routes ---
router.get('/dashboard/summary', authMiddleware, getDashboardSummary);
router.post('/dashboard/bookmark', authMiddleware, toggleBookmark);
router.post('/dashboard/progress', authMiddleware, updateProgress);

// --- Admin Panel Routes (Required Admin Role) ---
const adminRouter = [authMiddleware, adminMiddleware];

router.get('/admin/analytics', adminRouter, adminController.getAnalytics);
router.get('/admin/reports', adminRouter, adminController.exportReports);
router.get('/admin/users', adminRouter, adminController.getUsers);
router.delete('/admin/users/:id', adminRouter, adminController.deleteUser);

// Questions CRUD
router.get('/admin/questions', adminRouter, adminController.getQuestions);
router.post('/admin/questions', adminRouter, adminController.createQuestion);
router.put('/admin/questions/:id', adminRouter, adminController.updateQuestion);
router.delete('/admin/questions/:id', adminRouter, adminController.deleteQuestion);

// Dynamic Weight Matrix
router.get('/admin/weight-matrix', adminRouter, adminController.getWeightMatrix);
router.post('/admin/weight-matrix/update', adminRouter, adminController.updateOptionWeight);

// Courses CRUD
router.get('/admin/courses', adminRouter, adminController.getCourses);
router.post('/admin/courses', adminRouter, adminController.createCourse);
router.put('/admin/courses/:id', adminRouter, adminController.updateCourse);
router.delete('/admin/courses/:id', adminRouter, adminController.deleteCourse);

export default router;
