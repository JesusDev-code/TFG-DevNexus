package com.example.SpringBoot.TFG.repository

import com.example.SpringBoot.TFG.model.Usuario
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface UsuarioRepository : JpaRepository<Usuario, Int> {

    @Query("SELECT u FROM Usuario u JOIN FETCH u.rol WHERE u.firebaseUid = :firebaseUid")
    fun findByFirebaseUid(@Param("firebaseUid") firebaseUid: String): Optional<Usuario>

    fun existsByEmail(email: String): Boolean

    fun findByEmail(email: String): Optional<Usuario>

    // ✅ MODIFICADO: Buscar por departamento SOLO si permiten contacto
    // Spring Data genera automáticamente el SQL: ... WHERE departamento_id = ? AND permite_contacto = TRUE
    fun findByDepartamentoIdAndPermiteContactoTrue(departamentoId: Int): List<Usuario>

    // Búsqueda global: todos los que permiten contacto, excepto yo mismo
    @Query("""
        SELECT u FROM Usuario u
        WHERE u.permiteContacto = true
        AND (LOWER(u.nombre) LIKE LOWER(CONCAT('%', :query, '%'))
             OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))
        AND u.id <> :miId
    """)
    fun buscarContactosGlobal(
        @Param("query") query: String,
        @Param("miId") miId: Int
    ): List<Usuario>

    fun findByFcmToken(fcmToken: String): List<Usuario>

    // Usuarios "Ocultos" (para uso interno de admins si hiciera falta)
    fun findByPermiteContactoFalse(): List<Usuario>

    // Búsqueda global para ADMINS
    fun findByNombreContainingIgnoreCaseOrEmailContainingIgnoreCase(nombre: String, email: String): List<Usuario>
}