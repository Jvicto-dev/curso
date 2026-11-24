import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("espaco_cultural", (table) => {
        table.uuid("espaco_id").primary()
        table.uuid("bairro_id").notNullable()
            .references("bairro_id").inTable("bairro")
        table.string("nome").notNullable()
        table.string("natureza")    // ex.: público, privado
        table.string("tipo_espaco") // ex.: teatro, praça, centro cultural
        table.string("endereco")
        table.decimal("latitude", 10, 7)
        table.decimal("longitude", 10, 7)
        table.integer("capacidade")
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("espaco_cultural")
}
