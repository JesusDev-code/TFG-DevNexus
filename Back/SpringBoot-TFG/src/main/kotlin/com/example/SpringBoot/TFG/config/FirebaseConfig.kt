package com.example.SpringBoot.TFG.config

import com.google.auth.oauth2.GoogleCredentials
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.messaging.FirebaseMessaging // ✅ Nuevo import
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import java.util.Base64

@Configuration
@Profile("!test")
class FirebaseConfig {
    private val logger = LoggerFactory.getLogger(javaClass)

    @Value("\${firebase.sa-b64}")
    private lateinit var firebaseBase64: String

    @Bean
    fun firebaseApp(): FirebaseApp {
        return try {
            if (firebaseBase64.isBlank()) {
                throw IllegalStateException("❌ firebase.sa-b64 no está configurada en application.yml")
            }

            val decodedBytes = Base64.getDecoder().decode(firebaseBase64)
            val serviceAccount = decodedBytes.inputStream()

            val options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build()

            // Verificamos si ya existe una instancia para evitar errores al recargar
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options).also {
                    logger.info("Firebase inicializado correctamente desde Base64")
                }
            } else {
                FirebaseApp.getInstance()
            }

        } catch (ex: Exception) {
            logger.error("ERROR CRÍTICO inicializando Firebase: ${ex.message}", ex)
            throw IllegalStateException("Firebase initialization failed", ex)
        }
    }

    @Bean
    fun firebaseAuth(firebaseApp: FirebaseApp): FirebaseAuth =
        FirebaseAuth.getInstance(firebaseApp)

    // ✅ NUEVO BEAN: Permite enviar notificaciones push a los dispositivos
    @Bean
    fun firebaseMessaging(firebaseApp: FirebaseApp): FirebaseMessaging =
        FirebaseMessaging.getInstance(firebaseApp)
}