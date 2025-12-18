
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Calculate match percentage based on profile and job
function calculateMatch(profile: any, job: any): number {
  let matchScore = 0;
  let totalWeight = 0;

  // Check profile completeness (20%)
  totalWeight += 20;
  if (profile.resumeUrl) matchScore += 10;
  if (profile.experiences && profile.experiences.length > 0) matchScore += 5;
  if (profile.skills && profile.skills.length > 0) matchScore += 5;

  // Check location match (15%)
  totalWeight += 15;
  if (job.city && profile.city) {
    if (job.city.toLowerCase() === profile.city.toLowerCase()) {
      matchScore += 15;
    } else if (job.state && profile.state && job.state.toLowerCase() === profile.state.toLowerCase()) {
      matchScore += 8;
    }
  }

  // Check education level (15%)
  totalWeight += 15;
  if (profile.education && profile.education.length > 0) {
    matchScore += 15;
  }

  // Check relevant experience (25%)
  totalWeight += 25;
  if (profile.experiences && profile.experiences.length > 0) {
    const hasRelevantExperience = (profile.experiences as any[]).some(exp => {
      const titleMatch = exp.jobTitle?.toLowerCase().includes(job.title.split(' ')[0].toLowerCase());
      const descMatch = exp.description?.toLowerCase().includes(job.title.split(' ')[0].toLowerCase());
      return titleMatch || descMatch;
    });
    
    if (hasRelevantExperience) {
      matchScore += 25;
    } else {
      matchScore += 12; // Has experience, but not directly relevant
    }
  }

  // Check skills match (25%)
  totalWeight += 25;
  if (job.criteria && job.criteria.length > 0 && profile.skills && profile.skills.length > 0) {
    const profileSkills = (profile.skills as any[]).map(s => s.skillName.toLowerCase());
    const jobSkills = (job.criteria as any[])
      .filter(c => c.category === "Habilidades Técnicas" || c.category === "Habilidades")
      .map(c => c.name.toLowerCase());
    
    if (jobSkills.length > 0) {
      const matchingSkills = jobSkills.filter(js => 
        profileSkills.some(ps => ps.includes(js) || js.includes(ps))
      );
      const skillMatch = (matchingSkills.length / jobSkills.length) * 25;
      matchScore += skillMatch;
    } else {
      matchScore += 12; // No specific skills required
    }
  }

  return Math.round((matchScore / totalWeight) * 100);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (userRole !== "candidate") {
      return NextResponse.json(
        { error: "Apenas candidatos podem acessar esta funcionalidade" },
        { status: 403 }
      );
    }

    // Get candidate profile with related data
    const profile = await db.candidateProfile.findUnique({
      where: { email: session.user.email! },
      include: {
        education: true,
        experiences: true,
        skills: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil não encontrado" },
        { status: 404 }
      );
    }

    // Get active jobs
    const jobs = await db.job.findMany({
      where: { status: "active" },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        country: true,
        state: true,
        city: true,
        type: true,
        user: {
          select: {
            companyName: true,
          },
        },
        criteria: {
          select: {
            criterion: true,
            weight: true,
            description: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      take: 20,
      orderBy: {
        createdAt: "desc",
      },
    }) as any[];

    // Calculate match for each job
    const jobsWithMatch = jobs.map(job => {
      const matchPercentage = calculateMatch(profile, job);
      
      return {
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location,
        country: job.country,
        state: job.state,
        city: job.city,
        type: job.type,
        companyName: job.user?.companyName || "Empresa",
        criteria: job.criteria,
        _count: job._count,
        matchPercentage,
      };
    });

    // Sort by match percentage
    jobsWithMatch.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return NextResponse.json({
      jobs: jobsWithMatch,
      profileCompleteness: {
        hasResume: !!profile.resumeUrl,
        hasEducation: profile.education.length > 0,
        hasExperience: profile.experiences.length > 0,
        hasSkills: profile.skills.length > 0,
      },
    });
  } catch (error) {
    console.error("Error calculating job match:", error);
    return NextResponse.json(
      { error: "Erro ao calcular compatibilidade" },
      { status: 500 }
    );
  }
}
