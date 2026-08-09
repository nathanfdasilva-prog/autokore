import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Usa automaticamente as variáveis UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN
// (já configuradas na Vercel)
const redis = Redis.fromEnv()

// Limite: 10 requisições a cada 10 segundos, por pessoa/IP
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: 'autokore-ratelimit',
})