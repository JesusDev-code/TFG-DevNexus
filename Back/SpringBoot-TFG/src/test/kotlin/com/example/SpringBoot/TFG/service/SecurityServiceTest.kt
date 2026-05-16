package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.security.UserPrincipal
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.server.ResponseStatusException

class SecurityServiceTest {

    private val securityService = SecurityService()

    private val principalUser = UserPrincipal(
        uid = "user-uid",
        authorities = listOf(SimpleGrantedAuthority("ROLE_USER")),
        userId = 10
    )
    private val principalAdmin = UserPrincipal(
        uid = "admin-uid",
        authorities = listOf(SimpleGrantedAuthority("ROLE_ADMIN")),
        userId = 99
    )

    @BeforeEach
    fun setup() {
        SecurityContextHolder.clearContext()
    }

    @AfterEach
    fun teardown() {
        SecurityContextHolder.clearContext()
    }

    private fun setAuthentication(principal: UserPrincipal) {
        val auth = UsernamePasswordAuthenticationToken(principal, null, principal.authorities)
        SecurityContextHolder.getContext().authentication = auth
    }

    // ────────────────────────────────────────────────────────────────────
    // getUserPrincipal
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `getUserPrincipal retorna el principal cuando hay autenticacion valida`() {
        setAuthentication(principalUser)

        val result = securityService.getUserPrincipal()

        assertThat(result.uid).isEqualTo("user-uid")
        assertThat(result.userId).isEqualTo(10)
    }

    @Test
    fun `getUserPrincipal lanza UNAUTHORIZED cuando no hay autenticacion`() {
        // SecurityContext vacío — sin authentication

        val ex = assertThrows<ResponseStatusException> { securityService.getUserPrincipal() }

        assertThat(ex.statusCode.value()).isEqualTo(401)
    }

    @Test
    fun `getUserPrincipal lanza UNAUTHORIZED cuando el principal no es UserPrincipal`() {
        val auth = UsernamePasswordAuthenticationToken("anonimo", null, emptyList())
        SecurityContextHolder.getContext().authentication = auth

        val ex = assertThrows<ResponseStatusException> { securityService.getUserPrincipal() }

        assertThat(ex.statusCode.value()).isEqualTo(401)
    }

    // ────────────────────────────────────────────────────────────────────
    // hasRole
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `hasRole retorna true cuando el usuario tiene el rol`() {
        setAuthentication(principalAdmin)

        val result = securityService.hasRole("ADMIN")

        assertThat(result).isTrue()
    }

    @Test
    fun `hasRole retorna false cuando el usuario no tiene el rol`() {
        setAuthentication(principalUser)

        val result = securityService.hasRole("ADMIN")

        assertThat(result).isFalse()
    }

    @Test
    fun `hasRole retorna true con multiples roles si tiene alguno`() {
        setAuthentication(principalUser)

        val result = securityService.hasRole("ADMIN", "USER")

        assertThat(result).isTrue()
    }

    // ────────────────────────────────────────────────────────────────────
    // checkRole
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `checkRole no lanza excepcion cuando el usuario tiene el rol requerido`() {
        setAuthentication(principalAdmin)

        // No debe lanzar excepción
        securityService.checkRole("ADMIN")
    }

    @Test
    fun `checkRole lanza FORBIDDEN cuando el usuario no tiene el rol requerido`() {
        setAuthentication(principalUser)

        val ex = assertThrows<ResponseStatusException> { securityService.checkRole("ADMIN") }

        assertThat(ex.statusCode.value()).isEqualTo(403)
    }

    // ────────────────────────────────────────────────────────────────────
    // checkAccess
    // ────────────────────────────────────────────────────────────────────

    @Test
    fun `checkAccess permite acceso al duenio del recurso`() {
        setAuthentication(principalUser)

        // userId=10 es el dueño del recurso con ownerId=10
        securityService.checkAccess(10, "ADMIN")
        // No debe lanzar excepción
    }

    @Test
    fun `checkAccess permite acceso con rol especial aunque no sea duenio`() {
        setAuthentication(principalAdmin)

        // ownerId=10, admin.userId=99 — no es el dueño pero tiene el rol
        securityService.checkAccess(10, "ADMIN")
        // No debe lanzar excepción
    }

    @Test
    fun `checkAccess lanza FORBIDDEN si no es duenio ni tiene rol especial`() {
        setAuthentication(principalUser)

        // userId=10 intenta acceder a recurso de ownerId=99 sin tener el rol correcto
        val ex = assertThrows<ResponseStatusException> {
            securityService.checkAccess(99, "ADMIN")
        }

        assertThat(ex.statusCode.value()).isEqualTo(403)
    }

    @Test
    fun `checkAccess permite acceso cuando ownerId es null y tiene rol especial`() {
        setAuthentication(principalAdmin)

        // Sin dueño específico, vale con el rol
        securityService.checkAccess(null, "ADMIN")
        // No debe lanzar excepción
    }
}
