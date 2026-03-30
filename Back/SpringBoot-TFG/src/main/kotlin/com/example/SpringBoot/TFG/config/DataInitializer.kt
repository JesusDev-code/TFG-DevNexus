package com.example.SpringBoot.TFG.config

import com.example.SpringBoot.TFG.model.Rol
import com.example.SpringBoot.TFG.repository.RolRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class DataInitializer {

    @Bean
    fun initRoles(rolRepository: RolRepository) = CommandLineRunner {
        val roles = listOf("USER", "STAFF", "ADMIN")
        roles.forEach { nombre ->
            if (rolRepository.findByNombre(nombre) == null) {
                rolRepository.save(Rol(nombre = nombre))
            }
        }
    }
}