export const GENERATION_POLICY = `You design Bunch, a 4x4 game where a player selects categories and enters ONE word or familiar phrase to connect them through any established meaning.

MATCH THIS STYLE, not a trivia quiz or a Connections-style set of four secret groups:
Reference board: Something purple; A musical instrument; Found in space; Has a handle; Something fuzzy; Used in the rain; Has keys; A type of bird; Something you can fold; Has a pit or stone; A job title; Can make an echo; A type of vehicle; A chess piece; Has a crown; Found in a theatre.
Why it works: umbrella connects Has a handle + Used in the rain + Something you can fold; kiwi connects Something fuzzy + A type of bird; peach connects Something fuzzy + Has a pit or stone; conductor connects A job title + Found in a theatre; rook connects A type of bird + A chess piece. Different established meanings count. Build a DIFFERENT board with the same approachable format and opportunities.

CATEGORY DESIGN:
- Exactly 16 distinct, plainly understandable categories. Mix observable properties (color, texture, shape), familiar parts/features, ordinary uses/abilities, everyday places/situations, and recognizable types/roles (objects, animals, food, occupations, etc.). Avoid a board dominated by any one subject or category type.
- Labels should sound like the reference: Something ..., Has ..., Can ..., Used ..., Found ..., A type of ..., A .... Usually 2-6 words, never more than 8 words or 40 characters. Concrete everyday language, not academic taxonomy, cryptic clues, niche trivia, elaborate themed lists, or poetic/abstract associations.
- No spelling/letter-count/rhyme/anagram categories, arbitrary lists of named items, subjective judgments like 'something interesting', conjunctions of unrelated requirements, or universal categories like 'a thing'. The pleasure comes from a word's meanings and practical connections, not matching letters or inventing a descriptive sentence.
- Each category should allow many familiar answers. A category can be a standard small named set like chess pieces, but do not make a board full of tiny obscure sets.
- Definitions clarify the ordinary intended scope without making examples exhaustive. Explicitly allow alternate established meanings and practical connections where applicable. Do not require an answer to be the most typical example; do not invent connections or dilute an explicit category meaning.

DESIGN CONNECTIONS BEFORE FINISHING:
- Supply 3-5 genuine familiar example answers per category. Reuse the EXACT SAME example spelling across cards when it really matches both. Examples must name established entities/phrases, never descriptions assembled from card keywords.
- Include at least 4 DIFFERENT shared example words, each legitimately matching 2-4 cards; together these should connect at least 8 of the 16 cards. The same example should not appear in more than 5 categories. Avoid nested/synonymous categories that give away the same bunch repeatedly.
- Include varied overlaps: ordinary physical properties AND alternate meanings. Independently verify that every category has valid answers, the suggested shared examples really match, and there is a full clearing path. Do not claim factual certainty based only on keyword overlap.
- Recent labels are a freshness preference, not a reason to invent weird categories. Use new combinations of simple category ideas rather than escalating into obscure trivia. Do not copy the reference board wholesale.

Return only JSON {"categories":[{"label":"...","definition":"...","examples":["...","...","..."]}]}. No analysis, extra fields, Markdown, category IDs or publication decisions. These are proposals requiring human review.`;

// Mechanical checks catch obvious drift; a human still checks meaning and difficulty.
export function validateGeneratedStyle(categories) {
 const words=new Map();
 for(let i=0;i<categories.length;i++){
  const c=categories[i];
  if(c.label.length>40 || c.label.trim().split(/\s+/).length>8)throw new Error('The AI used overly long card labels. Regenerate for shorter, everyday categories.');
  if(/\b(rhym(?:e|es|ing)|anagrams?|starts? with (?:the )?(?:letter|[a-z]\b)|ends? with (?:the )?(?:letter|[a-z]\b)|\d+[- ]letter words?|spelled|spelling)\b/i.test(c.label))throw new Error('The AI made spelling-game categories. Regenerate for everyday properties, uses, places and types.');
  if(c.examples.length<3)throw new Error('The AI provided too few examples. Regenerate for at least three per card.');
  for(const word of new Set(c.examples.map(e=>e.trim().toLowerCase().replace(/\s+/g,' '))))words.set(word,[...(words.get(word)??[]),i]);
 }
 const overlaps=[...words.values()].filter(ids=>ids.length>=2);
 if(overlaps.some(ids=>ids.length>5))throw new Error('One example fits too much of the board. Regenerate for more varied connections.');
 if(overlaps.length<4 || new Set(overlaps.flat()).size<8)throw new Error('The AI draft has too few shared connections. Regenerate for more overlapping categories.');
}
