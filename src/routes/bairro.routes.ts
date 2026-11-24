import type { FastifyInstance } from "fastify"
import { randomUUID } from "node:crypto"
import { connection } from "../config/database.js"

// Formato do corpo (body) que chega no POST e no PUT
type BairroBody = {
    nome: string
    latitude: number
    longitude: number
}

// Parâmetros da URL: o :id de /bairro/:id
type BairroParams = {
    id: string
}

export async function bairroRoutes(app: FastifyInstance) {
    // GET /bairro -> lista todos os bairros
    app.get("/", async () => {
        const bairros = await connection("bairro").select("*").orderBy("nome")
        return bairros
    })

    // POST /bairro -> cria um bairro novo
    app.post("/", async (request, reply) => {
        const { nome, latitude, longitude } = request.body as BairroBody

        const bairro = { bairro_id: randomUUID(), nome, latitude, longitude }

        await connection("bairro").insert(bairro)

        return reply.status(201).send(bairro)
    })

    // GET /bairro/:id -> busca um bairro pelo id
    app.get("/:id", async (request, reply) => {
        const { id } = request.params as BairroParams

        const bairro = await connection("bairro").where({ bairro_id: id }).first()

        if (!bairro) {
            return reply.status(404).send({ message: "Bairro não encontrado" })
        }

        return bairro
    })

    // PUT /bairro/:id -> atualiza os dados de um bairro
    app.put("/:id", async (request, reply) => {
        const { id } = request.params as BairroParams
        const { nome, latitude, longitude } = request.body as BairroBody

        const updated = await connection("bairro").where({ bairro_id: id }).update({ nome, latitude, longitude })

        if (updated === 0) {
            return reply.status(404).send({ message: "Bairro não encontrado" })
        }

        const bairro = await connection("bairro").where({ bairro_id: id }).first()
        return bairro
    })

    // DELETE /bairro/:id -> remove um bairro
    app.delete("/:id", async (request, reply) => {
        const { id } = request.params as BairroParams

        // Espaços culturais e artistas apontam pro bairro (bairro_id).
        // Se algum ainda usa esse bairro, não deixamos apagar.
        const espaco = await connection("espaco_cultural").where({ bairro_id: id }).first()
        const artista = await connection("artista").where({ bairro_id: id }).first()

        if (espaco || artista) {
            // 409 = Conflict: o bairro ainda está em uso
            return reply.status(409).send({ message: "Esse bairro ainda tem espaços culturais ou artistas" })
        }

        const deleted = await connection("bairro").where({ bairro_id: id }).delete()

        if (deleted === 0) {
            return reply.status(404).send({ message: "Bairro não encontrado" })
        }

        return reply.status(204).send()
    })
}
