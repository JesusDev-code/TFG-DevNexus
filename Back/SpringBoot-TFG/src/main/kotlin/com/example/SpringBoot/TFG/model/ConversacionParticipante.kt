package com.example.SpringBoot.TFG.model

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "conversacion_participante")
class ConversacionParticipante( // ⚠️ Cambiado de 'data class' a 'class'

    @EmbeddedId
    val id: ConversacionParticipanteId = ConversacionParticipanteId(),

    @JsonIgnore // ✅ CRÍTICO: Evita que el serializador JSON entre en bucle infinito
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("conversacionId")
    @JoinColumn(name = "conversacion_id")
    val conversacion: Conversacion,

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("usuarioId")
    @JoinColumn(name = "usuario_id")
    val usuario: Usuario,

    @Column(name = "fecha_entrada", updatable = false)
    val fechaEntrada: LocalDateTime = LocalDateTime.now(),

    @Column(name = "fecha_salida")
    var fechaSalida: LocalDateTime? = null
) {
    // Implementación manual para evitar recursión con 'conversacion'
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is ConversacionParticipante) return false
        return id == other.id
    }

    override fun hashCode(): Int = id.hashCode()
}

@Embeddable
data class ConversacionParticipanteId(
    @Column(name = "conversacion_id")
    val conversacionId: Int = 0,

    @Column(name = "usuario_id")
    val usuarioId: Int = 0
) : java.io.Serializable