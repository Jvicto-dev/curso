import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("bairro", (table) => {
        table.uuid("bairro_id").primary()
        table.string("nome").notNullable()
        table.decimal("latitude", 10, 7)
        table.decimal("longitude", 10, 7)
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("bairro")
}
