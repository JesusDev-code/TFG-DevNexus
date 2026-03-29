package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.model.Departamento
import com.example.SpringBoot.TFG.repository.DepartamentoRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
@Transactional
class DepartamentoService(
    private val repo: DepartamentoRepository,
    private val securityService: SecurityService,
    private val auditoriaService: AuditoriaService // ✅ Inyectado
) {
    @Transactional(readOnly = true)
    fun findAll(): List<Departamento> {
        securityService.checkRole("ADMIN", "STAFF")
        return repo.findAll()
    }

    @Transactional(readOnly = true)
    fun findById(id: Int): Departamento {
        securityService.checkRole("ADMIN", "STAFF")
        return repo.findById(id).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Departamento no encontrado") }
    }

    fun save(d: Departamento): Departamento {
        securityService.checkRole("ADMIN")

        // ✅ LOG: Detectamos si es crear o editar
        val accion = if (d.id == null) "CREAR_DEPTO" else "EDITAR_DEPTO"
        val guardado = repo.save(d)

        auditoriaService.registrar(
            accion = accion,
            recurso = "Departamento",
            descripcion = "Departamento: ${guardado.nombre}",
            severidad = "INFO"
        )

        return guardado
    }

    fun delete(id: Int) {
        securityService.checkRole("ADMIN")
        if (!repo.existsById(id)) throw ResponseStatusException(HttpStatus.NOT_FOUND, "Departamento no encontrado")

        val depto = repo.findById(id).get()

        // ✅ LOG: Borrado (DANGER)
        auditoriaService.registrar(
            accion = "BORRAR_DEPTO",
            recurso = "Departamento",
            descripcion = "Departamento eliminado: ${depto.nombre}",
            severidad = "DANGER"
        )

        repo.deleteById(id)
    }
}