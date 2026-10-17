// Never expose the provider's raw body: it may echo request data.
export async function generationFailure(response) {
 let code='';try {const body=await response.json();if(typeof body?.error?.code==='string' && /^[a-zA-Z0-9_-]{1,80}$/.test(body.error.code))code=body.error.code;}catch{}
 const status=response.status;
 if(status===429){const raw=Number(response.headers.get('retry-after'));const seconds=Number.isFinite(raw)&&raw>0?Math.min(Math.ceil(raw),86400):60;return `Groq's usage limit was reached. Wait ${seconds} seconds before trying again. Your free plan may also have a daily limit.`;}
 if(status===401||status===403)return 'Groq rejected access. Check that the GROQ_API_KEY Worker secret is valid and has access to this model.';
 if(status===400 && ['json_validate_failed','json_generation_failed'].includes(code))return 'Groq could not finish a valid JSON board. Try generating once more; no draft was saved.';
 if(status>=500)return `Groq is temporarily unavailable (HTTP ${status}). Try again later.`;
 return `Groq rejected the board request (HTTP ${status}${code?', '+code:''}). No draft was saved.`;
}
