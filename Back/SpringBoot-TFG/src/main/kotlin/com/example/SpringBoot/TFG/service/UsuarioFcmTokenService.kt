package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.model.Plataforma
import com.example.SpringBoot.TFG.model.UsuarioFcmToken
import com.example.SpringBoot.TFG.repository.UsuarioFcmTokenRepository
import com.example.SpringBoot.TFG.repository.UsuarioRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

@Service
class UsuarioFcmTokenService(
    private val tokenRepo: UsuarioFcmTokenRepository,
    private val usuarioRepo: UsuarioRepository,
    private val securityService: SecurityService
) {

    @Transactional
    fun registrar(token: String, plataforma: Plataforma): UsuarioFcmToken {
        val userId = securityService.getUserPrincipal().userId!!
        val usuario = usuarioRepo.findById(userId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado") }

        val existente = tokenRepo.findByToken(token)
        if (existente != null) {
            if (existente.usuario.id != userId) {
                existente.usuario = usuario
            }
            existente.fechaUso = LocalDateTime.now()
            return tokenRepo.save(existente)
        }

        val nuevo = UsuarioFcmToken(
            usuario = usuario,
            token = token,
            plataforma = plataforma,
            fechaUso = LocalDateTime.now()
        )
        return tokenRepo.save(nuevo)
    }

    @Transactional
    fun eliminarPorToken(token: String) {
        val userId = securityService.getUserPrincipal().userId!!
        val existente = tokenRepo.findByToken(token) ?: return
        if (existente.usuario.id != userId && !securityService.hasRole("ADMIN")) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "No podés eliminar tokens de otro usuario")
        }
        tokenRepo.delete(existente)
    }

    @Transactional(readOnly = true)
    fun listarDelUsuarioActual(): List<UsuarioFcmToken> {
        val userId = securityService.getUserPrincipal().userId!!
        return tokenRepo.findByUsuarioId(userId)
    }
}
