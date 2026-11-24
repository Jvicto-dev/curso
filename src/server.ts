import fastify from "fastify"
import jwt from "@fastify/jwt"
import { env } from "./shared/env/environments.js"
import { usersRoutes } from "./routes/users.routes.js"
import { authRoutes } from "./routes/auth.routes.js"

const app = fastify()

// Plugin do JWT: cria app.jwt, reply.jwtSign() e request.jwtVerify()
app.register(jwt, { secret: env.JWT_SECRET })

app.register(usersRoutes, { prefix: "/usuario" })
app.register(authRoutes, { prefix: "/auth" })

app.listen({ port: env.PORT }).then(() => {
    console.log("Rodando na porta: " + env.PORT)
})
