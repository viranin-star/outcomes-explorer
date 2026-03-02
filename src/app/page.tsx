import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/outcomes/SearchBar";
import { computeTransparencyScore, transparencyLabel, transparencyColor } from "@/lib/scoring/transparency";
import { computePayback } from "@/lib/scoring/payback";
import { Badge } from "@/components/ui/badge";

const DEGREE_FILTERS = ["All", "masters", "bachelors", "certificate", "doctoral"];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Program → Career Mapping",
    description:
      "Every program maps to SOC occupation codes, O*NET tasks, BLS wage bands, and licensure requirements.",
  },
  {
    step: "2",
    title: "Earnings Trajectory",
    description:
      "Not just median salary. See 25th / 50th / 75th percentiles across early and mid-career, plus a no-degree baseline.",
  },
  {
    step: "3",
    title: "Entry Probability",
    description:
      "Estimated likelihood of entering your target occupation within 3 years — built from IPEDS completions and employment data.",
  },
  {
    step: "4",
    title: "Transparency Score",
    description:
      "Programs are rated on whether they publish audited outcomes, placement rates, employer lists, and recent data.",
  },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ degree?: string }>;
}) {
  const { degree } = await searchParams;
  const degreeFilter = degree && degree !== "All" ? degree : undefined;

  const [allPrograms, featuredPrograms] = await Promise.all([
    prisma.program.findMany({
      select: { slug: true, name: true, degreeLevel: true, institution: true },
      orderBy: { name: "asc" },
    }),
    prisma.program.findMany({
      where: degreeFilter ? { degreeLevel: degreeFilter } : undefined,
      include: {
        earnings: { orderBy: { cohortYear: "desc" }, take: 1 },
        occupations: {
          where: { commonality: "primary" },
          include: { occupation: true },
          take: 2,
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
            Follow the money, not the marketing
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
            What will your degree{" "}
            <span className="text-blue-600">actually</span> earn?
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Real earnings trajectories, career entry probabilities, and outcomes
            transparency scores — not the numbers schools want you to see.
          </p>
          <div className="flex justify-center">
            <SearchBar programs={allPrograms} />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold text-slate-800 mb-8 text-center">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="space-y-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-800 text-sm">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse programs */}
      <section className="py-16 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-slate-800">Browse Programs</h2>
            <div className="flex gap-2 flex-wrap">
              {DEGREE_FILTERS.map((d) => {
                const active = (degree ?? "All") === d;
                return (
                  <a
                    key={d}
                    href={d === "All" ? "/" : `/?degree=${d}`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                      active
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {d}
                  </a>
                );
              })}
            </div>
          </div>

          {featuredPrograms.length === 0 ? (
            <p className="text-slate-400 text-sm">No programs found for this filter.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredPrograms.map((program) => {
                const earnings = program.earnings[0] ?? null;
                const transparency = computeTransparencyScore(program);
                const payback = earnings
                  ? computePayback(
                      program.tuitionMin,
                      program.tuitionMax,
                      earnings.earlyMedian,
                      earnings.noDegreeMed
                    )
                  : null;

                return (
                  <a
                    key={program.slug}
                    href={`/programs/${program.slug}`}
                    className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all space-y-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-blue-700 transition-colors">
                          {program.name}
                        </h3>
                        <Badge variant="secondary" className="flex-shrink-0 text-xs capitalize">
                          {program.degreeLevel}
                        </Badge>
                      </div>
                      {program.institution && (
                        <p className="text-xs text-slate-400">{program.institution}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide">Early median</p>
                        <p className="text-base font-semibold text-slate-800">
                          {earnings?.earlyMedian
                            ? `$${(earnings.earlyMedian / 1000).toFixed(0)}k`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide">Payback</p>
                        <p className="text-base font-semibold text-slate-800">
                          {payback?.paybackYears ? `${payback.paybackYears} yrs` : "—"}
                        </p>
                      </div>
                    </div>

                    {program.occupations.length > 0 && (
                      <div className="space-y-1">
                        {program.occupations.map((po) => (
                          <p key={po.socCode} className="text-xs text-slate-500 truncate">
                            → {po.occupation.title}
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                      <span className="text-xs text-slate-400">Transparency</span>
                      <span className={`text-xs font-semibold ${transparencyColor(transparency.total)}`}>
                        {transparency.total}/100 · {transparencyLabel(transparency.total)}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}

          {featuredPrograms.length > 1 && (
            <div className="text-center pt-4">
              <a
                href={`/compare?programs=${featuredPrograms.slice(0, 2).map((p) => p.slug).join(",")}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
              >
                Compare these programs side by side →
              </a>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
