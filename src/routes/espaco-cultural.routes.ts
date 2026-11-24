import type { FastifyInstance } from "fastify"
import { randomUUID } from "node:crypto"
import { connection } from "../config/database.js"

// Formato do corpo (body) que chega no POST e no PUT
type EspacoCulturalBody = {
    bairro_id: string    // o bairro onde o espaço fica
    nome: string
    natureza: string     // ex.: público, privado
    tipo_espaco: string  // ex.: teatro, praça, centro cultural
    endereco: string
    latitude: number
    longitude: number
    capacidade: number
}

// Parâmetros da URL: o :id de /espaco-cultural/:id
type EspacoCulturalParams = {
    id: string
}

export async function espacoCulturalRoutes(app: FastifyInstance) {
    // GET /espaco-cultural -> lista todos os espaços culturais
    app.get("/", async () => {
        const espacos = await connection("espaco_cultural").select("*").orderBy("nome")
        return espacos
    })

    // POST /espaco-cultural -> cria um espaço cultural num bairro
    app.post("/", async (request, reply) => {
        const body = request.body as EspacoCulturalBody

        // Chave estrangeira: o bairro informado precisa existir
        const bairro = await connection("bairro").where({ bairro_id: body.bairro_id }).first()

        if (!bairro) {
            return reply.status(404).send({ message: "Bairro não encontrado" })
        }

        const espaco = {
            espaco_id: randomUUID(),
            bairro_id: body.bairro_id,
            nome: body.nome,
            natureza: body.natureza,
            tipo_espaco: body.tipo_espaco,
            endereco: body.endereco,
            latitude: body.latitude,
            longitude: body.longitude,
            capacidade: body.capacidade,
        }

        await connection("espaco_cultural").insert(espaco)

        return reply.status(201).send(espaco)
    })

    // GET /espaco-cultural/:id -> busca um espaço cultural pelo id
    app.get("/:id", async (request, reply) => {
        const { id } = request.params as EspacoCulturalParams

        const espaco = await connection("espaco_cultural").where({ espaco_id: id }).first()

        if (!espaco) {
            return reply.status(404).send({ message: "Espaço cultural não encontrado" })
        }

        return espaco
    })

    // PUT /espaco-cultural/:id -> atualiza os dados de um espaço cultural
    app.put("/:id", async (request, reply) => {
        const { id } = request.params as EspacoCulturalParams
        const body = request.body as EspacoCulturalBody

        // Mesma conferência do POST: o bairro precisa existir
        const bairro = await connection("bairro").where({ bairro_id: body.bairro_id }).first()

        if (!bairro) {
            return reply.status(404).send({ message: "Bairro não encontrado" })
        }

        const updated = await connection("espaco_cultural").where({ espaco_id: id }).update({
            bairro_id: body.bairro_id,
            nome: body.nome,
            natureza: body.natureza,
            tipo_espaco: body.tipo_espaco,
            endereco: body.endereco,
            latitude: body.latitude,
            longitude: body.longitude,
            capacidade: body.capacidade,
        })

        if (updated === 0) {
            return reply.status(404).send({ message: "Espaço cultural não encontrado" })
        }

        const espaco = await connection("espaco_cultural").where({ espaco_id: id }).first()
        return espaco
    })

    // DELETE /espaco-cultural/:id -> remove um espaço cultural
    app.delete("/:id", async (request, reply) => {
        const { id } = request.params as EspacoCulturalParams

        const deleted = await connection("espaco_cultural").where({ espaco_id: id }).delete()

        if (deleted === 0) {
            return reply.status(404).send({ message: "Espaço cultural não encontrado" })
        }

        return reply.status(204).send()
    })
}
