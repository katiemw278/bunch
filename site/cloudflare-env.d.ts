declare namespace Cloudflare { interface Env { DB?: D1Database; BUCKET?: R2Bucket; GENERATION_MODE?: "disabled" | "live"; GROQ_API_KEY?: string; JUDGING_MODE?: "seeded" | "live"; } }
