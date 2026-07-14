"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./controllers/auth.controller");
const assessment_controller_1 = require("./controllers/assessment.controller");
const dashboard_controller_1 = require("./controllers/dashboard.controller");
const auth_middleware_1 = require("./middlewares/auth.middleware");
const adminController = __importStar(require("./controllers/admin.controller"));
const router = (0, express_1.Router)();
// --- Public Authentication Routes ---
router.post('/auth/register', auth_controller_1.register);
router.post('/auth/login', auth_controller_1.login);
router.get('/auth/me', auth_middleware_1.authMiddleware, auth_controller_1.getMe);
// --- Assessment Routes ---
router.post('/assessment/start', auth_middleware_1.authMiddleware, assessment_controller_1.startAssessment);
router.post('/assessment/answer', auth_middleware_1.authMiddleware, assessment_controller_1.postAnswerAndGetNext);
router.post('/assessment/complete', auth_middleware_1.authMiddleware, assessment_controller_1.completeAssessment);
// --- Student Dashboard Routes ---
router.get('/dashboard/summary', auth_middleware_1.authMiddleware, dashboard_controller_1.getDashboardSummary);
router.post('/dashboard/bookmark', auth_middleware_1.authMiddleware, dashboard_controller_1.toggleBookmark);
router.post('/dashboard/progress', auth_middleware_1.authMiddleware, dashboard_controller_1.updateProgress);
// --- Admin Panel Routes (Required Admin Role) ---
const adminRouter = [auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware];
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
exports.default = router;
