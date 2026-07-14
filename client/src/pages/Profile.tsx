import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Briefcase, ArrowRight } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [level, setLevel] = useState<string>('Absolute Beginner');

  const options = [
    {
      id: 'Absolute Beginner',
      title: 'Absolute Beginner',
      subtitle: 'Starting from scratch',
      description: 'I have little to no experience in programming, design, or business. I want to build a foundation.',
      icon: BookOpen,
      color: 'text-slate-800',
      bgColor: 'bg-slate-50',
    },
    {
      id: 'Experienced Student',
      title: 'Experienced Student',
      subtitle: 'In school or self-studying',
      description: 'I know basic coding, design rules or business definitions. I want to specialize and build my portfolio.',
      icon: GraduationCap,
      color: 'text-slate-800',
      bgColor: 'bg-slate-50',
    },
    {
      id: 'Working Professional',
      title: 'Working Professional',
      subtitle: 'Changing careers',
      description: 'I work in another field or have industry experience. I want a focused roadmap to transition into technology.',
      icon: Briefcase,
      color: 'text-slate-800',
      bgColor: 'bg-slate-50',
    },
  ];

  const handleProceed = () => {
    localStorage.setItem('career_student_level', level);
    navigate('/assessment');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 min-h-[calc(100vh-73px)] flex flex-col justify-center bg-white">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 bg-slate-50 border border-slate-100 py-1 px-3 rounded-full">Step 1 of 2</span>
        <h1 className="text-4xl font-display font-medium text-slate-950 mt-4">Welcome to CareerMap</h1>
        <p className="text-sm text-slate-500 mt-3 font-sans leading-relaxed">
          Before we begin the conversational career assessment, help us understand your current career standing. This determines the starting point and resource depth of your roadmap.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = level === opt.id;

          return (
            <div
              key={opt.id}
              onClick={() => setLevel(opt.id)}
              className={`cursor-pointer bg-white p-7 rounded-[24px] border transition-all duration-300 flex flex-col justify-between h-68 ${
                isSelected 
                  ? 'border-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.02)] ring-1 ring-slate-900' 
                  : 'border-slate-200 hover:border-slate-300 shadow-[0_4px_20px_rgb(0,0,0,0.005)]'
              }`}
            >
              <div>
                <div className={`w-10 h-10 rounded-xl ${opt.bgColor} ${opt.color} border border-slate-100 flex items-center justify-center mb-5`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-slate-900 text-base">{opt.title}</h3>
                <span className="text-xs text-slate-400 font-medium block mt-0.5">{opt.subtitle}</span>
                <p className="text-xs text-slate-500 leading-relaxed mt-4 font-sans">{opt.description}</p>
              </div>

              <div className="flex justify-end pt-4">
                <input
                  type="radio"
                  name="student-level"
                  checked={isSelected}
                  onChange={() => setLevel(opt.id)}
                  className="w-4 h-4 text-slate-900 focus:ring-slate-900 border-slate-300"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleProceed}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-8 rounded-full transition-all shadow-sm shadow-slate-900/10 text-sm"
        >
          Proceed to Career Assessment
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
