import { prisma } from "@/lib/prisma";
import ScheduleClient from "./ScheduleClient";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const now = new Date();
  // Show: all live events + anything that started within the last 2 hours (might still be ongoing)
  // Hide: finished events that started > 2 hours ago
  const cutoff = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { isLive: true },
        { startTime: { gte: cutoff } },
      ],
    },
    orderBy: { startTime: "asc" },
  });

  return (
    <ScheduleClient
      matches={matches.map((m) => ({ ...m, startTime: m.startTime.toISOString() }))}
    />
  );
}
