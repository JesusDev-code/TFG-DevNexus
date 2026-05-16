package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.dto.DiarioTemaCreateDto
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
import org.mockito.Mockito.any
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.web.server.ResponseStatusException
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class DiarioTemaServiceTest {

    @Mock lateinit var repo: DiarioTemaRepository
    @Mock lateinit var usuarioRepo: UsuarioRepository
    @Mock lateinit var securityService: SecurityService
    @Mock lateinit var colaboracionRepo: DiarioColaboracionRepository
    @Mock lateinit var temaComentarioRepo: DiarioTemaComentarioRepository
    @Mock lateinit var diarioRepo: DiarioRepository

    @InjectMocks
    lateinit var diarioTemaService: DiarioTemaService

    private val rol = Rol(id = 1, nombre = "USER")
    private val usuario = Usuario(
        id = 1, firebaseUid = "uid-1", email = "user@test.com",
        nombre = "Propietario", rol = rol
    )
    private val otroUsuario = Usuario(
        id = 2, firebaseUid = "uid-2", email = "otro@test.com",
        nombre = "Otro", rol = rol
    )
    private val tema = DiarioTema(id = 10, titulo = "Proyecto Alpha", usuario = usuario)

    private val principal = UserPrincipal(
        uid = "uid-1",
        authorities = listOf(SimpleGrantedAuthority("ROLE_USER")),
        userId = 1
    )
    private val principalOtro = UserPrincipal(
        uid = "uid-2",
        authorities = listOf(SimpleGrantedAuthority("ROLE_USER")),
        userId = 2
    )

    // ────────────────────────────────────────────────────────────────────
    // listMisTemas
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `listMisTemas devuelve temas propios y compartidos sin duplicados`() {
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(repo.findByUsuarioId(1)).willReturn(listOf(tema))
        given(colaboracionRepo.findTemaIdsByColaborador(1)).willReturn(listOf(10))
        given(repo.findAllById(listOf(10))).willReturn(listOf(tema))

        val result = diarioTemaService.listMisTemas()

        // Aunque aparece dos veces (propio + colaborado), distinctBy lo filtra a 1
        assertThat(result).hasSize(1)
        assertThat(result[0].titulo).isEqualTo("Proyecto Alpha")
    }

    @Test
    fun `listMisTemas combina temas propios con los de colaboracion sin duplicados`() {
        val temaCompartido = DiarioTema(id = 20, titulo = "Proyecto Compartido", usuario = otroUsuario)
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(repo.findByUsuarioId(1)).willReturn(listOf(tema))
        given(colaboracionRepo.findTemaIdsByColaborador(1)).willReturn(listOf(20))
        given(repo.findAllById(listOf(20))).willReturn(listOf(temaCompartido))

        val result = diarioTemaService.listMisTemas()

        assertThat(result).hasSize(2)
    }

    // ────────────────────────────────────────────────────────────────────
    // create
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `create persiste nuevo tema y lo asocia al usuario autenticado`() {
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(usuarioRepo.findById(1)).willReturn(Optional.of(usuario))
        given(repo.save(any(DiarioTema::class.java))).willReturn(tema)

        val dto = DiarioTemaCreateDto(titulo = "Proyecto Alpha", descripcion = null)
        val result = diarioTemaService.create(dto)

        val captor = ArgumentCaptor.forClass(DiarioTema::class.java)
        verify(repo).save(captor.capture())
        assertThat(captor.value.titulo).isEqualTo("Proyecto Alpha")
        assertThat(captor.value.usuario.id).isEqualTo(1)
        assertThat(result.titulo).isEqualTo("Proyecto Alpha")
    }

    // ────────────────────────────────────────────────────────────────────
    // getById
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `getById retorna DTO cuando el tema existe`() {
        given(repo.findById(10)).willReturn(Optional.of(tema))

        val result = diarioTemaService.getById(10)

        assertThat(result.id).isEqualTo(10)
        assertThat(result.titulo).isEqualTo("Proyecto Alpha")
    }

    @Test
    fun `getById lanza NOT_FOUND cuando el tema no existe`() {
        given(repo.findById(999)).willReturn(Optional.empty())

        val ex = assertThrows<ResponseStatusException> { diarioTemaService.getById(999) }

        assertThat(ex.statusCode.value()).isEqualTo(404)
    }

    // ────────────────────────────────────────────────────────────────────
    // delete
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `delete elimina el tema cuando el usuario es el duenio`() {
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(repo.findById(10)).willReturn(Optional.of(tema))

        diarioTemaService.delete(10)

        verify(repo).delete(tema)
    }

    @Test
    fun `delete lanza FORBIDDEN cuando quien borra no es el duenio`() {
        given(securityService.getUserPrincipal()).willReturn(principalOtro)
        given(repo.findById(10)).willReturn(Optional.of(tema))

        val ex = assertThrows<ResponseStatusException> { diarioTemaService.delete(10) }

        assertThat(ex.statusCode.value()).isEqualTo(403)
        verify(repo, never()).delete(any())
    }

    @Test
    fun `delete lanza NOT_FOUND cuando el tema no existe`() {
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(repo.findById(999)).willReturn(Optional.empty())

        val ex = assertThrows<ResponseStatusException> { diarioTemaService.delete(999) }

        assertThat(ex.statusCode.value()).isEqualTo(404)
    }

    // ────────────────────────────────────────────────────────────────────
    // actualizarTema
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `actualizarTema permite al duenio modificar titulo y descripcion`() {
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(repo.findById(10)).willReturn(Optional.of(tema))
        given(repo.save(any(DiarioTema::class.java))).willReturn(tema)

        val result = diarioTemaService.actualizarTema(10, "Nuevo Título", "Nueva descripción")

        verify(repo).save(any(DiarioTema::class.java))
        assertThat(result).isNotNull
    }

    @Test
    fun `actualizarTema lanza FORBIDDEN si quien actualiza no es el duenio`() {
        given(securityService.getUserPrincipal()).willReturn(principalOtro)
        given(repo.findById(10)).willReturn(Optional.of(tema))

        val ex = assertThrows<ResponseStatusException> {
            diarioTemaService.actualizarTema(10, "Hack", null)
        }

        assertThat(ex.statusCode.value()).isEqualTo(403)
        verify(repo, never()).save(any())
    }

    // ────────────────────────────────────────────────────────────────────
    // cambiarVisibilidad
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `cambiarVisibilidad a PUBLICO actualiza el tema y las entradas`() {
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(repo.findById(10)).willReturn(Optional.of(tema))
        given(diarioRepo.findAllByTemaIdOrderByFechaCreacionDesc(10)).willReturn(emptyList())
        given(repo.save(any(DiarioTema::class.java))).willReturn(tema)

        val result = diarioTemaService.cambiarVisibilidad(10, Visibilidad.PUBLICO, "Título público", "Descripción")

        verify(repo).save(any(DiarioTema::class.java))
        assertThat(result).isNotNull
    }

    @Test
    fun `cambiarVisibilidad lanza FORBIDDEN si no es el duenio`() {
        given(securityService.getUserPrincipal()).willReturn(principalOtro)
        given(repo.findById(10)).willReturn(Optional.of(tema))

        val ex = assertThrows<ResponseStatusException> {
            diarioTemaService.cambiarVisibilidad(10, Visibilidad.PUBLICO)
        }

        assertThat(ex.statusCode.value()).isEqualTo(403)
    }

    // ────────────────────────────────────────────────────────────────────
    // listTemaPublicos
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `listTemaPublicos llama al repo con visibilidad PUBLICO`() {
        given(repo.findByVisibilidad(Visibilidad.PUBLICO)).willReturn(listOf(tema))

        val result = diarioTemaService.listTemaPublicos()

        verify(repo).findByVisibilidad(Visibilidad.PUBLICO)
        assertThat(result).hasSize(1)
    }

    // ────────────────────────────────────────────────────────────────────
    // listTemasByUserId
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `listTemasByUserId devuelve temas del usuario indicado`() {
        given(repo.findByUsuarioId(1)).willReturn(listOf(tema))

        val result = diarioTemaService.listTemasByUserId(1)

        verify(repo).findByUsuarioId(1)
        assertThat(result).hasSize(1)
    }
}
