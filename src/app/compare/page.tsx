import { prisma } from "@/lib/prisma";
import { CompareClient } from "./CompareClient";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ programs?: string }>;
}) {
  const { programs: programsParam } = await searchParams;

  // Get all programs for the selector
  const allPrograms = await prisma.program.findMany({
    select: { id: true, name: true, slug: true, degreeLevel: true, institution: true },
    orderBy: { name: "asc" },
  });

  // Pre-load any programs passed via query string
  const slugs = programsParam ? programsParam.split(",").slice(0, 3) : [];

  const selectedPrograms = slugs.length
    ? await prisma.program.findMany({
        where: { slug: { in: slugs } },
        include: {
          occupations: { include: { occupation: true } },
          earnings: { orderBy: { cohortYear: "desc" }, take: 1 },
        },
      })
    : [];

  return (
    <CompareClient
      allPrograms={allPrograms}
      initialPrograms={selectedPrograms}
    />
  );
}
