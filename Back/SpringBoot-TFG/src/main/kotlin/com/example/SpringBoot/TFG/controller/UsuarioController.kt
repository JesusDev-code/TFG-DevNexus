package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.dto.UsuarioCreateDto
import com.example.SpringBoot.TFG.dto.UsuarioDto
import com.example.SpringBoot.TFG.dto.UsuarioUpdateDto
import com.example.SpringBoot.TFG.model.Usuario
import com.example.SpringBoot.TFG.repository.UsuarioRepository
import com.example.SpringBoot.TFG.service.SecurityService
import com.example.SpringBoot.TFG.service.UsuarioService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import com.example.SpringBoot.TFG.dto.DepartamentoDto
import com.example.SpringBoot.TFG.repository.DepartamentoRepository
import org.springframework.security.access.prepost.PreAuthorize

@RestController
@RequestMapping("/api/usuarios")
class UsuarioController(
    private val service: UsuarioService,
    private val usuarioRepo: UsuarioRepository,
    private val securityService: SecurityService,
    private val departamentoRepo: DepartamentoRepository
) {

    @GetMapping("/departamentos")
    fun listarDepartamentos(): List<DepartamentoDto> {
        return departamentoRepo.findAll().map { DepartamentoDto(it.id!!, it.nombre) }
    }

    // ✅ NUEVO ENDPOINT: Listar compañeros por departamento
    // Accesible para cualquier usuario autenticado (gracias a .anyRequest().authenticated() en SecurityConfig)
    @GetMapping("/por-departamento/{departamentoId}")
    @Transactional(readOnly = true)
    fun listarPorDepartamento(@PathVariable departamentoId: Int): List<UsuarioDto> {
        return service.buscarPorDepartamento(departamentoId)
    }

    @GetMapping("/buscar")
    @Transactional(readOnly = true)
    fun buscar(@RequestParam query: String): List<UsuarioDto> {
        val principal = securityService.getUserPrincipal()
        val miUsuario = usuarioRepo.findById(principal.userId!!).orElseThrow()

        if (query.length < 3) return emptyList()

        // Admin ve a todos (incluyendo los que bloquearon contacto)
        if (principal.authorities.any { it.authority == "ROLE_ADMIN" }) {
            return usuarioRepo.findByNombreContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query)
                .map { it.toDto(mostrarMotivo = true) }
        }

        // Usuario regular: ve a todos los que permiten contacto, sin restricción de especialidad
        return usuarioRepo.buscarContactosGlobal(query, miUsuario.id!!)
            .map { it.toDto(mostrarMotivo = false) }
    }

    @GetMapping("/no-contactables")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    fun listarNoContactables(): List<UsuarioDto> {
        return usuarioRepo.findByPermiteContactoFalse().map { it.toDto(mostrarMotivo = true) }
    }

    // Editar MI perfil
    @PutMapping("/perfil")
    fun updatePerfil(@RequestBody updates: UsuarioUpdateDto): UsuarioDto {
        val principal = securityService.getUserPrincipal()
        return service.update(principal.userId!!, updates)
    }

    // Ver MI perfil
    @GetMapping("/perfil")
    @Transactional(readOnly = true)
    fun perfil(): ResponseEntity<UsuarioDto> {
        val principal = securityService.getUserPrincipal()
        val usuario = usuarioRepo.findById(principal.userId!!).orElseThrow()
        return ResponseEntity.ok(usuario.toDto(mostrarMotivo = true))
    }

    @PostMapping("/registro")
    fun registro(
        authentication: Authentication?,
        @Valid @RequestBody dto: UsuarioCreateDto
    ): ResponseEntity<UsuarioDto> {
        if (authentication == null) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token no proporcionado")
        }
        val principal = securityService.getUserPrincipal()
        val nuevoUsuario = service.create(dto, principal.uid)
        return ResponseEntity(nuevoUsuario, HttpStatus.CREATED)
    }

    // Listar todos (Para tabla Admin)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    fun list(): List<UsuarioDto> {
        return service.listAll()
    }

    // Obtener usuario por ID (Admin o Dueño)
    @GetMapping("/{id}")
    fun getById(@PathVariable id: Int): UsuarioDto {
        val principal = securityService.getUserPrincipal()
        if (principal.authorities.none { it.authority == "ROLE_ADMIN" } && principal.userId != id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso")
        }
        return service.getById(id)
    }

    // Editar OTRO usuario por ID (Solo Admin)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    fun updateUser(
        @PathVariable id: Int,
        @RequestBody updates: UsuarioUpdateDto
    ): UsuarioDto {
        return service.update(id, updates)
    }

    // Borrar MI perfil
    @DeleteMapping("/perfil")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deletePerfil() {
        val principal = securityService.getUserPrincipal()
        service.delete(principal.userId!!)
    }

    // Borrar OTRO usuario por ID (Solo Admin)
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteUser(@PathVariable id: Int) {
        service.delete(id)
    }

    // Mapeador privado
    private fun Usuario.toDto(mostrarMotivo: Boolean) = UsuarioDto(
        id = this.id!!,
        nombre = this.nombre,
        biografia = this.biografia,
        foto_perfil = this.foto_perfil,
        email = this.email,
        rolNombre = this.rol.nombre,
        departamentoId = this.departamento?.id,
        departamentoNombre = this.departamento?.nombre,
        fcmToken = this.fcmToken,
        permiteContacto = this.permiteContacto,
        motivoNoContacto = if (mostrarMotivo) this.motivoNoContacto else null
    )
}