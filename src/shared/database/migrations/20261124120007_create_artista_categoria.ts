import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("artista_categoria", (table) => {
        table.uuid("artista_id").notNullable()
            .references("artista_id").inTable("artista")
            .onDelete("CASCADE")
        table.uuid("categoria_id").notNullable()
            .references("categoria_id").inTable("categoria")
            .onDelete("CASCADE")

        // chave primária composta: o mesmo par não pode se repetir
        table.primary(["artista_id", "categoria_id"])
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("artista_categoria")
}
