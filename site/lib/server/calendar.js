export function easternDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone:'America/New_York', year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(now);
  const get = type => parts.find(p => p.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
export function addDays(date, count) { return new Date(Date.parse(date+'T12:00:00Z') + count*86400000).toISOString().slice(0,10); }
export function puzzleNumber(date) { return Math.round((Date.parse(date+'T12:00:00Z')-Date.parse('2026-10-15T12:00:00Z'))/86400000)+1; }
export function streakStats(dates, today) {
  const sorted = [...new Set(dates.filter(d => d <= today))].sort(); const days = new Set(sorted);
  let best = 0, run = 0, previous;
  for (const date of sorted) { run = previous && addDays(previous,1) === date ? run+1 : 1; best=Math.max(best,run); previous=date; }
  let cursor=days.has(today)?today:addDays(today,-1), current=0;
  while(days.has(cursor)){current++;cursor=addDays(cursor,-1);}
  return { currentStreak:current, bestStreak:best, dailyCompleted:sorted.length };
}
