package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.dto.UsuarioCreateDto
import com.example.SpringBoot.TFG.dto.UsuarioUpdateDto
import com.example.SpringBoot.TFG.model.Departamento
import com.example.SpringBoot.TFG.model.Rol
import com.example.SpringBoot.TFG.model.Usuario
import com.example.SpringBoot.TFG.repository.DepartamentoRepository
import com.example.SpringBoot.TFG.repository.RolRepository
import com.example.SpringBoot.TFG.repository.UsuarioRepository
import com.example.SpringBoot.TFG.security.UserPrincipal
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentCaptor
import org.mockito.BDDMockito.given
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.any
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.web.server.ResponseStatusException
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class UsuarioServiceTest {

    @Mock lateinit var usuarioRepo: UsuarioRepository
    @Mock lateinit var rolRepository: RolRepository
    @Mock lateinit var departamentoRepository: DepartamentoRepository
    @Mock lateinit var securityService: SecurityService
    @Mock lateinit var auditoriaService: AuditoriaService

    @InjectMocks
    lateinit var usuarioService: UsuarioService

    private val rol = Rol(id = 1, nombre = "USER")
    private val rolAdmin = Rol(id = 2, nombre = "ADMIN")
    private val departamento = Departamento(id = 1, nombre = "General")
    private val usuario = Usuario(
        id = 1,
        firebaseUid = "firebase-uid-1",
        email = "user@test.com",
        nombre = "Test User",
        rol = rol,
        departamento = departamento
    )
    private val principal = UserPrincipal(
        uid = "firebase-uid-1",
        authorities = listOf(SimpleGrantedAuthority("ROLE_USER")),
        userId = 1
    )
    private val principalAdmin = UserPrincipal(
        uid = "admin-uid",
        authorities = listOf(SimpleGrantedAuthority("ROLE_ADMIN")),
        userId = 99
    )

    // ────────────────────────────────────────────────────────────────────
    // listAll
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `listAll devuelve lista mapeada a DTO`() {
        given(usuarioRepo.findAll()).willReturn(listOf(usuario))

        val result = usuarioService.listAll()

        assertThat(result).hasSize(1)
        assertThat(result[0].email).isEqualTo("user@test.com")
        assertThat(result[0].rolNombre).isEqualTo("USER")
    }

    // ────────────────────────────────────────────────────────────────────
    // getById
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `getById retorna DTO cuando el usuario existe`() {
        given(usuarioRepo.findById(1)).willReturn(Optional.of(usuario))

        val result = usuarioService.getById(1)

        assertThat(result.id).isEqualTo(1)
        assertThat(result.nombre).isEqualTo("Test User")
    }

    @Test
    fun `getById lanza NOT_FOUND cuando el usuario no existe`() {
        given(usuarioRepo.findById(999)).willReturn(Optional.empty())

        val ex = assertThrows<ResponseStatusException> { usuarioService.getById(999) }

        assertThat(ex.statusCode.value()).isEqualTo(404)
    }

    // ────────────────────────────────────────────────────────────────────
    // getByFirebaseUid
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `getByFirebaseUid retorna DTO cuando el usuario existe`() {
        given(usuarioRepo.findByFirebaseUid("firebase-uid-1")).willReturn(Optional.of(usuario))

        val result = usuarioService.getByFirebaseUid("firebase-uid-1")

        assertThat(result.email).isEqualTo("user@test.com")
    }

    @Test
    fun `getByFirebaseUid lanza NOT_FOUND cuando no existe el uid`() {
        given(usuarioRepo.findByFirebaseUid("uid-inexistente")).willReturn(Optional.empty())

        val ex = assertThrows<ResponseStatusException> { usuarioService.getByFirebaseUid("uid-inexistente") }

        assertThat(ex.statusCode.value()).isEqualTo(404)
    }

    // ────────────────────────────────────────────────────────────────────
    // buscarPorDepartamento
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `buscarPorDepartamento filtra por departamento y permite contacto`() {
        given(usuarioRepo.findByDepartamentoIdAndPermiteContactoTrue(1)).willReturn(listOf(usuario))

        val result = usuarioService.buscarPorDepartamento(1)

        assertThat(result).hasSize(1)
        verify(usuarioRepo).findByDepartamentoIdAndPermiteContactoTrue(1)
        verify(usuarioRepo, never()).findAll()
    }

    // ────────────────────────────────────────────────────────────────────
    // create
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `create persiste nuevo usuario con rol USER`() {
        val dto = UsuarioCreateDto(
            email = "nuevo@test.com",
            nombre = "Nuevo Usuario",
            rolId = 1,
            fcmToken = null
        )

        given(usuarioRepo.existsByEmail("nuevo@test.com")).willReturn(false)
        given(usuarioRepo.findByFirebaseUid("new-uid")).willReturn(Optional.empty())
        given(rolRepository.findByNombre("USER")).willReturn(rol)
        given(departamentoRepository.findById(1)).willReturn(Optional.of(departamento))

        val usuarioGuardado = Usuario(
            id = 2, firebaseUid = "new-uid", email = "nuevo@test.com",
            nombre = "Nuevo Usuario", rol = rol, departamento = departamento
        )
        given(usuarioRepo.save(any(Usuario::class.java))).willReturn(usuarioGuardado)

        val result = usuarioService.create(dto, "new-uid")

        val captor = ArgumentCaptor.forClass(Usuario::class.java)
        verify(usuarioRepo).save(captor.capture())
        assertThat(captor.value.email).isEqualTo("nuevo@test.com")
        assertThat(captor.value.firebaseUid).isEqualTo("new-uid")
        assertThat(result.email).isEqualTo("nuevo@test.com")
    }

    @Test
    fun `create lanza CONFLICT si el email ya existe`() {
        val dto = UsuarioCreateDto(email = "duplicado@test.com", nombre = "X", rolId = 1, fcmToken = null)
        given(usuarioRepo.existsByEmail("duplicado@test.com")).willReturn(true)

        val ex = assertThrows<ResponseStatusException> { usuarioService.create(dto, "uid-x") }

        assertThat(ex.statusCode.value()).isEqualTo(409)
        verify(usuarioRepo, never()).save(any())
    }

    @Test
    fun `create lanza CONFLICT si el firebaseUid ya existe`() {
        val dto = UsuarioCreateDto(email = "nuevo@test.com", nombre = "X", rolId = 1, fcmToken = null)
        given(usuarioRepo.existsByEmail("nuevo@test.com")).willReturn(false)
        given(usuarioRepo.findByFirebaseUid("uid-dup")).willReturn(Optional.of(usuario))

        val ex = assertThrows<ResponseStatusException> { usuarioService.create(dto, "uid-dup") }

        assertThat(ex.statusCode.value()).isEqualTo(409)
        verify(usuarioRepo, never()).save(any())
    }

    // ────────────────────────────────────────────────────────────────────
    // sincronizarGoogle
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `sincronizarGoogle devuelve usuario existente sin persistir si ya existe`() {
        given(usuarioRepo.findByFirebaseUid("g-uid")).willReturn(Optional.of(usuario))

        val result = usuarioService.sincronizarGoogle("g-uid", "user@test.com", "Test User", null)

        assertThat(result.email).isEqualTo("user@test.com")
        verify(usuarioRepo, never()).save(any())
    }

    @Test
    fun `sincronizarGoogle crea nuevo usuario cuando no existe`() {
        given(usuarioRepo.findByFirebaseUid("g-new-uid")).willReturn(Optional.empty())
        given(rolRepository.findByNombre("USER")).willReturn(rol)
        given(departamentoRepository.findById(1)).willReturn(Optional.of(departamento))

        val nuevoUsuario = Usuario(
            id = 5, firebaseUid = "g-new-uid", email = "google@test.com",
            nombre = "Google User", rol = rol, departamento = departamento
        )
        given(usuarioRepo.save(any(Usuario::class.java))).willReturn(nuevoUsuario)

        val result = usuarioService.sincronizarGoogle("g-new-uid", "google@test.com", "Google User", null)

        assertThat(result.email).isEqualTo("google@test.com")
        verify(usuarioRepo).save(any(Usuario::class.java))
    }

    // ────────────────────────────────────────────────────────────────────
    // update
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `update modifica nombre y lo persiste`() {
        given(usuarioRepo.findById(1)).willReturn(Optional.of(usuario))
        given(usuarioRepo.save(any(Usuario::class.java))).willReturn(usuario)

        val updates = UsuarioUpdateDto(
            nombre = "Nombre Nuevo", biografia = null, foto_perfil = null,
            permiteContacto = null, motivoNoContacto = null,
            departamentoId = null, rolId = null, fcmToken = null
        )
        usuarioService.update(1, updates)

        verify(securityService).checkAccess(1, "ADMIN")
        verify(usuarioRepo).save(any(Usuario::class.java))
    }

    @Test
    fun `update lanza NOT_FOUND si el usuario no existe`() {
        given(usuarioRepo.findById(999)).willReturn(Optional.empty())

        val updates = UsuarioUpdateDto(
            nombre = null, biografia = null, foto_perfil = null,
            permiteContacto = null, motivoNoContacto = null,
            departamentoId = null, rolId = null, fcmToken = null
        )
        val ex = assertThrows<ResponseStatusException> { usuarioService.update(999, updates) }

        assertThat(ex.statusCode.value()).isEqualTo(404)
    }

    // ────────────────────────────────────────────────────────────────────
    // delete
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `delete elimina un usuario USER correctamente`() {
        given(usuarioRepo.findById(1)).willReturn(Optional.of(usuario))

        usuarioService.delete(1)

        verify(securityService).checkRole("ADMIN")
        verify(usuarioRepo).delete(usuario)
    }

    @Test
    fun `delete lanza FORBIDDEN cuando se intenta borrar un ADMIN`() {
        val adminUsuario = Usuario(
            id = 2, firebaseUid = "admin-fb", email = "admin@test.com",
            nombre = "Admin", rol = rolAdmin
        )
        given(usuarioRepo.findById(2)).willReturn(Optional.of(adminUsuario))

        val ex = assertThrows<ResponseStatusException> { usuarioService.delete(2) }

        assertThat(ex.statusCode.value()).isEqualTo(403)
        verify(usuarioRepo, never()).delete(any())
    }

    @Test
    fun `delete lanza NOT_FOUND si el usuario no existe`() {
        given(usuarioRepo.findById(999)).willReturn(Optional.empty())

        val ex = assertThrows<ResponseStatusException> { usuarioService.delete(999) }

        assertThat(ex.statusCode.value()).isEqualTo(404)
    }
}
