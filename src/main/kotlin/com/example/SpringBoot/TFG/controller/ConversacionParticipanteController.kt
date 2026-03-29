package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.model.ConversacionParticipante
import com.example.SpringBoot.TFG.service.ConversacionService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/conversacion-participantes")
class ConversacionParticipanteController(private val conversacionService: ConversacionService) {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@RequestBody cp: ConversacionParticipante): ConversacionParticipante {
        return conversacionService.añadirParticipante(cp)
    }

    @DeleteMapping("/{convId}/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable convId: Int, @PathVariable userId: Int) {
        conversacionService.eliminarParticipante(convId, userId)
    }
}