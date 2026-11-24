import type { FastifyInstance } from "fastify"
import { randomUUID } from "node:crypto"
import { connection } from "../config/database.js"

// Formato do corpo (body) que chega no POST e no PUT
type SubcategoriaBody = {
    categoria_id: string // a categoria "mãe" dessa subcategoria
    nome: string
}

// Parâmetros da URL: o :id de /subcategoria/:id
type SubcategoriaParams = {
    id: string
}

export async function subcategoriaRoutes(app: FastifyInstance) {
    // GET /subcategoria -> lista todas as subcategorias
    app.get("/", async () => {
        const subcategorias = await connection("subcategoria").select("*").orderBy("nome")
        return subcategorias
    })

    // POST /subcategoria -> cria uma subcategoria dentro de uma categoria
    app.post("/", async (request, reply) => {
        const { categoria_id, nome } = request.body as SubcategoriaBody

        // Chave estrangeira: a categoria informada precisa existir
        const categoria = await connection("categoria").where({ categoria_id }).first()

        if (!categoria) {
            return reply.status(404).send({ message: "Categoria não encontrada" })
        }

        const subcategoria = { subcategoria_id: randomUUID(), categoria_id, nome }

        await connection("subcategoria").insert(subcategoria)

        return reply.status(201).send(subcategoria)
    })

    // GET /subcategoria/:id -> busca uma subcategoria pelo id
    app.get("/:id", async (request, reply) => {
        const { id } = request.params as SubcategoriaParams

        const subcategoria = await connection("subcategoria").where({ subcategoria_id: id }).first()

        if (!subcategoria) {
            return reply.status(404).send({ message: "Subcategoria não encontrada" })
        }

        return subcategoria
    })

    // PUT /subcategoria/:id -> atualiza nome e/ou categoria de uma subcategoria
    app.put("/:id", async (request, reply) => {
        const { id } = request.params as SubcategoriaParams
        const { categoria_id, nome } = request.body as SubcategoriaBody

        // Mesma conferência do POST: a categoria nova precisa existir
        const categoria = await connection("categoria").where({ categoria_id }).first()

        if (!categoria) {
            return reply.status(404).send({ message: "Categoria não encontrada" })
        }

        const updated = await connection("subcategoria").where({ subcategoria_id: id }).update({ categoria_id, nome })

        if (updated === 0) {
            return reply.status(404).send({ message: "Subcategoria não encontrada" })
        }

        const subcategoria = await connection("subcategoria").where({ subcategoria_id: id }).first()
        return subcategoria
    })

    // DELETE /subcategoria/:id -> remove uma subcategoria
    app.delete("/:id", async (request, reply) => {
        const { id } = request.params as SubcategoriaParams

        const deleted = await connection("subcategoria").where({ subcategoria_id: id }).delete()

        if (deleted === 0) {
            return reply.status(404).send({ message: "Subcategoria não encontrada" })
        }

        return reply.status(204).send()
    })
}
