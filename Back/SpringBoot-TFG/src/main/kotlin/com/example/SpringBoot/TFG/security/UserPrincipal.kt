// UserPrincipal.kt - MEJORADO
package com.example.SpringBoot.TFG.security

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails

data class UserPrincipal(
    val uid: String,
    private val authorities: Collection<GrantedAuthority>,
    val userId: Int? = null // Nuevo campo opcional para no romper compatibilidad
) : UserDetails {

    override fun getAuthorities(): Collection<GrantedAuthority> = authorities

    override fun getPassword(): String? = null

    override fun getUsername(): String = uid

    override fun isAccountNonExpired(): Boolean = true

    override fun isAccountNonLocked(): Boolean = true

    override fun isCredentialsNonExpired(): Boolean = true

    override fun isEnabled(): Boolean = true
}
