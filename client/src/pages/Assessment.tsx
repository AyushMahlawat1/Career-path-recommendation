import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, ArrowRight, MessageSquare, Award } from 'lucide-react';
import { assessmentApi, Question } from '../utils/api';

interface Message {
  role: 'assistant' | 'user';
  text: string;
  options?: string[];
  type?: 'MULTIPLE_CHOICE' | 'LIKERT' | 'SCENARIO';
}

export default function Assessment() {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showCompleteEarly, setShowCompleteEarly] = useState<boolean>(false);
  
  // UI Status Screens
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);

  const stepsText = [
    'Parsing conversational context...',
    'Extracting cognitive career traits...',
    'Running weighted scoring algorithms...',
    'Assembling course match recommendations...',
    'Synthesizing personalized study roadmap...',
    'Finalizing reports compilation...'
  ];

  // Start Assessment Session
  const startMutation = useMutation({
    mutationFn: assessmentApi.start,
    onSuccess: (data) => {
      setAssessmentId(data.assessmentId);
      setQuestionIndex(data.questionIndex);
      setCurrentQuestion(data.question);
      
      // Seed first advisor bubble
      setIsTyping(true);
      setTimeout(() => {
        setMessages([
          {
            role: 'assistant',
            text: `Hi there! 👋 I'm your AI Career Advisor. Let's explore your interests, abilities, and goals to match you with the perfect career path.`,
          },
          {
            role: 'assistant',
            text: data.question.text,
            options: data.question.options,
            type: data.question.type,
          }
        ]);
        setIsTyping(false);
      }, 800);
    },
  });

  // Post Answer Mutation
  const answerMutation = useMutation({
    mutationFn: assessmentApi.answer,
    onSuccess: (data) => {
      setQuestionIndex(data.questionIndex);
      setCurrentQuestion(data.question);
      
      // Let advisor type next question
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.question.text,
            options: data.question.options,
            type: data.question.type,
          }
        ]);
        setIsTyping(false);
      }, 700);

      // Show complete early option after 15 questions
      if (data.questionIndex >= 15) {
        setShowCompleteEarly(true);
      }
      
      // Automatically finish at 25 questions
      if (data.questionIndex > 25) {
        handleCompleteEarly();
      }
    },
  });

  // Final Complete Mutation
  const completeMutation = useMutation({
    mutationFn: assessmentApi.complete,
    onSuccess: () => {
      navigate('/report');
    },
  });

  useEffect(() => {
    startMutation.mutate();
  }, []);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Loading stepper simulator
  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setAnalysisStep((prev) => {
          if (prev >= stepsText.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  const handleSelectOption = (optionText: string) => {
    if (!assessmentId || !currentQuestion) return;

    // Append user response to chat
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: optionText,
      }
    ]);

    // Send to backend
    answerMutation.mutate({
      assessmentId,
      questionText: currentQuestion.text,
      answerText: optionText,
    });
  };

  const handleCompleteEarly = () => {
    if (!assessmentId) return;
    setIsAnalyzing(true);
    completeMutation.mutate({ assessmentId });
  };

  // Render Likert Row
  const renderLikertOptions = () => {
    const likertScale = [
      { label: 'Strongly Disagree', val: 'Strongly Disagree' },
      { label: 'Disagree', val: 'Disagree' },
      { label: 'Neutral', val: 'Neutral' },
      { label: 'Agree', val: 'Agree' },
      { label: 'Strongly Agree', val: 'Strongly Agree' }
    ];

    return (
      <div className="grid grid-cols-5 gap-2 max-w-xl mx-auto mt-4 px-2">
        {likertScale.map((item) => (
          <button
            key={item.val}
            onClick={() => handleSelectOption(item.val)}
            disabled={answerMutation.isPending}
            className="flex flex-col items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-600 hover:bg-blue-50/20 active:scale-95 transition-all text-center min-h-[90px]"
          >
            <span className="text-xs font-semibold text-slate-700">{item.label}</span>
          </button>
        ))}
      </div>
    );
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-[32px] border border-slate-100 shadow-[0_12px_40px_rgb(0,0,0,0.015)]">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-14 h-14 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
            <Sparkles className="w-5 h-5 text-slate-900 absolute animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-semibold text-slate-900">Analyzing Potential</h2>
            <p className="text-sm text-slate-400 max-w-xs mx-auto font-sans leading-relaxed">
              Evaluating interview metrics against recommended weight schemas...
            </p>
          </div>

          {/* Stepper Status Indicators */}
          <div className="text-left space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100 text-xs font-sans">
            {stepsText.map((step, idx) => (
              <div key={step} className="flex items-center gap-3">
                {analysisStep > idx ? (
                  <div className="w-4 h-4 rounded-full bg-slate-950 text-white flex items-center justify-center text-[9px] font-bold">✓</div>
                ) : analysisStep === idx ? (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-slate-200"></div>
                )}
                <span className={`${analysisStep === idx ? 'text-slate-950 font-semibold' : 'text-slate-400'}`}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-white flex flex-col justify-between">
      {/* Dynamic Header */}
      <header className="sticky top-[73px] z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-slate-900" />
          <span className="font-display font-medium text-slate-900 text-sm">AI Career Interview</span>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5 text-xs text-slate-400 font-sans">
            <span>Progress: {questionIndex} / 25</span>
            <div className="w-24 bg-slate-100 h-1 rounded-full overflow-hidden border border-slate-200/40">
              <div 
                className="bg-slate-900 h-full transition-all duration-300" 
                style={{ width: `${Math.min(100, (questionIndex / 25) * 100)}%` }}
              ></div>
            </div>
          </div>

          {showCompleteEarly && (
            <button
              onClick={handleCompleteEarly}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-full flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Award className="w-4 h-4" />
              Analyze Careers Now
            </button>
          )}
        </div>
      </header>

      {/* Conversations log */}
      <main className="flex-grow max-w-3xl w-full mx-auto px-6 py-8 space-y-6 overflow-y-auto min-h-[400px]">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex flex-col max-w-[80%] items-start">
              {msg.role === 'assistant' && (
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1 ml-1 font-sans">
                  AI Advisor
                </span>
              )}
              
              <div
                className={`p-4 px-5 rounded-[20px] leading-relaxed text-sm font-sans ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex flex-col items-start">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1 ml-1 font-sans">
                AI Advisor
              </span>
              <div className="bg-slate-50 border border-slate-100 p-4 px-5 rounded-[20px] rounded-tl-none flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* User Response Controls Footer */}
      <footer className="sticky bottom-0 bg-white border-t border-slate-100 p-6 pb-8 flex flex-col items-center">
        {!isTyping && currentQuestion && (
          <div className="w-full max-w-3xl">
            {currentQuestion.type === 'LIKERT' ? (
              renderLikertOptions()
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelectOption(option)}
                    disabled={answerMutation.isPending}
                    className="p-4 px-5 bg-white text-slate-800 border border-slate-200 rounded-[20px] hover:border-slate-900 active:scale-[0.99] transition-all text-left text-xs font-semibold flex justify-between items-center group font-sans shadow-[0_2px_12px_rgb(0,0,0,0.005)]"
                  >
                    <span>{option}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}
