package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.dto.DiarioTemaCreateDto
import com.example.SpringBoot.TFG.dto.DiarioTemaDto
import com.example.SpringBoot.TFG.model.DiarioTema
import com.example.SpringBoot.TFG.repository.DiarioColaboracionRepository // ✅ Nuevo Import
import com.example.SpringBoot.TFG.repository.DiarioTemaRepository
import com.example.SpringBoot.TFG.repository.UsuarioRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
@Transactional
class DiarioTemaService(
    private val repo: DiarioTemaRepository,
    private val usuarioRepo: UsuarioRepository,
    private val securityService: SecurityService,
    // ✅ Inyectamos el repositorio de colaboraciones para buscar proyectos compartidos
    private val colaboracionRepo: DiarioColaboracionRepository
) {

    @Transactional(readOnly = true)
    fun listMisTemas(): List<DiarioTemaDto> {
        val currentUser = securityService.getUserPrincipal()

        // 1. Buscamos MIS proyectos (donde soy dueño)
        val misTemas = repo.findByUsuarioId(currentUser.userId!!)

        // 2. Buscamos los IDs de proyectos donde soy COLABORADOR ACEPTADO
        val idsCompartidos = colaboracionRepo.findTemaIdsByColaborador(currentUser.userId!!)

        // 3. Recuperamos esos temas compartidos de la base de datos
        val temasCompartidos = repo.findAllById(idsCompartidos)

        // 4. Unimos las dos listas (evitando duplicados por seguridad) y convertimos a DTO
        // El operador "+" une dos listas en Kotlin
        return (misTemas + temasCompartidos).distinctBy { it.id }.map { it.toDto() }
    }

    fun create(dto: DiarioTemaCreateDto): DiarioTemaDto {
        val currentUser = securityService.getUserPrincipal()
        val usuario = usuarioRepo.findById(currentUser.userId!!).orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado")
        }

        val nuevoTema = DiarioTema(
            titulo = dto.titulo,
            descripcion = dto.descripcion,
            usuario = usuario
        )
        return repo.save(nuevoTema).toDto()
    }

    @Transactional(readOnly = true)
    fun getById(id: Int): DiarioTemaDto {
        val tema = repo.findById(id).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Tema no encontrado") }

        // Opcional: Podrías verificar aquí si el usuario tiene permiso de ver este tema
        // (Ya sea porque es dueño O colaborador)

        return tema.toDto()
    }

    fun delete(id: Int) {
        val currentUser = securityService.getUserPrincipal()
        val tema = repo.findById(id).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Tema no encontrado") }

        // Seguridad: SOLO el dueño puede borrar el proyecto entero
        if (tema.usuario.id != currentUser.userId) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Solo el dueño puede eliminar el repositorio")
        }

        repo.delete(tema)
    }

    // Función auxiliar para convertir a DTO
    private fun DiarioTema.toDto() = DiarioTemaDto(
        id = this.id ?: 0,
        titulo = this.titulo,
        descripcion = this.descripcion,
        // Usamos !! porque un tema guardado siempre debe tener un usuario asociado
        usuarioId = this.usuario.id!!
    )
}