package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.model.Auditoria
import com.example.SpringBoot.TFG.repository.AuditoriaRepository
import com.example.SpringBoot.TFG.repository.UsuarioRepository
import com.example.SpringBoot.TFG.security.UserPrincipal
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AuditoriaService(
    private val auditoriaRepo: AuditoriaRepository,
    private val usuarioRepo: UsuarioRepository // Inyectado para sacar nombres reales
) {

    // ✅ ESTE ES EL MÉTODO QUE FALTABA
    @Transactional(readOnly = true)
    fun listarPaginado(busqueda: String?, pageable: Pageable): Page<Auditoria> {
        return auditoriaRepo.buscarPaginado(busqueda, pageable)
    }

    @Transactional(readOnly = true)
    fun obtenerPorId(id: Int): Auditoria? {
        return auditoriaRepo.findById(id).orElse(null)
    }

    @Transactional
    fun registrar(
        accion: String,
        recurso: String,
        descripcion: String?,
        severidad: String = "INFO",
        usuarioId: Int? = null,
        usuarioEmail: String? = null
    ) {
        var uId = usuarioId
        var uNombreReal = usuarioEmail

        // 1. Intentar sacar usuario del contexto de seguridad si no viene
        if (uId == null) {
            val auth = SecurityContextHolder.getContext().authentication
            if (auth != null && auth.principal is UserPrincipal) {
                val principal = auth.principal as UserPrincipal
                uId = principal.userId
            }
        }

        // 2. Si tenemos ID pero el nombre es un UID raro, buscamos el email real
        if (uId != null && (uNombreReal == null || uNombreReal.length > 20)) {
            val usuarioDb = usuarioRepo.findById(uId).orElse(null)
            if (usuarioDb != null) {
                uNombreReal = usuarioDb.email
            }
        }

        if (uNombreReal == null) uNombreReal = "Sistema/Anónimo"

        val log = Auditoria(
            accion = accion,
            recurso = recurso,
            descripcion = descripcion,
            severidad = severidad,
            usuarioId = uId,
            usuarioEmail = uNombreReal
        )

        auditoriaRepo.save(log)
    }
}