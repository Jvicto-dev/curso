import fastify from "fastify"
import { env } from "./shared/env/environments.js"
import { usersRoutes } from "./routes/users.routes.js"

const app = fastify()

app.register(usersRoutes, { prefix: "/users" })

app.listen({ port: env.PORT }).then(() => {
    console.log("Rodando na porta: " + env.PORT)
})
