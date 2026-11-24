import type { FastifyInstance } from "fastify"
import { randomUUID } from "node:crypto"
import { connection } from "../config/database.js"

// Formato do corpo (body) que chega no POST e no PUT
type CategoriaBody = {
    nome: string
}

// Parâmetros da URL: o :id de /categoria/:id
type CategoriaParams = {
    id: string
}

export async function categoriaRoutes(app: FastifyInstance) {
    // GET /categoria -> lista todas as categorias
    app.get("/", async () => {
        const categorias = await connection("categoria").select("*").orderBy("nome")
        return categorias
    })

    // POST /categoria -> cria uma categoria nova
    app.post("/", async (request, reply) => {
        const { nome } = request.body as CategoriaBody

        // O nome é único no banco: conferimos antes pra dar uma mensagem clara
        const jaExiste = await connection("categoria").where({ nome }).first()

        if (jaExiste) {
            // 409 = Conflict (já existe um recurso igual)
            return reply.status(409).send({ message: "Já existe uma categoria com esse nome" })
        }

        const categoria = { categoria_id: randomUUID(), nome }

        await connection("categoria").insert(categoria)

        return reply.status(201).send(categoria)
    })

    // GET /categoria/:id -> busca uma categoria pelo id
    app.get("/:id", async (request, reply) => {
        const { id } = request.params as CategoriaParams

        const categoria = await connection("categoria").where({ categoria_id: id }).first()

        if (!categoria) {
            return reply.status(404).send({ message: "Categoria não encontrada" })
        }

        return categoria
    })

    // PUT /categoria/:id -> troca o nome de uma categoria
    app.put("/:id", async (request, reply) => {
        const { id } = request.params as CategoriaParams
        const { nome } = request.body as CategoriaBody

        // Outra categoria (com id diferente) já usa esse nome?
        const jaExiste = await connection("categoria")
            .where({ nome })
            .whereNot({ categoria_id: id })
            .first()

        if (jaExiste) {
            return reply.status(409).send({ message: "Já existe uma categoria com esse nome" })
        }

        const updated = await connection("categoria").where({ categoria_id: id }).update({ nome })

        if (updated === 0) {
            return reply.status(404).send({ message: "Categoria não encontrada" })
        }

        const categoria = await connection("categoria").where({ categoria_id: id }).first()
        return categoria
    })

    // DELETE /categoria/:id -> remove uma categoria
    // Atenção: as subcategorias dela também são apagadas (onDelete CASCADE na migration)
    app.delete("/:id", async (request, reply) => {
        const { id } = request.params as CategoriaParams

        const deleted = await connection("categoria").where({ categoria_id: id }).delete()

        if (deleted === 0) {
            return reply.status(404).send({ message: "Categoria não encontrada" })
        }

        return reply.status(204).send()
    })
}
