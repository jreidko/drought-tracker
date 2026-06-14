import Leaderboard from "@/app/components/Leaderboard";
import LeaderboardError from "@/app/components/LeaderboardError";
import { getLeaderboardPlayers } from "@/lib/mlb-stats";

export default async function LeaderboardLoader() {
  let data;

  try {
    data = await getLeaderboardPlayers();
  } catch {
    return <LeaderboardError />;
  }

  return <Leaderboard {...data} />;
}
