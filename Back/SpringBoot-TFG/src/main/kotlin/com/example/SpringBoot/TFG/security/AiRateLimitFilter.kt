package com.example.SpringBoot.TFG.security

import io.github.bucket4j.Bandwidth
import io.github.bucket4j.Bucket
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.time.Duration
import java.util.concurrent.ConcurrentHashMap

@Component
class AiRateLimitFilter : OncePerRequestFilter() {

    private val buckets = ConcurrentHashMap<String, Bucket>()

    private fun newBucket(): Bucket {
        val limit = Bandwidth.builder()
            .capacity(10)
            .refillGreedy(10, Duration.ofMinutes(1))
            .build()
        return Bucket.builder().addLimit(limit).build()
    }

    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.servletPath
        return !path.startsWith("/api/diario-ai") && !path.startsWith("/api/vision")
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        chain: FilterChain
    ) {
        val userId = SecurityContextHolder.getContext().authentication?.name ?: request.remoteAddr
        val bucket = buckets.computeIfAbsent(userId) { newBucket() }

        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response)
        } else {
            response.status = 429
            response.contentType = "application/json"
            response.writer.write("""{"error":"Too Many Requests","message":"Límite de peticiones de IA alcanzado. Espera 1 minuto."}""")
        }
    }
}
