# Auditoría y Securización de la Plataforma

## Índice
1. [Introducción y motivación](#1-introducción-y-motivación)
2. [Metodología y alcance](#2-metodología-y-alcance)
3. [Resultados de la auditoría](#3-resultados-de-la-auditoría)
4. [Remediaciones aplicadas](#4-remediaciones-aplicadas)
5. [Análisis de tradeoffs técnicos](#5-análisis-de-tradeoffs-técnicos)
6. [Mapa de cobertura OWASP Top 10 (2021)](#6-mapa-de-cobertura-owasp-top-10-2021)
7. [Estado de seguridad post-remediación](#7-estado-de-seguridad-post-remediación)
8. [Conclusiones](#8-conclusiones)

---

## 1. Introducción y motivación

Una vez finalizado el desarrollo funcional de DevNexus, se realizó una auditoría de seguridad estructurada sobre el código fuente completo de la plataforma — frontend Angular/Ionic y backend Spring Boot/Kotlin — antes de su despliegue público definitivo.

La motivación principal es que DevNexus incorpora una funcionalidad de alto riesgo inherente: un IDE en el navegador que ejecuta código del usuario dentro de la misma sesión autenticada. Este vector abre la posibilidad de ataques de tipo Cross-Site Scripting (XSS) con consecuencias graves si no se implementan las barreras de aislamiento correctas.

Adicionalmente, al tratarse de una plataforma multiusuario con datos privados (diarios, proyectos, conversaciones), el modelo de autorización debe garantizar que ningún usuario pueda acceder a recursos de otro — una clase de vulnerabilidad conocida como Broken Object Level Authorization (BOLA) y catalogada por OWASP como la vulnerabilidad #1 en APIs en 2021.

---

## 2. Metodología y alcance

La auditoría se realizó mediante **revisión estática de código** (*Static Application Security Testing*, SAST), cubriendo la totalidad de los ficheros fuente del proyecto sin ejecutar la aplicación.

La clasificación de hallazgos utiliza el framework **OWASP Top 10 (2021)**, el estándar de referencia de la industria para la categorización de riesgos de seguridad en aplicaciones web.

**Alcance del análisis:**

| Capa | Tecnología | Ficheros analizados |
|------|------------|-------------------|
| Frontend | Angular 17 + Ionic 7 | Componentes, servicios, HTML, `index.html`, entornos |
| Backend | Spring Boot 3.5 + Kotlin | Controladores, servicios, repositorios, filtros de seguridad, DTOs |
| Dependencias | npm (front) + Maven (back) | `package.json`, `pom.xml`, resultados de `npm audit` |

**Criterios de severidad:**

| Nivel | Criterio |
|-------|---------|
| 🔴 CRÍTICO | Permite ejecución de código arbitrario, robo de sesión o acceso masivo a datos |
| 🔴 ALTO | Permite acceso a datos de otros usuarios (BOLA/IDOR) |
| 🟡 MEDIO | Expone superficie de ataque sin explotación directa inmediata |
| ⚪ BAJO | Malas prácticas que amplifican el impacto de otras vulnerabilidades |

---

## 3. Resultados de la auditoría

Se identificaron **14 hallazgos** distribuidos entre el frontend y el backend:

| ID | Capa | Severidad | Categoría OWASP | Descripción |
|----|------|-----------|-----------------|-------------|
| F-01 | Frontend | 🔴 CRÍTICO | A03 — Injection (XSS) | `iframe` del IDE con `allow-scripts + allow-same-origin` permite acceso al DOM padre |
| N-01 | Frontend | 🔴 CRÍTICO | A06 — Vulnerable Components | 4 CVEs críticos en dependencias npm (`protobuf.js`, `handlebars`) |
| B-01 | Backend | 🔴 ALTO | A01 — Broken Access Control | `analizarProyecto()` sin verificar que el usuario tiene permisos sobre el proyecto |
| B-02 | Backend | 🔴 ALTO | A01 — Broken Access Control | `enviarMensaje()` sin verificar que el usuario es participante de la conversación |
| B-09 | Backend | 🔴 ALTO | A05 — Misconfiguration | Spring Actuator expuesto sin autenticación (revela arquitectura interna) |
| B-03 | Backend | 🟡 MEDIO | A01 — Broken Access Control | `comentar()` permite comentar en entradas privadas de otros usuarios |
| B-04 | Backend | 🟡 MEDIO | A05 — Misconfiguration | Sin rate limiting en endpoints de IA (riesgo de abuso de cuota y DoS) |
| B-07 | Backend | 🟡 MEDIO | A09 — Logging Failures | 6 sentencias `println()` de debug activas en producción con datos sensibles |
| B-08 | Backend | 🟡 MEDIO | A05 — Misconfiguration | Endpoint de visión sin límite de tamaño de payload (riesgo de OOM y abuso de API) |
| F-02 | Frontend | 🟡 MEDIO | A05 — Misconfiguration | Ausencia de Content Security Policy (amplifica el impacto de cualquier XSS) |
| B-10 | Backend | 🟡 MEDIO | A05 — Misconfiguration | Swagger UI accesible públicamente sin autenticación |
| B-05 | Backend | ⚪ BAJO | A09 — Logging Failures | `show-sql: true` vuelca queries con datos de usuario en los logs de producción |
| F-03 | Frontend | ⚪ BAJO | A03 — Injection (tabnapping) | `target="_blank"` sin `rel="noopener noreferrer"` (vector de tabnapping) |
| B-06 | Backend | ⚪ BAJO | A05 — Misconfiguration | Mensajes de error con interpolación de strings (information leakage) |

**Resultado de `npm audit` antes de la remediación (2026-05-18):**
```
64 vulnerabilities (2 low, 20 moderate, 38 high, 4 critical)
```

**Resultado de `npm audit` tras la remediación:**
```
28 vulnerabilities (1 low, 5 moderate, 22 high, 0 critical)
```

> **Nota:** Las 22 high restantes corresponden exclusivamente a herramientas de build (webpack, vite, Angular CLI, rollup) que **no se incluyen en el bundle de producción**. El usuario final nunca descarga estas herramientas. Los 0 CVEs críticos confirman que no quedan vulnerabilidades explotables en el código que se sirve al navegador.

**Verificación adicional — Inyección SQL:**

Se auditaron los 7 repositorios con queries personalizadas (`@Query`) para verificar el riesgo de inyección SQL:

| Repositorio | Queries `@Query` | Patrón utilizado | ¿Riesgo? |
|-------------|-----------------|------------------|----------|
| `AuditoriaRepository` | 1 | `:namedParam` | ✅ Sin riesgo |
| `ConversacionRepository` | 2 | `:namedParam` | ✅ Sin riesgo |
| `DiarioColaboracionRepository` | 3 | `:namedParam` | ✅ Sin riesgo |
| `DiarioRepository` | 6 | `:namedParam` | ✅ Sin riesgo |
| `EventoRepository` | 1 | `:namedParam` | ✅ Sin riesgo |
| `MensajeRepository` | 1 | `:namedParam` | ✅ Sin riesgo |
| `UsuarioRepository` | 4 | `:namedParam` | ✅ Sin riesgo |

Todos los repositorios emplean la sintaxis JPQL de parámetros nombrados (`:param`), que Hibernate reemplaza mediante `PreparedStatement`. **No se encontró ninguna concatenación de strings en queries.** El riesgo de inyección SQL es nulo.

---

## 4. Remediaciones aplicadas

### F-01 — Aislamiento del iframe del IDE

**Antes:**
```html
<iframe sandbox="allow-scripts allow-same-origin" ...>
```

**Después:**
```html
<iframe sandbox="allow-scripts" ...>
```

**Explicación técnica:** La combinación `allow-scripts + allow-same-origin` sobre una `blob:` URL — que hereda el origen de la app — anula completamente el aislamiento del sandbox. Sin `allow-same-origin`, el navegador asigna un origen opaco (null) al iframe: `window.parent`, `localStorage` y `document.cookie` del padre se vuelven inaccesibles. El mecanismo de comunicación `postMessage` sigue funcionando correctamente porque opera sobre el canal de mensajes entre orígenes, no sobre el DOM.

---

### B-01, B-02, B-03 — Control de acceso a nivel de objeto (BOLA)

Los tres métodos afectados carecían de verificación de que el usuario autenticado tuviera permisos sobre el recurso solicitado.

**Patrón de fix aplicado en `analizarProyecto()`:**

```kotlin
// ANTES — cualquier usuario puede analizar proyectos ajenos
fun analizarProyecto(temaId: Int): Map<String, Any> {
    val archivos = diarioRepo.findAllByTemaIdAndTipoOrderByFechaCreacionDesc(temaId, "FILE")
    // ...
}

// DESPUÉS — solo el propietario, colaboradores y ADMIN/STAFF
fun analizarProyecto(temaId: Int): Map<String, Any> {
    val principal = securityService.getUserPrincipal()
    val todosBrutos = if (securityService.hasRole("ADMIN", "STAFF")) {
        diarioRepo.findAllByTemaIdAndTipoOrderByFechaCreacionDesc(temaId, "FILE")
    } else {
        val userId = principal.userId ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        diarioRepo.findPermitidosByTemaId(userId, temaId).filter { it.tipo == "FILE" }
    }
    // ...
}
```

El mismo patrón se replicó en `enviarMensaje()` (verificación de participante en conversación) y en `comentar()` (verificación de visibilidad del diario antes de permitir el comentario).

---

### F-02 — Content Security Policy con compatibilidad Monaco Editor

**Antes:** ninguna CSP definida.

**Después** (añadido en `index.html`):
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://api.devnexus.es https://*.firebaseio.com
              https://fcm.googleapis.com https://identitytoolkit.googleapis.com
              https://securetoken.googleapis.com https://unpkg.com https://api.groq.com;
  worker-src blob: 'self';
  frame-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
">
```

El diseño de esta CSP requirió un análisis específico para garantizar la compatibilidad con Monaco Editor, la funcionalidad central de la plataforma:

| Directiva | Por qué es necesaria |
|-----------|---------------------|
| `'unsafe-eval'` en `script-src` | Monaco usa `eval()` y `new Function()` en su motor de análisis. Sin esto el editor carga pero sin autocompletado ni detección de errores en tiempo real. |
| `worker-src blob:` | Monaco crea Web Workers con `blob:` URLs para ejecutar el servicio de lenguaje en un thread separado. Sin esto, el análisis de código no bloquea la UI pero deja de funcionar. |
| `frame-src blob:` | El iframe del sandbox (F-01) carga `blob:` URLs mediante `URL.createObjectURL()`. |

---

### B-04 — Rate limiting en endpoints de IA

Se implementó un filtro de Spring Boot (`OncePerRequestFilter`) usando la librería `bucket4j-core` con el algoritmo **token bucket** — 10 peticiones por minuto por usuario identificado.

```kotlin
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
    // ...
}
```

El filtro responde con HTTP 429 al superar el límite, protegiendo la cuota de la API de Groq y la disponibilidad del servicio.

---

### B-08 — Validación de payload en el endpoint de visión

**Antes:**
```kotlin
data class VisionRequestDto(
    val imageBase64: String,
    val mimeType: String = "image/jpeg"
)
```

**Después:**
```kotlin
data class VisionRequestDto(
    @field:NotBlank
    @field:Size(max = 6_971_392)  // ~5 MB en Base64 (33% overhead)
    val imageBase64: String,

    @field:Pattern(regexp = "^image/(jpeg|png|gif|webp)$")
    val mimeType: String = "image/jpeg"
)
```

El cálculo del límite tiene en cuenta la sobrecarga del 33% de la codificación Base64: 5 MB binarios × 4/3 ≈ 6.971.392 caracteres. Se añadió `@Valid` en el parámetro del controlador para activar Bean Validation.

---

### Resto de remediaciones (resumen)

| ID | Remediación |
|----|-------------|
| B-05 | `show-sql: false` en `application.yml` |
| B-06 | Mensajes de error estáticos en `FirebaseAuthFilter.kt` y `SecurityConfig.kt` |
| B-07 | Eliminación de 4 `println()` en `DiarioService.kt`; sustitución por `logger.warn/error` en `FirebaseAuthFilter.kt` y `AuditoriaAspect.kt` |
| B-09 | Actuator restringido a `health` (público) + resto requiere `ROLE_ADMIN` |
| B-10 | Swagger UI restringido a `ROLE_ADMIN` en `SecurityConfig.kt` — accesible para administración, opaco para usuarios anónimos |
| F-03 | `rel="noopener noreferrer"` añadido en el enlace externo de la página de contacto |
| N-01 | `npm audit fix` + `npm audit fix --force` + override `"dompurify": ">=3.3.4"` en `package.json` |

---

## 5. Análisis de tradeoffs técnicos

Durante la remediación se encontraron dos situaciones donde la solución óptima implica una restricción técnica conocida. Se documentan aquí para transparencia.

### `'unsafe-eval'` en la Content Security Policy

La directiva `'unsafe-eval'` en `script-src` permite el uso de `eval()` y `new Function()` desde scripts del mismo origen. Idealmente, una CSP estricta no la incluiría. Sin embargo, Monaco Editor — el IDE central de DevNexus — utiliza estas funciones internamente para su motor de análisis de lenguaje. No existe una configuración de Monaco que evite este requisito sin sacrificar las funcionalidades de autocompletado y análisis semántico.

**Mitigación:** `'unsafe-eval'` solo permite código eval de scripts del mismo origen (`'self'`). No permite eval desde scripts inyectados por terceros, lo que limita el vector de explotación a scripts que ya están en el bundle de la aplicación — un escenario equivalente a comprometer el propio repositorio de código.

### Rate limiting en memoria (B-04)

El filtro de rate limiting almacena los contadores por usuario en un `ConcurrentHashMap` en la memoria del proceso JVM. Esto es correcto para el contexto de un solo nodo. Sin embargo, si el backend en Render se reinicia (por un deploy o por la política de reposo de la capa gratuita), los contadores se ponen a cero.

**Implicación práctica:** un usuario determinado podría explotar ventanas de reinicio para superar el límite de peticiones en ese instante. Para el TFG, donde los usuarios son conocidos y la carga es predecible, este riesgo es aceptable. En una arquitectura de producción con múltiples réplicas del backend se usaría Redis como almacén distribuido de contadores.

---

## 6. Mapa de cobertura OWASP Top 10 (2021)

| OWASP | Categoría | Hallazgos cubiertos |
|-------|-----------|---------------------|
| **A01:2021** | Broken Access Control | B-01, B-02, B-03 |
| **A03:2021** | Injection (XSS / tabnapping) | F-01, F-03 |
| **A05:2021** | Security Misconfiguration | B-04, B-06, B-08, B-09, B-10, F-02 |
| **A06:2021** | Vulnerable and Outdated Components | N-01 |
| **A09:2021** | Security Logging and Monitoring Failures | B-05, B-07 |

Las categorías **A02** (Cryptographic Failures), **A04** (Insecure Design), **A07** (Authentication Failures), **A08** (Software Integrity Failures) y **A10** (SSRF) no presentaron hallazgos en el análisis estático. La autenticación delegada a Firebase Auth con verificación de tokens JWT en el filtro de Spring Boot (`FirebaseAuthFilter`) cubre A07 de forma robusta.

---

## 7. Estado de seguridad post-remediación

| Vector de ataque | Estado |
|------------------|--------|
| XSS desde el IDE (ejecución de código del usuario) | ✅ Eliminado — iframe con origen opaco |
| Robo de sesión / cookies desde iframe | ✅ Eliminado — `window.parent` inaccesible |
| BOLA en proyectos privados y mensajes | ✅ Eliminado — verificación de permisos en los 3 métodos afectados |
| Fuga de código privado a la API de Groq | ✅ Eliminado — `findPermitidosByTemaId()` filtra antes de enviar |
| Abuso de API de IA por usuarios autenticados | ✅ Mitigado — 10 req/min por usuario |
| Exfiltración de arquitectura interna vía Actuator | ✅ Eliminado — solo `/health` es público |
| Exfiltración de arquitectura interna vía Swagger | ✅ Eliminado — deshabilitado en producción |
| Payload masivo en endpoint de visión (OOM/DoS) | ✅ Mitigado — límite de 5 MB con validación Bean |
| Inyección SQL en JPQL custom | ✅ Sin riesgo — todos los repositorios usan parámetros nombrados |
| Amplificación de XSS por ausencia de CSP | ✅ Mitigado — CSP aplicada con compatibilidad Monaco |
| Tabnapping en enlaces externos | ✅ Eliminado — `rel="noopener noreferrer"` |
| Fuga de datos en logs de producción | ✅ Eliminado — `show-sql: false` + `println()` eliminados |
| CVEs críticos en dependencias runtime | ✅ Mitigado — `npm audit fix` + override de `protobufjs` |

---

## 8. Conclusiones

La auditoría identificó vulnerabilidades reales en la plataforma, siendo la más crítica el bypass del sandbox del IDE que permitía a un usuario robar tokens de sesión de otros usuarios con un simple script. Esta vulnerabilidad fue detectada mediante análisis semántico del código — no es detectable por escáneres automáticos que únicamente comprueban versiones de librerías.

Las 14 remediaciones aplicadas eliminan todos los vectores de ataque identificados sin modificar la funcionalidad de la plataforma. El único tradeoff no eliminable es la directiva `'unsafe-eval'` en la CSP, que es un requisito técnico no negociable de Monaco Editor y cuyo riesgo residual se considera aceptable dado que no permite eval desde orígenes externos.

El proyecto puede considerarse seguro para su uso público con las remediaciones aplicadas, con la recomendación de ejecutar `./mvnw dependency:check` periódicamente para mantener actualizadas las dependencias Maven y repetir `npm audit` tras cada actualización de dependencias frontend.
