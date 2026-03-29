package com.example.SpringBoot.TFG.security

import com.example.SpringBoot.TFG.repository.UsuarioRepository
import com.google.firebase.auth.FirebaseAuth
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class FirebaseAuthFilter(
    private val firebaseAuth: FirebaseAuth,
    private val usuarioRepository: UsuarioRepository
) : OncePerRequestFilter() {

    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.servletPath
        val method = request.method

        if (method == "OPTIONS") return true

        // ✅ CORREGIDO: Ya NO ignoramos "/api/usuarios/registro".
        // El filtro debe ejecutarse también en el registro para validar el token de Firebase
        // y permitir que el controlador obtenga el UID del principal.
        return path.startsWith("/swagger-ui") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/h2-console")
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        chain: FilterChain
    ) {
        val header = request.getHeader("Authorization")

        if (header == null || !header.startsWith("Bearer ")) {
            // Si no hay token, dejamos pasar la petición. Spring Security (SecurityConfig)
            // decidirá si rechazarla (401) o permitirla (si es pública).
            // PERO no establecemos autenticación, por lo que el Principal será nulo o anónimo.
            chain.doFilter(request, response)
            return
        }

        try {
            val token = header.substring(7).trim()
            val decoded = firebaseAuth.verifyIdToken(token)
            val uid = decoded.uid

            // Buscamos si el usuario ya existe en nuestra BD local
            val usuarioOpt = usuarioRepository.findByFirebaseUid(uid)

            val authorities = mutableListOf<SimpleGrantedAuthority>()
            var userId: Int? = null

            if (usuarioOpt.isPresent) {
                // CASO 1: Usuario ya registrado (Login normal)
                val usuario = usuarioOpt.get()
                userId = usuario.id
                val rolNombre = usuario.rol.nombre
                authorities.add(SimpleGrantedAuthority("ROLE_$rolNombre"))
            } else {
                // CASO 2: Usuario NO registrado (Es la petición de Registro)
                // Le damos un rol temporal "USER" o "GUEST" para que Spring Security
                // le deje pasar y llegar al UsuarioController.create()
                authorities.add(SimpleGrantedAuthority("ROLE_USER"))
            }

            // Creamos el Principal con el ID (si existe) y el UID
            val principal = UserPrincipal(uid, authorities, userId)
            val auth = UsernamePasswordAuthenticationToken(principal, null, authorities)

            SecurityContextHolder.getContext().authentication = auth

            chain.doFilter(request, response)

        } catch (e: Exception) {
            println("❌ [FILTRO] Error verificando token: ${e.message}")
            // Importante: Si el token es inválido (caducado, falso), cortamos aquí
            // y devolvemos 401 inmediatamente.
            response.status = HttpServletResponse.SC_UNAUTHORIZED
            SecurityContextHolder.clearContext()
            response.contentType = "application/json"
            response.writer.write("""{"error":"Token inválido","message":"${e.message}"}""")
        }
    }
}