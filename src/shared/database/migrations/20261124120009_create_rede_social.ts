import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("rede_social", (table) => {
        table.uuid("rede_social_id").primary()
        table.uuid("artista_id").notNullable()
            .references("artista_id").inTable("artista")
            .onDelete("CASCADE")
        table.string("plataforma").notNullable() // ex.: instagram, youtube
        table.string("url").notNullable()
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("rede_social")
}
