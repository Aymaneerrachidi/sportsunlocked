export const GUIDES = [
  {
    slug: "how-to-follow-a-busy-sports-day",
    title: "How To Follow A Busy Sports Day Without Missing Key Events",
    excerpt: "A practical workflow for sorting live games, overlapping kickoffs, and late-night events.",
    minutes: 5,
    sections: [
      {
        heading: "Start With The Day View",
        body: "On a crowded sports day, the first problem is not finding one event. It is understanding the order of the whole day. Start with a date-grouped schedule and scan by start time before opening any event. This gives you a quick mental map of early matches, prime-time windows, and late-night games that may overlap.",
      },
      {
        heading: "Separate Must-Watch From Background Events",
        body: "Pick one or two must-watch events, then keep lower-priority games as background checks. For example, a knockout football match may deserve the main screen while a tennis court, baseball game, or motor sports session can be monitored between breaks.",
      },
      {
        heading: "Use Categories To Reduce Noise",
        body: "Filtering by sport is useful when a schedule has hundreds of events. If you only care about football and basketball, hide the rest first. If you are browsing casually, use the live list to spot events already underway and the full schedule to plan what starts next.",
      },
      {
        heading: "Watch Time Zones Carefully",
        body: "International events often appear around midnight or early morning depending on your location. When planning ahead, compare the local start time with the date heading so you do not confuse late-night events with the following evening.",
      },
    ],
  },
  {
    slug: "sports-schedule-time-zone-guide",
    title: "A Simple Time Zone Guide For International Sports Fans",
    excerpt: "Why events appear on different dates and how to read schedules more accurately.",
    minutes: 4,
    sections: [
      {
        heading: "Why Dates Can Feel Off",
        body: "A match played in another country may start on one date locally and a different date for you. This is common with North American leagues, European football, Asian tournaments, and global combat sports cards.",
      },
      {
        heading: "Use Local Time As Your Anchor",
        body: "For day-to-day planning, your local time is usually the most useful display. It answers the practical question: when do I need to be available? If you are comparing with official league pages, remember that they may show venue time instead.",
      },
      {
        heading: "Check Overnight Blocks",
        body: "The easiest mistake is missing events after midnight. A schedule grouped by day should be scanned from midnight through early morning first, especially for sports like baseball, basketball, UFC, tennis, and motor racing.",
      },
      {
        heading: "Build A Small Watchlist",
        body: "Instead of trying to follow everything, make a small list of events by start time. Put the main event first, then add alternate events that begin during halftime, innings breaks, rain delays, or undercard gaps.",
      },
    ],
  },
  {
    slug: "multi-view-sports-setup",
    title: "How To Use Multi-View For Sports Without Overloading Your Screen",
    excerpt: "Tips for choosing two or four events and keeping the experience readable.",
    minutes: 5,
    sections: [
      {
        heading: "Two Screens Is Usually Enough",
        body: "Four screens can look exciting, but two active events are usually easier to follow. Use a two-screen layout when both events matter. Use four only when you are monitoring scores, starts, or multiple courts rather than watching every play closely.",
      },
      {
        heading: "Put The Main Event Top Left",
        body: "Most people naturally scan from the top left. Put the event you care about most in the first slot, then place secondary events to the right or below. This makes the layout feel organized instead of chaotic.",
      },
      {
        heading: "Avoid Audio Conflict",
        body: "Multi-view works best when only one event has audio. Keep the main event audible and mute the rest if the provider player allows it. If not, switch focus between events rather than running multiple loud streams.",
      },
      {
        heading: "Use It For Timing, Not Just Watching",
        body: "Multi-view is useful for checking whether an event has started, whether a break is over, or whether a match is entering a decisive phase. It does not need to replace focused viewing.",
      },
    ],
  },
  {
    slug: "choosing-which-live-sports-to-follow",
    title: "How To Choose Which Live Sports Event To Follow First",
    excerpt: "A decision guide for overlapping matches, undercards, tournaments, and recurring league games.",
    minutes: 4,
    sections: [
      {
        heading: "Prioritize Elimination Stakes",
        body: "When events overlap, knockout matches, finals, relegation battles, playoff games, and title-deciding events usually deserve priority over routine regular-season fixtures.",
      },
      {
        heading: "Look At Event Structure",
        body: "Some sports have natural pauses. Baseball, cricket, tennis, combat sports cards, and motor sports sessions often make it easier to switch in and out than continuous-flow sports.",
      },
      {
        heading: "Check Start Times And Main Events",
        body: "A fight card or tournament listing may start long before the event you care about most. Use the schedule as a starting point, then check official sources for exact main-event timing when it matters.",
      },
      {
        heading: "Keep One Backup Option",
        body: "Live sports can be delayed, postponed, or temporarily unavailable. Keeping one backup event nearby makes the experience smoother when schedules shift.",
      },
    ],
  },
];

export function guideBySlug(slug: string) {
  return GUIDES.find(guide => guide.slug === slug);
}
