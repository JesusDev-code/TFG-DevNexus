package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.dto.UsuarioCreateDto
import com.example.SpringBoot.TFG.dto.UsuarioDto
import com.example.SpringBoot.TFG.dto.UsuarioUpdateDto
import com.example.SpringBoot.TFG.model.Usuario
import com.example.SpringBoot.TFG.repository.DepartamentoRepository
import com.example.SpringBoot.TFG.repository.RolRepository
import com.example.SpringBoot.TFG.repository.UsuarioRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
@Transactional
class UsuarioService(
    private val usuarioRepo: UsuarioRepository,
    private val rolRepository: RolRepository,
    private val departamentoRepository: DepartamentoRepository,
    private val securityService: SecurityService,
    private val auditoriaService: AuditoriaService
) {

    @Transactional(readOnly = true)
    fun listAll(): List<UsuarioDto> = usuarioRepo.findAll().map { it.toDto(mostrarMotivo = true) }

    // ✅ MODIFICADO: Usamos el método que filtra por privacidad
    @Transactional(readOnly = true)
    fun buscarPorDepartamento(departamentoId: Int): List<UsuarioDto> {
        // Solo traemos a los usuarios DISPONIBLES de ese departamento
        val usuarios = usuarioRepo.findByDepartamentoIdAndPermiteContactoTrue(departamentoId)
        return usuarios.map { it.toDto(mostrarMotivo = true) }
    }

    @Transactional(readOnly = true)
    fun getById(id: Int): UsuarioDto = usuarioRepo.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado") }
        .toDto(mostrarMotivo = true)

    @Transactional(readOnly = true)
    fun getByFirebaseUid(uid: String): UsuarioDto = usuarioRepo.findByFirebaseUid(uid)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado") }
        .toDto(mostrarMotivo = true)

    // CREACIÓN MANUAL
    fun create(dto: UsuarioCreateDto, firebaseUid: String): UsuarioDto {
        if (usuarioRepo.existsByEmail(dto.email)) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Email ${dto.email} ya registrado")
        }
        if (usuarioRepo.findByFirebaseUid(firebaseUid).isPresent) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Firebase UID ya registrado")
        }

        val rol = rolRepository.findByNombre("USER")
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error: Rol USER no encontrado")
        val departamentoDefault = departamentoRepository.findById(1).orElse(null)

        val usuario = Usuario(
            firebaseUid = firebaseUid,
            email = dto.email,
            nombre = dto.nombre,
            biografia = dto.biografia,
            foto_perfil = dto.foto_perfil,
            rol = rol,
            departamento = departamentoDefault,
            fcmToken = dto.fcmToken,
            permiteContacto = true
        )

        val guardado = usuarioRepo.save(usuario)

        auditoriaService.registrar(
            accion = "REGISTRO",
            recurso = "Usuario",
            descripcion = "Nuevo usuario registrado: ${guardado.email}",
            severidad = "INFO",
            usuarioId = guardado.id,
            usuarioEmail = guardado.email
        )

        return guardado.toDto(mostrarMotivo = true)
    }

    // SINCRONIZACIÓN GOOGLE
    @Transactional
    fun sincronizarGoogle(uid: String, email: String, nombre: String, foto: String?): UsuarioDto {
        val usuarioExistente = usuarioRepo.findByFirebaseUid(uid)

        if (usuarioExistente.isPresent) {
            return usuarioExistente.get().toDto(mostrarMotivo = true)
        } else {
            val rolUser = rolRepository.findByNombre("USER")
                ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error: Rol USER no encontrado")

            val deptoDefault = departamentoRepository.findById(1).orElse(null)

            val nuevoUsuario = Usuario(
                firebaseUid = uid,
                email = email,
                nombre = nombre,
                foto_perfil = foto,
                rol = rolUser,
                departamento = deptoDefault,
                permiteContacto = true
            )

            val guardado = usuarioRepo.save(nuevoUsuario)

            auditoriaService.registrar(
                accion = "REGISTRO_GOOGLE",
                recurso = "Usuario",
                descripcion = "Registro automático vía Google: ${guardado.email}",
                severidad = "INFO",
                usuarioId = guardado.id,
                usuarioEmail = guardado.email
            )

            return guardado.toDto(mostrarMotivo = true)
        }
    }

    @Transactional
    fun update(id: Int, updates: UsuarioUpdateDto): UsuarioDto {
        securityService.checkAccess(id, "ADMIN")

        val usuario = usuarioRepo.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado") }

        var cambioSensible = false
        var detallesCambio = ""

        updates.nombre?.let { if (it.isNotBlank()) usuario.nombre = it }
        updates.biografia?.let { usuario.biografia = it }
        updates.foto_perfil?.let { usuario.foto_perfil = it }
        updates.permiteContacto?.let { usuario.permiteContacto = it }
        updates.motivoNoContacto?.let { usuario.motivoNoContacto = it }

        updates.rolId?.let { nuevoRolId ->
            if (usuario.rol.id != nuevoRolId) {
                val nuevoRol = rolRepository.findById(nuevoRolId).orElseThrow()
                detallesCambio += "Rol cambiado de ${usuario.rol.nombre} a ${nuevoRol.nombre}. "
                usuario.rol = nuevoRol
                cambioSensible = true
            }
        }

        updates.departamentoId?.let { newDeptId ->
            if (usuario.departamento?.id != newDeptId) {
                val nuevoDepto = departamentoRepository.findById(newDeptId).orElseThrow()
                usuario.departamento = nuevoDepto
            }
        }

        updates.fcmToken?.let { nuevoToken ->
            val otros = usuarioRepo.findByFcmToken(nuevoToken)
            otros.forEach { if (it.id != usuario.id) { it.fcmToken = null; usuarioRepo.save(it) } }
            usuario.fcmToken = nuevoToken
        }

        val actualizado = usuarioRepo.save(usuario)

        if (cambioSensible) {
            auditoriaService.registrar(
                accion = "MODIFICACION_SENSIBLE",
                recurso = "Usuario",
                descripcion = "Usuario ${usuario.email}: $detallesCambio",
                severidad = "WARNING"
            )
        }

        return actualizado.toDto(mostrarMotivo = true)
    }

    @Transactional
    fun delete(id: Int) {
        securityService.checkRole("ADMIN")

        val usuario = usuarioRepo.findById(id)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no existe") }

        if (usuario.rol.nombre == "ADMIN") {
            auditoriaService.registrar("INTENTO_BORRADO_ADMIN", "Usuario", "Intento de borrar al admin ${usuario.email}", "DANGER")
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "No se puede eliminar a un Administrador")
        }

        usuarioRepo.delete(usuario)

        auditoriaService.registrar(
            accion = "ELIMINAR",
            recurso = "Usuario",
            descripcion = "Usuario eliminado: ${usuario.email} (ID: $id)",
            severidad = "DANGER"
        )
    }

    fun Usuario.toDto(mostrarMotivo: Boolean = false) = UsuarioDto(
        id = requireNotNull(this.id),
        nombre = this.nombre,
        biografia = this.biografia,
        foto_perfil = this.foto_perfil,
        email = this.email,
        rolNombre = this.rol.nombre,
        departamentoNombre = this.departamento?.nombre,
        departamentoId = this.departamento?.id,
        fcmToken = this.fcmToken,
        permiteContacto = this.permiteContacto,
        motivoNoContacto = if (mostrarMotivo) this.motivoNoContacto else null
    )
}