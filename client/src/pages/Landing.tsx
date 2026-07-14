import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Code, Cpu, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const showcaseTracks = [
    {
      icon: Cpu,
      tag: '# INTELLIGENT MATCH',
      title: 'AI & Data Science Track',
      description: 'Explore your affinity for mathematical modeling, predictive analysis, and intelligent system design through interactive scenarios.',
      action: 'INITIALIZE EVALUATION ENGINE →'
    },
    {
      icon: Code,
      tag: '# FULL-STACK',
      title: 'Software Architecture Track',
      description: 'Assess logic pathways, structural reasoning, and software development patterns to verify your engineering potential.',
      action: 'INITIALIZE EVALUATION ENGINE →'
    },
    {
      icon: Target,
      tag: '# LEADERSHIP',
      title: 'Product & Design Strategy',
      description: 'Discover your strengths in visual aesthetics, human-computer interaction, product reasoning, and strategic execution.',
      action: 'INITIALIZE EVALUATION ENGINE →'
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-73px)] flex flex-col justify-between bg-white text-slate-900 font-sans">
      {/* Soft gradient background glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[35rem] h-[35rem] rounded-full bg-slate-500/5 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[40rem] h-[40rem] rounded-full bg-slate-400/5 blur-[130px]" />
      </div>

      <main className="max-w-7xl mx-auto px-6 py-16 flex-grow flex flex-col justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-slate-200 bg-slate-50/80 text-slate-800 text-xs font-semibold mb-6 tracking-wide"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            CAREERMAP DYNAMIC EVALUATION ENGINE
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-display font-medium tracking-tight leading-tight sm:leading-[1.1] mb-6 text-slate-950"
          >
            Master Your <span className="font-serif italic font-semibold text-slate-900">Future</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto font-normal leading-relaxed mb-8"
          >
            Select a specialized track to begin your interactive assessment.
            Unlock your personalized career roadmap upon completion.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-8 rounded-full transition-all shadow-sm shadow-slate-900/10"
            >
              Start Free Assessment
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-8 rounded-full border border-slate-200 shadow-sm transition-colors"
            >
              Sign In
            </Link>
          </motion.div>
        </div>

        {/* Tracks Grid (Inspired by SSI layout but in a crisp light theme) */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {showcaseTracks.map((track, index) => {
            const Icon = track.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="bg-white p-8 rounded-[24px] border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.035)] hover:border-slate-300 transition-all duration-300 flex flex-col justify-between items-start min-h-[300px] group"
              >
                <div className="w-full flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 bg-slate-50 border border-slate-100 py-1 px-2.5 rounded-full">
                    {track.tag}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-xl font-display font-semibold text-slate-900 mb-3">{track.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-sans mb-6">{track.description}</p>
                </div>

                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 tracking-wider uppercase group-hover:text-slate-600 transition-colors"
                >
                  {track.action}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Info Banner */}
        <div className="max-w-4xl mx-auto text-center border-t border-slate-100 pt-12 mt-12">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Scientific Onboarding Parameters</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center opacity-70">
            <span className="font-semibold text-slate-600 tracking-tight text-xs">30+ Assessment Questions</span>
            <span className="font-semibold text-slate-600 tracking-tight text-xs">10 Evaluated Traits</span>
            <span className="font-semibold text-slate-600 tracking-tight text-xs">Rule-Based Weighted Scoring</span>
            <span className="font-semibold text-slate-600 tracking-tight text-xs">Personalized AI Roadmaps</span>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-8 text-center text-xs text-slate-400 bg-white">
        <p>© {new Date().getFullYear()} CareerMap.ai. All rights reserved. Professional Career Recommendations.</p>
      </footer>
    </div>
  );
}
