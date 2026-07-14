"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNextQuestion = generateNextQuestion;
exports.extractTraits = extractTraits;
exports.generateAnalysisReportAndRoadmap = generateAnalysisReportAndRoadmap;
// 1. Dynamic Adaptive Question Generator
async function generateNextQuestion(chatHistory) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim() !== '') {
        try {
            const prompt = `
You are a conversational AI Career Counsellor. Your goal is to interview a student adaptively to discover their career traits.
Review the chat history so far (first 5 questions are background; follow-up questions should narrow down interest):

CHAT HISTORY:
${chatHistory.map((c) => `${c.role.toUpperCase()}: ${c.text}`).join('\n')}

Task:
Based on their answers, ask the next logical follow-up question.
- If they show technical affinity (e.g. coding), probe deeper (APIs, databases, automation vs frontend).
- If they express dislike for coding or math, pivot to visual design, marketing, copywriting, or management.
- Provide 3-4 distinct multiple-choice options for them to choose from. Emojis may be included in options.
- The question must be constructive, encouraging, and conversational.

You must respond in valid JSON format matching the schema below. Do not wrap in markdown quotes. Just return the JSON object:
{
  "text": "The question text...",
  "type": "MULTIPLE_CHOICE",
  "options": ["Option A", "Option B", "Option C"]
}
      `;
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: 'application/json' },
                }),
            });
            if (response.ok) {
                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    return JSON.parse(text);
                }
            }
        }
        catch (error) {
            console.error('Error generating question via Gemini, falling back:', error);
        }
    }
    // Mock Fallback Adaptive Loop
    return getMockNextQuestion(chatHistory);
}
// 2. Trait Extraction Service
async function extractTraits(chatHistory) {
    const apiKey = process.env.GEMINI_API_KEY;
    const traitNames = [
        'Analytical Thinking',
        'Programming Interest',
        'Creativity',
        'Leadership',
        'Communication',
        'Problem Solving',
        'Mathematics',
        'Business Orientation',
        'Attention to Detail',
        'Curiosity',
    ];
    if (apiKey && apiKey.trim() !== '') {
        try {
            const prompt = `
You are an Industrial-Organizational Psychologist. Analyze the following interview transcript between an AI Advisor and a student.
Rate the student's affinity from 1 to 10 (where 1 is lowest and 10 is highest) for these traits:
${traitNames.join(', ')}

INTERVIEW TRANSCRIPT:
${chatHistory.map((c) => `${c.role.toUpperCase()}: ${c.text}`).join('\n')}

You must respond in valid JSON format matching this schema. Do not write markdown blocks:
{
  "traits": {
    "Analytical Thinking": 8,
    "Programming Interest": 5,
    ...
  }
}
      `;
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: 'application/json' },
                }),
            });
            if (response.ok) {
                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    return JSON.parse(text);
                }
            }
        }
        catch (error) {
            console.error('Gemini trait extraction failed, falling back:', error);
        }
    }
    // Mock Fallback Trait Extractor
    return extractMockTraits(chatHistory);
}
// 3. Upgraded Report and Roadmap Generator
async function generateAnalysisReportAndRoadmap(userProfile, traitScores, topCourses) {
    const apiKey = process.env.GEMINI_API_KEY;
    const primaryCourse = topCourses[0];
    if (apiKey && apiKey.trim() !== '') {
        try {
            const prompt = `
You are a Senior Educational Career Advisor.
Generate a structured, premium-quality career report for a student based on their profile, computed trait scores, and recommended courses.

Student Name: ${userProfile.fullName}

TRAIT SCORES (1-10):
${Object.entries(traitScores).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

RECOMMENDED COURSES (In order of match score):
${topCourses.map((c, i) => `Rank ${i + 1}: ${c.name} (${c.code}) - ${c.description}`).join('\n')}

Generate the report in valid JSON format. Follow this schema exactly:
{
  "summary": "Professional career summary...",
  "personalityInsights": "Deep analysis of their working personality...",
  "strengths": ["Strength A", "Strength B", "Strength C"],
  "weaknesses": ["Area of improvement A", "Area of improvement B"],
  "courseFitExplanations": {
    "${topCourses[0]?.name}": "Why it matches your traits...",
    "${topCourses[1]?.name}": "Why it matches..."
  },
  "skillsToImprove": ["Skill 1", "Skill 2"],
  "personalMotivation": "Paragraph of career advisor encouragement...",
  "weeklyStudyPlan": ["Monday: 2 hours logic...", "Wednesday: ..."],
  "internshipStrategy": "Brief blueprint for securing internships...",
  "resumeTips": ["Include projects like...", "Highlight traits like..."],
  "interviewPrep": ["Question A: Answer tip...", "Question B: ..."],
  "comparisonTop3": "Compare the top 3 recommended options...",
  "roadmap": [
    {
      "title": "Stage 1 Title",
      "duration": "e.g., Month 1-2",
      "description": "Short explanation",
      "milestones": ["Milestone 1", "Milestone 2"],
      "projects": ["Project Name & description"],
      "certifications": ["Certification Name"],
      "resources": {
        "free": ["Free course resource 1"],
        "paid": ["Paid option"],
        "youtube": ["YouTube Channel Name"],
        "books": ["Book Title"],
        "websites": ["Practice website link name"]
      }
    }
  ]
}
      `;
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: 'application/json' },
                }),
            });
            if (response.ok) {
                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    return JSON.parse(text);
                }
            }
        }
        catch (error) {
            console.error('Gemini career report generation failed, falling back:', error);
        }
    }
    // Fallback Premium Mock report
    return getMockReport(userProfile.fullName, traitScores, topCourses);
}
// --- MOCK ADAPTIVE IMPLEMENTATION ENGINES ---
function getMockNextQuestion(chatHistory) {
    // Determine number of user answers in history
    const answeredCount = chatHistory.filter((c) => c.role === 'user').length;
    // Let's analyze prior answers to see if they like coding/building
    const fullTranscript = chatHistory.map((c) => c.text.toLowerCase()).join(' ');
    const dislikesCoding = fullTranscript.includes('never written code') || fullTranscript.includes('dislike') || fullTranscript.includes('visual') || fullTranscript.includes('design');
    const likesBusiness = fullTranscript.includes('business') || fullTranscript.includes('manager') || fullTranscript.includes('campaign');
    // Follow-up loops depending on question index (6 to 25)
    if (dislikesCoding) {
        const designerQuestions = [
            {
                text: 'Do you enjoy visual storytelling and choosing grids, layouts, or color schemes?',
                type: 'MULTIPLE_CHOICE',
                options: ['Yes, visual aesthetics excite me!', 'No, I prefer operational/business roles', 'I prefer organizing team tasks'],
            },
            {
                text: 'When using an app, do you notice visual flaws and think about how they could be placed better?',
                type: 'MULTIPLE_CHOICE',
                options: ['Constantly, I examine user flows', 'Occasionally', 'Rarely, I care more about load speeds'],
            },
            {
                text: 'Which aspect of digital marketing sounds most interesting to you?',
                type: 'MULTIPLE_CHOICE',
                options: ['Writing persuasive copy & SEO', 'Managing ad campaigns & stats', 'Branding and designing graphics'],
            },
            {
                text: 'How do you feel about coordinating deadlines and directing a creative design sprint?',
                type: 'MULTIPLE_CHOICE',
                options: ['I love taking charge of schedules', 'I prefer executing individual assets', 'I like small client presentations'],
            },
        ];
        const index = (answeredCount - 5) % designerQuestions.length;
        return designerQuestions[index];
    }
    else {
        // Technical pathway questions
        const developerQuestions = [
            {
                text: 'What kind of software projects excite you the most to build?',
                type: 'MULTIPLE_CHOICE',
                options: ['Interactive web portals & platforms', 'Native mobile apps on App Stores', 'Scalable cloud databases & scripts'],
            },
            {
                text: 'Have you worked with REST APIs or connected databases in prior trials?',
                type: 'MULTIPLE_CHOICE',
                options: ['Yes, written backend queries', 'Basic experience fetching endpoints', 'No, strictly local scripting'],
            },
            {
                text: 'How comfortable are you reading logs and terminal outputs to debug server issues?',
                type: 'MULTIPLE_CHOICE',
                options: ['I enjoy solving terminal errors', 'I find command-lines overwhelming', 'I can handle basic console alerts'],
            },
            {
                text: 'Do you prefer mathematical modeling (AI) or building robust infrastructure (DevOps)?',
                type: 'MULTIPLE_CHOICE',
                options: ['AI model tuning & stats', 'DevOps networks & pipelines', 'Web application logic'],
            },
        ];
        const index = (answeredCount - 5) % developerQuestions.length;
        return developerQuestions[index];
    }
}
function extractMockTraits(chatHistory) {
    const text = chatHistory.map((c) => c.text.toLowerCase()).join(' ');
    // Default baselines
    const scores = {
        'Analytical Thinking': 6,
        'Programming Interest': 5,
        'Creativity': 5,
        'Leadership': 5,
        'Communication': 6,
        'Problem Solving': 6,
        'Mathematics': 5,
        'Business Orientation': 5,
        'Attention to Detail': 6,
        'Curiosity': 6,
    };
    // Trait deduction logic based on keywords
    if (text.includes('specialist') || text.includes('math') || text.includes('statistic') || text.includes('python')) {
        scores['Analytical Thinking'] += 3;
        scores['Mathematics'] += 4;
    }
    if (text.includes('code') || text.includes('api') || text.includes('program') || text.includes('web')) {
        scores['Programming Interest'] += 4;
        scores['Problem Solving'] += 3;
    }
    if (text.includes('designer') || text.includes('visual') || text.includes('layout') || text.includes('figma')) {
        scores['Creativity'] += 4;
        scores['Attention to Detail'] += 2;
        scores['Programming Interest'] -= 2;
    }
    if (text.includes('manager') || text.includes('lead') || text.includes('coordinate') || text.includes('charge')) {
        scores['Leadership'] += 4;
        scores['Communication'] += 2;
        scores['Business Orientation'] += 2;
    }
    if (text.includes('marketing') || text.includes('ads') || text.includes('persuade') || text.includes('branding')) {
        scores['Business Orientation'] += 4;
        scores['Communication'] += 3;
        scores['Creativity'] += 2;
    }
    if (text.includes('server') || text.includes('cloud') || text.includes('docker') || text.includes('outage')) {
        scores['Problem Solving'] += 3;
        scores['Attention to Detail'] += 2;
        scores['Curiosity'] += 2;
    }
    // Clamp values between 1 and 10
    const traits = {};
    for (const [key, val] of Object.entries(scores)) {
        traits[key] = Math.max(1, Math.min(10, val));
    }
    return { traits };
}
function getMockReport(userName, traitScores, topCourses) {
    const primary = topCourses[0];
    const primaryName = primary?.name || 'Full-Stack Web Development';
    return {
        summary: `Based on an adaptive evaluation, ${userName} exhibits key cognitive patterns matching the ${primaryName} track. Their high scores in problem-solving and focus dynamics support technical success.`,
        personalityInsights: `You display features of an Analytical Organizer. You perform best in projects where logic, structured execution, and visual feedbacks are aligned.`,
        strengths: [
            'Deconstructs complex architectures into modular deliverables',
            'High visual sensitivity to user-facing interaction workflows',
            'Strong logical debugging persistence',
        ],
        weaknesses: [
            'Tends to overcomplicate backend schemas in early sprints',
            'Could study network load-balancing options in more detail',
        ],
        courseFitExplanations: {
            [topCourses[0]?.name || 'Course 1']: 'Direct match with your high logical reasoning scores and interest in product engineering.',
            [topCourses[1]?.name || 'Course 2']: 'Matches your data analysis profile and interest in structured pipelines.',
        },
        skillsToImprove: ['TypeScript strict types compilation', 'Git flow and pull requests management', 'Docker system containerization'],
        personalMotivation: `Switching to ${primaryName} gives you a solid workspace to combine analytical scripting with practical product creation. Keep consistency in code exercises, and you will thrive!`,
        weeklyStudyPlan: [
            'Monday: 2 hours - Core logic and system syntax',
            'Wednesday: 2 hours - Sandboxed project implementation',
            'Friday: 2 hours - Testing and codebase commits review',
            'Saturday: 3 hours - Portfolio project build assembly',
        ],
        internshipStrategy: `Build 3 high-quality standalone projects on GitHub. Reach out directly to startup CTOs on LinkedIn offering support on system prototypes.`,
        resumeTips: [
            'Highlight concrete metrics (e.g. reduced load times by 20%)',
            'Include links to hosted projects, not just code repositories',
        ],
        interviewPrep: [
            'Explain structural layout principles: be prepared to walk through your grid logic.',
            'How do you debug an API error: demonstrate structured investigation steps.',
        ],
        comparisonTop3: `The top matches offer distinct careers: #${topCourses[0]?.name} is a builder role; #${topCourses[1]?.name} is an analytics role; #${topCourses[2]?.name} focuses on layout aesthetics.`,
        roadmap: [
            {
                title: 'Stage 1: Core Fundamentals & Sandboxing',
                duration: 'Month 1-2',
                description: 'Establish basic coding structures, command line tools, and layout guidelines.',
                milestones: ['Write 20 standalone functions', 'Build responsive structural interface'],
                projects: ['Personal contact list API', 'Product landing design prototype'],
                certifications: ['FreeCodeCamp Developer foundations'],
                resources: {
                    free: ['CS50 Introduction to Computer Science'],
                    paid: ['Udemy developer courses'],
                    youtube: ['freeCodeCamp.org', 'Traversy Media'],
                    books: ['Eloquent JavaScript'],
                    websites: ['javascript.info', 'roadmap.sh'],
                },
            },
            {
                title: 'Stage 2: Advanced Integrations & Frameworks',
                duration: 'Month 3-4',
                description: 'Work with state parameters, route setups, and database drivers.',
                milestones: ['Integrate SQL storage', 'Deploy client live in the cloud'],
                projects: ['SaaS dashboard client dashboard clone'],
                certifications: ['AWS Cloud Practitioner'],
                resources: {
                    free: ['Full Stack Open course'],
                    paid: ['Frontend Masters'],
                    youtube: ['Web Dev Simplified', 'Net Ninja'],
                    books: ['Designing Data-Intensive Applications'],
                    websites: ['leetcode.com', 'typescriptlang.org'],
                },
            },
        ],
    };
}
