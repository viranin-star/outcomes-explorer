import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Seed occupations
  await prisma.occupation.upsert({
    where: { socCode: "21-1023" },
    update: {},
    create: {
      socCode: "21-1023",
      onetCode: "21-1023.00",
      title: "Mental Health & Substance Abuse Social Workers",
      description:
        "Assess and treat individuals with mental, emotional, or substance abuse problems.",
      industryGroup: "Social Services",
      requiresLicense: true,
      licenseNotes: "LCSW or LMSW required in most states",
    },
  });

  await prisma.occupation.upsert({
    where: { socCode: "21-1022" },
    update: {},
    create: {
      socCode: "21-1022",
      onetCode: "21-1022.00",
      title: "Healthcare Social Workers",
      description:
        "Provide individuals, families, and groups with the psychosocial support needed to cope with chronic, acute, or terminal illnesses.",
      industryGroup: "Healthcare",
      requiresLicense: true,
      licenseNotes: "LCSW required for independent clinical practice",
    },
  });

  await prisma.occupation.upsert({
    where: { socCode: "21-1029" },
    update: {},
    create: {
      socCode: "21-1029",
      onetCode: "21-1029.00",
      title: "Social Workers, All Other",
      description: "All social workers not listed separately.",
      industryGroup: "Social Services",
      requiresLicense: false,
    },
  });

  await prisma.occupation.upsert({
    where: { socCode: "13-2051" },
    update: {},
    create: {
      socCode: "13-2051",
      onetCode: "13-2051.00",
      title: "Financial and Investment Analysts",
      description:
        "Conduct quantitative analyses of information affecting investment programs of public or private institutions.",
      industryGroup: "Finance",
      requiresLicense: false,
    },
  });

  await prisma.occupation.upsert({
    where: { socCode: "11-3031" },
    update: {},
    create: {
      socCode: "11-3031",
      onetCode: "11-3031.00",
      title: "Financial Managers",
      description:
        "Plan, direct, or coordinate accounting, investing, banking, insurance, and other financial activities.",
      industryGroup: "Finance",
      requiresLicense: false,
    },
  });

  // Seed MSW program
  const msw = await prisma.program.upsert({
    where: { slug: "msw-social-work" },
    update: {},
    create: {
      name: "Master of Social Work (MSW)",
      slug: "msw-social-work",
      degreeLevel: "masters",
      cipCode: "44.0701",
      institution: "State University",
      tuitionMin: 28000,
      tuitionMax: 55000,
      transparencyScore: 62,
      hasAuditedOutcomes: false,
      hasSelfReported: true,
      dataYear: 2024,
      hasPlacementRate: true,
      hasEmployerList: false,
    },
  });

  await prisma.programEarnings.upsert({
    where: { id: "msw-earnings-2024" },
    update: {},
    create: {
      id: "msw-earnings-2024",
      programId: msw.id,
      cohortYear: 2024,
      earlyP25: 38000,
      earlyMedian: 48000,
      earlyP75: 58000,
      midP25: 52000,
      midMedian: 65000,
      midP75: 82000,
      noDegreeMed: 35000,
      source: "BLS OES + College Scorecard",
    },
  });

  await prisma.programOccupation.upsert({
    where: { id: "msw-occ-1" },
    update: {},
    create: {
      id: "msw-occ-1",
      programId: msw.id,
      socCode: "21-1023",
      commonality: "primary",
      probabilityScore: 0.58,
    },
  });

  await prisma.programOccupation.upsert({
    where: { id: "msw-occ-2" },
    update: {},
    create: {
      id: "msw-occ-2",
      programId: msw.id,
      socCode: "21-1022",
      commonality: "primary",
      probabilityScore: 0.22,
    },
  });

  await prisma.programOccupation.upsert({
    where: { id: "msw-occ-3" },
    update: {},
    create: {
      id: "msw-occ-3",
      programId: msw.id,
      socCode: "21-1029",
      commonality: "secondary",
      probabilityScore: 0.12,
    },
  });

  // Seed MBA Finance program
  const mba = await prisma.program.upsert({
    where: { slug: "mba-finance" },
    update: {},
    create: {
      name: "MBA (Finance Concentration)",
      slug: "mba-finance",
      degreeLevel: "masters",
      cipCode: "52.0201",
      institution: "Business School",
      tuitionMin: 55000,
      tuitionMax: 120000,
      transparencyScore: 81,
      hasAuditedOutcomes: true,
      hasSelfReported: false,
      dataYear: 2024,
      hasPlacementRate: true,
      hasEmployerList: true,
    },
  });

  await prisma.programEarnings.upsert({
    where: { id: "mba-earnings-2024" },
    update: {},
    create: {
      id: "mba-earnings-2024",
      programId: mba.id,
      cohortYear: 2024,
      earlyP25: 72000,
      earlyMedian: 95000,
      earlyP75: 130000,
      midP25: 95000,
      midMedian: 135000,
      midP75: 190000,
      noDegreeMed: 45000,
      source: "GMAC Employment Report 2024",
    },
  });

  await prisma.programOccupation.upsert({
    where: { id: "mba-occ-1" },
    update: {},
    create: {
      id: "mba-occ-1",
      programId: mba.id,
      socCode: "13-2051",
      commonality: "primary",
      probabilityScore: 0.45,
    },
  });

  await prisma.programOccupation.upsert({
    where: { id: "mba-occ-2" },
    update: {},
    create: {
      id: "mba-occ-2",
      programId: mba.id,
      socCode: "11-3031",
      commonality: "primary",
      probabilityScore: 0.35,
    },
  });

  console.log("✓ Seed complete — MSW and MBA programs created");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
