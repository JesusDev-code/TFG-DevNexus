package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.dto.DiarioComentarioDto
import com.example.SpringBoot.TFG.dto.DiarioTemaCreateDto
import com.example.SpringBoot.TFG.dto.DiarioTemaDto
import com.example.SpringBoot.TFG.model.DiarioTema
import com.example.SpringBoot.TFG.model.DiarioTemaComentario
import com.example.SpringBoot.TFG.model.Visibilidad
import com.example.SpringBoot.TFG.repository.DiarioColaboracionRepository
import com.example.SpringBoot.TFG.repository.DiarioRepository
import com.example.SpringBoot.TFG.repository.DiarioTemaComentarioRepository
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
    private val colaboracionRepo: DiarioColaboracionRepository,
    private val temaComentarioRepo: DiarioTemaComentarioRepository,
    private val diarioRepo: DiarioRepository
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

    @Transactional(readOnly = true)
    fun listTemasByUserId(userId: Int): List<DiarioTemaDto> {
        return repo.findByUsuarioId(userId).map { it.toDto() }
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

    @Transactional(readOnly = true)
    fun listarComentariosTema(temaId: Int): List<DiarioComentarioDto> {
        return temaComentarioRepo.findByTemaIdOrderByFechaAsc(temaId).map {
            DiarioComentarioDto(
                id = it.id!!,
                texto = it.texto,
                autorNombre = it.autor.nombre,
                esAdmin = it.autor.rol.nombre == "ADMIN" || it.autor.rol.nombre == "STAFF",
                fecha = it.fecha
            )
        }
    }

    @Transactional
    fun comentarTema(temaId: Int, texto: String): DiarioComentarioDto {
        val principal = securityService.getUserPrincipal()
        val autor = usuarioRepo.findById(principal.userId!!)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado") }
        val tema = repo.findById(temaId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Tema no encontrado") }

        val comentario = DiarioTemaComentario(texto = texto, tema = tema, autor = autor)
        val guardado = temaComentarioRepo.save(comentario)

        return DiarioComentarioDto(
            id = guardado.id!!,
            texto = guardado.texto,
            autorNombre = guardado.autor.nombre,
            esAdmin = guardado.autor.rol.nombre == "ADMIN" || guardado.autor.rol.nombre == "STAFF",
            fecha = guardado.fecha
        )
    }

    fun actualizarTema(id: Int, titulo: String?, descripcion: String?): DiarioTemaDto {
        val currentUser = securityService.getUserPrincipal()
        val tema = repo.findById(id).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Tema no encontrado") }
        if (tema.usuario.id != currentUser.userId) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Solo el dueño puede modificar el proyecto")
        }
        if (!titulo.isNullOrBlank()) tema.titulo = titulo
        if (descripcion != null) tema.descripcion = descripcion
        return repo.save(tema).toDto()
    }

    fun cambiarVisibilidad(
        id: Int,
        visibilidad: Visibilidad,
        tituloPublicacion: String? = null,
        descripcionPublicacion: String? = null
    ): DiarioTemaDto {
        val currentUser = securityService.getUserPrincipal()
        val tema = repo.findById(id).orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Tema no encontrado") }
        if (tema.usuario.id != currentUser.userId) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Solo el dueño puede cambiar la visibilidad")
        }
        tema.visibilidad = visibilidad
        if (visibilidad == Visibilidad.PUBLICO) {
            if (!tituloPublicacion.isNullOrBlank()) tema.tituloPublicacion = tituloPublicacion
            if (descripcionPublicacion != null) tema.descripcionPublicacion = descripcionPublicacion
        } else {
            tema.tituloPublicacion = null
            tema.descripcionPublicacion = null
        }
        val entradas = diarioRepo.findAllByTemaIdOrderByFechaCreacionDesc(id)
        entradas.forEach { it.visibilidad = visibilidad }
        if (entradas.isNotEmpty()) diarioRepo.saveAll(entradas)
        return repo.save(tema).toDto()
    }

    @Transactional(readOnly = true)
    fun listTemaPublicos(): List<DiarioTemaDto> =
        repo.findByVisibilidad(Visibilidad.PUBLICO).map { it.toDto() }

    @Transactional(readOnly = true)
    fun listarComentariosComunidad(temaId: Int): List<DiarioComentarioDto> =
        temaComentarioRepo.findByTemaIdAndComunidadOrderByFechaAsc(temaId, true).map {
            DiarioComentarioDto(
                id = it.id!!,
                texto = it.texto,
                autorNombre = it.autor.nombre,
                esAdmin = false,
                fecha = it.fecha
            )
        }

    @Transactional
    fun comentarComunidad(temaId: Int, texto: String): DiarioComentarioDto {
        val principal = securityService.getUserPrincipal()
        val autor = usuarioRepo.findById(principal.userId!!)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado") }
        val tema = repo.findById(temaId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Tema no encontrado") }
        val comentario = DiarioTemaComentario(texto = texto, tema = tema, autor = autor, comunidad = true)
        val guardado = temaComentarioRepo.save(comentario)
        return DiarioComentarioDto(
            id = guardado.id!!,
            texto = guardado.texto,
            autorNombre = guardado.autor.nombre,
            esAdmin = false,
            fecha = guardado.fecha
        )
    }

    private fun DiarioTema.toDto() = DiarioTemaDto(
        id = this.id ?: 0,
        titulo = this.titulo,
        descripcion = this.descripcion,
        usuarioId = this.usuario.id!!,
        visibilidad = this.visibilidad.name,
        usuarioNombre = this.usuario.nombre,
        tituloPublicacion = this.tituloPublicacion,
        descripcionPublicacion = this.descripcionPublicacion
    )
}