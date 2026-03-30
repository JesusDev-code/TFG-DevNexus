package com.example.SpringBoot.TFG

import com.example.SpringBoot.TFG.config.FirebaseTestConfig
import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

@ActiveProfiles("test")
@SpringBootTest
@Import(FirebaseTestConfig::class)
class SpringBootTfgApplicationTests {

	@Test
	fun contextLoads() {
	}

}
