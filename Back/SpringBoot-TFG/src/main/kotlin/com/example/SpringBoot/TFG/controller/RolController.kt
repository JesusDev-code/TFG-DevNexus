package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.model.Rol
import com.example.SpringBoot.TFG.service.RolService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/roles")
class RolController(private val service: RolService) {

    @GetMapping
    fun list(): List<Rol> = service.findAll()

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Int): Rol = service.findById(id)

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@RequestBody rol: Rol): Rol = service.save(rol)

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Int) = service.delete(id)
}