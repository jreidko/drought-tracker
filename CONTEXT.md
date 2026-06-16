# Drought Tracker — Domain Glossary

## Bat Side
Whether a player bats left (`L`), right (`R`), or from both sides (`S` — switch hitter). Sourced from the MLB Stats API `/people/{id}` response. Bat side is the relevant handedness dimension for a home run tracker; throw side is not tracked.

## Drought Streak
Consecutive games without a home run, counting backwards from the most recent game played. A streak of 0 means the player hit a HR in their last game.

## Drought Tier
A severity classification derived from the Drought Streak. Five tiers, in order of increasing drought:
- **Ignited** — 0 games (hit a HR last game)
- **Charged** — 1 game
- **Cooling** — 2–3 games
- **Cold** — 4–7 games
- **Frozen** — 8+ games

Used to drive visual styling (color temperature) across the UI.

## Game Today
Whether the player's team has a game scheduled on the current calendar date. Derived from the MLB Stats API `/schedule` endpoint using the player's team ID. Does not indicate lineup presence — an inactive player's team may still have a game today.

## HR Average
The mean home runs per season over a lookback window of completed seasons before the current season. Null if the player has no completed seasons in the window.

## Projected HRs
A full-season HR total extrapolated from the player's current-season pace: `round((homeRuns / gamesPlayed) * 162)`.

## Roster Status
Whether a player is currently available to play. `active` means on the active roster; `inactive` covers any exception (injured list, paternity leave, bereavement, suspension, etc.). Binary — the specific reason is not tracked.

## Season Sparkline
An inline SVG polyline showing a player's HR totals for each of the past 8 completed seasons, in chronological order. Line color matches the player's Drought Tier color. Used in place of discrete HR Average columns.
