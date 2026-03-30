package com.example.SpringBoot.TFG.repository

import com.example.SpringBoot.TFG.model.Rol
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface RolRepository : JpaRepository<Rol, Int> {
    fun findByNombre(nombre: String): Rol?
}