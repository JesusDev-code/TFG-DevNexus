package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.model.Rol
import com.example.SpringBoot.TFG.repository.RolRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
@Transactional
class RolService(
    private val repo: RolRepository,
    private val securityService: SecurityService,
    private val auditoriaService: AuditoriaService // ✅ Inyectado
) {
    @Transactional(readOnly = true)
    fun findAll(): List<Rol> {
        securityService.checkRole("ADMIN")
        return repo.findAll()
    }

    @Transactional(readOnly = true)
    fun findById(id: Int): Rol {
        securityService.checkRole("ADMIN")
        return repo.findById(id).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Rol no encontrado") }
    }

    fun save(rol: Rol): Rol {
        securityService.checkRole("ADMIN")

        // ✅ LOG: Creación/Edición de Rol
        val accion = if (rol.id == null) "CREAR_ROL" else "EDITAR_ROL"
        auditoriaService.registrar(accion, "Configuración", "Rol: ${rol.nombre}", "WARNING")

        return repo.save(rol)
    }

    fun delete(id: Int) {
        securityService.checkRole("ADMIN")
        if (!repo.existsById(id)) throw ResponseStatusException(HttpStatus.NOT_FOUND, "Rol no encontrado")

        // ✅ LOG: Borrado de Rol (Peligroso)
        auditoriaService.registrar("BORRAR_ROL", "Configuración", "Rol ID: $id eliminado", "DANGER")

        repo.deleteById(id)
    }
}