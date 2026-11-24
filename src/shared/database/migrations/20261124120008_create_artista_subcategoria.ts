import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("artista_subcategoria", (table) => {
        table.uuid("artista_id").notNullable()
            .references("artista_id").inTable("artista")
            .onDelete("CASCADE")
        table.uuid("subcategoria_id").notNullable()
            .references("subcategoria_id").inTable("subcategoria")
            .onDelete("CASCADE")

        // chave primária composta: o mesmo par não pode se repetir
        table.primary(["artista_id", "subcategoria_id"])
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("artista_subcategoria")
}
