package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.dto.NotificacionDto
import com.example.SpringBoot.TFG.service.NotificacionService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/notificaciones")
class NotificacionController(private val service: NotificacionService) {

    @GetMapping
    fun list(): List<NotificacionDto> = service.listarMisNotificaciones()

    @PatchMapping("/{id}/leer")
    fun marcarLeida(@PathVariable id: Int): NotificacionDto = service.marcarLeida(id)

    @PatchMapping("/leer-todas")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun marcarTodas() = service.marcarTodasLeidas()

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Int) = service.eliminar(id)

    @PostMapping("/soporte/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun notificarSoporte(@PathVariable userId: Int) = service.notificarSoporte(userId)

    @PostMapping("/test-push")
    fun testPush(): String = service.testPush()
}