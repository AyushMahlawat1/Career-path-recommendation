// API Client Wrapper for Career Recommendation Platform v2.0

const getHeaders = () => {
  const token = localStorage.getItem('career_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const BASE_URL = import.meta.env.VITE_API_URL || '';

export async function request(url: string, options: RequestInit = {}) {
  const headers = { ...getHeaders(), ...options.headers };
  const response = await fetch(`${BASE_URL}${url}`, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
  }
  
  return response.json();
}

// Interfaces
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'STUDENT' | 'ADMIN';
  createdAt?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  potentialSalary: string;
}

export interface Trait {
  id: string;
  name: string;
  description?: string;
}

export interface CourseTraitWeight {
  id: string;
  courseId: string;
  traitId: string;
  weight: number;
}

export interface Question {
  id?: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'LIKERT' | 'SCENARIO';
  category: string;
  orderIndex?: number;
  options: string[];
}

export interface CareerReport {
  id: string;
  summary: string;
  personalityInsights: string;
  strengths: string[];
  weaknesses: string[];
  courseFitExplanations: { [courseName: string]: string };
  skillsToImprove: string[];
  personalMotivation: string;
  weeklyStudyPlan: string[];
  internshipStrategy: string;
  resumeTips: string[];
  interviewPrep: string[];
  comparisonTop3: string;
}

export interface RoadmapStage {
  title: string;
  duration: string;
  description: string;
  milestones: string[];
  projects: string[];
  certifications: string[];
  resources: {
    free: string[];
    paid: string[];
    youtube: string[];
    books: string[];
    websites: string[];
  };
}

export interface Roadmap {
  id: string;
  stages: RoadmapStage[];
}

export interface Recommendation {
  id: string;
  courseId: string;
  score: number;
  rank: number;
  course: Course;
}

export interface DashboardSummary {
  latestAssessment: {
    id: string;
    createdAt: string;
    recommendations: Recommendation[];
    careerReport: CareerReport;
    roadmap: Roadmap;
    traitScores?: Array<{
      score: number;
      trait: {
        name: string;
        description?: string;
      };
    }>;
  } | null;
  history: Array<{
    id: string;
    createdAt: string;
    status: string;
    topMatch: string;
  }>;
  bookmarks: Course[];
  progress: Array<{
    courseId: string;
    stageName: string;
    isCompleted: boolean;
  }>;
}

// Auth API calls
export const authApi = {
  login: (data: any) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/api/auth/me'),
};

// Assessment API calls
export const assessmentApi = {
  start: (): Promise<{
    assessmentId: string;
    question: Question;
    questionIndex: number;
    totalQuestionsAnswered: number;
  }> => request('/api/assessment/start', { method: 'POST' }),

  answer: (data: {
    assessmentId: string;
    questionText: string;
    answerText: string;
  }): Promise<{
    question: Question;
    questionIndex: number;
    totalQuestionsAnswered: number;
  }> => request('/api/assessment/answer', { method: 'POST', body: JSON.stringify(data) }),

  complete: (data: {
    assessmentId: string;
  }): Promise<{
    assessmentId: string;
    recommendations: Recommendation[];
    report: CareerReport;
    roadmap: Roadmap;
  }> => request('/api/assessment/complete', { method: 'POST', body: JSON.stringify(data) }),
};

// Student Dashboard API calls
export const dashboardApi = {
  getSummary: (): Promise<DashboardSummary> => request('/api/dashboard/summary'),
  toggleBookmark: (courseId: string) => 
    request('/api/dashboard/bookmark', { method: 'POST', body: JSON.stringify({ courseId }) }),
  updateProgress: (assessmentId: string, courseId: string, stageName: string, isCompleted: boolean) => 
    request('/api/dashboard/progress', { 
      method: 'POST', 
      body: JSON.stringify({ assessmentId, courseId, stageName, isCompleted }) 
    }),
};

// Admin Panel API calls
export const adminApi = {
  getAnalytics: () => request('/api/admin/analytics'),
  getReports: () => request('/api/admin/reports'),
  getUsers: (): Promise<User[]> => request('/api/admin/users'),
  deleteUser: (id: string) => request(`/api/admin/users/${id}`, { method: 'DELETE' }),
  
  getQuestions: (): Promise<Question[]> => request('/api/admin/questions'),
  createQuestion: (data: any) => request('/api/admin/questions', { method: 'POST', body: JSON.stringify(data) }),
  updateQuestion: (id: string, data: any) => request(`/api/admin/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteQuestion: (id: string) => request(`/api/admin/questions/${id}`, { method: 'DELETE' }),
  
  getWeightMatrix: (): Promise<{
    courses: Array<{ id: string; name: string; code: string }>;
    traits: Trait[];
    weights: CourseTraitWeight[];
  }> => request('/api/admin/weight-matrix'),
  updateOptionWeight: (courseId: string, traitId: string, weight: number) => 
    request('/api/admin/weight-matrix/update', { method: 'POST', body: JSON.stringify({ courseId, traitId, weight }) }),
  
  getCourses: (): Promise<Course[]> => request('/api/admin/courses'),
  createCourse: (data: any) => request('/api/admin/courses', { method: 'POST', body: JSON.stringify(data) }),
  updateCourse: (id: string, data: any) => request(`/api/admin/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCourse: (id: string) => request(`/api/admin/courses/${id}`, { method: 'DELETE' }),
};
