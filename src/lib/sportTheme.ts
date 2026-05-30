export const SPORT_COLORS: Record<string, string> = {
  // Streamed API lowercase categories
  football:         "var(--sport-football)",
  soccer:           "var(--sport-football)",
  basketball:       "var(--sport-basketball)",
  tennis:           "var(--sport-tennis)",
  hockey:           "var(--sport-hockey)",
  boxing:           "var(--sport-boxing)",
  mma:              "var(--sport-boxing)",
  fight:            "var(--sport-boxing)",
  cricket:          "var(--sport-cricket)",
  rugby:            "var(--sport-rugby)",
  baseball:         "var(--sport-baseball)",
  golf:             "#22c55e",
  motorsports:      "#F59E0B",
  amfootball:       "#F97316",
  darts:            "#a78bfa",
  afl:              "#F59E0B",
  other:            "var(--sport-other)",
};

export function sportColor(category: string): string {
  return SPORT_COLORS[category.toLowerCase()] ?? "var(--sport-other)";
}
