type ReferenceItem = {
  label: string;
  description: string;
  source: string;
};

type AbbreviationItem = {
  abbr: string;
  meaning: string;
};

const abbreviations: AbbreviationItem[] = [
  { abbr: "HR", meaning: "Home runs" },
  { abbr: "Proj", meaning: "Projected full-season total at current pace" },
  { abbr: "1Y / 3Y / 5Y", meaning: "Lookback window in years for HR averages" },
  { abbr: "Avg", meaning: "Average home runs per season over the lookback window" },
  { abbr: "g", meaning: "Average games between home runs (shown under each Avg)" },
  { abbr: "G", meaning: "Games played" },
  { abbr: "ERA", meaning: "Earned run average" },
  { abbr: "WHIP", meaning: "Walks plus hits per inning pitched" },
  { abbr: "K", meaning: "Strikeouts" },
  { abbr: "IP", meaning: "Innings pitched" },
  { abbr: "W-L", meaning: "Win–loss record" },
  { abbr: "IL", meaning: "Injured list (or other inactive roster status)" },
  { abbr: "TBD", meaning: "To be determined — probable starter not yet announced" },
  { abbr: "B-Ref", meaning: "Baseball Reference" },
];

const hitterStats: ReferenceItem[] = [
  {
    label: "HR / Proj HR",
    description:
      "Season home runs so far, then a full-season projection from current pace: round((HR ÷ games played) × 162).",
    source: "MLB Stats API — yearByYear hitting stats",
  },
  {
    label: "Drought streak",
    description:
      "Consecutive games without a home run, counting back from the most recent game. 0 means a HR in the last game played.",
    source: "MLB Stats API — gameLog hitting stats",
  },
  {
    label: "1Y / 3Y / 5Y Avg",
    description:
      "Average home runs per completed season over the lookback window. The small line below is average games between home runs.",
    source: "MLB Stats API — yearByYear hitting stats",
  },
];

const statusBadges: ReferenceItem[] = [
  {
    label: "Active",
    description: "Player is on the active roster.",
    source: "MLB Stats API — /people/{id}",
  },
  {
    label: "Game",
    description: "Player's team has a game scheduled today. Does not confirm lineup status.",
    source: "MLB Stats API — /schedule",
  },
  {
    label: "IL",
    description: "Player is inactive (injured list, bereavement, suspension, etc.).",
    source: "MLB Stats API — /people/{id}",
  },
];

const todayGameStats: ReferenceItem[] = [
  {
    label: "Venue",
    description: "Ballpark for today's game. Home/Away is relative to the hitter's team.",
    source: "MLB Stats API — /schedule (venue hydrate)",
  },
  {
    label: "HR Factor",
    description:
      "Statcast park factor for home runs at this stadium. 100 is league average; above 100 is hitter-friendly, below 100 is pitcher-friendly.",
    source: "Baseball Savant — statcast park factors",
  },
  {
    label: "At Park",
    description:
      "This hitter's home runs and games at this stadium during the current season.",
    source: "MLB Stats API — gameLog hitting stats",
  },
  {
    label: "Vs Pitcher",
    description:
      "Probable opposing starter for today. W-L, ERA, WHIP, HR, K, and IP are current-season pitching stats.",
    source: "MLB Stats API — /schedule (probablePitcher) + pitching season stats",
  },
];

const droughtTiers: ReferenceItem[] = [
  {
    label: "Ignited",
    description: "0 games without a HR — homered last game.",
    source: "Derived from drought streak",
  },
  {
    label: "Charged",
    description: "1 game without a HR.",
    source: "Derived from drought streak",
  },
  {
    label: "Cooling",
    description: "2–3 games without a HR.",
    source: "Derived from drought streak",
  },
  {
    label: "Cold",
    description: "4–7 games without a HR.",
    source: "Derived from drought streak",
  },
  {
    label: "Frozen",
    description: "8+ games without a HR.",
    source: "Derived from drought streak",
  },
];

function ReferenceGroup({
  title,
  items,
}: {
  title: string;
  items: ReferenceItem[];
}) {
  return (
    <div>
      <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-chrome">
        {title}
      </h3>
      <dl className="mt-2 space-y-2.5">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="font-mono text-[10px] font-bold uppercase tracking-wide text-sith">
              {item.label}
            </dt>
            <dd className="mt-0.5 text-xs leading-relaxed text-muted">
              {item.description}
            </dd>
            <dd className="mt-0.5 font-mono text-[10px] text-muted/70">
              Source: {item.source}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function AbbreviationGroup({ items }: { items: AbbreviationItem[] }) {
  return (
    <div>
      <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-chrome">
        Abbreviations
      </h3>
      <dl className="mt-2 grid gap-x-4 gap-y-2 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.abbr} className="flex gap-2">
            <dt className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-wide text-sith">
              {item.abbr}
            </dt>
            <dd className="text-xs leading-relaxed text-muted">{item.meaning}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function LeaderboardReference() {
  return (
    <section
      aria-label="Field reference"
      className="mt-4 rounded-sm border border-border bg-surface/80 px-4 py-4 sm:mt-6"
    >
      <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-chrome">
        What the numbers mean
      </h2>
      <p className="mt-1 text-xs text-muted">
        Top 100 home run leaders for the current season. Data refreshes every 15 minutes.
      </p>

      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ReferenceGroup title="Hitter stats" items={hitterStats} />
        <ReferenceGroup title="Status badges" items={statusBadges} />
        <ReferenceGroup title="Today's game" items={todayGameStats} />
        <ReferenceGroup title="Drought tiers" items={droughtTiers} />
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <AbbreviationGroup items={abbreviations} />
      </div>

      <p className="mt-4 border-t border-border pt-3 font-mono text-[10px] leading-relaxed text-muted/70">
        External links (Savant, FanGraphs, B-Ref, ESPN) open third-party player pages.
        FanGraphs and B-Ref IDs are curated where available; ESPN IDs are matched via
        search. Team logos from MLB Static.
      </p>
    </section>
  );
}
