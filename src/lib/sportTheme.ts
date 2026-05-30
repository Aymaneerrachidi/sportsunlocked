export const SPORT_COLORS: Record<string, string> = {
  Football: "var(--sport-football)",
  Basketball: "var(--sport-basketball)",
  Tennis: "var(--sport-tennis)",
  F1: "var(--sport-f1)",
  Cricket: "var(--sport-cricket)",
  Rugby: "var(--sport-rugby)",
  Baseball: "var(--sport-baseball)",
  Boxing: "var(--sport-boxing)",
  "Ice Hockey": "var(--sport-hockey)",
  Golf: "var(--sport-golf)",
  MotoSports: "#F59E0B",
  Motorcycle: "#F59E0B",
  Other: "var(--sport-other)",
};

export function sportColor(sport: string) {
  return SPORT_COLORS[sport] ?? "var(--sport-other)";
}
