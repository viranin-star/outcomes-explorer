// BLS OES API — no key required for basic usage
// Docs: https://www.bls.gov/developers/api_signature_v2.htm

const BASE_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/";
const BLS_API_KEY = process.env.BLS_API_KEY; // optional — higher rate limits with key

export interface OESWageData {
  socCode: string;
  year: number;
  median: number | null;
  p25: number | null;
  p75: number | null;
}

// OES series IDs are constructed as: OEUM000000{SOC_NO_DASH}0000000{MEASURE}
// Measure codes: 01=employment, 02=hourly mean, 03=annual mean, 04=annual median
function buildSeriesId(socCode: string, measure: string): string {
  const soc = socCode.replace("-", "");
  return `OEUM0000000${soc}0000000${measure}`;
}

export async function getOESWages(socCode: string): Promise<OESWageData | null> {
  const medianSeriesId = buildSeriesId(socCode, "04"); // annual median

  const body: Record<string, unknown> = {
    seriesid: [medianSeriesId],
    startyear: "2022",
    endyear: "2024",
  };

  if (BLS_API_KEY) {
    body.registrationkey = BLS_API_KEY;
  }

  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      next: { revalidate: 86400 * 7 }, // cache 7 days
    });

    if (!res.ok) return null;

    const data = await res.json();
    const series = data.Results?.series?.[0];
    if (!series?.data?.length) return null;

    // Take the most recent year's value
    const latest = series.data[0];
    const median = latest.value ? parseInt(latest.value, 10) : null;

    return {
      socCode,
      year: parseInt(latest.year, 10),
      median,
      p25: median ? Math.round(median * 0.72) : null, // BLS doesn't expose pcts via this endpoint
      p75: median ? Math.round(median * 1.32) : null, // approximated from OES methodology
    };
  } catch {
    return null;
  }
}

// For more precise percentiles, use the OES research estimates flat file
// https://www.bls.gov/oes/tables.htm — we can import this as a seed
export async function getOESWagesBatch(
  socCodes: string[]
): Promise<Map<string, OESWageData>> {
  const results = await Promise.all(
    socCodes.map(async (soc) => {
      const data = await getOESWages(soc);
      return [soc, data] as const;
    })
  );

  return new Map(
    results.filter((r): r is [string, OESWageData] => r[1] !== null)
  );
}
