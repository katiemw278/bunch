import handler from 'vinext/server/fetch-handler';
import { maintainDailyQueue } from './lib/server/generation';
export default {
 fetch: handler.fetch,
 async scheduled(_event:ScheduledController,_env:Cloudflare.Env,ctx:ExecutionContext) { ctx.waitUntil(maintainDailyQueue().catch(error=>{console.error('Daily queue job failed',error);throw error;})); },
};
