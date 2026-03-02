const BASE_URL = "https://api.data.gov/ed/collegescorecard/v1";
const API_KEY = process.env.COLLEGE_SCORECARD_API_KEY ?? "DEMO_KEY";

export interface ScorecardProgram {
  id: number;
  name: string;
  city: string;
  state: string;
  earnings: {
    median_1yr: number | null;
    median_5yr: number | null;
  };
  completion_rate: number | null;
}

interface ScorecardField {
  "school.name": string;
  "school.city": string;
  "school.state": string;
  id: number;
  "earnings.1_yr_after_completion.median": number | null;
  "earnings.6_yr_after_entry.median": number | null;
  "completion.consumer_rate": number | null;
}

export async function searchProgramsByName(
  name: string,
  limit = 10
): Promise<ScorecardProgram[]> {
  const fields = [
    "id",
    "school.name",
    "school.city",
    "school.state",
    "earnings.1_yr_after_completion.median",
    "earnings.6_yr_after_entry.median",
    "completion.consumer_rate",
  ].join(",");

  const params = new URLSearchParams({
    "school.name": name,
    fields,
    per_page: String(limit),
    api_key: API_KEY,
  });

  const res = await fetch(`${BASE_URL}/schools?${params}`, {
    next: { revalidate: 86400 }, // cache 24h
  });

  if (!res.ok) {
    throw new Error(`Scorecard API error: ${res.status}`);
  }

  const data = await res.json();
  const results: ScorecardField[] = data.results ?? [];

  return results.map((r) => ({
    id: r.id,
    name: r["school.name"],
    city: r["school.city"],
    state: r["school.state"],
    earnings: {
      median_1yr: r["earnings.1_yr_after_completion.median"],
      median_5yr: r["earnings.6_yr_after_entry.median"],
    },
    completion_rate: r["completion.consumer_rate"],
  }));
}

export async function getProgramById(
  id: number
): Promise<ScorecardProgram | null> {
  const fields = [
    "id",
    "school.name",
    "school.city",
    "school.state",
    "earnings.1_yr_after_completion.median",
    "earnings.6_yr_after_entry.median",
    "completion.consumer_rate",
  ].join(",");

  const params = new URLSearchParams({
    "id": String(id),
    fields,
    api_key: API_KEY,
  });

  const res = await fetch(`${BASE_URL}/schools?${params}`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) return null;

  const data = await res.json();
  const r: ScorecardField = data.results?.[0];
  if (!r) return null;

  return {
    id: r.id,
    name: r["school.name"],
    city: r["school.city"],
    state: r["school.state"],
    earnings: {
      median_1yr: r["earnings.1_yr_after_completion.median"],
      median_5yr: r["earnings.6_yr_after_entry.median"],
    },
    completion_rate: r["completion.consumer_rate"],
  };
}
