import type { FastifyInstance } from "fastify"
import bcrypt from "bcryptjs"
import { connection } from "../config/database.js"
import { verificarToken } from "../middlewares/verificar-token.js"

// Formato do corpo que chega no login
type LoginBody = {
    email: string
    password: string
}

// O que vai guardado dentro do token
type TokenPayload = {
    sub: string    // id do usuário ("sub" = subject, o dono do token)
    perfil: string
}

export async function authRoutes(app: FastifyInstance) {
    // POST /auth/login -> confere email e senha e devolve um token
    app.post("/login", async (request, reply) => {
        const { email, password } = request.body as LoginBody

        // 1. Procura o usuário pelo email
        const usuario = await connection("usuario").where({ email }).first()

        // Se não achou ninguém com esse email, para aqui
        if (!usuario) {
            return reply.status(401).send({ message: "Email ou senha inválidos" })
        }

        // 2. Compara a senha digitada com o hash salvo no banco
        const senhaCorreta = await bcrypt.compare(password, usuario.senha_hash)

        // Se a senha não bate, para aqui
        if (!senhaCorreta) {
            return reply.status(401).send({ message: "Email ou senha inválidos" })
        }

        // As duas mensagens são iguais de propósito:
        // assim ninguém descobre se o email existe ou não no sistema

        // 3. Deu tudo certo: monta o token

        const payload: TokenPayload = { sub: usuario.usuario_id, perfil: usuario.perfil }

        // Assina o token com o JWT_SECRET; ele vale por 1 dia
        const token = await reply.jwtSign(payload, { expiresIn: "1d" })

        return { token }
    })

    // GET /auth/me -> exemplo de rota protegida: só responde com um token válido
    // { onRequest: verificarToken } = roda o middleware antes da rota
    app.get("/me", { onRequest: verificarToken }, async (request) => {
        // Se chegou aqui, o token é válido (o middleware já conferiu)
        const { sub } = request.user as TokenPayload

        const usuario = await connection("usuario")
            .select("usuario_id", "name", "email", "perfil")
            .where({ usuario_id: sub })
            .first()

        return usuario
    })
}
