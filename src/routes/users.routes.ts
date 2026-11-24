import type { FastifyInstance } from "fastify"
import { randomUUID } from "node:crypto"
import bcrypt from "bcryptjs"
import { connection } from "../config/database.js"

// Formato do corpo (body) que chega no POST e no PUT
type UserBody = {
    name: string
    email: string
    password: string
}

// Parâmetros da URL: o :id de /usuario/:id
type UserParams = {
    id: string
}

// No banco, a tabela se chama "usuario" (migration rename_users_to_usuario):
// o id fica na coluna "usuario_id" e a senha na coluna "senha_hash".
// Por fora a API não muda: continua /usuario, com name, email e password no body.

// Plugin do Fastify: recebe o app e cria nele as rotas de users.
// O prefixo "/usuario" é colocado no server.ts, por isso aqui as rotas
// usam só "/" e "/:id" (escrever "/usuario" aqui viraria /usuario/usuario).
export async function usersRoutes(app: FastifyInstance) {
    // GET /usuario -> lista todos os usuários
    app.get("/", async () => {
        const users = await connection("usuario").select("*")
        return users
    })

    // POST /usuario -> cria um usuário novo
    app.post("/", async (request, reply) => {
        const { name, email, password } = request.body as UserBody

        // A senha nunca é salva como veio: guardamos só o hash dela
        const senha_hash = await bcrypt.hash(password, 8)

        // O id é gerado aqui no código (UUID), não pelo banco
        const user = { usuario_id: randomUUID(), name, email, senha_hash }

        await connection("usuario").insert(user)

        // 201 = Created (recurso criado com sucesso)
        return reply.status(201).send(user)
    })

    // GET /usuario/:id -> busca um usuário pelo id
    app.get("/:id", async (request, reply) => {
        const { id } = request.params as UserParams

        // .first() devolve só o primeiro registro (ou undefined se não achar)
        const user = await connection("usuario").where({ usuario_id: id }).first()

        if (!user) {
            return reply.status(404).send({ message: "Usuário não encontrado" })
        }

        return user
    })

    // PUT /usuario/:id -> atualiza os dados de um usuário
    app.put("/:id", async (request, reply) => {
        const { id } = request.params as UserParams
        const { name, email, password } = request.body as UserBody

        const senha_hash = await bcrypt.hash(password, 8)

        // .update() devolve quantas linhas foram alteradas
        const updated = await connection("usuario").where({ usuario_id: id }).update({ name, email, senha_hash })

        // 0 linhas alteradas = não existe usuário com esse id
        if (updated === 0) {
            return reply.status(404).send({ message: "Usuário não encontrado" })
        }

        // Busca de novo pra devolver o usuário já atualizado
        const user = await connection("usuario").where({ usuario_id: id }).first()
        return user
    })

    // DELETE /usuario/:id -> remove um usuário
    app.delete("/:id", async (request, reply) => {
        const { id } = request.params as UserParams

        // .delete() devolve quantas linhas foram apagadas
        const deleted = await connection("usuario").where({ usuario_id: id }).delete()

        if (deleted === 0) {
            return reply.status(404).send({ message: "Usuário não encontrado" })
        }

        // 204 = No Content (deu certo, mas não tem nada pra devolver)
        return reply.status(204).send()
    })
}
