import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("historico_analise", (table) => {
        table.uuid("historico_id").primary()
        table.uuid("artista_id").notNullable()
            .references("artista_id").inTable("artista")
            .onDelete("CASCADE")
        table.uuid("usuario_id").notNullable() // quem fez a análise
            .references("usuario_id").inTable("usuario")
        table.string("acao").notNullable() // ex.: aprovou, reprovou, pediu ajuste
        table.text("motivo")
        table.timestamp("criado_em").notNullable().defaultTo(knex.fn.now())
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("historico_analise")
}
