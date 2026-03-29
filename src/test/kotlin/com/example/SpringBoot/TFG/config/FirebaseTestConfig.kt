package com.example.SpringBoot.TFG.config

import com.google.firebase.FirebaseApp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.messaging.FirebaseMessaging
import org.mockito.Mockito
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import org.springframework.context.annotation.Profile

@TestConfiguration
@Profile("test")
class FirebaseTestConfig {

    @Bean
    @Primary
    fun firebaseApp(): FirebaseApp = Mockito.mock(FirebaseApp::class.java)

    @Bean
    @Primary
    fun firebaseAuth(): FirebaseAuth = Mockito.mock(FirebaseAuth::class.java)

    @Bean
    @Primary
    fun firebaseMessaging(): FirebaseMessaging = Mockito.mock(FirebaseMessaging::class.java)
}
