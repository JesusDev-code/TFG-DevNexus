package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.dto.FcmTokenRegistroDto
import com.example.SpringBoot.TFG.service.UsuarioFcmTokenService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import java.net.URLDecoder
import java.nio.charset.StandardCharsets

@RestController
@RequestMapping("/api/usuarios/fcm-tokens")
class FcmTokenController(private val service: UsuarioFcmTokenService) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun registrar(@RequestBody dto: FcmTokenRegistroDto) {
        service.registrar(dto.token, dto.plataforma)
    }

    @DeleteMapping("/{token}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun eliminar(@PathVariable token: String) {
        val decodificado = URLDecoder.decode(token, StandardCharsets.UTF_8)
        service.eliminarPorToken(decodificado)
    }
}
