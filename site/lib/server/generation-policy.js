export const GENERATION_POLICY = `You design Bunch, a 4x4 game where a player selects categories and enters ONE word or familiar phrase to connect them through any established meaning.

MATCH THIS STYLE, not a trivia quiz or a Connections-style set of four secret groups:
Reference board: Something purple; A musical instrument; Found in space; Has a handle; Something fuzzy; Used in the rain; Has keys; A type of bird; Something you can fold; Has a pit or stone; A job title; Can make an echo; A type of vehicle; A chess piece; Has a crown; Found in a theatre.
Why it works: umbrella connects Has a handle + Used in the rain + Something you can fold; kiwi connects Something fuzzy + A type of bird; peach connects Something fuzzy + Has a pit or stone; conductor connects A job title + Found in a theatre; rook connects A type of bird + A chess piece. Different established meanings count. Build a DIFFERENT board with the same approachable format and opportunities.

CATEGORY DESIGN:
- Exactly 16 distinct, plainly understandable categories. Mix observable properties (color, texture, shape), familiar parts/features, ordinary uses/abilities, everyday places/situations, and recognizable types/roles (objects, animals, food, occupations, etc.). Avoid a board dominated by any one subject or category type.
- Build every label from an explicit frame plus a short subject. Never return a standalone noun like "Fruit", "Tools" or "Purple". Use "A type of fruit", "A type of tool", or "Something purple". Labels should sound like the reference: Something ..., Has ..., Can ..., Used ..., Found ..., A type of ..., A .... Usually 2-6 words, never more than 8 words or 40 characters. Concrete everyday language, not academic taxonomy, cryptic clues, niche trivia, elaborate themed lists, or poetic/abstract associations.
- No spelling/letter-count/rhyme/anagram categories, arbitrary lists of named items, subjective judgments like 'something interesting', conjunctions of unrelated requirements, or universal categories like 'a thing'. The pleasure comes from a word's meanings and practical connections, not matching letters or inventing a descriptive sentence.
- Each category should allow many familiar answers. A category can be a standard small named set like chess pieces, but do not make a board full of tiny obscure sets.
- Definitions clarify the ordinary intended scope without making examples exhaustive. Explicitly allow alternate established meanings and practical connections where applicable. Do not require an answer to be the most typical example; do not invent connections or dilute an explicit category meaning.

DESIGN CONNECTIONS BEFORE FINISHING:
- Supply 3-5 genuine familiar example answers per category. Reuse the EXACT SAME example spelling across cards when it really matches both. Examples must name established entities/phrases, never descriptions assembled from card keywords.
- Include at least 4 DIFFERENT shared example words, each legitimately matching 2-4 cards; together these should connect at least 8 of the 16 cards. The same example should not appear in more than 5 categories. Avoid nested/synonymous categories that give away the same bunch repeatedly.
- Include varied overlaps: ordinary physical properties AND alternate meanings. Independently verify that every category has valid answers, the suggested shared examples really match, and there is a full clearing path. Do not claim factual certainty based only on keyword overlap.
- NEVER reuse a category from forbiddenAdjacentCategories, including a rewording with the same meaning. Those belong to the previous or next calendar day. Recurring categories after a gap are fine. Other recent labels are a freshness preference, not a reason to invent weird categories. Use new combinations of simple category ideas rather than escalating into obscure trivia. Do not copy the reference board wholesale.

Return only JSON {"categories":[{"frame":"Has","subject":"wheels","definition":"An object that has wheels for ordinary movement.","examples":["car","bicycle","suitcase"]}, ...]}. The example demonstrates the structure only: produce exactly 16 actual categories, not an ellipsis. Allowed frames: "Something", "Has", "Can", "Used in", "Used for", "Found in", "A type of", "A", "An". Choose the frame appropriate to each category, with subject completing it grammatically. For example frame="Found in", subject="a kitchen"; frame="Can", subject="float". The server combines frame and subject into the visible card label. No analysis, Markdown, category IDs or publication decisions. These are proposals requiring human review.`;

// Label frames make phrase labels part of the data format, not just a stylistic request.
export function materializeGeneratedCategories(categories) {
 if(!Array.isArray(categories))return categories;
 const frames=new Set(['Something','Has','Can','Used in','Used for','Found in','A type of','A','An']);
 return categories.map(c=>{
  if(c && frames.has(c.frame) && typeof c.subject==='string' && c.subject.trim())return {...c,label:c.frame+' '+c.subject.trim()};
  return c; // Preserve legacy-shaped responses for review instead of inventing a meaning.
 });
}

// Style problems are review warnings. Only structural validation blocks saving a draft.
export function generationReviewWarnings(categories) {
 const warnings=[],words=new Map();
 for(let i=0;i<categories.length;i++){
  const c=categories[i],count=c.label.trim().split(/\s+/).length;
  if(count<2)warnings.push(`Card ${i+1}: use a phrase label instead of "${c.label}".`);
  if(c.label.length>40 || count>8)warnings.push(`Card ${i+1}: shorten this label to fit the card.`);
  if(/\b(rhym(?:e|es|ing)|anagrams?|starts? with (?:the )?(?:letter|[a-z]\b)|ends? with (?:the )?(?:letter|[a-z]\b)|\d+[- ]letter words?|spelled|spelling)\b/i.test(c.label))warnings.push(`Card ${i+1}: replace the spelling-game category with an everyday category.`);
  if(c.examples.filter(e=>e.trim()).length<3)warnings.push(`Card ${i+1}: add at least three example answers.`);
  for(const word of new Set(c.examples.map(e=>e.trim().toLowerCase().replace(/\s+/g,' ')).filter(Boolean)))words.set(word,[...(words.get(word)??[]),i]);
 }
 const overlaps=[...words.values()].filter(ids=>ids.length>=2);
 if(overlaps.some(ids=>ids.length>5))warnings.push('One example appears on more than five cards. Check for overly broad categories.');
 if(overlaps.length<4 || new Set(overlaps.flat()).size<8)warnings.push('Few shared examples are listed. Add and verify more words that connect multiple cards; unlisted connections may still exist.');
 return warnings;
}
