const ESPN_SEARCH_API = "https://site.web.api.espn.com/apis/common/v3/search";
const ESPN_ATHLETE_API =
  "https://site.api.espn.com/apis/common/v3/sports/baseball/mlb/athletes";
const CACHE_SECONDS = 86_400;

type EspnSearchItem = {
  id: string;
  displayName: string;
};

type EspnSearchResponse = {
  items?: EspnSearchItem[];
};

type EspnAthleteResponse = {
  athlete?: {
    displayDOB?: string;
  };
};

const espnIdCache = new Map<string, number | null>();

function cacheKey(fullName: string, birthDate?: string): string {
  return `${fullName}|${birthDate ?? ""}`;
}

function normalizePlayerName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function parseEspnDisplayDob(displayDOB: string): string | null {
  const parts = displayDOB.split("/");
  if (parts.length !== 3) {
    return null;
  }

  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const year = Number(parts[2]);

  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

async function fetchEspnAthleteBirthDate(espnId: number): Promise<string | null> {
  const response = await fetch(`${ESPN_ATHLETE_API}/${espnId}`, {
    next: { revalidate: CACHE_SECONDS },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as EspnAthleteResponse;
  const displayDOB = data.athlete?.displayDOB;

  return displayDOB ? parseEspnDisplayDob(displayDOB) : null;
}

async function searchEspnCandidates(fullName: string): Promise<EspnSearchItem[]> {
  const response = await fetch(
    `${ESPN_SEARCH_API}?query=${encodeURIComponent(fullName)}&limit=10&type=player&sport=baseball&league=mlb`,
    { next: { revalidate: CACHE_SECONDS } },
  );

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as EspnSearchResponse;
  const normalizedName = normalizePlayerName(fullName);

  return (data.items ?? []).filter(
    (item) => normalizePlayerName(item.displayName) === normalizedName,
  );
}

export async function lookupEspnId(
  fullName: string,
  birthDate?: string,
): Promise<number | undefined> {
  const key = cacheKey(fullName, birthDate);
  if (espnIdCache.has(key)) {
    const cached = espnIdCache.get(key);
    return cached ?? undefined;
  }

  const candidates = await searchEspnCandidates(fullName);

  if (candidates.length === 0) {
    espnIdCache.set(key, null);
    return undefined;
  }

  if (candidates.length === 1) {
    const espnId = Number(candidates[0].id);
    espnIdCache.set(key, espnId);
    return espnId;
  }

  if (!birthDate) {
    espnIdCache.set(key, null);
    return undefined;
  }

  for (const candidate of candidates) {
    const espnId = Number(candidate.id);
    const espnBirthDate = await fetchEspnAthleteBirthDate(espnId);

    if (espnBirthDate === birthDate) {
      espnIdCache.set(key, espnId);
      return espnId;
    }
  }

  espnIdCache.set(key, null);
  return undefined;
}
