import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Compass, ArrowRight, Loader, Trophy, 
  BookmarkCheck, ClipboardList, Sparkles, LogOut
} from 'lucide-react';
import { dashboardApi } from '../utils/api';

export default function Dashboard() {
  const navigate = useNavigate();

  // Fetch Dashboard summary data
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: dashboardApi.getSummary,
  });

  const handleLogout = () => {
    localStorage.removeItem('career_token');
    localStorage.removeItem('career_user');
    navigate('/');
  };

  const getStorageUser = () => {
    const userStr = localStorage.getItem('career_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  };
  
  const user = getStorageUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Loading your profile dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="text-red-500 font-bold">Failed to load student dashboard. Please log in again.</div>
        <button onClick={handleLogout} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold">
          Log Out
        </button>
      </div>
    );
  }

  const { latestAssessment, history, bookmarks, progress } = data || {
    latestAssessment: null,
    history: [],
    bookmarks: [],
    progress: []
  };

  // Compute roadmap completion percentage
  const totalMilestones = progress.length;
  const completedMilestones = progress.filter((p) => p.isCompleted).length;
  const completionPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  const topMatch = latestAssessment?.recommendations[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* SaaS Navigation */}
      <nav className="bg-white border-b border-slate-200/60 sticky top-0 z-20 px-6 py-4 flex items-center justify-between shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            CM
          </div>
          <span className="font-bold text-slate-800 text-sm tracking-tight">CareerMap v2.0</span>
        </div>

        <div className="flex items-center gap-4">
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100/80 px-3.5 py-2 rounded-xl transition-all"
            >
              Control Panel
            </Link>
          )}

          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <span className="text-xs font-semibold text-slate-700 hidden sm:inline">{user?.fullName || 'Student'}</span>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm">
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Welcome back, {user?.fullName || 'Scholar'} 👋
            </h2>
            <p className="text-xs text-slate-400">Track study goals, matching careers, and progress pathways here.</p>
          </div>
          <Link
            to="/assessment"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.98] w-fit"
          >
            <Sparkles className="w-4 h-4" />
            Start Career Interview
          </Link>
        </div>

        {latestAssessment ? (
          <div className="grid md:grid-cols-12 gap-8">
            
            {/* Left Column: Matches & Roadmap Progress */}
            <div className="md:col-span-8 space-y-8">
              
              {/* Top Match Hero */}
              {topMatch && (
                <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Top Career Match
                    </span>
                    <h3 className="text-xl font-bold text-slate-800 leading-tight mt-2">{topMatch.course.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-2">{topMatch.course.description}</p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Match Score</p>
                      <p className="text-sm font-bold text-slate-800">{topMatch.score} points</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Salary Potential</p>
                      <p className="text-sm font-bold text-slate-800">{topMatch.course.potentialSalary}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Study Duration</p>
                      <p className="text-sm font-bold text-slate-800">{topMatch.course.duration}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
                    <Link
                      to="/report"
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors group"
                    >
                      Open Career Report & Roadmap
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Learning Progress Checklist */}
              {totalMilestones > 0 && (
                <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Roadmap Progress Tracker</h4>
                      <p className="text-[10px] text-slate-400">Mastery checklist for {topMatch?.course.name}</p>
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">
                      {completionPercentage}% Done
                    </span>
                  </div>

                  <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>

                  <div className="space-y-3.5 border-t border-slate-100 pt-6">
                    {progress.map((item) => (
                      <div key={item.stageName} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${item.isCompleted ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                            <Trophy className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-slate-700">{item.stageName}</span>
                        </div>
                        <span className={`text-[10px] font-bold ${item.isCompleted ? 'text-green-600' : 'text-slate-400'}`}>
                          {item.isCompleted ? 'Completed ✓' : 'In Progress'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex justify-end">
                    <Link to="/report" className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                      Update milestones in Roadmap tab →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Bookmarks, History & Resources */}
            <div className="md:col-span-4 space-y-8">
              
              {/* Bookmarks */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-blue-600" />
                  Bookmarked Courses
                </h4>

                {bookmarks.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">No bookmarks saved yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {bookmarks.map((bookmark) => (
                      <div key={bookmark.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-slate-700 leading-snug">{bookmark.name}</p>
                          <p className="text-[10px] text-slate-400">{bookmark.category}</p>
                        </div>
                        <Link 
                          to="/report"
                          className="p-1.5 hover:bg-slate-200/70 text-slate-400 hover:text-slate-600 rounded-lg transition-all"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assessment History */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-blue-600" />
                  Session History
                </h4>

                <div className="space-y-2.5">
                  {history.slice(0, 4).map((h) => (
                    <div key={h.id} className="p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-700">Top: {h.topMatch}</p>
                        <p className="text-[10px] text-slate-400">{new Date(h.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${h.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                        {h.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white p-12 rounded-3xl border border-slate-200/60 shadow-sm text-center max-w-xl mx-auto space-y-6">
            <Compass className="w-12 h-12 text-slate-400 mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800">Your Dashboard is empty</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Please complete our conversational career assessment. Our scoring models will map your traits to the perfect path.
              </p>
            </div>
            <Link
              to="/assessment"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-2xl inline-flex items-center gap-1.5 transition-all shadow-sm"
            >
              Start Assessment
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
