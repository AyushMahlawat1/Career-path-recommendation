import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function calculateCourseScores(assessmentId: string) {
  // 1. Fetch student trait scores for this assessment
  const traitScores = await prisma.traitScore.findMany({
    where: { assessmentId },
    include: {
      trait: true,
    },
  });

  if (traitScores.length === 0) {
    throw new Error('No trait scores found for this assessment. Cannot run matching engine.');
  }

  // 2. Fetch all courses with their trait weights
  const courses = await prisma.course.findMany({
    include: {
      traitWeights: {
        include: {
          trait: true,
        },
      },
    },
  });

  const scoresList: Array<{ courseId: string; score: number }> = [];

  // 3. Calculate score for each course
  for (const course of courses) {
    let totalScore = 0;

    for (const tw of course.traitWeights) {
      // Find the corresponding student trait score for this trait
      const studentScoreRecord = traitScores.find((ts) => ts.traitId === tw.traitId);
      const studentScore = studentScoreRecord ? studentScoreRecord.score : 0;

      // Score += Trait Score * Course Weight
      totalScore += studentScore * tw.weight;
    }

    scoresList.push({
      courseId: course.id,
      score: parseFloat(totalScore.toFixed(2)),
    });
  }

  // 4. Sort courses by score descending
  const sortedCourses = scoresList.sort((a, b) => b.score - a.score);

  // 5. Return Top 5 course recommendations with rank indices
  return sortedCourses.slice(0, 5).map((item, index) => ({
    courseId: item.courseId,
    score: item.score,
    rank: index + 1,
  }));
}
