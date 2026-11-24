import fastify from "fastify"
import jwt from "@fastify/jwt"
import cors from "@fastify/cors"
import { env } from "./shared/env/environments.js"
import { usersRoutes } from "./routes/users.routes.js"
import { authRoutes } from "./routes/auth.routes.js"
import { categoriaRoutes } from "./routes/categoria.routes.js"
import { subcategoriaRoutes } from "./routes/subcategoria.routes.js"
import { bairroRoutes } from "./routes/bairro.routes.js"
import { espacoCulturalRoutes } from "./routes/espaco-cultural.routes.js"

const app = fastify()

// CORS: deixa páginas abertas no navegador (como o testador-de-api.html) chamarem a API.
// Sem a lista de methods, o plugin só libera GET, HEAD e POST.
app.register(cors, {
    origin: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
})

// Plugin do JWT: cria app.jwt, reply.jwtSign() e request.jwtVerify()
app.register(jwt, { secret: env.JWT_SECRET })

app.register(usersRoutes, { prefix: "/usuario" })
app.register(authRoutes, { prefix: "/auth" })
app.register(categoriaRoutes, { prefix: "/categoria" })
app.register(subcategoriaRoutes, { prefix: "/subcategoria" })
app.register(bairroRoutes, { prefix: "/bairro" })
app.register(espacoCulturalRoutes, { prefix: "/espaco-cultural" })

app.listen({ port: env.PORT }).then(() => {
    console.log("Rodando na porta: " + env.PORT)
})
