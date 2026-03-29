package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.repository.*
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
class MensajeServiceTest {

    @Mock lateinit var repo: MensajeRepository
    @Mock lateinit var conversacionRepo: ConversacionRepository
    @Mock lateinit var participanteRepo: ConversacionParticipanteRepository
    @Mock lateinit var usuarioRepo: UsuarioRepository
    @Mock lateinit var securityService: SecurityService
    @Mock lateinit var notificacionService: NotificacionService

    @InjectMocks
    lateinit var mensajeService: MensajeService

    private val principal = UserPrincipal(
        uid = "user-uid",
        authorities = listOf(SimpleGrantedAuthority("ROLE_USER")),
        userId = 42
    )

    @Test
    fun `marcarComoLeidos usa query especifica y nunca findAll`() {
        given(securityService.getUserPrincipal()).willReturn(principal)
        given(repo.findByConversacionIdAndAutorIdNotAndLeidoEnIsNull(1, 42)).willReturn(emptyList())

        mensajeService.marcarComoLeidos(1)

        verify(repo).findByConversacionIdAndAutorIdNotAndLeidoEnIsNull(1, 42)
        verify(repo, never()).findAll()
    }
}
