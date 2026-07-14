import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

// 1. Get Analytics Summary
export async function getAnalytics(req: AuthenticatedRequest, res: Response) {
  try {
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalAssessments = await prisma.assessment.count({ where: { status: 'COMPLETED' } });
    
    // Calculate course popularity
    const recommendations = await prisma.recommendation.findMany({
      include: {
        course: true,
      },
    });

    const popularCoursesMap: { [courseName: string]: number } = {};
    recommendations.forEach((rec) => {
      // Weight by rank (rank 1 counts as 5 points, rank 2 as 4 points... etc.)
      const points = 6 - rec.rank;
      popularCoursesMap[rec.course.name] = (popularCoursesMap[rec.course.name] || 0) + points;
    });

    const popularCourses = Object.entries(popularCoursesMap)
      .map(([name, points]) => ({ name, points }))
      .sort((a, b) => b.points - a.points);

    res.json({
      totalStudents,
      totalAssessments,
      popularCourses,
    });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

// 2. Export Assessment Reports (Returns JSON structure of all completed reports)
export async function exportReports(req: AuthenticatedRequest, res: Response) {
  try {
    const assessments = await prisma.assessment.findMany({
      where: { status: 'COMPLETED' },
      include: {
        user: {
          select: { fullName: true, email: true },
        },
        recommendations: {
          orderBy: { rank: 'asc' },
          include: { course: true },
        },
        careerReport: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedAssessments = assessments.map((a) => {
      if (a.careerReport) {
        return {
          ...a,
          careerReport: {
            ...a.careerReport,
            strengths: JSON.parse(a.careerReport.strengths),
            weaknesses: JSON.parse(a.careerReport.weaknesses),
            courseFitExplanations: JSON.parse(a.careerReport.courseFitExplanations),
            skillsToImprove: JSON.parse(a.careerReport.skillsToImprove),
            weeklyStudyPlan: JSON.parse(a.careerReport.weeklyStudyPlan || '[]'),
            resumeTips: JSON.parse(a.careerReport.resumeTips || '[]'),
            interviewPrep: JSON.parse(a.careerReport.interviewPrep || '[]'),
          },
        };
      }
      return a;
    });

    res.json(formattedAssessments);
  } catch (error) {
    console.error('Error exporting reports:', error);
    res.status(500).json({ error: 'Failed to export reports' });
  }
}

// 3. User Management
export async function getUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users list' });
  }
}

export async function deleteUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    if (id === req.user?.id) {
      return res.status(400).json({ error: 'You cannot delete yourself' });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}

// 4. Questions CRUD
export async function getQuestions(req: AuthenticatedRequest, res: Response) {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { orderIndex: 'asc' },
    });
    
    const formatted = questions.map((q) => ({
      ...q,
      options: JSON.parse(q.options),
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching admin questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
}

export async function createQuestion(req: AuthenticatedRequest, res: Response) {
  try {
    const { text, type, category, orderIndex, options } = req.body;

    const question = await prisma.question.create({
      data: {
        text,
        type,
        category,
        orderIndex: orderIndex || 0,
        options: JSON.stringify(options || []),
      },
    });

    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
}

export async function updateQuestion(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { text, type, category, orderIndex, options } = req.body;

    const question = await prisma.question.update({
      where: { id },
      data: {
        text,
        type,
        category,
        orderIndex: parseInt(orderIndex) || 0,
        options: JSON.stringify(options || []),
      },
    });

    res.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
}

export async function deleteQuestion(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.question.delete({ where: { id } });
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
}

// 5. CourseTraitWeights Matrix Management
export async function getWeightMatrix(req: AuthenticatedRequest, res: Response) {
  try {
    const courses = await prisma.course.findMany({ select: { id: true, name: true, code: true } });
    const traits = await prisma.trait.findMany();
    const weights = await prisma.courseTraitWeight.findMany();

    res.json({
      courses,
      traits,
      weights,
    });
  } catch (error) {
    console.error('Error fetching weight matrix:', error);
    res.status(500).json({ error: 'Failed to fetch weight matrix' });
  }
}

export async function updateOptionWeight(req: AuthenticatedRequest, res: Response) {
  try {
    const { courseId, traitId, weight } = req.body;

    if (!courseId || !traitId || weight === undefined) {
      return res.status(400).json({ error: 'courseId, traitId and weight are required' });
    }

    const traitWeight = await prisma.courseTraitWeight.upsert({
      where: {
        courseId_traitId: { courseId, traitId },
      },
      update: {
        weight: parseFloat(weight),
      },
      create: {
        courseId,
        traitId,
        weight: parseFloat(weight),
      },
    });

    res.json(traitWeight);
  } catch (error) {
    console.error('Error updating trait weight:', error);
    res.status(500).json({ error: 'Failed to update weight' });
  }
}

// 6. Courses CRUD
export async function getCourses(req: AuthenticatedRequest, res: Response) {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(courses);
  } catch (error) {
    console.error('Error listing courses:', error);
    res.status(500).json({ error: 'Failed to list courses' });
  }
}

export async function createCourse(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, code, description, category, difficulty, duration, potentialSalary } = req.body;

    const course = await prisma.course.create({
      data: {
        name,
        code,
        description,
        category,
        difficulty,
        duration,
        potentialSalary,
      },
    });

    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
}

export async function updateCourse(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, code, description, category, difficulty, duration, potentialSalary } = req.body;

    const course = await prisma.course.update({
      where: { id },
      data: {
        name,
        code,
        description,
        category,
        difficulty,
        duration,
        potentialSalary,
      },
    });

    res.json(course);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
}

export async function deleteCourse(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    await prisma.course.delete({ where: { id } });
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
}
