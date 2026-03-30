package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.repository.EventoRepository
import com.example.SpringBoot.TFG.repository.UsuarioRepository
import com.example.SpringBoot.TFG.security.UserPrincipal
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.BDDMockito.given
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.security.core.authority.SimpleGrantedAuthority

@ExtendWith(MockitoExtension::class)
class EventoServiceTest {

    @Mock lateinit var repo: EventoRepository
    @Mock lateinit var usuarioRepo: UsuarioRepository
    @Mock lateinit var notificacionService: NotificacionService
    @Mock lateinit var securityService: SecurityService
    @Mock lateinit var auditoriaService: AuditoriaService

    @InjectMocks
    lateinit var eventoService: EventoService

    private val principalUser = UserPrincipal(
        uid = "user-uid",
        authorities = listOf(SimpleGrantedAuthority("ROLE_USER")),
        userId = 10
    )

    @Test
    fun `listarSeguro para usuario sin rol admin llama findPublicosOrByUsuarioId y nunca findAll`() {
        given(securityService.getUserPrincipal()).willReturn(principalUser)
        given(securityService.hasRole("ADMIN", "STAFF")).willReturn(false)
        given(repo.findPublicosOrByUsuarioId(10)).willReturn(emptyList())

        eventoService.listarSeguro()

        verify(repo).findPublicosOrByUsuarioId(10)
        verify(repo, never()).findAll()
    }
}
