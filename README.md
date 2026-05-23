# DevNexus

Plataforma colaborativa para desarrolladores que integra gestión de proyectos, diario profesional, mentoría y un IDE web con asistencia de inteligencia artificial.

**Trabajo de Fin de Grado — 2º DAM · IES Rafael Alberti**
**Autor:** Jesús Alfonso Pedreño Domínguez · Curso 2025–2026

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Angular 18 · Ionic 8 · Capacitor 6 |
| Backend | Spring Boot 3 · Kotlin |
| Base de datos | PostgreSQL 17 · PgBouncer |
| Autenticación | Firebase Auth |
| Notificaciones | Firebase Cloud Messaging (FCM) |
| IA | Groq API · Llama 3.3 70B |
| Animaciones | Rive Runtime |
| Tests E2E | Cypress |
| Tests unitarios | Jest |

---

## Características principales

- **IDE web** con editor de código integrado, ejecución de entornos Docker y asistente IA
- **Diario profesional** con entradas privadas/públicas y exportación a Markdown y CSV
- **Sistema de mentoría** con tickets de soporte y chat en tiempo real
- **Gestión de proyectos** con tablero Kanban y control de visibilidad
- **Panel de administración** completo (usuarios, roles, estadísticas)
- **App móvil** para Android vía Capacitor
- **Autenticación** con email/contraseña y Google OAuth

---

## Estructura del repositorio

```
TFG/
├── Front/      # Aplicación Angular + Ionic (web y Android)
├── Back/       # API REST Spring Boot + Kotlin
└── memoria/    # Memoria técnica del TFG
```

---

## Instalación y arranque

### Requisitos previos

- Node.js 20+
- Java 21+
- PostgreSQL 17
- Docker (para los entornos del IDE)
- Firebase project configurado

### Frontend

```bash
cd Front
npm install
ionic serve
```

Para Android:

```bash
ionic cap sync android
ionic cap open android
```

### Backend

Configurar las variables de entorno en `Back/SpringBoot-TFG/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/devnexus
    username: tu_usuario
    password: tu_password

firebase:
  credentials-path: /ruta/a/serviceAccountKey.json

groq:
  api-key: tu_groq_api_key
```

Arrancar:

```bash
cd Back/SpringBoot-TFG
./gradlew bootRun
```

---

## Tests

### Unitarios (Frontend)

```bash
cd Front
npm test
```

353 tests unitarios con Jest.

### E2E

```bash
cd Front
npx cypress open
```

4 specs · 20 tests (autenticación, IDE, perfil, administración).

---

## Seguridad

Antes del despliegue público se realizó una auditoría SAST completa (frontend + backend) con clasificación OWASP Top 10 (2021). Se identificaron y corrigieron 14 hallazgos, incluyendo un bypass crítico del sandbox del IDE que permitía robo de tokens de sesión mediante XSS.

| Protección | Mecanismo |
|---|---|
| Aislamiento del IDE | `iframe sandbox="allow-scripts"` sin `allow-same-origin` — origen opaco |
| Control de acceso (BOLA) | Verificación de propietario/colaborador en `analizarProyecto`, `enviarMensaje`, `comentar` |
| Content Security Policy | CSP completa con compatibilidad Monaco Editor (ver `Front/src/index.html`) |
| Rate limiting IA | Token bucket 10 req/min por usuario (`AiRateLimitFilter` con bucket4j) |
| Validación de payload | Bean Validation en `VisionRequestDto` — límite 5 MB + tipo MIME permitido |
| Dependencias | 0 CVEs críticos en runtime (`npm audit` + override `dompurify`) |
| Actuator / Swagger | Restringidos a `ROLE_ADMIN` — `/actuator/health` es el único endpoint público |

Documentación detallada: `memoria/Memoria_TFG_DevNexus.md` § 12.5.

---

## Roles de usuario

| Rol | Descripción |
|---|---|
| `USER` | Usuario estándar — diario, proyectos, IDE |
| `STAFF` | Mentor — revisión de entradas, soporte a usuarios |
| `ADMIN` | Administración completa de la plataforma |

---

## Memoria del proyecto

La memoria técnica completa está en [`memoria/Memoria_TFG_DevNexus.md`](memoria/Memoria_TFG_DevNexus.md) e incluye:

- Justificación y análisis comparativo
- Diseño de arquitectura y diagramas UML
- Diagramas de secuencia y entidad–relación
- Plan de gestión de riesgos
- Registro de pruebas y plan de calidad
- Auditoría de seguridad OWASP
- Manuales de instalación y usuario
- Conclusiones y mejoras futuras

---

## Licencia

Proyecto académico — IES Rafael Alberti · 2025–2026
