import PassingTdBoard from "@/app/components/nfl/PassingTdBoard";
import LeaderboardError from "@/app/components/LeaderboardError";
import { getPassingTdPlayers } from "@/lib/nfl-stats";

export default async function PassingTdLoader() {
  let data;

  try {
    data = await getPassingTdPlayers();
  } catch {
    return (
      <LeaderboardError
        message="ESPN did not respond with NFL passing stats. Try again in a few minutes."
        retryHref="/passing-tds"
      />
    );
  }

  return <PassingTdBoard {...data} />;
}
