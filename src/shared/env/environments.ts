import "dotenv/config"
import { z } from "zod"
const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  DB_FILE: z.string(),
  JWT_SECRET: z.string(), // chave usada pra assinar e conferir os tokens
})
const _env = envSchema.safeParse(process.env)
if (!_env.success) throw new Error("Invalid environment variables")
export const env = _env.data


