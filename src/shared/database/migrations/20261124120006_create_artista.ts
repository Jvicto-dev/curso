import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("artista", (table) => {
        table.uuid("artista_id").primary()

        // chaves estrangeiras
        table.uuid("usuario_id").notNullable().unique()
            .references("usuario_id").inTable("usuario")
            .onDelete("CASCADE")
        table.uuid("bairro_id")
            .references("bairro_id").inTable("bairro")
        table.uuid("aprovado_por") // usuário que aprovou o cadastro (vazio enquanto não aprovado)
            .references("usuario_id").inTable("usuario")

        // dados públicos
        table.string("slug").notNullable().unique()
        table.string("nome_artistico").notNullable()
        table.string("tipo_agente") // ex.: pessoa física, coletivo, grupo
        table.integer("tempo_atuacao_anos")
        table.text("resumo")
        table.string("drt")
        table.string("foto") // url da foto
        table.boolean("atende_publico_infantil").notNullable().defaultTo(false)

        // dados internos (não aparecem no perfil público)
        table.string("nome_civil").notNullable()
        table.string("cpf_cnpj").notNullable()
        table.string("telefone")
        table.boolean("telefone_publico").notNullable().defaultTo(false) // se o telefone pode aparecer no perfil
        table.boolean("credenciado").notNullable().defaultTo(false)

        // aceites
        table.timestamp("declaracao_veracidade_em")
        table.timestamp("aceite_lgpd_em")

        // análise do cadastro
        table.string("status").notNullable().defaultTo("pendente") // pendente, aprovado, reprovado
        table.text("motivo_status")
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable("artista")
}
