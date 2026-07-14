import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database v2.0...');

  // Delete records in reverse order of dependencies
  await prisma.resource.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.progress.deleteMany({});
  await prisma.roadmap.deleteMany({});
  await prisma.careerReport.deleteMany({});
  await prisma.recommendation.deleteMany({});
  await prisma.traitScore.deleteMany({});
  await prisma.assessmentResponse.deleteMany({});
  await prisma.aIConversation.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.courseTraitWeight.deleteMany({});
  await prisma.trait.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Seed Users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@careermap.com',
      fullName: 'System Administrator',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const student = await prisma.user.create({
    data: {
      email: 'student@careermap.com',
      fullName: 'Alex Coder',
      passwordHash,
      role: 'STUDENT',
    },
  });

  console.log('Users seeded');

  // 2. Seed Courses
  const coursesData = [
    {
      name: 'Full-Stack Web Development',
      code: 'FSWD',
      description: 'Master front-end interfaces and robust backend engineering to build production-scale web applications.',
      category: 'Software Engineering',
      difficulty: 'Intermediate',
      duration: '6 Months',
      potentialSalary: '$85,000 - $130,000',
    },
    {
      name: 'Data Science & Artificial Intelligence',
      code: 'DSAI',
      description: 'Learn statistical modeling, machine learning algorithms, and deep neural networks to build intelligent applications.',
      category: 'Data & AI',
      difficulty: 'Advanced',
      duration: '8 Months',
      potentialSalary: '$95,000 - $150,000',
    },
    {
      name: 'UI/UX & Product Design',
      code: 'UIUX',
      description: 'Focus on user interface design, user experience research, wireframing, and interactive design aesthetics.',
      category: 'Design',
      difficulty: 'Beginner',
      duration: '4 Months',
      potentialSalary: '$70,000 - $110,000',
    },
    {
      name: 'Cloud Computing & DevOps',
      code: 'CLDV',
      description: 'Build scalable cloud infrastructure, automate deployment pipelines, and maintain system reliability.',
      category: 'Infrastructure',
      difficulty: 'Advanced',
      duration: '6 Months',
      potentialSalary: '$90,000 - $145,000',
    },
    {
      name: 'Cybersecurity Specialist',
      code: 'CYBR',
      description: 'Learn threat modeling, network security, penetration testing, and digital forensics to secure enterprise assets.',
      category: 'Security',
      difficulty: 'Advanced',
      duration: '7 Months',
      potentialSalary: '$88,000 - $140,000',
    },
    {
      name: 'Digital Marketing & Brand Strategy',
      code: 'DMBS',
      description: 'Understand consumer psychology, SEO, campaign execution, data metrics, and brand storytelling.',
      category: 'Business & Marketing',
      difficulty: 'Beginner',
      duration: '3 Months',
      potentialSalary: '$60,000 - $95,000',
    },
    {
      name: 'Product Management & Business Analysis',
      code: 'PMBA',
      description: 'Bridge the gap between technology and business by orchestrating product lifecycles, user stories, and requirements.',
      category: 'Business & Management',
      difficulty: 'Intermediate',
      duration: '5 Months',
      potentialSalary: '$90,000 - $135,000',
    },
    {
      name: 'Mobile App Development (iOS & Android)',
      code: 'MADV',
      description: 'Build native and cross-platform mobile experiences for iOS and Android platforms using modern SDKs.',
      category: 'Software Engineering',
      difficulty: 'Intermediate',
      duration: '5 Months',
      potentialSalary: '$80,000 - $125,000',
    },
  ];

  const courses: { [key: string]: any } = {};
  for (const c of coursesData) {
    courses[c.code] = await prisma.course.create({ data: c });
  }
  console.log('Courses seeded');

  // 3. Seed Traits
  const traitsData = [
    { name: 'Analytical Thinking', description: 'Logical structure reasoning and deductive analysis' },
    { name: 'Programming Interest', description: 'Interest in writing algorithms and code components' },
    { name: 'Creativity', description: 'Expression, styling grids, aesthetics, and copywriting' },
    { name: 'Leadership', description: 'Coordinating people, tracking timelines, and planning product targets' },
    { name: 'Communication', description: 'Presenting, negotiating scopes, and social interactions' },
    { name: 'Problem Solving', description: 'Troubleshooting errors, logs, and systems failures' },
    { name: 'Mathematics', description: 'Quantitative statistics, probabilities, and algebra models' },
    { name: 'Business Orientation', description: 'Economics, startup structures, advertising, and marketing strategies' },
    { name: 'Attention to Detail', description: 'Audit protocols, syntax accuracy, and layout adjustments' },
    { name: 'Curiosity', description: 'Desire to study how frameworks operate and explore technical depths' },
  ];

  const traits: { [key: string]: any } = {};
  for (const t of traitsData) {
    traits[t.name] = await prisma.trait.create({ data: t });
  }
  console.log('Traits seeded');

  // 4. Seed CourseTraitWeights Matrix
  const weightsMatrix: { [courseCode: string]: { [traitName: string]: number } } = {
    FSWD: {
      'Programming Interest': 10,
      'Problem Solving': 9,
      'Analytical Thinking': 8,
      'Attention to Detail': 7,
      'Curiosity': 8,
      'Creativity': 6,
      'Communication': 5,
      'Mathematics': 5,
      'Leadership': 4,
      'Business Orientation': 4,
    },
    DSAI: {
      'Analytical Thinking': 10,
      'Mathematics': 10,
      'Problem Solving': 9,
      'Curiosity': 9,
      'Programming Interest': 8,
      'Attention to Detail': 8,
      'Creativity': 4,
      'Communication': 4,
      'Leadership': 3,
      'Business Orientation': 3,
    },
    UIUX: {
      'Creativity': 10,
      'Curiosity': 9,
      'Attention to Detail': 9,
      'Communication': 8,
      'Problem Solving': 7,
      'Business Orientation': 6,
      'Leadership': 5,
      'Analytical Thinking': 5,
      'Programming Interest': 1,
      'Mathematics': 1,
    },
    CLDV: {
      'Problem Solving': 9,
      'Analytical Thinking': 8,
      'Attention to Detail': 8,
      'Curiosity': 8,
      'Programming Interest': 7,
      'Mathematics': 6,
      'Communication': 5,
      'Leadership': 5,
      'Business Orientation': 4,
      'Creativity': 3,
    },
    CYBR: {
      'Attention to Detail': 10,
      'Problem Solving': 9,
      'Analytical Thinking': 9,
      'Curiosity': 9,
      'Programming Interest': 7,
      'Mathematics': 7,
      'Communication': 5,
      'Leadership': 4,
      'Business Orientation': 3,
      'Creativity': 3,
    },
    DMBS: {
      'Communication': 10,
      'Business Orientation': 9,
      'Creativity': 8,
      'Curiosity': 8,
      'Attention to Detail': 6,
      'Problem Solving': 6,
      'Analytical Thinking': 6,
      'Leadership': 6,
      'Programming Interest': 1,
      'Mathematics': 1,
    },
    PMBA: {
      'Leadership': 10,
      'Communication': 10,
      'Business Orientation': 9,
      'Problem Solving': 8,
      'Analytical Thinking': 7,
      'Curiosity': 8,
      'Attention to Detail': 7,
      'Creativity': 6,
      'Mathematics': 4,
      'Programming Interest': 3,
    },
    MADV: {
      'Programming Interest': 9,
      'Problem Solving': 8,
      'Curiosity': 8,
      'Creativity': 7,
      'Attention to Detail': 7,
      'Analytical Thinking': 7,
      'Communication': 6,
      'Business Orientation': 5,
      'Mathematics': 4,
      'Leadership': 4,
    },
  };

  for (const courseCode in weightsMatrix) {
    const course = courses[courseCode];
    const mappings = weightsMatrix[courseCode];

    for (const traitName in mappings) {
      const trait = traits[traitName];
      await prisma.courseTraitWeight.create({
        data: {
          courseId: course.id,
          traitId: trait.id,
          weight: mappings[traitName],
        },
      });
    }
  }
  console.log('CourseTraitWeights seeded');

  // 5. Seed 5 Fixed Baseline Questions
  const fixedQuestions = [
    {
      text: 'What is your current highest education qualification?',
      category: 'Education',
      type: 'MULTIPLE_CHOICE',
      orderIndex: 1,
      options: ['High School / Secondary School', 'Undergraduate Student (Bachelors)', 'Postgraduate Student (Masters / Ph.D.)', 'Working Professional seeking transition'],
    },
    {
      text: 'Which academic stream did you study in High School?',
      category: 'School Stream',
      type: 'MULTIPLE_CHOICE',
      orderIndex: 2,
      options: ['Science (Physics, Chemistry, Maths)', 'Commerce / Economics', 'Arts / Humanities', 'Other / Vocational'],
    },
    {
      text: 'What is your current semester or year of study?',
      category: 'Current Semester',
      type: 'MULTIPLE_CHOICE',
      orderIndex: 3,
      options: ['First Year / Beginning', 'Second or Third Year', 'Final Year / Graduating Soon', 'Not applicable (Working Professional/Not in school)'],
    },
    {
      text: 'What is your current experience level with digital projects or building software?',
      category: 'Previous Experience',
      type: 'MULTIPLE_CHOICE',
      orderIndex: 4,
      options: ['Absolute Beginner (Never built a project)', 'Novice (Created simple scripts/HTML pages)', 'Intermediate (Built full apps or styled interfaces)', 'Advanced (Deployed software and code databases)'],
    },
    {
      text: 'What is your primary long-term career goal?',
      category: 'Career Goals',
      type: 'MULTIPLE_CHOICE',
      orderIndex: 5,
      options: ['Technical Specialist (Principal Coder/Architect)', 'Creative Strategist (UIUX Lead/Designer)', 'Managerial Leader (Product Manager/Director)', 'Growth Specialist (Founder/Digital Agency Lead)'],
    },
  ];

  for (const fq of fixedQuestions) {
    await prisma.question.create({
      data: {
        text: fq.text,
        category: fq.category,
        type: fq.type,
        orderIndex: fq.orderIndex,
        options: JSON.stringify(fq.options),
      },
    });
  }

  console.log('Fixed questions seeded successfully.');
  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
