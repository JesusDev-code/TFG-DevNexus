package com.example.SpringBoot.TFG.controller

import com.example.SpringBoot.TFG.model.Departamento
import com.example.SpringBoot.TFG.service.DepartamentoService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/departamentos")
class DepartamentoController(private val service: DepartamentoService) {

    @GetMapping
    fun list(): List<Departamento> = service.findAll()

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Int): Departamento = service.findById(id)

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@RequestBody d: Departamento): Departamento = service.save(d)

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Int) = service.delete(id)
}