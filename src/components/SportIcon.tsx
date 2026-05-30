"use client";

type SportIconProps = {
  sport?: string;
  size?: number;
  color?: string;
  muted?: boolean;
};

function Ball({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="2.2" />;
}

export default function SportIcon({ sport = "Other", size = 18, color = "currentColor", muted = false }: SportIconProps) {
  const key = sport.toLowerCase();
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
    style: { color, display: "block", opacity: muted ? 0.72 : 1, flexShrink: 0 },
  } as const;

  if (key === "all") {
    return (
      <svg {...common}>
        <path d="M4 7.5h16M4 12h16M4 16.5h16" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
        <path d="M7 5v14M12 5v14M17 5v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
      </svg>
    );
  }

  if (key === "football" || key === "soccer") {
    return (
      <svg {...common}>
        <Ball cx={12} cy={12} r={8.5} />
        <path d="M12 7.1l4.1 3-1.6 4.8h-5l-1.6-4.8 4.1-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M12 3.5v3.6M4.8 9.6l3.1.5M19.2 9.6l-3.1.5M7.3 19l2.2-4.1M16.7 19l-2.2-4.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (key === "basketball") {
    return (
      <svg {...common}>
        <Ball cx={12} cy={12} r={8.5} />
        <path d="M4.5 12h15M12 3.5c2.8 2.5 4.2 5.3 4.2 8.5S14.8 18 12 20.5M12 3.5C9.2 6 7.8 8.8 7.8 12S9.2 18 12 20.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (key === "tennis") {
    return (
      <svg {...common}>
        <Ball cx={12} cy={12} r={8.5} />
        <path d="M6.2 5.9c4.2 1.2 6.7 3.6 7.7 7.1.6 2 .7 3.7.4 5.1M17.8 18.1c-4.2-1.2-6.7-3.6-7.7-7.1-.6-2-.7-3.7-.4-5.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (key === "f1" || key.includes("formula")) {
    return (
      <svg {...common}>
        <path d="M3 14.5h2.7l2.1-4.8h5.4l2.8 3.2h2.6c1.2 0 2.2 1 2.2 2.2v1.4H3v-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 9.7l1.8-3.2h4.8l3.1 6.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7" cy="17.2" r="1.8" fill="currentColor" />
        <circle cx="17.2" cy="17.2" r="1.8" fill="currentColor" />
      </svg>
    );
  }

  if (key === "cricket") {
    return (
      <svg {...common}>
        <path d="M6.5 20.2L17.8 8.9l-2.7-2.7L3.8 17.5l2.7 2.7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M15.4 5.9l2-2 2.7 2.7-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="17.5" cy="17.2" r="2.4" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  if (key === "rugby") {
    return (
      <svg {...common}>
        <path d="M4.5 12c2.4-5.1 7.3-7.6 15-7.5.1 7.7-2.4 12.6-7.5 15-5.2-.5-7-2.3-7.5-7.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M7.4 16.6l9.2-9.2M10.4 17.7l6.2-6.2M6.3 13.6l6.2-6.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (key === "baseball") {
    return (
      <svg {...common}>
        <Ball cx={12} cy={12} r={8.5} />
        <path d="M7.3 5.2c2 1.8 3 4.1 3 6.8s-1 5-3 6.8M16.7 5.2c-2 1.8-3 4.1-3 6.8s1 5 3 6.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M8.8 7.7l-1.6.9M9.7 10.4l-1.8.4M9.7 13.6l-1.8-.4M8.8 16.3l-1.6-.9M15.2 7.7l1.6.9M14.3 10.4l1.8.4M14.3 13.6l1.8-.4M15.2 16.3l1.6-.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (key === "boxing") {
    return (
      <svg {...common}>
        <path d="M8 4h5.5A4.5 4.5 0 0 1 18 8.5V12a4 4 0 0 1-4 4h-3v4H6v-7.5A3.5 3.5 0 0 1 2.5 9V7.5A3.5 3.5 0 0 1 6 4h2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M8 4v7M11.5 4v7M15 4.5V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (key === "ice hockey" || key === "hockey") {
    return (
      <svg {...common}>
        <path d="M7 4v10.2c0 2.1 1.7 3.8 3.8 3.8H19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 20h9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M17 17.5h3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (key === "golf") {
    return (
      <svg {...common}>
        <path d="M8 21h8M12 21V4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M12 4l7 2.8-7 2.8V4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="17.5" cy="18" r="1.4" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M5 9h14M5 15h14M9 5v14M15 5v14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
