import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("categoria", (table) => {
        table.uuid("categoria_id").primary()
        table.string("nome").notNullable().unique()
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("categoria")
}
