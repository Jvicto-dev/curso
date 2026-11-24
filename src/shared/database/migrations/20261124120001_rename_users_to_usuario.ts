import type { Knex } from "knex";

// Reaproveita a tabela "users" (aula 2) como a tabela "usuario" do DER:
// troca o nome da tabela e das colunas, e acrescenta a coluna "perfil".
// Os dados que já estavam em "users" continuam lá.

export async function up(knex: Knex): Promise<void> {
    await knex.schema.renameTable("users", "usuario")

    await knex.schema.alterTable("usuario", (table) => {
        table.renameColumn("id", "usuario_id")
        table.renameColumn("password", "senha_hash")
    })

    await knex.schema.alterTable("usuario", (table) => {
        // ex.: "admin", "analista", "artista"
        // o default é obrigatório: as linhas que já existem precisam de um valor
        table.string("perfil").notNullable().defaultTo("artista")
    })
}


export async function down(knex: Knex): Promise<void> {
    // desfaz na ordem contrária
    await knex.schema.alterTable("usuario", (table) => {
        table.dropColumn("perfil")
    })

    await knex.schema.alterTable("usuario", (table) => {
        table.renameColumn("senha_hash", "password")
        table.renameColumn("usuario_id", "id")
    })

    await knex.schema.renameTable("usuario", "users")
}
