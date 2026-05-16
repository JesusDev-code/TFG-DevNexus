package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.dto.DiarioCreateDto
import com.example.SpringBoot.TFG.model.*
import com.example.SpringBoot.TFG.repository.*
import com.example.SpringBoot.TFG.security.UserPrincipal
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentCaptor
import org.mockito.BDDMockito.given
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.ArgumentMatchers.anyInt
import org.mockito.Mockito.any
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.Mockito.verifyNoInteractions
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.web.server.ResponseStatusException
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class DiarioServiceTest {

    @Mock lateinit var repo: DiarioRepository
    @Mock lateinit var usuarioRepo: UsuarioRepository
    @Mock lateinit var diarioTemaRepo: DiarioTemaRepository
    @Mock lateinit var securityService: SecurityService
    @Mock lateinit var comentarioRepo: DiarioComentarioRepository
    @Mock lateinit var colaboracionRepo: DiarioColaboracionRepository

    @InjectMocks
    lateinit var diarioService: DiarioService

    private val rol = Rol(id = 1, nombre = "USER")
    private val usuario = Usuario(
        id = 1, firebaseUid = "uid-1", email = "user@test.com",
        nombre = "Test User", rol = rol
    )
    private val tema = DiarioTema(id = 10, titulo = "Mi Proyecto", usuario = usuario)
    private val diario = Diario(
        id = 1, contenido = "Contenido de prueba",
        visibilidad = Visibilidad.PRIVADO, usuario = usuario, tema = tema
    )
    private val principal = UserPrincipal(
        uid = "uid-1",
        authorities = listOf(SimpleGrantedAuthority("ROLE_USER")),
        userId = 1
    )
    private val principalAdmin = UserPrincipal(
        uid = "admin-uid",
        authorities = listOf(SimpleGrantedAuthority("ROLE_ADMIN")),
        userId = 99
    )

    // ────────────────────────────────────────────────────────────────────
    // create
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `create guarda diario cuando el usuario es duenio del tema`() {
        val dto = DiarioCreateDto(contenido = "Nuevo contenido", visibilidad = Visibilidad.PRIVADO, temaId = 10)

        given(usuarioRepo.findByFirebaseUid("uid-1")).willReturn(Optional.of(usuario))
        given(diarioTemaRepo.findById(10)).willReturn(Optional.of(tema))
        // usuario.id == tema.usuario.id → es dueño
        given(repo.save(any(Diario::class.java))).willReturn(diario)

        val result = diarioService.create("uid-1", dto)

        val captor = ArgumentCaptor.forClass(Diario::class.java)
        verify(repo).save(captor.capture())
        assertThat(captor.value.contenido).isEqualTo("Nuevo contenido")
        assertThat(result.usuarioId).isEqualTo(1)
    }

    @Test
    fun `create guarda diario sin tema sin verificar permisos de colaboracion`() {
        val dto = DiarioCreateDto(contenido = "Entrada libre", visibilidad = Visibilidad.PUBLICO)

        given(usuarioRepo.findByFirebaseUid("uid-1")).willReturn(Optional.of(usuario))
        given(repo.save(any(Diario::class.java))).willReturn(
            Diario(id = 2, contenido = "Entrada libre", visibilidad = Visibilidad.PUBLICO, usuario = usuario)
        )

        val result = diarioService.create("uid-1", dto)

        verify(repo).save(any(Diario::class.java))
        verifyNoInteractions(colaboracionRepo)
        assertThat(result.contenido).isEqualTo("Entrada libre")
    }

    @Test
    fun `create lanza FORBIDDEN si el usuario no es duenio ni colaborador del tema`() {
        val otroUsuario = Usuario(id = 2, firebaseUid = "uid-2", email = "otro@test.com", nombre = "Otro", rol = rol)
        val dto = DiarioCreateDto(contenido = "Intento", visibilidad = Visibilidad.PRIVADO, temaId = 10)

        given(usuarioRepo.findByFirebaseUid("uid-2")).willReturn(Optional.of(otroUsuario))
        given(diarioTemaRepo.findById(10)).willReturn(Optional.of(tema))
        // otroUsuario.id=2, tema.usuario.id=1 → no es dueño
        given(colaboracionRepo.existsByTemaIdAndUsuarioIdAndEstado(10, 2, InvitacionEstado.ACEPTADA)).willReturn(false)

        val ex = assertThrows<ResponseStatusException> { diarioService.create("uid-2", dto) }

        assertThat(ex.statusCode.value()).isEqualTo(403)
        verify(repo, never()).save(any())
    }

    @Test
    fun `create lanza NOT_FOUND si el usuario no existe`() {
        val dto = DiarioCreateDto(contenido = "X", visibilidad = Visibilidad.PRIVADO)
        given(usuarioRepo.findByFirebaseUid("uid-ghost")).willReturn(Optional.empty())

        val ex = assertThrows<ResponseStatusException> { diarioService.create("uid-ghost", dto) }

        assertThat(ex.statusCode.value()).isEqualTo(404)
    }

    // ────────────────────────────────────────────────────────────────────
    // getById
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `getById retorna DTO cuando existe`() {
        given(repo.findById(1)).willReturn(Optional.of(diario))

        val result = diarioService.getById(1)

        assertThat(result).isNotNull
        assertThat(result!!.id).isEqualTo(1)
    }

    @Test
    fun `getById retorna null cuando no existe`() {
        given(repo.findById(999)).willReturn(Optional.empty())

        val result = diarioService.getById(999)

        assertThat(result).isNull()
    }

    // ────────────────────────────────────────────────────────────────────
    // update
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `update permite al autor editar su diario`() {
        given(repo.findById(1)).willReturn(Optional.of(diario))
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(repo.save(any(Diario::class.java))).willReturn(diario)

        val dto = DiarioCreateDto(contenido = "Editado", visibilidad = Visibilidad.PUBLICO)
        val result = diarioService.update(1, dto)

        verify(repo).save(any(Diario::class.java))
        assertThat(result).isNotNull
    }

    @Test
    fun `update lanza FORBIDDEN si no es autor ni staff ni colaborador`() {
        val principalOtro = UserPrincipal(uid = "uid-otro", authorities = listOf(SimpleGrantedAuthority("ROLE_USER")), userId = 99)
        given(repo.findById(1)).willReturn(Optional.of(diario))
        given(securityService.getUserPrincipal()).willReturn(principalOtro)
        given(colaboracionRepo.existsByTemaIdAndUsuarioIdAndEstado(10, 99, InvitacionEstado.ACEPTADA)).willReturn(false)

        val ex = assertThrows<ResponseStatusException> {
            diarioService.update(1, DiarioCreateDto(contenido = "Hack", visibilidad = Visibilidad.PRIVADO))
        }

        assertThat(ex.statusCode.value()).isEqualTo(403)
        verify(repo, never()).save(any())
    }

    @Test
    fun `update lanza NOT_FOUND si el diario no existe`() {
        given(repo.findById(999)).willReturn(Optional.empty())

        val ex = assertThrows<ResponseStatusException> {
            diarioService.update(999, DiarioCreateDto(contenido = "X", visibilidad = Visibilidad.PRIVADO))
        }

        assertThat(ex.statusCode.value()).isEqualTo(404)
    }

    // ────────────────────────────────────────────────────────────────────
    // delete
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `delete permite al autor borrar su diario`() {
        given(repo.findById(1)).willReturn(Optional.of(diario))
        given(securityService.getUserPrincipal()).willReturn(principal)

        diarioService.delete(1)

        verify(repo).deleteById(1)
    }

    @Test
    fun `delete lanza NOT_FOUND si el diario no existe`() {
        given(repo.findById(999)).willReturn(Optional.empty())

        val ex = assertThrows<ResponseStatusException> { diarioService.delete(999) }

        assertThat(ex.statusCode.value()).isEqualTo(404)
    }

    @Test
    fun `delete lanza FORBIDDEN si no es autor ni staff ni duenio del proyecto`() {
        val principalOtro = UserPrincipal(uid = "uid-otro", authorities = listOf(SimpleGrantedAuthority("ROLE_USER")), userId = 77)
        given(repo.findById(1)).willReturn(Optional.of(diario))
        given(securityService.getUserPrincipal()).willReturn(principalOtro)

        val ex = assertThrows<ResponseStatusException> { diarioService.delete(1) }

        assertThat(ex.statusCode.value()).isEqualTo(403)
        verify(repo, never()).deleteById(anyInt())
    }

    // ────────────────────────────────────────────────────────────────────
    // publicos / publicosPorTema
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `publicos llama a findAllByVisibilidad PUBLICO`() {
        val pageable = PageRequest.of(0, 10)
        given(repo.findAllByVisibilidad(Visibilidad.PUBLICO, pageable)).willReturn(PageImpl(listOf(diario)))

        val result = diarioService.publicos(pageable)

        verify(repo).findAllByVisibilidad(Visibilidad.PUBLICO, pageable)
        assertThat(result.totalElements).isEqualTo(1)
    }

    @Test
    fun `publicosPorTema filtra solo PUBLICOS del tema`() {
        val diarioPublico = Diario(id = 2, contenido = "X", visibilidad = Visibilidad.PUBLICO, usuario = usuario, tema = tema)
        val diarioPrivado = Diario(id = 3, contenido = "Y", visibilidad = Visibilidad.PRIVADO, usuario = usuario, tema = tema)

        given(repo.findAllByTemaIdOrderByFechaCreacionDesc(10)).willReturn(listOf(diarioPublico, diarioPrivado))

        val result = diarioService.publicosPorTema(10)

        assertThat(result).hasSize(1)
        assertThat(result[0].visibilidad).isEqualTo("PUBLICO")
    }
}
