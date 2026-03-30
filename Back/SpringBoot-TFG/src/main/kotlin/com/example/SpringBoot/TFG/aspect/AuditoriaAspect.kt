package com.example.SpringBoot.TFG.aspect

import com.example.SpringBoot.TFG.service.AuditoriaService
import org.aspectj.lang.JoinPoint
import org.aspectj.lang.annotation.AfterReturning
import org.aspectj.lang.annotation.Aspect
import org.springframework.stereotype.Component

@Aspect
@Component
class AuditoriaAspect(
    private val auditoriaService: AuditoriaService // ✅ Ahora usamos el Service
) {

    // Detecta Creaciones (POST) -> INFO
    @AfterReturning("within(com.example.SpringBoot.TFG.controller..*) && @annotation(org.springframework.web.bind.annotation.PostMapping)")
    fun logCrear(joinPoint: JoinPoint) {
        procesarLog("CREAR", joinPoint, "INFO")
    }

    // Detecta Modificaciones (PUT/PATCH) -> WARNING
    @AfterReturning("within(com.example.SpringBoot.TFG.controller..*) && @annotation(org.springframework.web.bind.annotation.PutMapping)")
    fun logModificar(joinPoint: JoinPoint) {
        procesarLog("MODIFICAR", joinPoint, "WARNING")
    }

    // Detecta Patch también como Modificación
    @AfterReturning("within(com.example.SpringBoot.TFG.controller..*) && @annotation(org.springframework.web.bind.annotation.PatchMapping)")
    fun logPatch(joinPoint: JoinPoint) {
        procesarLog("MODIFICAR", joinPoint, "WARNING")
    }

    // Detecta Eliminaciones (DELETE) -> DANGER
    @AfterReturning("within(com.example.SpringBoot.TFG.controller..*) && @annotation(org.springframework.web.bind.annotation.DeleteMapping)")
    fun logEliminar(joinPoint: JoinPoint) {
        procesarLog("ELIMINAR", joinPoint, "DANGER")
    }

    private fun procesarLog(accion: String, joinPoint: JoinPoint, severidad: String) {
        try {
            // Sacar nombre del recurso (ej: TicketController -> Ticket)
            val className = joinPoint.signature.declaringType.simpleName
            val recursoNombre = className.replace("Controller", "")
            val metodo = joinPoint.signature.name

            // Llamamos al servicio para guardar (él se encarga de buscar el usuario actual)
            auditoriaService.registrar(
                accion = accion,
                recurso = recursoNombre,
                descripcion = "Operación automática: $metodo",
                severidad = severidad
            )

        } catch (e: Exception) {
            println("❌ Error en aspecto de auditoría: ${e.message}")
        }
    }
}