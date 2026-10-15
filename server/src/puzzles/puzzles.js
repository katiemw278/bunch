/**
 * Seed puzzle data for Bunch.
 * Each puzzle has 9 categories arranged in a 3x3 grid (row-major order).
 *
 * Category fields:
 *   id          – stable identifier for caching
 *   label       – short player-facing text shown on the tile
 *   definition  – precise internal description used by the AI judge
 *   examples    – 3-5 canonical answers reviewers verified
 *
 * Design goals per the spec:
 *   - Several familiar answers per category
 *   - Multiple overlaps (strong answers hit 2-4 tiles)
 *   - At least one verified win path (board cleared in ≤8 moves)
 *   - No single answer that trivially clears all 9
 */

const PUZZLES = [
  {
    id: "puzzle-001",
    date: "2026-10-15",
    number: 1,
    categories: [
      // Row 1
      {
        id: "p1-c1",
        label: "Something yellow",
        definition:
          "The answer must refer to something that is characteristically or prototypically yellow in color. The yellow color should be a well-known, defining property of the thing.",
        examples: ["banana", "lemon", "sunflower", "gold", "butter", "daffodil"],
      },
      {
        id: "p1-c2",
        label: "Something sweet",
        definition:
          "The answer must refer to something that is characteristically sweet in taste — containing natural sugars or sweeteners, or widely known for sweetness.",
        examples: ["honey", "sugar", "candy", "maple syrup", "chocolate", "mango"],
      },
      {
        id: "p1-c3",
        label: "Found in a kitchen",
        definition:
          "The answer must refer to an object, ingredient, or appliance that is normally kept or used in a kitchen. Common household kitchen items.",
        examples: ["knife", "spatula", "flour", "olive oil", "toaster", "colander"],
      },
      // Row 2
      {
        id: "p1-c4",
        label: "Grows on a tree",
        definition:
          "The answer must refer to something that physically grows on a tree — fruit, nuts, leaves, bark products, or other tree-produced items.",
        examples: ["apple", "coconut", "walnut", "maple syrup", "cherry", "acorn"],
      },
      {
        id: "p1-c5",
        label: "Something sticky",
        definition:
          "The answer must refer to something that is characteristically sticky or adhesive — either naturally or as a defining property.",
        examples: ["honey", "tape", "glue", "caramel", "sap", "molasses"],
      },
      {
        id: "p1-c6",
        label: "Used in baking",
        definition:
          "The answer must refer to an ingredient or tool that is commonly used when baking bread, cakes, cookies, or pastries.",
        examples: ["flour", "butter", "sugar", "yeast", "baking soda", "rolling pin"],
      },
      // Row 3
      {
        id: "p1-c7",
        label: "Something small",
        definition:
          "The answer must refer to something that is characteristically small in size — typically fitting in a human hand or smaller.",
        examples: ["pea", "marble", "coin", "acorn", "button", "thimble"],
      },
      {
        id: "p1-c8",
        label: "Has a peel or skin",
        definition:
          "The answer must refer to something that has a removable outer layer — a peel, skin, rind, shell, or husk that is typically removed before eating or use.",
        examples: ["banana", "orange", "potato", "avocado", "onion", "mango"],
      },
      {
        id: "p1-c9",
        label: "Comes in a jar",
        definition:
          "The answer must refer to a food or product that is commonly sold or stored in a glass or plastic jar.",
        examples: ["honey", "peanut butter", "jam", "pickles", "mustard", "salsa"],
      },
    ],
    // Verified win path: 7 moves
    // honey (c2,c4→NO, c5,c9), lemon (c1,c2,c8), banana (c1,c8,c4→NO),
    // Actual solution:
    // 1. honey       → c2 sweet, c5 sticky, c9 jar           (3 tiles)
    // 2. lemon       → c1 yellow, c2 sweet, c8 peel           (but c2 already cleared by honey; c1+c8 = 2 new)
    // 3. banana      → c1 yellow, c4 tree, c8 peel, c7 small  (c1+c4+c8+c7 but lemon took c1+c8; c4+c7=2)
    // 4. flour       → c3 kitchen, c6 baking                  (2 tiles)
    // 5. butter      → c3 kitchen, c6 baking, c2 sweet        (c3+c6 if not gone)
    // Simpler path:
    // 1. honey       → c2,c5,c9   (3 tiles)
    // 2. lemon       → c1,c8      (2 tiles, c2 already gone)
    // 3. banana      → c4,c7      (2 tiles, c1+c8 gone)
    // 4. flour       → c3,c6      (2 tiles)
    // 5. maple syrup → nothing new if already done above
    // That's 9 tiles in 4 moves — a perfect game
    sampleSolutions: [
      { answer: "honey", clears: ["p1-c2", "p1-c5", "p1-c9"] },
      { answer: "lemon", clears: ["p1-c1", "p1-c8"] },
      { answer: "banana", clears: ["p1-c4", "p1-c7"] },
      { answer: "flour", clears: ["p1-c3", "p1-c6"] },
    ],
  },
  {
    id: "puzzle-002",
    date: "2026-10-16",
    number: 2,
    categories: [
      // Row 1
      {
        id: "p2-c1",
        label: "Something cold",
        definition:
          "The answer must refer to something that is characteristically cold — either naturally cold or known for being served/experienced cold.",
        examples: ["ice", "snow", "glacier", "ice cream", "frozen yogurt", "sleet"],
      },
      {
        id: "p2-c2",
        label: "Found at the beach",
        definition:
          "The answer must refer to something commonly found at, associated with, or used at a beach or coastline.",
        examples: ["sand", "seashell", "sunscreen", "wave", "lifeguard", "towel"],
      },
      {
        id: "p2-c3",
        label: "Makes a sound",
        definition:
          "The answer must refer to something specifically known for producing a characteristic or notable sound — it should be one of the defining features of the thing.",
        examples: ["bell", "drum", "thunder", "whistle", "alarm", "foghorn"],
      },
      // Row 2
      {
        id: "p2-c4",
        label: "Something round",
        definition:
          "The answer must refer to something that is characteristically round or spherical in shape.",
        examples: ["ball", "globe", "coin", "pearl", "bubble", "wheel"],
      },
      {
        id: "p2-c5",
        label: "Used in a sport",
        definition:
          "The answer must refer to an object, piece of equipment, or thing directly used in playing a sport.",
        examples: ["ball", "racket", "net", "bat", "puck", "helmet"],
      },
      {
        id: "p2-c6",
        label: "Can be inflated",
        definition:
          "The answer must refer to something that is commonly or notably inflated with air or gas.",
        examples: ["balloon", "tire", "ball", "life jacket", "air mattress", "blimp"],
      },
      // Row 3
      {
        id: "p2-c7",
        label: "Something white",
        definition:
          "The answer must refer to something that is characteristically or prototypically white in color.",
        examples: ["snow", "milk", "cloud", "pearl", "chalk", "swan"],
      },
      {
        id: "p2-c8",
        label: "Floats on water",
        definition:
          "The answer must refer to something that is known for floating on water — either naturally or by design.",
        examples: ["boat", "duck", "buoy", "cork", "log", "iceberg"],
      },
      {
        id: "p2-c9",
        label: "Found in the sky",
        definition:
          "The answer must refer to something that is naturally or commonly found in the sky or atmosphere.",
        examples: ["cloud", "star", "airplane", "bird", "rainbow", "moon"],
      },
    ],
    sampleSolutions: [
      { answer: "ball", clears: ["p2-c4", "p2-c5", "p2-c6"] },
      { answer: "snow", clears: ["p2-c1", "p2-c7"] },
      { answer: "cloud", clears: ["p2-c7", "p2-c9"] },
      { answer: "buoy", clears: ["p2-c3", "p2-c8"] },
      { answer: "sand", clears: ["p2-c2"] },
      { answer: "iceberg", clears: ["p2-c1", "p2-c8"] },
    ],
  },
  {
    id: "puzzle-003",
    date: "2026-10-17",
    number: 3,
    categories: [
      // Row 1
      {
        id: "p3-c1",
        label: "Something red",
        definition:
          "The answer must refer to something that is characteristically or prototypically red in color.",
        examples: ["rose", "tomato", "fire truck", "apple", "ruby", "strawberry"],
      },
      {
        id: "p3-c2",
        label: "Found in a garden",
        definition:
          "The answer must refer to something commonly found in, grown in, or associated with a garden.",
        examples: ["rose", "tomato", "shovel", "hose", "worm", "compost"],
      },
      {
        id: "p3-c3",
        label: "Has a strong smell",
        definition:
          "The answer must refer to something with a characteristically strong or notable scent — pleasant or unpleasant.",
        examples: ["rose", "garlic", "coffee", "skunk", "perfume", "onion"],
      },
      // Row 2
      {
        id: "p3-c4",
        label: "Something edible",
        definition:
          "The answer must refer to something that is commonly eaten as food by humans.",
        examples: ["tomato", "strawberry", "bread", "cheese", "mushroom", "egg"],
      },
      {
        id: "p3-c5",
        label: "Given as a gift",
        definition:
          "The answer must refer to something that is very commonly given as a gift or present.",
        examples: ["rose", "chocolate", "card", "book", "candle", "wine"],
      },
      {
        id: "p3-c6",
        label: "Used in Italian cooking",
        definition:
          "The answer must refer to an ingredient, dish, or item that is a well-known staple of Italian cuisine.",
        examples: ["tomato", "pasta", "olive oil", "basil", "parmesan", "garlic"],
      },
      // Row 3
      {
        id: "p3-c7",
        label: "Comes in a bunch",
        definition:
          "The answer must refer to something that is characteristically sold, found, or grouped in a bunch — a cluster or bundle of multiple items together.",
        examples: ["grapes", "bananas", "flowers", "keys", "carrots", "kale"],
      },
      {
        id: "p3-c8",
        label: "Something sweet",
        definition:
          "The answer must refer to something that is characteristically sweet in taste.",
        examples: ["strawberry", "chocolate", "honey", "candy", "caramel", "cherry"],
      },
      {
        id: "p3-c9",
        label: "Found at a farmers market",
        definition:
          "The answer must refer to something commonly sold at a farmers market — fresh produce, artisan foods, flowers, or handmade goods.",
        examples: ["tomato", "honey", "flowers", "jam", "kale", "peach"],
      },
    ],
    sampleSolutions: [
      { answer: "rose", clears: ["p3-c1", "p3-c2", "p3-c3", "p3-c5"] },
      { answer: "tomato", clears: ["p3-c1", "p3-c2", "p3-c4", "p3-c6", "p3-c9"] },
      { answer: "strawberry", clears: ["p3-c1", "p3-c4", "p3-c8"] },
      { answer: "garlic", clears: ["p3-c3", "p3-c6"] },
      { answer: "grapes", clears: ["p3-c7", "p3-c8", "p3-c9"] },
      { answer: "chocolate", clears: ["p3-c5", "p3-c8"] },
    ],
  },
];

/**
 * Get today's puzzle based on date string (YYYY-MM-DD).
 * Falls back to the first puzzle if no match.
 */
function getPuzzleForDate(dateStr) {
  const puzzle = PUZZLES.find((p) => p.date === dateStr);
  return puzzle || PUZZLES[0];
}

function getPuzzleById(id) {
  return PUZZLES.find((p) => p.id === id) || null;
}

module.exports = { PUZZLES, getPuzzleForDate, getPuzzleById };
