package com.example.SpringBoot.TFG.repository

import com.example.SpringBoot.TFG.model.Mensaje
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface MensajeRepository : JpaRepository<Mensaje, Int> {
    fun findByConversacionIdOrderByFechaEnvioDesc(conversacionId: Int, pageable: Pageable): Page<Mensaje>

    @Query("""
        SELECT COUNT(m) FROM Mensaje m
        WHERE m.conversacion.id = :convId
        AND m.autor.id <> :userId
        AND m.leidoEn IS NULL
    """)
    fun countUnreadMessages(convId: Int, userId: Int): Long

    fun findByConversacionIdAndAutorIdNotAndLeidoEnIsNull(conversacionId: Int, autorId: Int): List<Mensaje>
}