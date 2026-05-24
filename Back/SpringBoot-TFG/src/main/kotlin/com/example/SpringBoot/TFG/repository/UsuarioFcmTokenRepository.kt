package com.example.SpringBoot.TFG.repository

import com.example.SpringBoot.TFG.model.UsuarioFcmToken
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UsuarioFcmTokenRepository : JpaRepository<UsuarioFcmToken, Long> {
    fun findByUsuarioId(usuarioId: Int): List<UsuarioFcmToken>
    fun findByToken(token: String): UsuarioFcmToken?
    fun deleteByToken(token: String)
}
