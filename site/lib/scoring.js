/** Shared scoring and bunch ratings for the API, guide, and celebrations. */
export function getBunchScore(count) {
  return count > 0 ? 10 * count * (count + 1) / 2 : 0;
}
const RATINGS = [
  { name: "Seedling", icon: "🌱" },
  { name: "Looking ripe", icon: "🌿" },
  { name: "Sweet bunch", icon: "🍇" },
  { name: "Vine talent", icon: "✨" },
  { name: "Grape escape", icon: "🚀" },
  { name: "Vine genius", icon: "🧠" },
  { name: "Grape expectations", icon: "💎" },
  { name: "Vintage stuff", icon: "👑" },
  { name: "One in a bunch", icon: "🏆" },
];
export const SCORING_LEVELS = Array.from({ length: 25 }, (_, index) => ({ ...(RATINGS[index] || { name: index === 24 ? "The whole vineyard" : "Legendary bunch", icon: "🍇" }), count: index + 1, points: getBunchScore(index + 1) }));

const FINISH_HEADLINES = [
  "The whole vineyard!",
  "One of a vine!",
  "Grape minds think alike!",
  "Crushed it!",
  "A fine vine!",
  "Looking grape!",
  "Sweet finish!",
  "Bunch complete!",
];
export function getFinishHeadline(moveCount) {
  return FINISH_HEADLINES[Math.min(Math.max(1, Math.trunc(moveCount)), 8) - 1];
}
