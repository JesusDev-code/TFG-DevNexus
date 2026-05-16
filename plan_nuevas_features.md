# Plan: Export MD + Foto-a-Diario con IA

## Qué vamos a hacer

Dos features nuevas en el módulo de Diario:

1. **Exportar como Markdown (.md)** — botón adicional al CSV, generado 100% en frontend desde los datos ya cargados.
2. **Foto de código → IA → Diario** — el usuario saca una foto (o elige una imagen) con código, el backend llama a Groq, y el texto extraído se pega en el textarea de nueva entrada.

---

## Arquitectura (producción-ready)

```
[Frontend]  →  POST /api/vision/extraer-codigo  →  [Backend Spring Boot]
                   { imageBase64, mimeType }           ↓
                                                  Groq API (llama-4-scout vision)
                                                       ↓
                   { texto: "código extraído" }  ←  response
```

La API key de Groq **solo existe en el backend** como variable de entorno `GROQ_API_KEY`. Nunca llega al frontend.

---

## Ficheros a crear / modificar

### Backend

| Acción | Fichero |
|--------|---------|
| CREAR  | `controller/VisionController.kt` |
| CREAR  | `service/VisionService.kt` |
| CREAR  | `dto/VisionRequestDto.kt` |
| CREAR  | `dto/VisionResponseDto.kt` |
| MODIFICAR | `application.yml` — añadir `groq.api-key: ${GROQ_API_KEY}` |
| MODIFICAR | `.env.example` — añadir `GROQ_API_KEY=your-groq-api-key` |

### Frontend

| Acción | Fichero |
|--------|---------|
| MODIFICAR | `services/diario.service.ts` — añadir `extraerCodigoDeImagen()` y `exportarTemaMd()` |
| MODIFICAR | `user-diary/user-diary.page.ts` — métodos `exportarMd()` y `abrirCamaraIA()` |
| MODIFICAR | `user-diary/user-diary.page.html` — dos botones nuevos |

---

## Detalle técnico

### Exportar .md (frontend-only)

- Genera Markdown con los datos de `entradasFiltradas` que ya están en memoria.
- Formato: `# Título del tema\n\n---\n\n## Fecha\n\n{contenido}\n\n---`
- Misma lógica de descarga que el CSV: web usa `createObjectURL`, Android usa `Filesystem + Share`.

### Foto → IA → Diario (backend → Groq)

**Backend:**
- Endpoint: `POST /api/vision/extraer-codigo` (requiere JWT — cualquier usuario autenticado).
- Spring `RestTemplate` llama a `https://api.groq.com/openai/v1/chat/completions`.
- Modelo: `meta-llama/llama-4-scout-17b-16e-instruct` (gratis, soporta visión).
- Prompt del sistema: *"Eres un extractor de código. Devuelve ÚNICAMENTE el código que aparece en la imagen, sin explicaciones, sin markdown de bloque, preservando indentación y formato exactos."*
- Si Groq responde con error o está caído → 503 con mensaje claro.

**Frontend:**
- Botón "Scan código" con icono de cámara en el formulario de nueva entrada.
- En móvil: `<input type="file" accept="image/*" capture="environment">` — abre cámara.
- En web: `<input type="file" accept="image/*">` — abre selector de archivo.
- Convierte la imagen a base64 con `FileReader`.
- Llama a `/api/vision/extraer-codigo` con el base64 y el mime type.
- Mientras espera: spinner y botón deshabilitado.
- Al recibir: inserta el texto al final del `nuevaEntradaTexto` (no reemplaza, acumula).

---

## Estado de avance

- [x] Backend: DTOs (`VisionRequestDto.kt`, `VisionResponseDto.kt`)
- [x] Backend: VisionService (llamada a Groq con RestTemplate)
- [x] Backend: VisionController (`POST /api/vision/extraer-codigo`, protegido por JWT)
- [x] Backend: `HttpClientConfig.kt` — bean RestTemplate
- [x] Backend: `application.yml` — `groq.api-key: ${GROQ_API_KEY}`
- [x] Backend: `.env.example` — `GROQ_API_KEY=your-groq-api-key`
- [x] Frontend: `diario.service.ts` — `extraerCodigoDeImagen()`
- [x] Frontend: `user-diary.page.ts` — `exportarMd()`, `abrirCamaraIA()`, `procesarImagenIA()`, `exportarNativo()` (unifica CSV y MD)
- [x] Frontend: `user-diary.page.html` — botón MD en topbar, botón "Scan IA" con spinner en plantillas
- [x] Frontend: SCSS — estilos `.export-md` (verde) y `.scan-ia` (amarillo)
- [x] Lint — `All files pass linting`

## Pendiente (acción manual)

1. Añadir `GROQ_API_KEY=<tu-key>` en el `.env` del servidor (Dokploy/VPS).
   - Obtener key gratis en https://console.groq.com
2. Rebuildar el APK con Android Studio (necesario por los nuevos plugins Capacitor: filesystem + share).
