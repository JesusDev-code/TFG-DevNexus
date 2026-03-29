package com.example.SpringBoot.TFG

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableScheduling
class SpringBootTfgApplication

fun main(args: Array<String>) {
	runApplication<SpringBootTfgApplication>(*args)
}
