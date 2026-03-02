// O*NET Web Services — requires free registration
// Register at: https://services.onetcenter.org/developer/
// Uses HTTP Basic Auth: username = your O*NET code, password = blank

const BASE_URL = "https://services.onetcenter.org/ws";
const ONET_USERNAME = process.env.ONET_USERNAME ?? ""; // your O*NET code

function authHeader(): HeadersInit {
  if (!ONET_USERNAME) return {};
  const encoded = Buffer.from(`${ONET_USERNAME}:`).toString("base64");
  return { Authorization: `Basic ${encoded}` };
}

export interface OnetOccupation {
  code: string;
  title: string;
  description: string;
  brightOutlook: boolean;
  tasks: string[];
  skills: string[];
}

export async function getOccupation(
  onetCode: string
): Promise<OnetOccupation | null> {
  if (!ONET_USERNAME) {
    // Return stub data in development if no key configured
    return {
      code: onetCode,
      title: "Occupation (O*NET key not configured)",
      description: "Add ONET_USERNAME to .env to fetch live data.",
      brightOutlook: false,
      tasks: [],
      skills: [],
    };
  }

  try {
    const [occRes, tasksRes, skillsRes] = await Promise.all([
      fetch(`${BASE_URL}/occupations/${onetCode}`, {
        headers: { ...authHeader(), Accept: "application/json" },
        next: { revalidate: 86400 * 30 },
      }),
      fetch(`${BASE_URL}/occupations/${onetCode}/summary/tasks`, {
        headers: { ...authHeader(), Accept: "application/json" },
        next: { revalidate: 86400 * 30 },
      }),
      fetch(`${BASE_URL}/occupations/${onetCode}/summary/skills`, {
        headers: { ...authHeader(), Accept: "application/json" },
        next: { revalidate: 86400 * 30 },
      }),
    ]);

    if (!occRes.ok) return null;

    const occ = await occRes.json();
    const tasksData = tasksRes.ok ? await tasksRes.json() : { task: [] };
    const skillsData = skillsRes.ok ? await skillsRes.json() : { element: [] };

    return {
      code: onetCode,
      title: occ.title,
      description: occ.description,
      brightOutlook: occ.bright_outlook ?? false,
      tasks: (tasksData.task ?? []).slice(0, 5).map((t: { statement: string }) => t.statement),
      skills: (skillsData.element ?? []).slice(0, 6).map((s: { name: string }) => s.name),
    };
  } catch {
    return null;
  }
}

export async function searchOccupations(
  keyword: string
): Promise<{ code: string; title: string }[]> {
  if (!ONET_USERNAME) return [];

  try {
    const res = await fetch(
      `${BASE_URL}/occupations?keyword=${encodeURIComponent(keyword)}&end=10`,
      {
        headers: { ...authHeader(), Accept: "application/json" },
        next: { revalidate: 86400 },
      }
    );

    if (!res.ok) return [];
    const data = await res.json();
    return (data.occupation ?? []).map((o: { code: string; title: string }) => ({
      code: o.code,
      title: o.title,
    }));
  } catch {
    return [];
  }
}
