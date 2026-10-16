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
 *   - At least one verified path to clear the board
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
        label: "Fits in your palm",
        definition:
          "The answer must refer to something that is characteristically small in size — typically fitting in a human hand or smaller. Everyday objects that are notably compact or tiny.",
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
        label: "Known for making a sound",
        definition:
          "The answer must refer to something whose primary purpose or most defining characteristic is the sound it makes. Making sound should be the first thing that comes to mind about it — not an incidental property.",
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
        label: "Designed to float",
        definition:
          "The answer must refer to something that is specifically designed or purpose-built to float on water, or something whose primary natural function involves floating. Incidental floating (e.g. a ball that happens to float) does not count.",
        examples: ["boat", "buoy", "life jacket", "raft", "cork", "pontoon"],
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
        label: "A food you eat raw",
        definition:
          "The answer must refer to a food that is commonly or typically eaten raw — without cooking or significant processing. It should be something people regularly eat in its natural state.",
        examples: ["tomato", "strawberry", "apple", "carrot", "cucumber", "grape"],
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

/** @type {[string, string, string[]][]} */
const EXTRA_CATEGORIES = [
  ["Something green", "Characteristically green in color", ["grass", "lime", "pea"]],
  ["Made of metal", "An object typically made primarily of metal", ["coin", "knife", "bell"]],
  ["Has wheels", "Typically has wheels used for movement", ["bicycle", "car", "skateboard"]],
  ["Something crunchy", "A food characteristically crunchy when eaten", ["carrot", "apple", "cracker"]],
  ["Found in a forest", "Naturally found in forests", ["acorn", "mushroom", "owl"]],
  ["Has wings", "An animal or vehicle with wings", ["bird", "airplane", "butterfly"]],
  ["Used for writing", "An instrument or material commonly used for writing", ["pencil", "pen", "chalk"]],
  ["Something transparent", "Typically transparent, allowing you to see through it", ["glass", "window", "water"]],
  ["Keeps you warm", "Commonly worn or used to provide warmth", ["coat", "blanket", "fire"]],
  ["Found in a bathroom", "Commonly kept or used in a bathroom", ["soap", "towel", "toothbrush"]],
  ["Has seeds", "A plant product containing seeds", ["apple", "tomato", "lemon"]],
  ["Something sharp", "Typically has a sharp point or cutting edge", ["knife", "needle", "thorn"]],
  ["Makes light", "Produces or emits visible light", ["sun", "candle", "lamp"]],
  ["Lives in water", "An organism that naturally lives primarily in water", ["fish", "jellyfish", "whale"]],
  ["Something soft", "Characteristically soft to the touch", ["cotton", "pillow", "feather"]],
  ["Comes in pairs", "Commonly used, sold, or found as a pair", ["shoes", "socks", "gloves"]],
];
const HARD_PUZZLES = PUZZLES.map(p => ({ ...p, id: p.id + "-hard4", categories: [
  ...p.categories.map(c => ({ ...c, id: c.id + "-hard" })),
  ...EXTRA_CATEGORIES.slice(0, 7).map(([label, definition, examples], i) => ({ id: `${p.id}-hard-extra-${i}`, label, definition, examples }))
] }));

// An additional board accessible by its own play link.
HARD_PUZZLES.push({
  "id": "puzzle-004-hard4",
  "date": "2026-10-15",
  "number": 4,
  "categories": [
    {
      "id": "p4-c1",
      "label": "Something purple",
      "definition": "Characteristically purple in color",
      "examples": [
        "lavender",
        "eggplant",
        "amethyst"
      ]
    },
    {
      "id": "p4-c2",
      "label": "A musical instrument",
      "definition": "A recognized instrument played to produce music",
      "examples": [
        "flute",
        "guitar",
        "drum"
      ]
    },
    {
      "id": "p4-c3",
      "label": "Found in space",
      "definition": "Naturally present in outer space or an object commonly sent there",
      "examples": [
        "star",
        "comet",
        "satellite"
      ]
    },
    {
      "id": "p4-c4",
      "label": "Has a handle",
      "definition": "Typically has a handle used to hold or operate it",
      "examples": [
        "mug",
        "umbrella",
        "suitcase"
      ]
    },
    {
      "id": "p4-c5",
      "label": "Something fuzzy",
      "definition": "Characteristically covered in fine soft hair or fibers",
      "examples": [
        "peach",
        "kiwi",
        "teddy bear"
      ]
    },
    {
      "id": "p4-c6",
      "label": "Used in the rain",
      "definition": "Commonly used to protect against rain or manage rainwater",
      "examples": [
        "umbrella",
        "raincoat",
        "boots"
      ]
    },
    {
      "id": "p4-c7",
      "label": "Has keys",
      "definition": "Typically has physical keys for operating, playing, or opening it",
      "examples": [
        "piano",
        "keyboard",
        "keyring"
      ]
    },
    {
      "id": "p4-c8",
      "label": "A type of bird",
      "definition": "A bird species or widely recognized kind of bird",
      "examples": [
        "kiwi",
        "crane",
        "robin"
      ]
    },
    {
      "id": "p4-c9",
      "label": "Something you can fold",
      "definition": "Something commonly folded for use, packing, or storage, including flexible clothing and rainwear such as ponchos and raincoats, paper, textiles, and collapsible equipment. It need not be sold already folded.",
      "examples": [
        "umbrella",
        "paper",
        "towel"
      ]
    },
    {
      "id": "p4-c10",
      "label": "Has a pit or stone",
      "definition": "A fruit with a hard central pit or stone containing its seed",
      "examples": [
        "peach",
        "plum",
        "cherry"
      ]
    },
    {
      "id": "p4-c11",
      "label": "A job title",
      "definition": "A recognized occupational title, including a common alternative meaning of the answer",
      "examples": [
        "conductor",
        "pilot",
        "judge"
      ]
    },
    {
      "id": "p4-c12",
      "label": "Can make an echo",
      "definition": "Something characteristically capable of producing a sound that can echo or a place well known for echoes",
      "examples": [
        "drum",
        "cave",
        "canyon"
      ]
    },
    {
      "id": "p4-c13",
      "label": "A type of vehicle",
      "definition": "A recognized vehicle used to carry people or goods",
      "examples": [
        "train",
        "car",
        "rocket"
      ]
    },
    {
      "id": "p4-c14",
      "label": "A chess piece",
      "definition": "The name of one of the six standard types of chess piece",
      "examples": [
        "king",
        "queen",
        "bishop"
      ]
    },
    {
      "id": "p4-c15",
      "label": "Has a crown",
      "definition": "Conventionally wears or possesses a crown, including a named crown structure",
      "examples": [
        "king",
        "queen",
        "pineapple"
      ]
    },
    {
      "id": "p4-c16",
      "label": "Found in a theatre",
      "definition": "Something commonly found in a live theatre, including people and equipment",
      "examples": [
        "conductor",
        "stage",
        "curtain"
      ]
    }
  ]
});

/**
 * Get today's puzzle based on date string (YYYY-MM-DD).
 * Falls back to the first puzzle if no match.
 */
function getPuzzleForDate(dateStr, mode = "easy") {
  const pool = mode === "hard" ? HARD_PUZZLES : PUZZLES;
  const puzzle = pool.find((p) => p.date === dateStr);
  return puzzle || pool[0];
}

function getPuzzleById(id) {
  return [...PUZZLES, ...HARD_PUZZLES].find((p) => p.id === id) || null;
}

export { PUZZLES, getPuzzleForDate, getPuzzleById };
