import type { FastifyInstance } from "fastify"
import { randomUUID } from "node:crypto"
import { connection } from "../config/database.js"

// Formato do corpo (body) que chega no POST e no PUT
type UserBody = {
    name: string
    email: string
    password: string
}

// Parâmetros da URL: o :id de /users/:id
type UserParams = {
    id: string
}

// Plugin do Fastify: recebe o app e cria nele as rotas de users.
// O prefixo "/users" é colocado no server.ts, por isso aqui as rotas
// usam só "/" e "/:id" (escrever "/users" aqui viraria /users/users).
export async function usersRoutes(app: FastifyInstance) {
    // GET /users -> lista todos os usuários
    app.get("/", async () => {
        const users = await connection("users").select("*")
        return users
    })

    // POST /users -> cria um usuário novo
    app.post("/", async (request, reply) => {
        const { name, email, password } = request.body as UserBody

        // O id é gerado aqui no código (UUID), não pelo banco
        const user = { id: randomUUID(), name, email, password }

        await connection("users").insert(user)

        // 201 = Created (recurso criado com sucesso)
        return reply.status(201).send(user)
    })

    // GET /users/:id -> busca um usuário pelo id
    app.get("/:id", async (request, reply) => {
        const { id } = request.params as UserParams

        // .first() devolve só o primeiro registro (ou undefined se não achar)
        const user = await connection("users").where({ id }).first()

        if (!user) {
            return reply.status(404).send({ message: "Usuário não encontrado" })
        }

        return user
    })

    // PUT /users/:id -> atualiza os dados de um usuário
    app.put("/:id", async (request, reply) => {
        const { id } = request.params as UserParams
        const { name, email, password } = request.body as UserBody

        // .update() devolve quantas linhas foram alteradas
        const updated = await connection("users").where({ id }).update({ name, email, password })

        // 0 linhas alteradas = não existe usuário com esse id
        if (updated === 0) {
            return reply.status(404).send({ message: "Usuário não encontrado" })
        }

        // Busca de novo pra devolver o usuário já atualizado
        const user = await connection("users").where({ id }).first()
        return user
    })

    // DELETE /users/:id -> remove um usuário
    app.delete("/:id", async (request, reply) => {
        const { id } = request.params as UserParams

        // .delete() devolve quantas linhas foram apagadas
        const deleted = await connection("users").where({ id }).delete()

        if (deleted === 0) {
            return reply.status(404).send({ message: "Usuário não encontrado" })
        }

        // 204 = No Content (deu certo, mas não tem nada pra devolver)
        return reply.status(204).send()
    })
}
