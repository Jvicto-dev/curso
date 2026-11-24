import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("subcategoria", (table) => {
        table.uuid("subcategoria_id").primary()
        table.uuid("categoria_id").notNullable()
            .references("categoria_id").inTable("categoria")
            .onDelete("CASCADE")
        table.string("nome").notNullable()
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("subcategoria")
}
