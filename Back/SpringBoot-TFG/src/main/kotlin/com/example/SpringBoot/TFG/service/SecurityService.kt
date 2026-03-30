package com.example.SpringBoot.TFG.service

import com.example.SpringBoot.TFG.security.UserPrincipal
import org.springframework.http.HttpStatus
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class SecurityService {

    /**
     * Obtiene el usuario autenticado actual de forma segura.
     */
    fun getUserPrincipal(): UserPrincipal {
        val authentication = SecurityContextHolder.getContext().authentication
        if (authentication == null || authentication.principal !is UserPrincipal) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no identificado")
        }
        return authentication.principal as UserPrincipal
    }

    /**
     * Valida si el usuario actual tiene acceso a un recurso.
     * Lanza excepción si no tiene permiso.
     *
     * @param ownerId El ID del usuario dueño del recurso (puede ser null).
     * @param allowedRoles Lista de roles permitidos además del dueño (ej: "ADMIN", "STAFF").
     */
    fun checkAccess(ownerId: Int?, vararg allowedRoles: String) {
        val principal = getUserPrincipal()

        // 1. Comprobar si es el dueño
        // Usamos el userId que añadimos en la Fase 1
        if (ownerId != null && principal.userId == ownerId) {
            return // Es el dueño, pase.
        }

        // 2. Comprobar si tiene algún rol especial permitido
        // Nota: Spring Security guarda los roles como "ROLE_ADMIN", por eso añadimos el prefijo.
        val hasRole = principal.authorities.any { auth ->
            allowedRoles.any { role -> auth.authority == "ROLE_$role" }
        }

        if (hasRole) {
            return // Es VIP (Admin/Staff), pase.
        }

        // 3. Si no es dueño ni tiene rol -> EXPULSADO
        throw ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para modificar este recurso")
    }

    /**
     * Sobrecarga para verificar solo roles (sin dueño específico)
     */
    fun checkRole(vararg allowedRoles: String) {
        val principal = getUserPrincipal()
        val hasRole = principal.authorities.any { auth ->
            allowedRoles.any { role -> auth.authority == "ROLE_$role" }
        }
        if (!hasRole) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Requiere privilegios elevados: ${allowedRoles.joinToString()}")
        }
    }

    /**
     * Devuelve true si el usuario tiene alguno de los roles indicados.
     * NO lanza excepción (útil para condicionales if/else).
     */
    fun hasRole(vararg allowedRoles: String): Boolean {
        val principal = getUserPrincipal()
        return principal.authorities.any { auth ->
            allowedRoles.any { role -> auth.authority == "ROLE_$role" }
        }
    }
}