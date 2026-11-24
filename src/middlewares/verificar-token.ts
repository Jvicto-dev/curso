import type { FastifyReply, FastifyRequest } from "fastify"

// Middleware: roda ANTES da rota.
// Se o token for válido, deixa a rota seguir.
// Se não for, responde 401 e a rota nem chega a rodar.
export async function verificarToken(request: FastifyRequest, reply: FastifyReply) {
    try {
        // Lê o header "Authorization: Bearer <token>" e confere a assinatura.
        // Se der certo, os dados do token ficam em request.user
        await request.jwtVerify()
    } catch (erro) {
        return reply.status(401).send({ message: "Token inválido ou ausente" })
    }
}
