import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  BarChart3, Database, HelpCircle, GraduationCap, Users, 
  Trash2, Loader, PlusCircle
} from 'lucide-react';
import { adminApi, Course, Question } from '../utils/api';

export default function AdminPanel() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'analytics' | 'matrix' | 'questions' | 'courses' | 'users'>('analytics');
  
  // Question CRUD editing states
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState<boolean>(false);
  const [qText, setQText] = useState<string>('');
  const [qType, setQType] = useState<'MULTIPLE_CHOICE' | 'LIKERT' | 'SCENARIO'>('MULTIPLE_CHOICE');
  const [qCategory, setQCategory] = useState<string>('');
  const [qOptions, setQOptions] = useState<string[]>([]);
  const [newOptText, setNewOptText] = useState<string>('');

  // Course CRUD editing states
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showCourseModal, setShowCourseModal] = useState<boolean>(false);
  const [cName, setCName] = useState<string>('');
  const [cCode, setCCode] = useState<string>('');
  const [cDesc, setCDesc] = useState<string>('');
  const [cCategory, setCCategory] = useState<string>('');
  const [cDiff, setCDiff] = useState<string>('Intermediate');
  const [cDur, setCDur] = useState<string>('6 Months');
  const [cSalary, setCSalary] = useState<string>('$80,000 - $120,000');

  // Queries
  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: adminApi.getAnalytics,
  });

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: adminApi.getUsers,
  });

  const { data: questions, isLoading: loadingQuestions } = useQuery({
    queryKey: ['adminQuestions'],
    queryFn: adminApi.getQuestions,
  });

  const { data: matrixData, isLoading: loadingMatrix } = useQuery({
    queryKey: ['adminWeightMatrix'],
    queryFn: adminApi.getWeightMatrix,
  });

  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['adminCourses'],
    queryFn: adminApi.getCourses,
  });

  // Mutations
  const updateWeightMutation = useMutation({
    mutationFn: (vars: { courseId: string; traitId: string; weight: number }) => 
      adminApi.updateOptionWeight(vars.courseId, vars.traitId, vars.weight),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminWeightMatrix'] });
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: adminApi.createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminQuestions'] });
      closeQuestionModal();
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: (vars: { id: string; data: any }) => adminApi.updateQuestion(vars.id, vars.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminQuestions'] });
      closeQuestionModal();
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: adminApi.deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminQuestions'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: adminApi.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
      closeCourseModal();
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: (vars: { id: string; data: any }) => adminApi.updateCourse(vars.id, vars.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
      closeCourseModal();
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: adminApi.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
    },
  });

  // Modal actions
  const openNewQuestionModal = () => {
    setEditingQuestion(null);
    setQText('');
    setQType('MULTIPLE_CHOICE');
    setQCategory('');
    setQOptions([]);
    setShowQuestionModal(true);
  };

  const openEditQuestionModal = (q: Question) => {
    setEditingQuestion(q);
    setQText(q.text);
    setQType(q.type);
    setQCategory(q.category);
    setQOptions(q.options || []);
    setShowQuestionModal(true);
  };

  const closeQuestionModal = () => {
    setShowQuestionModal(false);
    setEditingQuestion(null);
  };

  const addOption = () => {
    if (newOptText.trim()) {
      setQOptions([...qOptions, newOptText.trim()]);
      setNewOptText('');
    }
  };

  const removeOption = (index: number) => {
    setQOptions(qOptions.filter((_, idx) => idx !== index));
  };

  const saveQuestion = () => {
    const payload = {
      text: qText,
      type: qType,
      category: qCategory,
      options: qOptions,
    };
    if (editingQuestion?.id) {
      updateQuestionMutation.mutate({ id: editingQuestion.id, data: payload });
    } else {
      createQuestionMutation.mutate(payload);
    }
  };

  const openNewCourseModal = () => {
    setEditingCourse(null);
    setCName('');
    setCCode('');
    setCDesc('');
    setCCategory('');
    setCDiff('Intermediate');
    setCDur('6 Months');
    setCSalary('$80,000 - $120,000');
    setShowCourseModal(true);
  };

  const openEditCourseModal = (c: Course) => {
    setEditingCourse(c);
    setCName(c.name);
    setCCode(c.code);
    setCDesc(c.description);
    setCCategory(c.category);
    setCDiff(c.difficulty);
    setCDur(c.duration);
    setCSalary(c.potentialSalary);
    setShowCourseModal(true);
  };

  const closeCourseModal = () => {
    setShowCourseModal(false);
    setEditingCourse(null);
  };

  const saveCourse = () => {
    const payload = {
      name: cName,
      code: cCode,
      description: cDesc,
      category: cCategory,
      difficulty: cDiff,
      duration: cDur,
      potentialSalary: cSalary,
    };
    if (editingCourse?.id) {
      updateCourseMutation.mutate({ id: editingCourse.id, data: payload });
    } else {
      createCourseMutation.mutate(payload);
    }
  };

  const handleWeightCellChange = (courseId: string, traitId: string, value: string) => {
    const floatVal = parseFloat(value);
    if (!isNaN(floatVal) && floatVal >= 0 && floatVal <= 10) {
      updateWeightMutation.mutate({ courseId, traitId, weight: floatVal });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Panel Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
        <div className="p-6 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm tracking-tight">Admin Portal</h2>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">v2.0 Traits Panel</p>
            </div>
          </div>

          <div className="space-y-1.5">
            {[
              { id: 'analytics', label: 'Overview Metrics', icon: BarChart3 },
              { id: 'matrix', label: 'Traits Weight Matrix', icon: Database },
              { id: 'questions', label: 'Fixed Questions', icon: HelpCircle },
              { id: 'courses', label: 'Courses Manager', icon: GraduationCap },
              { id: 'users', label: 'Student Accounts', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100">
          <Link
            to="/dashboard"
            className="w-full flex items-center justify-center text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/80 py-2.5 rounded-xl transition-all"
          >
            Exit to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Admin Contents */}
      <main className="flex-1 overflow-y-auto p-10 max-w-7xl mx-auto">
        
        {/* OVERVIEW METRICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm">
              <h3 className="text-base font-bold text-slate-800">Analytics Dashboard</h3>
              <p className="text-xs text-slate-400">System overview stats and matching activity</p>

              {loadingAnalytics ? (
                <div className="py-10 text-center"><Loader className="w-6 h-6 animate-spin mx-auto text-blue-600" /></div>
              ) : (
                <div className="grid grid-cols-2 gap-6 mt-6">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Registered Students</p>
                    <p className="text-3xl font-extrabold text-slate-800 mt-2">{analytics?.totalStudents || 0}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Completed Profiles</p>
                    <p className="text-3xl font-extrabold text-slate-800 mt-2">{analytics?.totalAssessments || 0}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Course Recommendations Popularity</h4>
              {analytics?.popularCourses?.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">No matching session metrics available.</p>
              ) : (
                <div className="space-y-3.5 mt-4">
                  {analytics?.popularCourses?.map((item: any) => (
                    <div key={item.name} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">{item.name}</span>
                      <span className="font-bold text-blue-600">{item.points} match weight units</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TRAITS WEIGHT MATRIX TABLE */}
        {activeTab === 'matrix' && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Dynamic Course-Trait Weight Matrix</h3>
              <p className="text-xs text-slate-400">Map weights (0 to 10) for Course calculations. Edits are synced to database instantly.</p>
            </div>

            {loadingMatrix ? (
              <div className="py-10 text-center"><Loader className="w-6 h-6 animate-spin mx-auto text-blue-600" /></div>
            ) : (
              <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-subtle">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700">
                    <tr>
                      <th className="px-6 py-4">Trait Name</th>
                      {matrixData?.courses.map((course) => (
                        <th key={course.id} className="px-4 py-4 text-center" title={course.name}>
                          {course.code}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {matrixData?.traits.map((trait) => (
                      <tr key={trait.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-semibold text-slate-700 border-r border-slate-100">
                          {trait.name}
                        </td>
                        {matrixData?.courses.map((course) => {
                          const weightRecord = matrixData.weights.find(
                            (w) => w.courseId === course.id && w.traitId === trait.id
                          );
                          const currentWeight = weightRecord ? weightRecord.weight : 0;
                          return (
                            <td key={course.id} className="px-2 py-2 text-center border-r border-slate-100">
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="10"
                                defaultValue={currentWeight}
                                onBlur={(e) => handleWeightCellChange(course.id, trait.id, e.target.value)}
                                className="w-16 px-2 py-1 text-center font-bold border border-slate-200 rounded-lg hover:border-blue-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-xs"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* QUESTIONS CRUD */}
        {activeTab === 'questions' && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-800">Fixed Baseline Questions</h3>
                <p className="text-xs text-slate-400">Questions 1 to 5 evaluated at assessment start</p>
              </div>
              <button
                onClick={openNewQuestionModal}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Add Question
              </button>
            </div>

            {loadingQuestions ? (
              <div className="py-10 text-center"><Loader className="w-6 h-6 animate-spin mx-auto text-blue-600" /></div>
            ) : (
              <div className="space-y-4">
                {questions?.map((q) => (
                  <div key={q.id} className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                          {q.type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">{q.category}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm leading-snug">{q.text}</h4>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {q.options.map((opt, i) => (
                          <span key={i} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-slate-600">
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => openEditQuestionModal(q)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteQuestionMutation.mutate(q.id!)}
                        className="text-xs font-semibold text-red-600 hover:text-red-800 bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* COURSES CRUD */}
        {activeTab === 'courses' && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-800">Predefined Courses Manager</h3>
                <p className="text-xs text-slate-400">Configure catalog properties and match configurations</p>
              </div>
              <button
                onClick={openNewCourseModal}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Add Course
              </button>
            </div>

            {loadingCourses ? (
              <div className="py-10 text-center"><Loader className="w-6 h-6 animate-spin mx-auto text-blue-600" /></div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {courses?.map((c) => (
                  <div key={c.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between min-h-[160px]">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                          {c.code}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">{c.category}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm leading-snug">{c.name}</h4>
                      <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">{c.description}</p>
                    </div>

                    <div className="border-t border-slate-200/60 pt-4 mt-4 flex justify-end gap-2">
                      <button
                        onClick={() => openEditCourseModal(c)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCourseMutation.mutate(c.id)}
                        className="text-xs font-semibold text-red-600 hover:text-red-800 bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USERS MANAGER */}
        {activeTab === 'users' && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Student Account Controls</h3>
              <p className="text-xs text-slate-400">Manage user access configurations</p>
            </div>

            {loadingUsers ? (
              <div className="py-10 text-center"><Loader className="w-6 h-6 animate-spin mx-auto text-blue-600" /></div>
            ) : (
              <div className="border border-slate-200/60 rounded-2xl overflow-hidden shadow-subtle">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700">
                    <tr>
                      <th className="px-6 py-4">Full Name</th>
                      <th className="px-6 py-4">Email Address</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {users?.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-semibold text-slate-800">{u.fullName}</td>
                        <td className="px-6 py-4 text-slate-500">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.role === 'ADMIN' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => deleteUserMutation.mutate(u.id)}
                            className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-all"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* QUESTION EDITOR MODAL */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-xl border border-slate-200 p-8 space-y-6">
            <h3 className="text-base font-bold text-slate-800">
              {editingQuestion ? 'Edit Question Config' : 'New Fixed Question'}
            </h3>
            
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Question Content Text</label>
                <input
                  type="text"
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                  placeholder="e.g. Rate your mathematics background..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Category Tag</label>
                  <input
                    type="text"
                    value={qCategory}
                    onChange={(e) => setQCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                    placeholder="e.g. Mathematics"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Input Type</label>
                  <select
                    value={qType}
                    onChange={(e: any) => setQType(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                  >
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="LIKERT">Likert Scale</option>
                    <option value="SCENARIO">Scenario</option>
                  </select>
                </div>
              </div>

              {qType !== 'LIKERT' && (
                <div className="space-y-3">
                  <label className="font-bold text-slate-700">Answer Options List</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newOptText}
                      onChange={(e) => setNewOptText(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                      placeholder="Add an answer option..."
                    />
                    <button
                      onClick={addOption}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl transition-all"
                    >
                      Add
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-32 overflow-y-auto border border-slate-100 p-2.5 rounded-xl bg-slate-50/50">
                    {qOptions.map((opt, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-200">
                        <span>{opt}</span>
                        <button
                          onClick={() => removeOption(idx)}
                          className="text-red-500 hover:text-red-700 font-bold text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={closeQuestionModal}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveQuestion}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COURSE EDITOR MODAL */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-xl border border-slate-200 p-8 space-y-6">
            <h3 className="text-base font-bold text-slate-800">
              {editingCourse ? 'Edit Course Catalog' : 'New Course Properties'}
            </h3>
            
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Course Name</label>
                  <input
                    type="text"
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none"
                    placeholder="e.g. Cybersecurity Specialist"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Course Code (Unique)</label>
                  <input
                    type="text"
                    value={cCode}
                    onChange={(e) => setCCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none"
                    placeholder="e.g. CYBR"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Description Summary</label>
                <textarea
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none resize-none"
                  placeholder="Enter details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Category</label>
                  <input
                    type="text"
                    value={cCategory}
                    onChange={(e) => setCCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none"
                    placeholder="e.g. Security"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Difficulty</label>
                  <select
                    value={cDiff}
                    onChange={(e) => setCDiff(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Duration</label>
                  <input
                    type="text"
                    value={cDur}
                    onChange={(e) => setCDur(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none"
                    placeholder="e.g. 6 Months"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Potential Salary</label>
                  <input
                    type="text"
                    value={cSalary}
                    onChange={(e) => setCSalary(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none"
                    placeholder="e.g. $80,000 - $120,000"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={closeCourseModal}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveCourse}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
