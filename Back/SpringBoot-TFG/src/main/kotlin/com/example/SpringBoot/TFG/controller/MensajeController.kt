package com.example.SpringBoot.TFG.controller


import com.example.SpringBoot.TFG.dto.MensajeCreateDto
import com.example.SpringBoot.TFG.service.MensajeService
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/api/mensajes")
class MensajeController(private val service: MensajeService) {
    @PutMapping("/leer-todo/{convId}")
    fun marcarComoLeido(@PathVariable convId: Int) = service.marcarComoLeidos(convId)

    @GetMapping("/conversacion/{convId}")
    fun deConversacion(@PathVariable convId: Int) = service.obtenerMensajes(convId)

    @PostMapping
    fun enviar(@RequestBody dto: MensajeCreateDto) = service.enviarMensaje(dto)
}