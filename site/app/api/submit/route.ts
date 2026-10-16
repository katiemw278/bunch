import { normalizeAnswer,isDuplicate,feedbackMessage,getGameStatus,calcMoveScore } from '@/lib/server/logic';
import { judgeAnswer } from '@/lib/server/judge';
import { availablePuzzle,guest,json,session,db,sameOrigin,limited } from '@/lib/server/store';
import { easternDate } from '@/lib/server/calendar';
export async function POST(req:Request){
 try {
  if(!await sameOrigin(req))return json({error:'Invalid origin'},null,403);
  if(await limited('submit-ip:'+(req.headers.get('cf-connecting-ip')??'local'),120))return json({type:'retry',message:'A little too fast. Please wait a minute.'},null,429);
  const text=await req.text();if(text.length>4096)return json({error:'Request too large'},null,413);
  const body=JSON.parse(text);const {puzzleId,answer,selectedCategoryIds}=body??{};
  if(typeof puzzleId!=='string'||typeof answer!=='string'||!answer.trim()||answer.length>80)return json({error:'Invalid submission'},null,400);
  const puzzle=await availablePuzzle(puzzleId);if(!puzzle)return json({error:'Puzzle not found'},null,404);
  const player=(await guest(req))!;const send=(value:unknown,status=200)=>json(value,player.cookie,status);
  const saved=await session(player.id,puzzleId);const state=saved.state;
  const requestId=typeof body.requestId==='string'&&/^[a-zA-Z0-9-]{8,80}$/.test(body.requestId)?body.requestId:crypto.randomUUID();
  if(saved.last_request===requestId&&saved.last_response)return send(JSON.parse(saved.last_response));
  if(await limited('submit-player:'+player.id,30))return send({type:'retry',message:'A little too fast. Please wait a minute.'},429);
  if(state.status!=='playing')return send({type:'retry',message:'This board is already complete. Refresh to see your results.'});
  if(!Array.isArray(selectedCategoryIds)||!selectedCategoryIds.length||selectedCategoryIds.length>16||new Set(selectedCategoryIds).size!==selectedCategoryIds.length||selectedCategoryIds.some(id=>typeof id!=='string'||state.clearedTiles.includes(id)||!puzzle.categories.some(c=>c.id===id)))return send({type:'invalid',message:'Select the cards you think your answer matches.'});
  const normalized=normalizeAnswer(answer);if(isDuplicate(normalized,state.previousAnswers))return send({type:'duplicate',message:`You already tried "${normalized}". Try a different answer.`});
  const pending=puzzle.categories.filter(c=>selectedCategoryIds.includes(c.id));const judgments=await judgeAnswer(normalized,pending);
  if(!judgments||judgments.length!==pending.length)return send({type:'retry',message:"Couldn't check that answer. Please try again — this won't count as a move."});
  if(judgments.some(j=>j.invalidAnswer))return send({type:'invalid',message:'Too descriptive. Try one word or a familiar phrase.'});
  const newlyCleared=judgments.filter(j=>j.matches&&selectedCategoryIds.includes(j.categoryId)).map(j=>j.categoryId);
  const newClearedTiles=[...state.clearedTiles,...newlyCleared],newMoveCount=state.moveCount+1,moveScore=calcMoveScore(newlyCleared.length),newStatus=getGameStatus(newClearedTiles.length,newMoveCount,16);
  const count=newlyCleared.length;const label=count===0?'miss':count===1?'single':count===2?'pair':count===3?'triple':count===4?'quad':count<9?'super':'perfect';
  const next={...state,status:newStatus,moveCount:newMoveCount,score:state.score+moveScore,clearedTiles:newClearedTiles,previousAnswers:[...state.previousAnswers,normalized],history:[...state.history,{moveNumber:newMoveCount,answer:normalized,tilesCleared:newlyCleared,score:moveScore,label}]};
  const result={type:'result',normalized,newlyCleared,moveScore,message:feedbackMessage(count,normalized),newMoveCount,newClearedTiles,newPreviousAnswers:next.previousAnswers,newStatus,judgmentMap:Object.fromEntries(judgments.map(j=>[j.categoryId,{matches:j.matches,explanation:j.explanation}]))};
  const now=new Date().toISOString();
  const queries=[db().prepare('UPDATE game_sessions SET state=?,version=version+1,last_request=?,last_response=? WHERE player_id=? AND puzzle_id=? AND version=?').bind(JSON.stringify(next),requestId,JSON.stringify(result),player.id,puzzleId,saved.version)];
  if(newStatus==='won')queries.push(db().prepare(`INSERT INTO completions(player_id,puzzle_id,release_date,completed_at,daily_eligible,score) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM game_sessions WHERE player_id=? AND puzzle_id=? AND last_request=?) ON CONFLICT DO NOTHING`).bind(player.id,puzzleId,puzzle.date,now,puzzle.date===easternDate() && !!await db().prepare("SELECT id FROM puzzles WHERE id=? AND status='ready' AND release_date=?").bind(puzzleId,easternDate()).first()?1:0,next.score,player.id,puzzleId,requestId));
  const written=await db().batch(queries);if(written[0].meta.changes!==1)return send({type:'retry',message:'Another move was saved first. Refresh to restore your board.'});
  return send(result);
 }catch(error){console.error('Submission failed',error instanceof Error?error.message:'Unknown');return json({type:'retry',message:"Couldn't check that answer. Please try again — this won't count as a move."});}
}
