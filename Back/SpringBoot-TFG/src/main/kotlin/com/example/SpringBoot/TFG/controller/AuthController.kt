package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.dto.GoogleLoginDto
import com.example.SpringBoot.TFG.dto.UsuarioDto
import com.example.SpringBoot.TFG.security.UserPrincipal
import com.example.SpringBoot.TFG.service.UsuarioService
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class AuthController(private val usuarioService: UsuarioService) {

    @PostMapping("/google")
    fun googleLogin(@RequestBody body: GoogleLoginDto, authentication: Authentication): UsuarioDto {
        // Spring Security ya ha verificado el token de Firebase gracias a tu filtro
        // y ha puesto el UID en el objeto "principal".
        val principal = authentication.principal as UserPrincipal

        return usuarioService.sincronizarGoogle(
            uid = principal.uid,
            email = body.email,
            nombre = body.nombre,
            foto = body.foto
        )
    }
}