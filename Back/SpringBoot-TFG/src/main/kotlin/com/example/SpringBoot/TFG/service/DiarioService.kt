package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.dto.DiarioComentarioDto
import com.example.SpringBoot.TFG.dto.DiarioCreateDto
import com.example.SpringBoot.TFG.dto.DiarioDto
import com.example.SpringBoot.TFG.dto.DiarioFileDto
import com.example.SpringBoot.TFG.model.Diario
import com.example.SpringBoot.TFG.model.DiarioComentario
import com.example.SpringBoot.TFG.model.Visibilidad
import com.example.SpringBoot.TFG.model.InvitacionEstado
import com.example.SpringBoot.TFG.repository.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
@Transactional
class DiarioService(
    private val repo: DiarioRepository,
    private val usuarioRepo: UsuarioRepository,
    private val diarioTemaRepo: DiarioTemaRepository,
    private val securityService: SecurityService,
    private val comentarioRepo: DiarioComentarioRepository,
    private val colaboracionRepo: DiarioColaboracionRepository
) {

    @Transactional(readOnly = true)
    fun listAll(pageable: Pageable): Page<DiarioDto> = repo.findAll(pageable).map { it.toDto() }

    @Transactional(readOnly = true)
    fun getById(id: Int): DiarioDto? = repo.findById(id).orElse(null)?.toDto()

    @Transactional
    fun create(firebaseUid: String, dto: DiarioCreateDto): DiarioDto {
        val usuario = usuarioRepo.findByFirebaseUid(firebaseUid)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado") }

        val tema = dto.temaId?.let {
            diarioTemaRepo.findById(it)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Tema con ID $it no encontrado") }
        }

        // --- PERMISOS DE ESCRITURA ---
        if (tema != null) {
            val esDuenio = tema.usuario.id == usuario.id
            val esColaborador = colaboracionRepo.existsByTemaIdAndUsuarioIdAndEstado(
                tema.id!!,
                usuario.id!!,
                InvitacionEstado.ACEPTADA
            )
            if (!esDuenio && !esColaborador) {
                throw ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para escribir en este proyecto.")
            }
        }

        
        val diario = Diario(
            contenido = dto.contenido,
            visibilidad = dto.visibilidad,
            usuario = usuario,
            tema = tema,
            tipo = dto.tipo,
            filename = dto.filename
        )
        val saved = repo.save(diario)
        return saved.toDto()
    }

    @Transactional
    fun update(id: Int, dto: DiarioCreateDto): DiarioDto {
        val diario = repo.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Diario no encontrado") }

        val currentUser = securityService.getUserPrincipal()

        val esAutor = diario.usuario.id == currentUser.userId
        val esStaff = currentUser.authorities.any { it.authority == "ROLE_STAFF" || it.authority == "ROLE_ADMIN" }
        val esColaborador = diario.tema?.id?.let { temaId ->
            colaboracionRepo.existsByTemaIdAndUsuarioIdAndEstado(
                temaId,
                currentUser.userId!!,
                InvitacionEstado.ACEPTADA
            )
        } ?: false

        if (!esAutor && !esStaff && !esColaborador) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para editar este código")
        }

        diario.contenido = dto.contenido
        diario.visibilidad = dto.visibilidad
        dto.temaId?.let {
            diario.tema = diarioTemaRepo.findById(it)
                .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Tema no encontrado") }
        }
        dto.tipo?.let { diario.tipo = it }
        dto.filename?.let { diario.filename = it }
        return repo.save(diario).toDto()
    }

    @Transactional
    fun delete(id: Int) {
        val diario = repo.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Diario no encontrado") }

        val currentUser = securityService.getUserPrincipal()
        val esAutor = diario.usuario.id == currentUser.userId
        val esStaff = currentUser.authorities.any { it.authority == "ROLE_STAFF" || it.authority == "ROLE_ADMIN" }
        // El dueño del proyecto también puede moderar (borrar notas de otros en su proyecto)
        val esDuenioProyecto = diario.tema?.usuario?.id == currentUser.userId

        if (!esAutor && !esStaff && !esDuenioProyecto) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para borrar esta nota")
        }
        repo.deleteById(id)
    }

    @Transactional(readOnly = true)
    fun publicos(pageable: Pageable): Page<DiarioDto> =
        repo.findAllByVisibilidad(Visibilidad.PUBLICO, pageable).map { it.toDto() }

    @Transactional(readOnly = true)
    fun publicosPorTema(temaId: Int): List<DiarioDto> =
        repo.findAllByTemaIdOrderByFechaCreacionDesc(temaId)
            .filter { it.visibilidad == Visibilidad.PUBLICO }
            .map { it.toDto() }

    // ✅ MÉTODO ACTUALIZADO PARA COLABORACIÓN
    @Transactional(readOnly = true)
    fun deUsuario(firebaseUid: String, pageable: Pageable): Page<DiarioDto> {
        val usuario = usuarioRepo.findByFirebaseUid(firebaseUid)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado") }

        val sortedPageable = PageRequest.of(
            pageable.pageNumber,
            pageable.pageSize,
            Sort.by("fechaCreacion").descending()
        )

        // CAMBIO CLAVE: Usamos findAllPermitidos en lugar de findAllByUsuarioId
        return repo.findAllPermitidos(usuario.id!!, sortedPageable).map { it.toDto() }
    }

    @Transactional(readOnly = true)
    fun listByUserId(userId: Int, pageable: Pageable): Page<DiarioDto> {
        val sortedPageable = PageRequest.of(
            pageable.pageNumber,
            pageable.pageSize,
            Sort.by("fechaCreacion").descending()
        )
        return repo.findAllByUsuarioId(userId, sortedPageable).map { it.toDto() }
    }

    @Transactional(readOnly = true)
    fun exportarTemaCsv(temaId: Int): ByteArray {
        val tema = diarioTemaRepo.findById(temaId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Tema no encontrado") }

        val diarios = if (securityService.hasRole("ADMIN", "STAFF")) {
            repo.findAllByTemaIdOrderByFechaCreacionDesc(temaId)
        } else {
            val principal = securityService.getUserPrincipal()
            val userId = principal.userId ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no identificado")
            repo.findPermitidosByTemaId(userId, temaId)
        }

        val csv = buildString {
            appendLine("tema_id,tema_titulo,diario_id,fecha_creacion,visibilidad,usuario_id,usuario_nombre,contenido")
            diarios.forEach { d ->
                appendLine(
                    listOf(
                        tema.id ?: "",
                        escapeCsv(tema.titulo ?: "Sin titulo"),
                        d.id ?: "",
                        d.fechaCreacion,
                        d.visibilidad.name,
                        d.usuario.id ?: "",
                        escapeCsv(d.usuario.nombre),
                        escapeCsv(d.contenido ?: "")
                    ).joinToString(",")
                )
            }
        }

        return csv.toByteArray(Charsets.UTF_8)
    }

    @Transactional(readOnly = true)
    fun listarComentarios(diarioId: Int): List<DiarioComentarioDto> {
        return comentarioRepo.findByDiarioIdOrderByFechaAsc(diarioId).map {
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
    fun comentar(diarioId: Int, texto: String): DiarioComentarioDto {
        val principal = securityService.getUserPrincipal()
        val autor = usuarioRepo.findById(principal.userId!!)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado") }
        val diario = repo.findById(diarioId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Diario no encontrado") }

        if (diario.visibilidad == Visibilidad.PRIVADO) {
            val esAdminOrStaff = principal.authorities.any {
                it.authority == "ROLE_STAFF" || it.authority == "ROLE_ADMIN"
            }
            if (diario.usuario.id != principal.userId && !esAdminOrStaff) {
                throw ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes acceso a esta entrada")
            }
        }

        val comentario = DiarioComentario(texto = texto, diario = diario, autor = autor)
        val guardado = comentarioRepo.save(comentario)

        return DiarioComentarioDto(
            id = guardado.id!!,
            texto = guardado.texto,
            autorNombre = guardado.autor.nombre,
            esAdmin = guardado.autor.rol.nombre == "ADMIN" || guardado.autor.rol.nombre == "STAFF",
            fecha = guardado.fecha
        )
    }

    @Transactional(readOnly = true)
    fun getArchivosActuales(temaId: Int): List<DiarioDto> {
        val archivos = repo.findAllByTemaIdAndTipoOrderByFechaCreacionDesc(temaId, "FILE")
            .groupBy { it.filename }
            .mapNotNull { (_, versions) -> versions.firstOrNull() }
            .sortedBy { it.filename }
            .map { it.toDto() }

        return archivos
    }

    fun Diario.toDto() = DiarioDto(
        id = requireNotNull(this.id),
        contenido = this.contenido,
        visibilidad = this.visibilidad.name,
        fechaCreacion = this.fechaCreacion,
        usuarioId = requireNotNull(this.usuario.id),
        usuarioNombre = this.usuario.nombre,
        temaId = this.tema?.id,
        temaTitulo = this.tema?.titulo,
        tipo = this.tipo,
        filename = this.filename
    )

    private fun escapeCsv(value: String): String {
        val escaped = value.replace("\"", "\"\"")
        return "\"$escaped\""
    }
}
