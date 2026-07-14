import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Award, Clock, DollarSign, Bookmark, BookmarkCheck,
  TrendingUp, ArrowLeft, Check,
  BookOpen, Video, Globe, Briefcase, HelpCircle
} from 'lucide-react';
import { dashboardApi as studentDashboardApi } from '../utils/api';

export default function Report() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'roadmap' | 'comparison'>('overview');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Fetch Dashboard summary which contains latest assessment data
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: studentDashboardApi.getSummary,
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: studentDashboardApi.toggleBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: (variables: { assessmentId: string; courseId: string; stageName: string; isCompleted: boolean }) =>
      studentDashboardApi.updateProgress(variables.assessmentId, variables.courseId, variables.stageName, variables.isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  // Set default selected course once data loads
  useEffect(() => {
    if (dashboardData?.latestAssessment?.recommendations?.length) {
      setSelectedCourseId(dashboardData.latestAssessment.recommendations[0].courseId);
    }
  }, [dashboardData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-500">Loading your career profile report...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData?.latestAssessment) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-5">
        <HelpCircle className="w-12 h-12 text-slate-400" />
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-800">No Assessment Found</h2>
          <p className="text-xs text-slate-400 max-w-sm">Please complete a career diagnostic assessment to view your matches and roadmaps.</p>
        </div>
        <Link to="/assessment" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all">
          Start Assessment
        </Link>
      </div>
    );
  }

  const { latestAssessment, bookmarks, progress } = dashboardData;
  const { recommendations, careerReport, roadmap, traitScores } = latestAssessment;
  
  const isBookmarked = (courseId: string) => bookmarks.some((b) => b.id === courseId);
  const getProgressStatus = (courseId: string, stageName: string) => {
    return progress.some((p) => p.courseId === courseId && p.stageName === stageName && p.isCompleted);
  };

  const selectedCourseRec = recommendations.find((r) => r.courseId === selectedCourseId) || recommendations[0];
  const selectedCourse = selectedCourseRec?.course;

  const handleToggleBookmark = (courseId: string) => {
    toggleBookmarkMutation.mutate(courseId);
  };

  const handleToggleProgress = (courseId: string, stageName: string) => {
    if (!latestAssessment.id) return;
    const currentStatus = getProgressStatus(courseId, stageName);
    updateProgressMutation.mutate({
      assessmentId: latestAssessment.id,
      courseId,
      stageName,
      isCompleted: !currentStatus,
    });
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-white pb-20">
      {/* Top Banner Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-[73px] z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-slate-400 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="space-y-0.5">
            <h1 className="text-sm font-display font-semibold text-slate-900">Career Blueprint</h1>
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Generated on {new Date(latestAssessment.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <Link
          to="/dashboard"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 px-4 py-2 rounded-full transition-all"
        >
          Go to Dashboard
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-10 grid lg:grid-cols-12 gap-10">
        
        {/* Left Side: Top Matches Index */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-7 rounded-[24px] border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.005)] space-y-5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Matched Career Tracks</h2>
            
            <div className="space-y-3.5">
              {recommendations.map((rec) => (
                <button
                  key={rec.courseId}
                  onClick={() => setSelectedCourseId(rec.courseId)}
                  className={`w-full p-5 rounded-2xl border transition-all text-left flex flex-col justify-between gap-3.5 ${
                    selectedCourseId === rec.courseId
                      ? 'border-slate-900 bg-slate-50/50 shadow-sm ring-1 ring-slate-900'
                      : 'border-slate-100 bg-slate-50/30 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-800 bg-white border border-slate-200/80 px-2 py-0.5 rounded-full">
                      Rank #{rec.rank}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Match Score: {rec.score}</span>
                  </div>
                  <h3 className="font-display font-semibold text-slate-900 text-sm leading-snug">{rec.course.name}</h3>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden border border-slate-200/30">
                    <div 
                      className="bg-slate-900 h-full" 
                      style={{ width: `${Math.min(100, (rec.score / (recommendations[0]?.score || 100)) * 100)}%` }}
                    ></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Tab Contents */}
        <div className="lg:col-span-8 space-y-6">
          {/* Navigation Tabs (Elegant text with line indicator) */}
          <div className="flex gap-8 border-b border-slate-100 pb-4">
            {(['overview', 'roadmap', 'comparison'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="relative pb-2.5 text-sm font-semibold transition-all capitalize"
              >
                <span className={activeTab === tab ? 'text-slate-900 font-bold' : 'text-slate-400 hover:text-slate-600'}>
                  {tab === 'comparison' ? 'Top 3 Comparison' : `${tab} Analysis`}
                </span>
                {activeTab === tab && (
                  <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-slate-900 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW & TRAITS */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Core Course Details */}
              <div className="bg-white p-8 rounded-[24px] border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.005)] space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-3">
                    <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 bg-slate-50 border border-slate-100 py-1 px-2.5 rounded-full">{selectedCourse.category}</span>
                    <h2 className="text-3xl font-display font-medium text-slate-950 leading-tight">{selectedCourse.name}</h2>
                    <p className="text-sm text-slate-500 leading-relaxed font-sans">{selectedCourse.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggleBookmark(selectedCourse.id)}
                    className={`p-3 rounded-full border transition-all ${
                      isBookmarked(selectedCourse.id)
                        ? 'border-slate-900 bg-slate-50 text-slate-900'
                        : 'border-slate-200 bg-white text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {isBookmarked(selectedCourse.id) ? (
                      <BookmarkCheck className="w-5 h-5" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Duration</p>
                      <p className="text-xs font-bold text-slate-800">{selectedCourse.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Level</p>
                      <p className="text-xs font-bold text-slate-800">{selectedCourse.difficulty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Salary</p>
                      <p className="text-xs font-bold text-slate-800">{selectedCourse.potentialSalary}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trait Graph Analysis */}
              {traitScores && traitScores.length > 0 && (
                <div className="bg-white p-8 rounded-[24px] border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.005)] space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-display font-semibold text-slate-900">Your Cognitive Career Traits</h3>
                    <p className="text-xs text-slate-400 font-sans">Extracted from your assessment dialog answers on a scale from 1 to 10</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {traitScores.map((ts) => (
                      <div key={ts.trait.name} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                        <div className="flex justify-between text-xs font-semibold font-sans">
                          <span className="text-slate-700">{ts.trait.name}</span>
                          <span className="text-slate-900 font-bold">{ts.score} / 10</span>
                        </div>
                        <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-slate-900 h-full rounded-full transition-all" 
                            style={{ width: `${(ts.score / 10) * 100}%` }}
                          ></div>
                        </div>
                        {ts.trait.description && (
                          <p className="text-[10px] text-slate-400 leading-normal font-sans pt-1">{ts.trait.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Career Report Details */}
              <div className="bg-white p-8 rounded-[24px] border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.005)] space-y-8">
                <div className="space-y-3">
                  <h3 className="text-xl font-display font-semibold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-slate-950" />
                    Career Summary
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">{careerReport.summary}</p>
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-6">
                  <h3 className="text-xl font-display font-semibold text-slate-900">Personality Insights</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">{careerReport.personalityInsights}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider font-sans">Key Strengths</h4>
                    <ul className="space-y-2.5">
                      {careerReport.strengths.map((str, idx) => (
                        <li key={idx} className="flex gap-2.5 text-xs text-slate-600 items-start font-sans">
                          <span className="text-emerald-500 shrink-0 font-bold">✓</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wider font-sans">Areas to Monitor</h4>
                    <ul className="space-y-2.5">
                      {careerReport.weaknesses.map((weak, idx) => (
                        <li key={idx} className="flex gap-2.5 text-xs text-slate-600 items-start font-sans">
                          <span className="text-amber-500 shrink-0 font-bold">⚠</span>
                          <span>{weak}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-6">
                  <h3 className="text-xl font-display font-semibold text-slate-900">Advice & Personal Motivation</h3>
                  <p className="text-xs text-slate-500 leading-relaxed italic font-serif">"{careerReport.personalMotivation}"</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROADMAP STAGES */}
          {activeTab === 'roadmap' && roadmap && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[24px] border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.005)] flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-display font-semibold text-slate-900">Personalized Roadmap</h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">Step-by-step milestones to master {selectedCourse.name}</p>
                </div>
              </div>

              {roadmap.stages.map((stage, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[24px] border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.005)] space-y-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2">
                      <span className="text-[9px] font-semibold text-slate-800 bg-slate-50 border border-slate-200/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {stage.duration}
                      </span>
                      <h4 className="text-lg font-display font-semibold text-slate-900">{stage.title}</h4>
                      <p className="text-xs text-slate-500 font-sans leading-relaxed">{stage.description}</p>
                    </div>

                    <button
                      onClick={() => handleToggleProgress(selectedCourse.id, stage.title)}
                      className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                        getProgressStatus(selectedCourse.id, stage.title)
                          ? 'border-slate-950 bg-slate-950 text-white'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-900 hover:text-slate-900 shadow-sm'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      {getProgressStatus(selectedCourse.id, stage.title) ? 'Stage Completed' : 'Mark Completed'}
                    </button>
                  </div>

                  {/* Milestones Checkboxes */}
                  <div className="space-y-3 border-t border-slate-100 pt-6">
                    <h5 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-sans">Milestones</h5>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {stage.milestones.map((ms, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-3 px-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 font-sans">
                          <Check className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                          <span>{ms}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projects & Certs */}
                  <div className="grid sm:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        Suggested Project
                      </h5>
                      {stage.projects.map((proj, i) => (
                        <p key={i} className="text-xs text-slate-500 leading-relaxed bg-slate-50 border border-slate-100 p-3.5 px-4 rounded-xl font-sans">
                          {proj}
                        </p>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        Certifications Target
                      </h5>
                      {stage.certifications.map((cert, i) => (
                        <p key={i} className="text-xs text-slate-500 leading-relaxed bg-slate-50 border border-slate-100 p-3.5 px-4 rounded-xl font-sans">
                          {cert}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Study Resources */}
                  <div className="border-t border-slate-100 pt-6 space-y-4">
                    <h5 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-sans">Suggested Learning Resources</h5>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {stage.resources.youtube && stage.resources.youtube.length > 0 && (
                        <div className="flex gap-3.5 items-start font-sans">
                          <div className="p-2.5 bg-slate-50 border border-slate-100 text-slate-800 rounded-xl">
                            <Video className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">YouTube Channels</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{stage.resources.youtube.join(', ')}</p>
                          </div>
                        </div>
                      )}

                      {stage.resources.books && stage.resources.books.length > 0 && (
                        <div className="flex gap-3.5 items-start font-sans">
                          <div className="p-2.5 bg-slate-50 border border-slate-100 text-slate-800 rounded-xl">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">Recommended Books</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{stage.resources.books.join(', ')}</p>
                          </div>
                        </div>
                      )}

                      {stage.resources.free && stage.resources.free.length > 0 && (
                        <div className="flex gap-3.5 items-start font-sans">
                          <div className="p-2.5 bg-slate-50 border border-slate-100 text-slate-800 rounded-xl">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">Free Practice Guides</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{stage.resources.free.join(', ')}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: SIDE BY SIDE COMPARISON */}
          {activeTab === 'comparison' && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[24px] border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.005)] space-y-6">
                <h3 className="text-xl font-display font-semibold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-slate-900" />
                  Comparative Analysis
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-sans">{careerReport.comparisonTop3}</p>

                <div className="grid md:grid-cols-3 gap-5">
                  {recommendations.slice(0, 3).map((rec) => (
                    <div key={rec.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between min-h-[300px] font-sans">
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-semibold text-slate-800 bg-white border border-slate-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">Rank #{rec.rank} Match</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{rec.course.category}</span>
                        </div>
                        <h4 className="font-display font-semibold text-slate-900 text-sm leading-snug">{rec.course.name}</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed h-20 overflow-y-auto pr-1">{rec.course.description}</p>
                      </div>

                      <div className="space-y-2 border-t border-slate-200/60 pt-4 text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Duration</span>
                          <span className="font-bold text-slate-800">{rec.course.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Potential Salary</span>
                          <span className="font-bold text-slate-800">{rec.course.potentialSalary}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Difficulty</span>
                          <span className="font-bold text-slate-800">{rec.course.difficulty}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
