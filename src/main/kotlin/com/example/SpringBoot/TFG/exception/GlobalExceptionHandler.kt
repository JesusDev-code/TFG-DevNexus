package com.example.SpringBoot.TFG.exception

import org.springframework.core.annotation.Order
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.security.core.AuthenticationException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.context.request.WebRequest
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

@RestControllerAdvice
@Order(1)
class GlobalExceptionHandler {

    // 1. Errores de Autenticación (401)
    @ExceptionHandler(AuthenticationException::class)
    fun handleAuthenticationException(ex: AuthenticationException): ResponseEntity<ErrorResponse> {
        val error = ErrorResponse(
            status = HttpStatus.UNAUTHORIZED.value(),
            error = "Unauthorized",
            message = ex.message ?: "Token inválido o expirado",
            timestamp = LocalDateTime.now()
        )
        return ResponseEntity(error, HttpStatus.UNAUTHORIZED)
    }

    // 2. Errores lanzados manualmente con ResponseStatusException (403, 404, 409...)
    @ExceptionHandler(ResponseStatusException::class)
    fun handleResponseStatusException(
        ex: ResponseStatusException,
        request: WebRequest
    ): ResponseEntity<ErrorResponse> {
        val statusCode = ex.statusCode
        val httpStatus = HttpStatus.valueOf(statusCode.value())

        val error = ErrorResponse(
            status = statusCode.value(),
            error = httpStatus.reasonPhrase,
            message = ex.reason ?: getStandardReason(statusCode.value()),
            timestamp = LocalDateTime.now(),
            path = request.getDescription(false).removePrefix("uri=")
        )

        return ResponseEntity(error, httpStatus)
    }

    // 3. Errores de Validación (@Valid en DTOs) (400)
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationException(ex: MethodArgumentNotValidException): ResponseEntity<ValidationErrorResponse> {
        val errors = ex.bindingResult.fieldErrors.associate { fieldError ->
            fieldError.field to (fieldError.defaultMessage ?: "Valor inválido")
        }

        val error = ValidationErrorResponse(
            status = HttpStatus.BAD_REQUEST.value(),
            error = "Validación fallida",
            message = "Hay ${errors.size} error(es) de validación",
            timestamp = LocalDateTime.now(),
            validationErrors = errors
        )

        return ResponseEntity(error, HttpStatus.BAD_REQUEST)
    }

    // 4. ✅ NUEVO: Errores de formato JSON (Enum inválido, fecha mal formada...) (400)
    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleJsonErrors(ex: HttpMessageNotReadableException): ResponseEntity<ErrorResponse> {
        val error = ErrorResponse(
            status = HttpStatus.BAD_REQUEST.value(),
            error = "Formato JSON inválido",
            message = "Error al procesar la petición. Verifica los tipos de datos (ej: Enums, fechas, números).",
            timestamp = LocalDateTime.now(),
            debugMessage = ex.message // Útil para desarrollo
        )
        return ResponseEntity(error, HttpStatus.BAD_REQUEST)
    }

    // 5. Cualquier otro error no controlado (500)
    @ExceptionHandler(Exception::class)
    fun handleGenericException(ex: Exception): ResponseEntity<ErrorResponse> {
        ex.printStackTrace() // Importante para ver el error en la consola del servidor

        val error = ErrorResponse(
            status = HttpStatus.INTERNAL_SERVER_ERROR.value(),
            error = "Error interno del servidor",
            message = "Ha ocurrido un error inesperado. Contacta con soporte si persiste.",
            timestamp = LocalDateTime.now(),
            debugMessage = ex.message
        )

        return ResponseEntity(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }

    private fun getStandardReason(code: Int): String = when (code) {
        400 -> "Bad Request"
        401 -> "Unauthorized"
        403 -> "Forbidden"
        404 -> "Not Found"
        405 -> "Method Not Allowed"
        409 -> "Conflict"
        500 -> "Internal Server Error"
        else -> "Error"
    }
}

// Clases de respuesta (DTOs internos)
data class ErrorResponse(
    val status: Int,
    val error: String,
    val message: String,
    val timestamp: LocalDateTime,
    val path: String? = null,
    val debugMessage: String? = null
)

data class ValidationErrorResponse(
    val status: Int,
    val error: String,
    val message: String,
    val timestamp: LocalDateTime,
    val validationErrors: Map<String, String>
)