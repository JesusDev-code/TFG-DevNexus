# DOCUMENTACIÓN DEL TRABAJO DE FIN DE GRADO
## Ciclo Superior de Desarrollo de Aplicaciones Multiplataforma (DAM)

---

# 1. PORTADA

![Portada DevNexus](img/portada.png)

**Nombre del proyecto:** DevNexus — Plataforma Colaborativa de Gestión de Diarios, Incidencias y Comunicación para Desarrolladores

**Autor:** Jesús Alfonso Pedreño Domínguez

**Centro educativo:** IES Rafael Alberti

**Ciclo formativo:**  Desarrollo de Aplicaciones Multiplataforma (2º DAM)

**Curso académico:** 2025–2026

**Fecha de entrega:** Junio 2026

---

# 2. ÍNDICE DEL DOCUMENTO

1. [Portada](#1-portada)
2. [Índice del documento](#2-índice-del-documento)
3. [Introducción](#3-introducción)
   - [3.1 Justificación del proyecto](#31-justificación-del-proyecto)
   - [3.2 Análisis comparativo de aplicaciones similares](#32-análisis-comparativo-de-aplicaciones-similares)
   - [3.3 Tendencias del mercado](#33-tendencias-del-mercado)
   - [3.4 Beneficios y expectativas del proyecto](#34-beneficios-y-expectativas-del-proyecto)
4. [Descripción del proyecto](#4-descripción-del-proyecto)
   - [4.1 Tipo de proyecto](#41-tipo-de-proyecto)
   - [4.2 Características principales](#42-características-principales)
   - [4.3 Usuarios destinatarios](#43-usuarios-destinatarios)
5. [Objetivos del proyecto](#5-objetivos-del-proyecto)
   - [5.1 Objetivo general](#51-objetivo-general)
   - [5.2 Objetivos específicos](#52-objetivos-específicos)
6. [Alcance del proyecto](#6-alcance-del-proyecto)
   - [6.1 Qué incluye el proyecto](#61-qué-incluye-el-proyecto)
   - [6.2 Límites y restricciones](#62-límites-y-restricciones)
7. [Requisitos del proyecto](#7-requisitos-del-proyecto)
   - [7.1 Requisitos funcionales](#71-requisitos-funcionales)
   - [7.2 Requisitos técnicos](#72-requisitos-técnicos)
   - [7.3 Requisitos legales y normativos](#73-requisitos-legales-y-normativos)
8. [Planificación del proyecto](#8-planificación-del-proyecto)
   - [8.1 Estructura de tareas (WBS)](#81-estructura-de-tareas-wbs--work-breakdown-structure)
   - [8.2 Cronograma (Diagrama de Gantt)](#82-cronograma-diagrama-de-gantt)
   - [8.3 Recursos necesarios](#83-recursos-necesarios)
9. [Plan de gestión de riesgos](#9-plan-de-gestión-de-riesgos)
   - [9.1 Identificación y evaluación de riesgos](#91-identificación-y-evaluación-de-riesgos)
   - [9.2 Recursos preventivos](#92-recursos-preventivos)
   - [9.3 Plan de mitigación](#93-plan-de-mitigación)
10. [Diseño](#10-diseño)
    - [10.1 Prototipado y wireframes](#101-prototipado-y-wireframes)
    - [10.2 Especificaciones técnicas](#102-especificaciones-técnicas)
    - [10.3 Diagramas UML](#103-diagramas-uml)
11. [Instalación y preparación](#11-instalación-y-preparación)
    - [11.1 Procedimientos necesarios para hacer funcionar el proyecto](#111-procedimientos-necesarios-para-hacer-funcionar-el-proyecto)
    - [11.2 Procedimientos para el control de versiones](#112-procedimientos-para-el-control-de-versiones)
    - [11.3 Procedimientos para registrar las incidencias](#113-procedimientos-para-registrar-las-incidencias)
12. [Documentación de ejecución y plan de calidad](#12-documentación-de-ejecución-y-plan-de-calidad)
    - [12.1 Procedimientos operativos](#121-procedimientos-operativos)
    - [12.2 Registro de pruebas](#122-registro-de-pruebas)
    - [12.3 Indicadores de calidad](#123-indicadores-de-calidad)
    - [12.4 Métodos de verificación](#124-métodos-de-verificación)
13. [Distribución](#13-distribución)
    - [13.1 Tecnología de distribución](#131-tecnología-de-distribución)
    - [13.2 Descripción del proceso de distribución](#132-descripción-del-proceso-de-distribución)
14. [Manuales](#14-manuales)
    - [14.1 Manual de instalación](#141-manual-de-instalación)
    - [14.2 Manual de usuario](#142-manual-de-usuario)
15. [Conclusiones](#15-conclusiones)
    - [15.1 Informe final](#151-informe-final)
    - [15.2 Resultados obtenidos](#152-resultados-obtenidos)
    - [15.3 Viabilidad del proyecto](#153-viabilidad-del-proyecto)
    - [15.4 Mejoras futuras](#154-mejoras-futuras)
16. [Anexos](#16-anexos)
    - [Anexo A: Diagrama Entidad–Relación completo](#anexo-a-diagrama-entidad-relación-completo)
    - [Anexo B: Descripción detallada de la API REST](#anexo-b-descripción-detallada-de-la-api-rest)
    - [Anexo C: Casos de prueba detallados](#anexo-c-casos-de-prueba-detallados)
    - [Anexo D: Configuración técnica de PgBouncer](#anexo-d-configuración-técnica-de-pgbouncer)
17. [Índice de tablas e imágenes](#17-índice-de-tablas-e-imágenes)
18. [Bibliografía y referencias](#18-bibliografía-y-referencias)

---

# 3. INTRODUCCIÓN

## 3.1 Justificación del proyecto

El presente proyecto surge de la observación de una necesidad real en entornos de desarrollo de software y equipos técnicos: la dispersión de herramientas para gestionar la comunicación interna, el seguimiento de incidencias y la documentación del trabajo diario. En muchos contextos profesionales, estas funciones se gestionan de forma independiente mediante aplicaciones distintas (correo electrónico, hojas de cálculo, gestores de tareas, aplicaciones de mensajería), lo que provoca ineficiencias, falta de trazabilidad y pérdida de información.

La idea de desarrollar **DevNexus** nace de la voluntad de unificar en una sola plataforma las funcionalidades más demandadas en equipos de desarrollo: un sistema de diarios de progreso personales y colaborativos, un gestor de tickets de soporte técnico, un módulo de mensajería interna, un calendario de eventos y un panel de administración con auditoría completa. Todo ello orientado específicamente a la comunidad de desarrolladores.

El proyecto representa la culminación del ciclo formativo de Desarrollo de Aplicaciones Multiplataforma, aplicando de forma integrada conocimientos de programación backend, desarrollo frontend, diseño de bases de datos, arquitectura de software, seguridad y despliegue en producción. Se ha optado por tecnologías de uso profesional real (Spring Boot, Angular, Ionic, Firebase, PostgreSQL, Docker) para que el resultado sea una aplicación directamente transferible a un contexto laboral.

## 3.2 Análisis comparativo de aplicaciones similares

Antes de definir el alcance del proyecto, se realizó un análisis de aplicaciones existentes en el mercado que ofrecen funcionalidades similares a las planteadas:

| Aplicación | Funcionalidades | Limitaciones frente a DevNexus |
|---|---|---|
| **Jira** | Gestión de tickets, flujos de trabajo, sprints | No incluye diarios de progreso, mensajería ni calendario personal |
| **Slack** | Mensajería en tiempo real, canales temáticos | No tiene gestión de tickets ni diarios con revisión por mentores |
| **Notion** | Notas, bases de datos, wiki colaborativo | Sin sistema de tickets ni auditoría por roles diferenciados |
| **Trello** | Gestión visual de tareas con tableros Kanban | Sin mensajería, sin diarios, sin control de acceso por roles |
| **Microsoft Teams** | Comunicación, integración con Office 365 | Alta complejidad, requiere infraestructura Microsoft, coste elevado |
| **Google Workspace** | Documentos, correo, calendario compartido | Sin sistema de tickets ni auditoría de acciones del sistema |
| **Dev.to** | Blog para desarrolladores, comunidad | Sin tickets, sin mensajería privada, sin gestión de equipos |

**Conclusión del análisis:** Ninguna de las aplicaciones analizadas combina en una única plataforma accesible y ligera las cinco funcionalidades centrales del proyecto: diarios con control de visibilidad y colaboración entre desarrolladores, tickets de soporte con historial completo, mensajería entre usuarios, eventos con calendario integrado y auditoría de acciones con control por roles. DevNexus cubre este nicho con una arquitectura moderna, abierta y orientada específicamente a la comunidad de desarrollo de software.

## 3.3 Tendencias del mercado

El desarrollo de este proyecto se enmarca dentro de varias tendencias tecnológicas actuales:

- **Arquitecturas desacopladas (API-first):** Las aplicaciones modernas separan backend y frontend, permitiendo que distintos clientes consuman la misma API REST. Esta arquitectura facilita la escalabilidad y el mantenimiento, y es la que se ha adoptado en este proyecto.

- **Aplicaciones Progressive Web App (PWA) y móvil-first:** La combinación de Angular e Ionic permite generar aplicaciones web con experiencia similar a una app nativa, adaptable a dispositivos móviles y de escritorio desde una única base de código.

- **Autenticación federada:** El uso de Firebase Authentication con Google Sign-In representa la tendencia hacia sistemas de identidad externos (SSO), más seguros y con menor fricción para el usuario.

- **Contenedorización y DevOps:** El despliegue mediante Docker y Docker Compose es ya un estándar en la industria, permitiendo reproducir entornos de forma fiable y desplegar aplicaciones de manera ágil.

- **Auditoría y trazabilidad:** La creciente importancia del cumplimiento normativo (RGPD, ISO 27001) ha impulsado la inclusión de sistemas de auditoría en las aplicaciones empresariales, algo que DevNexus implementa de forma nativa.

- **Infraestructura propia y DevOps:** El despliegue sobre un VPS dedicado con Dokploy como orquestador, PostgreSQL auto-hospedado y monitorización activa refleja la tendencia hacia infraestructuras controladas por el propio desarrollador, con independencia de terceros y coste predecible.

- **Developer Experience (DX):** La comunidad tecnológica demanda cada vez más herramientas que mejoren la experiencia del desarrollador, integrando documentación de progreso, mentoría y colaboración en un solo lugar.

## 3.4 Beneficios y expectativas del proyecto

Los principales beneficios esperados del proyecto son:

- **Centralización de herramientas:** Un único punto de acceso para diarios de progreso, tickets de soporte, mensajes, eventos y notificaciones, reduciendo la fragmentación y mejorando la productividad del equipo.

- **Trazabilidad completa:** El sistema de auditoría registra todas las acciones relevantes, permitiendo conocer quién hizo qué y cuándo, lo que resulta esencial para la resolución de incidencias y la rendición de cuentas.

- **Control de privacidad:** Los usuarios pueden gestionar sus propios datos y definir la visibilidad de su contenido (privado, pendiente de revisión, público), respetando el derecho a la privacidad.

- **Escalabilidad técnica:** La arquitectura elegida permite ampliar funcionalidades sin rediseñar el sistema, adaptándose a crecimientos futuros tanto en usuarios como en módulos.

- **Aprendizaje aplicado:** El proyecto permite aplicar en un contexto realista tecnologías del nivel de un desarrollador junior-medio en la industria, superando el nivel mínimo esperado en un TFG de DAM.

- **Demostración de competencias:** La implementación completa (backend + frontend + despliegue Docker + base de datos + autenticación + notificaciones push) demuestra la madurez técnica del desarrollador para enfrentarse a proyectos reales.

---

# 4. DESCRIPCIÓN DEL PROYECTO

## 4.1 Tipo de proyecto

DevNexus es una **aplicación web full-stack** de tipo plataforma colaborativa, orientada a la gestión de comunidades de desarrolladores y equipos técnicos. Se trata de un proyecto de desarrollo original que integra:

- Un **backend** basado en API REST (Spring Boot + Kotlin)
- Un **frontend** web/móvil (Angular + Ionic + Capacitor)
- Una **base de datos relacional** (PostgreSQL)
- Un sistema de **autenticación externa** (Firebase Authentication)
- Un sistema de **notificaciones push** (Firebase Cloud Messaging)
- Un entorno de **despliegue containerizado** (Docker + Docker Compose)

La tipología del proyecto es **software de gestión** con componentes de comunicación, contenido y administración. No es un producto comercial, sino un prototipo funcional de nivel profesional desarrollado como Trabajo de Fin de Grado.

## 4.2 Características principales

Las características principales de la aplicación son:

**Sistema de diarios de progreso:**
- Creación de entradas de diario personal con contenido en texto enriquecido (Markdown)
- Control de visibilidad: privado, pendiente de revisión por staff, público
- Organización por temas/repositorios con posibilidad de colaboración
- Sistema de invitaciones para colaborar en temas compartidos
- Comentarios en diarios públicos
- Panel de revisión para el personal de staff (mentoría)
- Gráfico de actividad tipo GitHub (contribuciones)
- Exportación de entradas en formato **CSV** (datos estructurados) y **Markdown (.md)** optimizado para procesado por herramientas de IA
- **Transcripción de código con IA generativa:** el usuario fotografía código (pantalla, papel, pizarra) y el sistema extrae el texto automáticamente mediante Groq Llama Vision, insertándolo directamente como nueva entrada del diario
- **Code Review IA:** análisis automático del contenido de cada entrada, con feedback técnico sobre calidad, mejoras y buenas prácticas generado por Groq Llama
- **Sugerencia de etiquetas IA:** el sistema analiza el texto que el usuario está redactando y propone 3–5 etiquetas relevantes como chips interactivos
- **Resumen ejecutivo IA:** generación automática de un resumen estructurado del proyecto a partir de todas las entradas del tema
- **IDE de proyectos integrado:** cada proyecto/tema dispone de un entorno de edición tipo VS Code con árbol de archivos navegable, editor Monaco con sintaxis coloreada (HTML, CSS, TypeScript, JavaScript, Python, etc.), soporte de carpetas anidadas y previsualización en sandbox. La creación del proyecto abre un modal centrado; los archivos se persisten en la base de datos con campo `filename` y `tipo`

**Sistema de tickets de soporte:**
- Creación de tickets con título, descripción, prioridad (alta, media, baja) y estado (abierto, en progreso, resuelto)
- Comentarios dentro de cada ticket para la comunicación entre usuario y staff
- Historial completo de cambios de estado para auditoría
- Panel de administración de tickets con filtros y búsqueda
- Chat integrado por ticket para comunicación directa

**Mensajería interna:**
- Conversaciones individuales
- Envío y recepción de mensajes mediante API REST con control de lectura (leído/no leído)
- Gestión de participantes: añadir y eliminar
- Filtrado de contactos por departamento (Backend Developer, Frontend Developer, Full Stack Developer)
- Bandeja de entrada para el staff (soporte chat en vivo por ticket)

**Gestión de eventos:**
- Creación de eventos con fecha, hora, título y descripción
- Visibilidad privada o pública
- Vista de calendario integrada (Syncfusion Schedule) con vistas de día, semana, mes y agenda
- Panel lateral de próximos eventos

**Sistema de notificaciones:**
- Notificaciones push mediante Firebase Cloud Messaging (FCM)
- Centro de notificaciones en la aplicación
- Marcado individual y masivo de notificaciones como leídas

**Panel de administración:**
- Gestión completa de usuarios: ver, editar, eliminar, cambiar rol
- Gestión de departamentos y estructura organizativa
- Revisión y aprobación de diarios públicos (mentoría)
- Supervisión de tickets con gestión de estados y prioridades
- Gestión de eventos globales
- Mensajería de soporte técnico (chat en vivo con usuarios)
- Registro de auditoría con niveles de severidad (INFO, WARNING, DANGER)

**Páginas públicas:**
- Landing page con animaciones y vídeo de fondo
- Página "Sobre la comunidad" con misión y visión
- Página de contacto con formulario
- Blog de noticias con diarios públicos de la comunidad
- Sección FAQ / Ayuda con preguntas frecuentes
- Política de privacidad

**Funcionalidades transversales:**
- Autenticación dual: Google OAuth2 (Firebase) y registro/login con email y contraseña propios, con recuperación de contraseña vía Firebase
- Control de acceso basado en roles (ADMIN, STAFF, USER)
- Perfil de usuario personalizable (nombre, especialidad, foto)
- Control de privacidad de contacto
- Menú lateral responsive con navegación contextual
- Chat flotante de soporte técnico en **tiempo real** (Firebase Firestore) accesible desde cualquier página

## 4.3 Usuarios destinatarios

La aplicación está diseñada para tres perfiles de usuario:

**Usuario estándar (rol USER):**
Desarrolladores que utilizan la plataforma para documentar su progreso diario, comunicarse con otros miembros de la comunidad y solicitar soporte a través del sistema de tickets. Puede ser un estudiante, desarrollador junior o miembro de un equipo técnico.

**Personal de soporte / Mentor (rol STAFF):**
Desarrolladores senior o mentores responsables de atender las solicitudes de los usuarios, revisar el contenido publicado (diarios) y gestionar las comunicaciones de soporte. Dispone de permisos adicionales para moderar contenido y actualizar el estado de tickets.

**Administrador (rol ADMIN):**
Persona responsable de la gestión global de la plataforma: usuarios, departamentos, configuración general y supervisión de todas las actividades mediante el panel de auditoría. Tiene acceso completo a todas las funcionalidades del sistema.

*Figura 1: Diagrama de roles y permisos del sistema*

```mermaid
%%{init: {'theme': 'dark'}}%%
graph LR
    subgraph Roles["Roles del Sistema"]
        USER(["👤 USER"])
        STAFF(["🛡️ STAFF"])
        ADMIN(["⚙️ ADMIN"])
    end

    subgraph Permisos_USER["Permisos USER"]
        P1["Diario personal"]
        P2["Tickets de soporte"]
        P3["Mensajería"]
        P4["Eventos"]
        P5["Notificaciones"]
        P6["Perfil propio"]
    end

    subgraph Permisos_STAFF["Permisos STAFF (hereda USER)"]
        P7["Bandeja soporte técnico"]
        P8["Cambiar estado tickets"]
        P9["Revisar diarios pendientes"]
        P10["Mensajería Pro"]
    end

    subgraph Permisos_ADMIN["Permisos ADMIN (hereda STAFF)"]
        P11["Gestión de usuarios (CRUD)"]
        P12["Gestión de departamentos"]
        P13["Registro de auditoría"]
        P14["Gestión de eventos globales"]
        P15["Panel de administración completo"]
    end

    USER --> P1 & P2 & P3 & P4 & P5 & P6
    STAFF --> P7 & P8 & P9 & P10
    ADMIN --> P11 & P12 & P13 & P14 & P15
    STAFF -.->|"hereda"| USER
    ADMIN -.->|"hereda"| STAFF

    style USER fill:#6366f1,stroke:#818cf8,color:#fff
    style STAFF fill:#f59e0b,stroke:#fbbf24,color:#000
    style ADMIN fill:#ef4444,stroke:#f87171,color:#fff
    style Roles fill:#1e1b4b,stroke:#6366f1,color:#fff
    style Permisos_USER fill:#2d1b69,stroke:#8b5cf6,color:#fff
    style Permisos_STAFF fill:#78350f,stroke:#f59e0b,color:#fff
    style Permisos_ADMIN fill:#450a0a,stroke:#ef4444,color:#fff
```

---

# 5. OBJETIVOS DEL PROYECTO

## 5.1 Objetivo general

Diseñar, implementar y desplegar una plataforma web colaborativa completa orientada a la comunidad de desarrolladores, que integre en un único sistema la gestión de diarios de progreso, tickets de soporte, mensajería interna, eventos y auditoría, aplicando arquitecturas modernas y buenas prácticas de desarrollo de software profesional.

## 5.2 Objetivos específicos

1. **Diseñar la arquitectura del sistema** separando claramente frontend y backend mediante una API REST, siguiendo el patrón cliente-servidor desacoplado.

2. **Implementar el backend** con Spring Boot y Kotlin, organizando el código en capas (controladores, servicios, repositorios, DTOs) y documentando la API con OpenAPI/Swagger.

3. **Diseñar y normalizar la base de datos relacional** con PostgreSQL, aplicando las formas normales hasta 3FN y garantizando la integridad referencial mediante claves foráneas.

4. **Implementar el frontend** con Angular e Ionic, desarrollando una interfaz responsiva y adaptada a dispositivos móviles y de escritorio, con un diseño visual profesional.

5. **Integrar un sistema de autenticación seguro** mediante Firebase Authentication con Google Sign-In y tokens JWT para proteger los endpoints del backend.

6. **Implementar control de acceso basado en roles** (ADMIN, STAFF, USER) que limite las funcionalidades disponibles para cada perfil.

7. **Desarrollar el módulo de diarios** con control de visibilidad, sistema de revisión/mentoría, colaboración entre usuarios e IDE de proyectos integrado (árbol de archivos, Monaco Editor, sandbox preview).

8. **Desarrollar el módulo de tickets** con gestión de estados, prioridades, comentarios, historial de cambios y chat integrado.

9. **Desarrollar el módulo de mensajería** con soporte para conversaciones individuales y grupales, filtrado por departamento.

10. **Desarrollar el módulo de eventos** con calendario Syncfusion integrado y control de visibilidad.

11. **Implementar un sistema de auditoría** que registre las acciones relevantes realizadas en el sistema, incluyendo actor, acción, recurso y severidad.

12. **Implementar notificaciones push** mediante Firebase Cloud Messaging para alertar a los usuarios de eventos relevantes en tiempo real.

13. **Desplegar el sistema completo** mediante Docker y Docker Compose, garantizando la reproducibilidad del entorno en producción.

14. **Realizar pruebas funcionales y de seguridad** que validen el correcto funcionamiento del sistema antes de su puesta en producción.

---

# 6. ALCANCE DEL PROYECTO

## 6.1 Qué incluye el proyecto

El alcance del proyecto comprende el desarrollo e implantación de los siguientes elementos:

**Backend (API REST):**
- 16 controladores REST con sus respectivos endpoints (usuarios, roles, departamentos, diarios, temas de diario, colaboraciones, comentarios de tema de diario, tickets, comentarios de tickets, historial de tickets, conversaciones, participantes, mensajes, eventos, notificaciones, auditoría)
- 13 servicios de negocio con lógica de autorización
- 17 entidades JPA mapeadas a tablas de base de datos
- Sistema de autenticación y autorización mediante Firebase JWT + Spring Security
- Documentación automática con SpringDoc OpenAPI (Swagger UI)
- Sistema de auditoría mediante Spring AOP (aspecto transversal)
- Gestión de migraciones con Flyway
- Validación de datos de entrada con Bean Validation

**Base de datos:**
- Diseño e implementación del esquema relacional completo con 17 tablas
- Índices en campos de búsqueda frecuente
- Integridad referencial con claves foráneas
- Gestión mediante PostgreSQL 17 auto-hospedado en VPS dedicado
- Administración visual con pgAdmin 4 (acceso web en el propio VPS)
- Backup automático periódico a NeonDB (copia de seguridad externa)
- Migraciones versionadas con Flyway (V1: esquema inicial, V2: permisos de colaboración, V3: columnas `tipo` y `filename` en tabla `diario` para soporte IDE, V4: tabla `diario_tema_comentarios` para el sistema de feedback de proyecto)
- Proxy de conexiones PgBouncer en modo `transaction`: pool estático de 20 conexiones permanentes a PostgreSQL, capacidad de hasta 10.000 conexiones cliente simultáneas y un throughput teórico de ~2.000 queries/segundo (con latencia media de 10 ms por query). PostgreSQL nunca recibe más de 25 conexiones independientemente de la carga, protegiéndolo de saturación en escenarios de alta concurrencia

**Frontend:**
- Aplicación Angular 20 / Ionic 8 con componentes standalone
- Enrutamiento protegido por guards de autenticación y rol
- Páginas públicas: inicio (landing), sobre la comunidad, blog, FAQ, contacto, privacidad
- Sección de usuario: perfil, diario de progreso, tickets, mensajes, notificaciones, eventos
- Panel de administración completo: gestión de usuarios, tickets, diarios, eventos, mensajes de soporte, auditoría, departamentos, perfil
- Interceptor HTTP para gestión automática de tokens de autenticación
- Integración con Firebase (autenticación, FCM para notificaciones push)
- Calendario Syncfusion EJ2 Schedule con múltiples vistas
- ChangeDetectionStrategy.OnPush en todos los componentes (optimización de rendimiento)
- Diseño visual profesional con tema oscuro y gradientes

**Despliegue e infraestructura:**
- Dockerfile multi-stage para backend (Maven build + JRE runtime)
- Dockerfile multi-stage para frontend (Node build + Nginx embebido como servidor de estáticos, configurado para SPA routing con `try_files`)
- Despliegue en VPS dedicado (4 vCores, 8 GB RAM, 75 GB almacenamiento)
- Dokploy como PaaS self-hosted: proxy inverso, gestión de imágenes Docker y SSL automático
- Dominio personalizado `devnexus.es` con certificado HTTPS via Let's Encrypt (gestionado por Dokploy)
- Bot de Telegram para alertas de reinicio y monitorización del servidor
- PgBouncer como proxy de conexiones a base de datos (contenedor Docker independiente gestionado por Dokploy): pool estático de 20 conexiones en modo `transaction`, soporta hasta 10.000 clientes concurrentes con un throughput de ~2.000 queries/segundo, preparando la arquitectura para escalado horizontal sin modificar el backend

**Documentación:**
- Documentación técnica completa del proyecto
- Manual de instalación y uso
- Diagramas UML (casos de uso, secuencia, E-R, componentes, despliegue)

## 6.2 Límites y restricciones

**Fuera del alcance:**
- Desarrollo de aplicaciones móviles nativas distribuidas en tiendas (iOS/Android). El frontend Ionic genera una PWA y aplicación Capacitor, pero no se publica en App Store ni Google Play.
- Integración con sistemas ERP, CRM u otros sistemas empresariales externos.
- Panel de analítica avanzada o business intelligence.
- Sistema de facturación o pagos.
- Soporte para múltiples idiomas (i18n). La aplicación está íntegramente en español.
- Pipeline CI/CD automatizado (GitHub Actions, Jenkins, etc.).

**Restricciones técnicas:**
- La autenticación soporta dos métodos: Google OAuth2 (Firebase) y registro/login con email y contraseña propios. El restablecimiento de contraseña es gestionado íntegramente por Firebase (envío de correo de recuperación).
- El sistema de mensajería utiliza API REST con actualización bajo demanda (no WebSockets). Las notificaciones de nuevos mensajes se gestionan mediante Firebase Cloud Messaging (FCM).
- El almacenamiento de archivos adjuntos no está implementado en la versión actual.

**Restricciones de recursos:**
- Desarrollo realizado por un único desarrollador durante el período del TFG.
- Infraestructura sobre VPS con contrato anual personal; los costes corren a cargo del desarrollador.

---

# 7. REQUISITOS DEL PROYECTO

## 7.1 Requisitos funcionales

Los requisitos funcionales describen el comportamiento del sistema desde el punto de vista del usuario.

### Gestión de usuarios

| ID | Requisito |
|---|---|
| RF-01 | El sistema debe permitir que los usuarios se registren mediante su cuenta de Google (Firebase Authentication). |
| RF-02 | El sistema debe asignar automáticamente el rol USER a los nuevos registros, salvo asignación manual por parte de un administrador. |
| RF-03 | El usuario debe poder consultar y modificar su perfil (nombre, especialidad técnica, foto de perfil). |
| RF-04 | El usuario debe poder configurar sus preferencias de contacto (permitir/no permitir que otros usuarios le contacten, con motivo opcional). |
| RF-05 | Los administradores deben poder gestionar usuarios: ver, editar rol/departamento y eliminar. |
| RF-06 | El sistema debe permitir organizar usuarios por departamentos (Backend Developer, Frontend Developer, Full Stack Developer). |

### Sistema de diarios

| ID | Requisito |
|---|---|
| RF-07 | El usuario debe poder crear entradas de diario asociadas a un tema/repositorio. |
| RF-08 | El usuario debe poder definir la visibilidad de cada entrada: privada, pendiente de revisión o pública. |
| RF-09 | El sistema debe permitir crear temas de diario e invitar a otros usuarios a colaborar en ellos. |
| RF-10 | Los usuarios invitados deben poder aceptar o rechazar invitaciones de colaboración. |
| RF-11 | El personal de staff debe poder revisar y aprobar o rechazar las entradas marcadas como "pendiente". |
| RF-12 | Los usuarios deben poder comentar en los diarios públicos. |
| RF-28 | El usuario debe poder exportar las entradas de un tema como fichero Markdown (.md), optimizado para procesado por herramientas de IA externas. |
| RF-29 | El usuario debe poder fotografiar código y obtener su transcripción automática mediante IA generativa (Groq Llama Vision), insertándola como nueva entrada del diario. |
| RF-30 | El sistema debe analizar el contenido de una entrada del diario y generar un code review automático con feedback técnico estructurado. |
| RF-31 | El sistema debe analizar el texto de una entrada en redacción y sugerir etiquetas relevantes como chips interactivos aplicables con un clic. |
| RF-32 | El sistema debe generar un resumen ejecutivo del proyecto a partir del conjunto de entradas de un tema, estructurado en secciones Markdown. |
| RF-35 | El usuario debe poder gestionar archivos de código dentro de un proyecto mediante un IDE integrado: crear archivos con nombre y ruta (soportando carpetas anidadas), editar su contenido con Monaco Editor (resaltado de sintaxis), navegar el árbol de archivos y eliminar archivos. |
| RF-36 | El sistema debe persistir cada versión de cada archivo del IDE en base de datos, permitiendo recuperar el contenido más reciente al cargar el proyecto. |
| RF-37 | La creación de un nuevo proyecto debe presentarse mediante un modal centrado con animación, accesible tanto desde el botón principal de la barra de herramientas como desde el estado vacío (empty state). |
| RF-38 | El personal de staff debe poder dejar comentarios de feedback directamente sobre un tema de diario completo (a nivel de proyecto, no de entrada individual), visibles para el propietario del tema. |
| RF-39 | El administrador debe poder acceder al IDE de un proyecto en modo solo lectura: puede navegar el árbol de archivos y visualizar el código, pero no modificar, crear ni eliminar archivos ni carpetas. Las funcionalidades de IA tampoco están disponibles en este modo. |
| RF-40 | Las páginas de administración (tickets, usuarios, eventos, auditoría, mensajes) deben adaptarse a dispositivos móviles mostrando tarjetas individuales en lugar de tablas, con acceso al detalle mediante modal a pantalla completa. |

### Sistema de tickets

| ID | Requisito |
|---|---|
| RF-13 | El usuario debe poder crear tickets de soporte con título, descripción y prioridad. |
| RF-14 | El sistema debe mostrar al usuario sus propios tickets con su estado actual, con filtros por estado (activos, historial, todos). |
| RF-15 | El personal autorizado (STAFF/ADMIN) debe poder cambiar el estado de un ticket (ABIERTO → EN_PROGRESO → RESUELTO). |
| RF-16 | El sistema debe registrar el historial completo de cambios de estado de cada ticket. |
| RF-17 | Los usuarios deben poder comunicarse con el staff a través del chat integrado en cada ticket. |
| RF-41 | El usuario debe poder solicitar la reapertura de un ticket resuelto. El sistema debe cambiar el estado a `SOLICITUD_REAPERTURA` y notificar al staff, quien podrá aceptar (volviendo a `EN_PROGRESO`) o rechazar (manteniendo `RESUELTO`), generando en ambos casos un mensaje automático en el chat del ticket. |

### Mensajería

| ID | Requisito |
|---|---|
| RF-18 | El sistema debe permitir crear conversaciones individuales o grupales. |
| RF-19 | Los participantes de una conversación deben poder enviar y recibir mensajes. |
| RF-20 | El sistema debe registrar el estado de lectura de los mensajes. |
| RF-21 | Los usuarios deben poder filtrar contactos por departamento al crear una conversación. |
| RF-22 | Los administradores deben poder gestionar una bandeja de soporte para atender a los usuarios. |

### Eventos

| ID | Requisito |
|---|---|
| RF-23 | El usuario debe poder crear eventos con fecha, hora, título, descripción y visibilidad (público/privado). |
| RF-24 | El sistema debe mostrar los eventos en una vista de calendario con opciones de día, semana, mes y agenda. |
| RF-25 | El usuario debe poder eliminar sus propios eventos. |

### Notificaciones

| ID | Requisito |
|---|---|
| RF-26 | El sistema debe enviar notificaciones push cuando se produzcan eventos relevantes (nuevo mensaje, respuesta a ticket, etc.). |
| RF-27 | El usuario debe poder consultar y marcar como leídas sus notificaciones (individual y masivamente). |

### Auditoría

| ID | Requisito |
|---|---|
| RF-33 | El sistema debe registrar automáticamente las acciones relevantes (login, creación, modificación, eliminación de recursos). |
| RF-34 | Los administradores deben poder consultar el registro de auditoría con búsqueda y filtros por nivel de severidad. |

## 7.2 Requisitos técnicos

### Backend

| ID | Requisito |
|---|---|
| RT-01 | El backend debe estar desarrollado con **Spring Boot 3.x** y **Kotlin**. |
| RT-02 | El backend debe exponer una **API REST** que cumpla con los principios RESTful. |
| RT-03 | La API debe estar documentada automáticamente con **SpringDoc OpenAPI 3.0** (Swagger UI). |
| RT-04 | La autenticación debe basarse en **tokens JWT** generados por Firebase Authentication. |
| RT-05 | El sistema debe implementar autorización por roles mediante **Spring Security** y anotaciones `@PreAuthorize`. |
| RT-06 | La arquitectura del backend debe seguir el patrón de capas: Controller → Service → Repository → Entity/DTO. |
| RT-07 | El sistema de auditoría debe implementarse mediante **Spring AOP** con aspecto transversal. |
| RT-08 | Las notificaciones push deben enviarse mediante **Firebase Cloud Messaging (FCM)**. |
| RT-09 | La gestión del esquema de base de datos debe realizarse con **Flyway** (migraciones versionadas). |

### Base de datos

| ID | Requisito |
|---|---|
| RT-10 | La base de datos debe ser **PostgreSQL** (versión 14 o superior). |
| RT-11 | El esquema debe diseñarse aplicando normalización hasta la **Tercera Forma Normal (3FN)**. |
| RT-12 | Deben definirse **índices** sobre los campos utilizados frecuentemente en consultas y filtros. |

### Frontend

| ID | Requisito |
|---|---|
| RT-13 | El frontend debe estar desarrollado con **Angular 20** e **Ionic 8** (componentes standalone). |
| RT-14 | La aplicación debe ser **responsiva** y adaptarse a pantallas de móvil, tablet y escritorio. |
| RT-15 | La navegación debe estar protegida mediante **guards de Angular** que comprueben autenticación y rol. |
| RT-16 | Las peticiones HTTP al backend deben incluir automáticamente el token JWT mediante un **interceptor Angular**. |
| RT-17 | La integración de calendario debe realizarse con **Syncfusion EJ2 Schedule**. |
| RT-18 | Todos los componentes deben usar **ChangeDetectionStrategy.OnPush** para optimizar el rendimiento. |

### Despliegue

| ID | Requisito |
|---|---|
| RT-19 | Todos los componentes deben poder desplegarse mediante **Docker** y **Docker Compose**. |
| RT-20 | El frontend debe compilarse para producción y servirse mediante **Nginx**. |
| RT-21 | La configuración sensible debe gestionarse mediante **variables de entorno**, sin incluirla en el código fuente. |

### Rendimiento y seguridad

| ID | Requisito |
|---|---|
| RT-22 | Las peticiones protegidas deben devolver **HTTP 401** sin token válido y **HTTP 403** sin permisos suficientes. |
| RT-23 | Todos los datos de entrada deben ser **validados** en el backend antes de procesarse. |
| RT-24 | La arquitectura debe incorporar **PgBouncer** como proxy de conexiones a base de datos en modo `transaction`, con un pool estático de 20 conexiones a PostgreSQL y capacidad para hasta 10.000 conexiones cliente simultáneas, garantizando que PostgreSQL nunca supere las 25 conexiones activas independientemente de la carga y permitiendo escalado horizontal de instancias backend sin degradación de la base de datos. |
| RT-25 | El panel de administración debe ser completamente **responsivo**, adaptando su interfaz mediante tarjetas en dispositivos móviles (< 600 px) y tablas con scroll virtual en escritorio. |

## 7.3 Requisitos legales y normativos

### Protección de datos (RGPD)

| ID | Requisito |
|---|---|
| RL-01 | La aplicación debe informar a los usuarios sobre el tratamiento de sus datos personales mediante una política de privacidad accesible desde la interfaz. |
| RL-02 | Los datos personales de los usuarios (nombre, email, foto de perfil) provienen de la cuenta de Google mediante OAuth 2.0, y su tratamiento está sujeto a las condiciones de Google y al RGPD. |
| RL-03 | Los usuarios deben poder eliminar su propia cuenta y datos desde la aplicación (derecho de supresión — RGPD Art. 17). El endpoint `DELETE /api/usuarios/perfil` implementa esta funcionalidad. |
| RL-04 | Los datos no deben compartirse con terceros no autorizados ni usarse con fines distintos a los declarados. |
| RL-05 | La aplicación debe implementar medidas técnicas de seguridad adecuadas (autenticación, HTTPS, control de acceso) para proteger los datos personales. |

### Licencias de software

| ID | Requisito |
|---|---|
| RL-06 | Todas las dependencias y librerías utilizadas deben usarse respetando sus licencias. Syncfusion requiere licencia de uso, registrada en el proyecto. |
| RL-07 | El software desarrollado es un proyecto académico sin fines comerciales. |

### Accesibilidad

| ID | Requisito |
|---|---|
| RL-08 | La aplicación debe seguir, en la medida de lo posible, las pautas de accesibilidad WCAG 2.1 nivel A. |

---

# 8. PLANIFICACIÓN DEL PROYECTO

## 8.1 Estructura de tareas (WBS — Work Breakdown Structure)

El proyecto se ha dividido en las siguientes fases y tareas principales:

### FASE 1: Análisis y diseño (Semanas 1–3)
- 1.1 Análisis de requisitos funcionales y no funcionales
- 1.2 Análisis comparativo de aplicaciones similares
- 1.3 Diseño del modelo de datos (entidades y relaciones)
- 1.4 Diseño de la arquitectura del sistema (API-first)
- 1.5 Diseño de los wireframes de la interfaz de usuario
- 1.6 Definición de la API (endpoints, métodos, DTOs)
- 1.7 Planificación del proyecto y gestión de riesgos

### FASE 2: Configuración del entorno (Semanas 3–4)
- 2.1 Configuración del repositorio Git y estrategia de ramas
- 2.2 Configuración del proyecto Spring Boot (Kotlin + Maven)
- 2.3 Configuración del proyecto Angular/Ionic (standalone components)
- 2.4 Configuración de Firebase (Authentication + FCM)
- 2.5 Creación y configuración de la base de datos PostgreSQL (Neon)
- 2.6 Configuración del entorno de desarrollo local

### FASE 3: Desarrollo del backend (Semanas 4–10)
- 3.1 Implementación del modelo de datos (entidades JPA)
- 3.2 Implementación de repositorios (Spring Data JPA)
- 3.3 Implementación de la seguridad (Firebase JWT + Spring Security)
- 3.4 Implementación del módulo de usuarios, roles y departamentos
- 3.5 Implementación del módulo de diarios, temas y colaboraciones
- 3.6 Implementación del módulo de tickets, comentarios e historial
- 3.7 Implementación del módulo de mensajería (conversaciones + mensajes)
- 3.8 Implementación del módulo de eventos
- 3.9 Implementación del módulo de notificaciones y FCM
- 3.10 Implementación del sistema de auditoría (Spring AOP)
- 3.11 Configuración de SpringDoc OpenAPI (Swagger UI)
- 3.12 Configuración de Flyway para migraciones
- 3.13 Pruebas de endpoints con Swagger

### FASE 4: Desarrollo del frontend (Semanas 8–14)
- 4.1 Configuración del routing, guards e interceptor HTTP
- 4.2 Desarrollo de las páginas públicas (landing, about, blog, FAQ, contacto, privacidad)
- 4.3 Desarrollo del flujo de autenticación (Google Sign-In)
- 4.4 Desarrollo de la sección de perfil de usuario
- 4.5 Desarrollo del módulo de diarios (lista, detalle, creación, temas, invitaciones, gráfico de actividad)
- 4.6 Desarrollo del módulo de tickets (lista, detalle, chat integrado)
- 4.7 Desarrollo del módulo de mensajería (conversaciones, filtro por departamento)
- 4.8 Desarrollo del módulo de eventos y calendario Syncfusion
- 4.9 Desarrollo del centro de notificaciones
- 4.10 Desarrollo del panel de administración completo (8 secciones)
- 4.11 Integración con Firebase (autenticación, FCM, service worker)
- 4.12 Diseño visual: tema oscuro, gradientes, animaciones
- 4.13 Ajustes de diseño responsivo (móvil/tablet/escritorio)
- 4.14 Optimización: OnPush en todos los componentes

### FASE 5: Integración y pruebas (Semanas 14–16)
- 5.1 Pruebas de integración frontend–backend
- 5.2 Pruebas funcionales de cada módulo
- 5.3 Pruebas de autenticación y autorización por roles
- 5.4 Pruebas de validación de datos
- 5.5 Corrección de errores detectados
- 5.6 Pruebas de usabilidad

### FASE 6: Despliegue (Semanas 16–17)
- 6.1 Creación de Dockerfile multi-stage para el backend
- 6.2 Creación de Dockerfile multi-stage para el frontend (build + Nginx)
- 6.3 Configuración de Docker Compose con health checks
- 6.4 Pruebas del despliegue local con Docker Compose
- 6.5 Despliegue en entorno de producción (VPS)
- 6.6 Configuración de dominio devnexus.es
- 6.7 Pruebas de validación en producción

### FASE 7: Documentación y entrega (Semanas 17–18)
- 7.1 Redacción de la documentación técnica completa
- 7.2 Redacción del manual de instalación y uso
- 7.3 Preparación de la defensa oral
- 7.4 Revisión final y entrega

## 8.2 Cronograma (Diagrama de Gantt)

El proyecto se planificó para un período de 18 semanas (aproximadamente 4,5 meses):

*Figura 2: Diagrama de Gantt del proyecto*

```mermaid
%%{init: {'theme': 'dark'}}%%
gantt
    title Cronograma del Proyecto DevNexus — TFG DAM
    dateFormat  YYYY-MM-DD
    axisFormat  %d/%m

    section Fase 1 - Analisis
    Analisis de requisitos           :f1a, 2025-01-13, 7d
    Analisis comparativo             :f1b, 2025-01-20, 5d
    Diseno modelo de datos           :f1c, 2025-01-20, 7d
    Diseno arquitectura              :f1d, 2025-01-27, 5d
    Wireframes UI                    :f1e, 2025-01-27, 5d
    Definicion API                   :f1f, 2025-01-27, 5d
    Planificacion y riesgos          :f1g, 2025-02-01, 3d

    section Fase 2 - Entorno
    Repositorio Git                  :f2a, 2025-02-03, 2d
    Config Spring Boot               :f2b, 2025-02-03, 5d
    Config Angular/Ionic             :f2c, 2025-02-05, 5d
    Config Firebase                  :f2d, 2025-02-07, 3d
    Config PostgreSQL VPS            :f2e, 2025-02-10, 3d

    section Fase 3 - Backend
    Entidades JPA                    :f3a, 2025-02-10, 7d
    Repositorios                     :f3b, 2025-02-17, 5d
    Seguridad Firebase JWT           :f3c, 2025-02-17, 7d
    Modulo usuarios y roles          :f3d, 2025-02-24, 5d
    Modulo diarios                   :f3e, 2025-03-03, 7d
    Modulo tickets                   :f3f, 2025-03-10, 7d
    Modulo mensajeria                :f3g, 2025-03-17, 5d
    Modulo eventos                   :f3h, 2025-03-17, 5d
    Modulo notificaciones FCM        :f3i, 2025-03-24, 5d
    Auditoria Spring AOP             :f3j, 2025-03-24, 3d
    Swagger OpenAPI                  :f3k, 2025-03-27, 2d
    Flyway migraciones               :f3l, 2025-03-27, 2d

    section Fase 4 - Frontend
    Routing guards interceptor       :f4a, 2025-03-10, 5d
    Paginas publicas                 :f4b, 2025-03-17, 7d
    Autenticacion Google             :f4c, 2025-03-17, 5d
    Perfil usuario                   :f4d, 2025-03-24, 5d
    Modulo diarios FE                :f4e, 2025-03-31, 7d
    Modulo tickets FE                :f4f, 2025-04-07, 7d
    Modulo mensajeria FE             :f4g, 2025-04-14, 5d
    Modulo eventos calendario        :f4h, 2025-04-14, 7d
    Centro notificaciones            :f4i, 2025-04-21, 3d
    Panel administracion             :f4j, 2025-04-21, 10d
    Firebase integration             :f4k, 2025-04-28, 3d
    Diseno visual tema oscuro        :f4l, 2025-04-28, 5d
    Responsive design                :f4m, 2025-05-01, 3d
    OnPush optimization              :f4n, 2025-05-01, 3d

    section Fase 5 - Pruebas
    Integracion FE-BE                :f5a, 2025-05-05, 5d
    Pruebas funcionales              :f5b, 2025-05-05, 7d
    Pruebas seguridad                :f5c, 2025-05-12, 3d
    Correccion errores               :f5d, 2025-05-12, 5d

    section Fase 6 - Despliegue
    Dockerfiles multi-stage          :f6a, 2025-05-19, 3d
    Docker Compose                   :f6b, 2025-05-19, 3d
    Despliegue produccion            :f6c, 2025-05-22, 5d
    Config dominio devnexus.es       :f6d, 2025-05-26, 2d

    section Fase 7 - Documentacion
    Documentacion tecnica            :f7a, 2025-05-26, 7d
    Manual instalacion y uso         :f7b, 2025-06-02, 5d
    Preparacion defensa              :f7c, 2025-06-05, 3d
    Revision final y entrega         :f7d, 2025-06-08, 2d
```

| Fase | Semanas | Duración |
|---|---|---|
| F1. Análisis y diseño | 1–3 | 3 semanas |
| F2. Configuración del entorno | 3–4 | 2 semanas |
| F3. Desarrollo del backend | 4–10 | 7 semanas |
| F4. Desarrollo del frontend | 8–14 | 7 semanas |
| F5. Integración y pruebas | 14–16 | 2 semanas |
| F6. Despliegue | 16–17 | 2 semanas |
| F7. Documentación y entrega | 17–18 | 2 semanas |

*Nota: Las fases de backend y frontend se solapan a partir de la semana 8, siguiendo un enfoque iterativo que permite desarrollar en paralelo ambas capas una vez establecidas las interfaces de la API.*

## 8.3 Recursos necesarios

### Recursos técnicos — Hardware

| Recurso | Especificación |
|---|---|
| Ordenador de desarrollo | Mínimo 16 GB de RAM, procesador multinúcleo |
| Conexión a Internet | Necesaria para Firebase y acceso remoto al VPS |
| VPS de producción | Modelo VPS-1: 4 vCores, 8 GB RAM, 75 GB SSD (contrato anual) |

![Figura: Especificaciones del VPS de producción](img/vps.png)
*Figura: Panel del proveedor mostrando la configuración del VPS — 4 vCores, 8 GB de memoria y 75 GB de almacenamiento*

### Recursos técnicos — Software

| Herramienta | Versión | Uso |
|---|---|---|
| IntelliJ IDEA / VS Code | Última | IDE de desarrollo |
| Java JDK | 17 (LTS) | Compilación del backend |
| Kotlin | 1.9.25 | Lenguaje del backend |
| Maven | 3.9 | Gestión de dependencias backend |
| Node.js | 20 (LTS) | Entorno de ejecución frontend |
| Angular CLI | 20 | Scaffolding y build del frontend |
| Ionic CLI | 8 | Framework UI móvil |
| Capacitor | 7.4.4 | Wrapper nativo Android |
| Docker Desktop | Última | Contenedorización |
| Git + GitHub | Última | Control de versiones |
| Postman / Swagger UI | Última | Prueba de endpoints |
| pgAdmin | 4 | Gestión de base de datos |
| Firebase Console | Web | Configuración de servicios Firebase |

### Recursos técnicos — Servicios e infraestructura

| Servicio / Recurso | Plan | Uso |
|---|---|---|
| Firebase Authentication | Gratuito (Spark) | Autenticación de usuarios (Google + email/password) |
| Firebase Cloud Messaging | Gratuito | Notificaciones push |
| VPS dedicado (4 vCores, 8 GB, 75 GB) | Contrato anual | Servidor de producción — aloja PostgreSQL, backend, frontend y otros proyectos |
| Dokploy | Self-hosted gratuito | PaaS para gestión de imágenes Docker, proxy inverso y SSL |
| NeonDB PostgreSQL | Gratuito (tier básico) | Destino de backup periódico de la base de datos |
| GitHub | Gratuito | Repositorio de código |

### Recursos humanos
- 1 desarrollador (el alumno): responsable de análisis, diseño, desarrollo, pruebas y documentación
- Tutor del centro: orientación y revisión del proyecto

---

# 9. PLAN DE GESTIÓN DE RIESGOS

## 9.1 Identificación y evaluación de riesgos

Se han identificado los principales riesgos que podrían afectar al desarrollo del proyecto, evaluados según su probabilidad e impacto (escala 1–5):

| ID | Riesgo | Prob. | Impacto | Criticidad |
|---|---|---|---|---|
| R-01 | Cambios en la API de Firebase que rompan la autenticación | 2 | 5 | Alta |
| R-02 | Incompatibilidades de versiones entre Angular/Ionic y dependencias | 3 | 4 | Alta |
| R-03 | Pérdida de datos en la base de datos de desarrollo | 2 | 4 | Media-Alta |
| R-04 | Subestimación del tiempo de desarrollo de algún módulo | 4 | 3 | Alta |
| R-05 | Fallo o caída del VPS de producción | 2 | 4 | Media-Alta |
| R-06 | Problemas de CORS entre frontend y backend en producción | 3 | 3 | Media |
| R-07 | Errores de seguridad (acceso no autorizado a recursos) | 2 | 5 | Alta |
| R-08 | Problemas en la configuración de Docker en producción | 3 | 3 | Media |
| R-09 | Cambios de diseño tardíos que requieran refactorización | 3 | 2 | Media |
| R-10 | Ausencia de soporte técnico para una tecnología concreta | 2 | 3 | Baja-Media |

## 9.2 Recursos preventivos

- **R-01 (Firebase API):** Seguir la documentación oficial y fijar versiones de dependencias en `pom.xml` y `package.json`.
- **R-02 (Incompatibilidades):** Utilizar versiones LTS estables. Actualizar dependencias de forma controlada, probando en entorno local antes de integrar.
- **R-03 (Pérdida de datos):** Backups regulares. Scripts de inicialización (`import.sql`) para recrear datos de prueba. Migraciones Flyway versionadas.
- **R-04 (Tiempo):** Planificación con holgura entre fases. Priorizar funcionalidades core del MVP.
- **R-05 (Caída de VPS):** Monitorización activa con bot de Telegram que notifica reinicios. Backup de datos a NeonDB. Dokploy con política `restart: always` para recuperación automática de contenedores.
- **R-06 (CORS):** Configurar correctamente la política CORS en Spring Boot desde el inicio, especificando los orígenes permitidos.
- **R-07 (Seguridad):** Pruebas específicas de autorización. Revisión sistemática de endpoints con Swagger.
- **R-08 (Docker):** Probar despliegue con Docker Compose en local antes de producción. Documentar todos los pasos.
- **R-09 (Diseño):** Validar wireframes y arquitectura antes de comenzar el desarrollo.
- **R-10 (Soporte técnico):** Consultar documentación oficial, Stack Overflow, GitHub Issues.

## 9.3 Plan de mitigación

| ID | Riesgo materializado | Plan de mitigación |
|---|---|---|
| R-01 | Firebase API cambia | Migrar a versión compatible o alternativa JWT propia |
| R-02 | Incompatibilidad de versiones | Retroceder a la versión estable anterior de la dependencia afectada |
| R-03 | Pérdida de datos | Restaurar desde último backup; recrear datos con scripts |
| R-04 | Tiempo insuficiente | Reducir alcance a funcionalidades del MVP |
| R-05 | Caída de VPS | Bot Telegram notifica el reinicio; `restart: always` en Docker recupera contenedores automáticamente; datos respaldados en NeonDB |
| R-06 | CORS en producción | Ajustar configuración CORS para el dominio de producción |
| R-07 | Brecha de seguridad | Identificar endpoint afectado, aplicar corrección, volver a probar |
| R-08 | Docker falla | Revisar logs; consultar documentación; desplegar sin Docker si necesario |
| R-09 | Rediseño tardío | Implementar cambio de forma incremental |
| R-10 | Sin soporte técnico | Ampliar búsqueda en documentación, GitHub, Stack Overflow |

---

# 10. DISEÑO

## 10.1 Prototipado y wireframes

El diseño de la interfaz de usuario se ha planificado siguiendo un enfoque mobile-first, aprovechando las capacidades de Ionic para generar interfaces adaptadas a dispositivos móviles y de escritorio. El diseño visual utiliza un tema oscuro con gradientes en tonos púrpura y rosa, buscando una estética moderna y profesional orientada a desarrolladores.

### Páginas públicas

Las páginas públicas siguen una estructura de landing page con barra de navegación lateral, secciones de contenido y chat flotante de soporte. El acceso a la aplicación se realiza mediante el botón de inicio de sesión con Google.

![Figura 3: Captura de la landing page — sección hero con vídeo de fondo](img/1.png)

*Figura 3: Landing page — sección hero*

![Figura 4: Captura de la landing page — sección de características (Documenta, Mentoría, Conecta)](img/2.png)

*Figura 4: Landing page — sección de características*

![Figura 5: Captura de la página "Sobre la comunidad" — hero con las 4 propuestas de valor](img/31.png)

*Figura 5: Página "Sobre la comunidad" — presentación de las 4 características principales (Diario Personal, Blog Comunitario, IA Integrada, Colaboración) con indicadores numerados y sección de descarga de la APK para Android*

![Figura 5b: Captura de la página "Sobre la comunidad" en vista móvil](img/32.png)

*Figura 5b: Página "Sobre la comunidad" — vista adaptada para dispositivos móviles*

![Figura 6: Captura de la página de Contacto — Soporte & Comunidad](img/33.png)

*Figura 6: Página de Contacto rediseñada — canal principal de soporte mediante sistema de tickets con estados (Pendiente, Respondido, Resuelto) y canales secundarios (GitHub, Discord)*

![Figura 7: Captura de la página FAQ — ¿Cómo funciona DevNexus?](img/34.png)

*Figura 7: Página FAQ — sección superior con las 4 funcionalidades clave de la plataforma*

![Figura 7b: Captura de la página FAQ — acordeón de preguntas frecuentes](img/35.png)

*Figura 7b: Página FAQ — acordeón de preguntas frecuentes y accesos directos a Privacidad y Soporte*

### Dashboard de usuario

Una vez autenticado, el usuario accede a su panel personal ("Panel de Usuario") con las siguientes secciones accesibles desde las pestañas superiores:

- **Mi Perfil:** Datos personales, especialidad técnica y configuración de privacidad
- **Diario:** Gráfico de actividad, listado de repositorios/temas y entradas de diario
- **Tickets:** Centro de soporte con filtros (activos, historial, todos) y chat por ticket
- **Mensajes:** Conversaciones activas con filtro por departamento
- **Avisos:** Centro de notificaciones con marcado masivo
- **Eventos:** Calendario Syncfusion con vistas múltiples y panel de próximos eventos

![Figura 8: Captura del Panel de Usuario — Mi Perfil](img/16.png)

*Figura 8: Panel de Usuario — Mi Perfil*

![Figura 9: Captura del Panel de Usuario — Diario de progreso (vista de proyectos)](img/22.png)

*Figura 9: Panel de Usuario — Diario de progreso con listado de proyectos y gráfico de actividad*

#### IDE de proyectos integrado

El módulo de diario incluye un entorno de desarrollo integrado (IDE) accesible por proyecto, con árbol de archivos navegable, editor Monaco con resaltado de sintaxis, sistema de commits, panel de IA y previsualización en sandbox.

![Figura 9a: IDE integrado — Editor de código con árbol de archivos y Monaco Editor](img/23.png)

*Figura 9a: IDE integrado — árbol de archivos navegable (con soporte de carpetas anidadas) y editor Monaco con resaltado de sintaxis*

![Figura 9b: IDE integrado — Panel de Análisis IA con sugerencias en tiempo real](img/24.png)

*Figura 9b: IDE integrado — Panel lateral de Análisis IA (code review, sugerencia de etiquetas, resumen ejecutivo y análisis del proyecto)*

![Figura 9c: IDE integrado — Modal de invitación de colaboradores](img/25.png)

*Figura 9c: IDE integrado — Modal para invitar colaboradores al proyecto mediante correo electrónico*

![Figura 9d: IDE integrado — Historial de commits y entradas de diario](img/26.png)

*Figura 9d: IDE integrado — Panel inferior con el historial de commits y entradas de diario del proyecto*

![Figura 9e: IDE integrado — Feedback de staff sobre el proyecto](img/27.png)

*Figura 9e: IDE integrado — Sección de feedback de staff visible para el propietario del proyecto*

![Figura 10: Captura del Panel de Usuario — Tickets / Centro de Soporte](img/18.png)

*Figura 10: Panel de Usuario — Centro de Soporte (Tickets)*

![Figura 11: Captura del Panel de Usuario — Mensajería](img/19.png)

*Figura 11: Panel de Usuario — Mensajería*

![Figura 12: Captura del Panel de Usuario — Centro de Notificaciones](img/20.png)

*Figura 12: Panel de Usuario — Centro de Notificaciones*

![Figura 13: Captura del Panel de Usuario — Agenda y Eventos (Calendario)](img/21.png)

*Figura 13: Panel de Usuario — Agenda y Eventos*

### Panel de administración

El administrador y el staff acceden a un panel diferenciado ("Panel de Administración") con:

- **Usuarios:** Tabla de gestión con búsqueda, filtros, edición de rol/departamento y eliminación
- **Chats-Servicio técnico:** Tickets activos con chat en vivo con usuarios
- **Tickets:** Vista global de todos los tickets con código, prioridad, estado y chat
- **Mensajes:** Mensajería Pro para comunicación administrativa
- **Eventos:** Gestión de eventos globales con creación y filtros
- **Diarios:** Gestión de diarios por usuario para revisión y mentoría
- **Auditoría:** Registro de acciones del sistema con nivel, acción, recurso, usuario, detalles y fecha
- **Perfil:** Perfil del administrador con los mismos campos que el usuario

![Figura 14: Captura del Panel de Administración — Gestión de Usuarios](img/6.png)

*Figura 14: Panel de Administración — Gestión de Usuarios*

![Figura 15: Captura del Panel de Administración — Editar Usuario (modal)](img/7.png)

*Figura 15: Panel de Administración — Editar Usuario (modal)*

![Figura 16: Captura del Panel de Administración — Chats-Servicio Técnico](img/8.png)

*Figura 16: Panel de Administración — Chats-Servicio Técnico*

![Figura 17: Captura del Panel de Administración — Gestión de Tickets](img/9.png)

*Figura 17: Panel de Administración — Gestión de Tickets*

![Figura 18: Captura del Panel de Administración — Mensajería Pro](img/10.png)

*Figura 18: Panel de Administración — Mensajería Pro*

![Figura 19: Captura del Panel de Administración — Crear Evento (modal)](img/11.png)

*Figura 19: Panel de Administración — Crear Evento (modal)*

![Figura 20: Captura del Panel de Administración — Gestión de Diarios](img/12.png)

*Figura 20: Panel de Administración — Gestión de Diarios*

![Figura 21: Captura del Panel de Administración — Registro de Auditoría](img/13.png)

*Figura 21: Panel de Administración — Registro de Auditoría*

![Figura 22: Captura del Panel de Administración — Perfil](img/14.png)

*Figura 22: Panel de Administración — Perfil del Administrador*

### Blog de la comunidad

El blog muestra los proyectos publicados por la comunidad como tarjetas con gradiente, título de publicación, descripción y autor. Al hacer clic se abre un modal con los archivos de código del IDE con resaltado de sintaxis, las entradas de diario y la sección de comentarios de la comunidad.

![Figura 23: Captura del blog — vista de tarjetas de proyectos publicados](img/29.png)

*Figura 23: Blog — Comunidad & Updates con tarjetas de proyectos publicados*

![Figura 23a: Captura del modal de publicación — título y descripción para el blog](img/28.png)

*Figura 23a: Modal "Publicar en el blog" — el usuario introduce un título y descripción de publicación sin modificar el nombre interno del proyecto*

![Figura 23b: Captura del modal del proyecto en el blog — código e IDE y comentarios](img/30.png)

*Figura 23b: Modal de proyecto en el blog — archivos de código del IDE con syntax highlighting, etiqueta de lenguaje, botón de preview en vivo y sección de comentarios de la comunidad*

## 10.2 Especificaciones técnicas

### Arquitectura global del sistema

*Figura 24: Diagrama de arquitectura global del sistema*

```mermaid
%%{init: {'theme': 'dark'}}%%
graph TB
    subgraph ClientLayer["Capa de Presentacion"]
        direction LR
        Browser["Navegador Web"]
        PWA["PWA / Movil"]
    end

    subgraph FrontendLayer["Frontend - Angular 20 + Ionic 8"]
        direction LR
        Components["Componentes<br/>Standalone + OnPush"]
        Services["Servicios<br/>AuthService, ApiService..."]
        GuardsInt["Guards + Interceptor<br/>AuthGuard, TokenInterceptor"]
        FirebaseFE["Firebase SDK<br/>Auth + FCM"]
    end

    subgraph APILayer["Capa API - HTTP/HTTPS + JWT"]
        API["API REST<br/>JSON + Bearer Token"]
    end

    subgraph BackendLayer["Backend - Spring Boot 3.5.7 + Kotlin 1.9.25"]
        direction LR
        Controllers["Controllers (15)<br/>@RestController"]
        ServicesBE["Services (13)<br/>@Service"]
        Repositories["Repositories (16)<br/>JpaRepository"]
        SecurityBE["Security<br/>FirebaseAuthFilter<br/>SecurityConfig"]
        AuditBE["Auditoria<br/>@Aspect (AOP)"]
        SwaggerBE["Swagger<br/>SpringDoc OpenAPI"]
    end

    subgraph DataLayer["Capa de Persistencia"]
        PostgreSQL["PostgreSQL 17<br/>17 tablas | 3FN<br/>Flyway migrations"]
    end

    subgraph InfraLayer["Infraestructura VPS"]
        direction LR
        Dokploy["Dokploy<br/>Proxy inverso + SSL<br/>Gestión Docker"]
        PgAdmin["pgAdmin 4<br/>Administración visual<br/>PostgreSQL"]
        TelegramBot["Bot Telegram<br/>Monitorización<br/>Alertas de reinicio"]
    end

    subgraph ExternalLayer["Servicios Externos"]
        direction LR
        GAuth["Firebase<br/>Authentication<br/>Google OAuth 2.0"]
        GFCM["Firebase<br/>Cloud Messaging<br/>Push Notifications"]
        Neon["NeonDB<br/>PostgreSQL<br/>Backup externo"]
        GroqAI["Groq AI<br/>Llama Vision + 70B<br/>IA generativa"]
    end

    Browser --> FrontendLayer
    PWA --> FrontendLayer
    Components --> Services
    Services --> GuardsInt
    GuardsInt --> API
    FirebaseFE --> GAuth

    Dokploy -->|"Enruta tráfico HTTPS"| API
    API --> Controllers
    Controllers --> ServicesBE
    ServicesBE --> Repositories
    Repositories --> PostgreSQL
    SecurityBE -->|"Verifica JWT"| GAuth
    ServicesBE -->|"Push"| GFCM
    ServicesBE -->|"IA generativa"| GroqAI
    AuditBE -->|"Intercepta"| Controllers
    PostgreSQL -.->|"Backup periódico"| Neon
    PgAdmin -.->|"Administra"| PostgreSQL
    TelegramBot -.->|"Monitoriza"| Dokploy

    style ClientLayer fill:#1e1b4b,stroke:#6366f1,color:#fff
    style FrontendLayer fill:#2d1b69,stroke:#8b5cf6,color:#fff
    style APILayer fill:#4c1d95,stroke:#a78bfa,color:#fff
    style BackendLayer fill:#3b1a45,stroke:#d946ef,color:#fff
    style DataLayer fill:#1e3a5f,stroke:#3b82f6,color:#fff
    style ExternalLayer fill:#0f3460,stroke:#16213e,color:#fff
```

El sistema sigue una arquitectura cliente-servidor desacoplada con las siguientes capas:

| Capa | Componente | Tecnología |
|---|---|---|
| **Presentación** | Frontend SPA | Angular 20 + Ionic 8 |
| **Servidor de estáticos** | Contenedor frontend | Nginx (sirve los estáticos compilados de Angular + SPA routing) |
| **Proxy inverso / SSL** | Orquestador de producción | Dokploy (proxy HTTPS, gestión de contenedores, Let's Encrypt) |
| **Lógica de negocio** | Backend API REST | Spring Boot 3.5.7 + Kotlin 1.9.25 |
| **Persistencia** | Base de datos relacional | PostgreSQL 16 (auto-hospedado en VPS) |
| **Administración BD** | Interfaz visual | pgAdmin 4 (acceso web en VPS) |
| **Backup BD** | Copia de seguridad externa | NeonDB (PostgreSQL gestionado en la nube) |
| **Autenticación** | Proveedor de identidad | Firebase Authentication (Google OAuth + email/password) |
| **Notificaciones** | Servicio push | Firebase Cloud Messaging (FCM) |
| **IA generativa** | Servicio externo de IA | Groq (Llama Vision para transcripción de código; Llama 3.3 70B para code review, etiquetas y resumen) |
| **Contenedorización** | Imágenes Docker | Docker — 2 imágenes propias publicadas en Docker Hub |
| **Monitorización** | Alertas de producción | Bot de Telegram (notificaciones de reinicio del servidor) |

### Arquitectura del backend (patrón por capas)

El backend sigue estrictamente el patrón de arquitectura por capas:

```
Controller (HTTP) → Service (lógica de negocio) → Repository (acceso a datos) → Entity (modelo JPA)
     ↑                        ↑                          ↑
    DTO                  Security                    Database
 (entrada/salida)     (Firebase JWT)             (PostgreSQL)
```

**Capa Controller:** Recibe las peticiones HTTP, valida los datos de entrada (DTOs) y delega en la capa de servicio. Cada controlador está anotado con `@RestController` y expone endpoints REST documentados con SpringDoc.

**Capa Service:** Contiene la lógica de negocio. Gestiona transacciones, aplica reglas de autorización y coordina operaciones entre repositorios. Anotados con `@Service`.

**Capa Repository:** Interfaces que extienden `JpaRepository` de Spring Data. Definen consultas personalizadas mediante `@Query` o derivación de nombres de métodos.

**Capa Entity/Model:** Clases Kotlin anotadas con JPA (`@Entity`, `@Table`, `@Column`) que representan las tablas de la base de datos.

**Capa DTO:** Clases de transferencia de datos que separan la representación externa de la interna, evitando exponer directamente las entidades JPA.

**Capa Security:** Filtro de autenticación (`FirebaseAuthFilter`) que intercepta cada petición, verifica el token JWT con Firebase Admin SDK y establece el contexto de seguridad de Spring.

**Aspecto de Auditoría:** Componente transversal implementado con Spring AOP (`@Aspect`) que registra automáticamente las acciones realizadas en los controladores.

### Stack tecnológico completo

| Capa | Tecnología | Versión |
|---|---|---|
| Lenguaje backend | Kotlin | 1.9.25 |
| Framework backend | Spring Boot | 3.5.7 |
| ORM | Spring Data JPA / Hibernate | Incluido en Spring Boot |
| Migraciones DB | Flyway | 10.x |
| Base de datos | PostgreSQL | 16+ |
| Autenticación | Firebase Authentication | SDK Admin 9.x |
| Notificaciones push | Firebase Cloud Messaging | SDK 9.x |
| Documentación API | SpringDoc OpenAPI | 2.x |
| Build backend | Maven | 3.9 |
| Lenguaje frontend | TypeScript | 5.x |
| Framework frontend | Angular | 20.0.0 |
| UI Framework | Ionic | 8.0.0 |
| Mobile wrapper | Capacitor | 7.4.4 |
| Calendario | Syncfusion EJ2 Schedule | Última |
| Contenedorización | Docker + Docker Compose | Última |
| Servidor web (prod.) | Nginx | Alpine |
| Runtime frontend | Node.js | 20 LTS |
| JDK | Java | 17 LTS |

## 10.3 Diagramas UML

### Diagrama de Casos de Uso

*Figura 25: Diagrama de Casos de Uso UML*

```mermaid
%%{init: {'theme': 'dark'}}%%
graph TB
    subgraph Sistema["Sistema DevNexus"]
        direction TB
        UC1["Iniciar sesion /<br/>Registrarse con Google"]
        UC2["Gestionar perfil personal"]
        UC3["Crear / editar / eliminar<br/>entradas de diario"]
        UC4["Crear temas e<br/>invitar colaboradores"]
        UC5["Crear tickets de soporte"]
        UC6["Chat en ticket<br/>con staff"]
        UC7["Enviar / recibir mensajes"]
        UC8["Crear / ver / eliminar<br/>eventos"]
        UC9["Consultar notificaciones"]
        UC10["Revisar y aprobar<br/>diarios pendientes"]
        UC11["Cambiar estado<br/>de tickets"]
        UC12["Bandeja de<br/>soporte tecnico"]
        UC13["Gestionar usuarios<br/>CRUD + roles"]
        UC14["Gestionar departamentos"]
        UC15["Consultar registro<br/>de auditoria"]
        UC16["Gestionar eventos<br/>globales"]
    end

    USER(("Usuario<br/>USER"))
    STAFF(("Staff /<br/>Mentor<br/>STAFF"))
    ADMIN(("Administrador<br/>ADMIN"))

    USER --- UC1
    USER --- UC2
    USER --- UC3
    USER --- UC4
    USER --- UC5
    USER --- UC6
    USER --- UC7
    USER --- UC8
    USER --- UC9

    STAFF --- UC1
    STAFF --- UC2
    STAFF --- UC3
    STAFF --- UC7
    STAFF --- UC10
    STAFF --- UC11
    STAFF --- UC12

    ADMIN --- UC1
    ADMIN --- UC2
    ADMIN --- UC10
    ADMIN --- UC11
    ADMIN --- UC13
    ADMIN --- UC14
    ADMIN --- UC15
    ADMIN --- UC16

    style USER fill:#6366f1,stroke:#818cf8,color:#fff
    style STAFF fill:#f59e0b,stroke:#fbbf24,color:#000
    style ADMIN fill:#ef4444,stroke:#f87171,color:#fff
    style Sistema fill:#1e1b4b,stroke:#6366f1,color:#fff
```

**Actores del sistema:**

| Actor | Descripción |
|---|---|
| Usuario Estándar (USER) | Persona registrada que utiliza la plataforma para documentar progreso, comunicarse y solicitar soporte |
| Personal de Soporte (STAFF) | Mentor o desarrollador senior que modera contenido, atiende tickets y revisa diarios |
| Administrador (ADMIN) | Gestor global de la plataforma con acceso completo a todas las funcionalidades |

**Casos de uso por actor:**

El USUARIO puede:
- Iniciar sesión / Registrarse con Google
- Gestionar perfil personal (editar datos, especialidad, privacidad)
- Crear, editar y eliminar entradas de diario propias
- Crear temas de diario e invitar colaboradores
- Crear tickets de soporte y añadir comentarios/chat
- Enviar y recibir mensajes (individuales y grupales)
- Crear, ver y eliminar eventos propios
- Consultar y gestionar notificaciones

El STAFF puede (además de lo anterior):
- Ver todos los diarios públicos y pendientes de revisión
- Aprobar/rechazar diarios pendientes (mentoría)
- Ver y gestionar todos los tickets (cambiar estado)
- Acceder a la bandeja de soporte (chat en vivo)

El ADMINISTRADOR puede (además de lo anterior):
- Gestionar todos los usuarios (CRUD, cambio de rol/departamento)
- Gestionar departamentos
- Ver todos los tickets, eventos y mensajes
- Consultar el registro de auditoría completo
- Asignar roles a usuarios

### Diagrama de Secuencia — Autenticación con Google

*Figura 26: Diagrama de secuencia — Flujo de autenticación*

```mermaid
%%{init: {'theme': 'dark'}}%%
sequenceDiagram
    actor U as Usuario
    participant F as Frontend<br/>Angular/Ionic
    participant FB as Firebase<br/>Auth
    participant G as Google<br/>OAuth 2.0
    participant B as Backend<br/>Spring Boot
    participant DB as PostgreSQL

    U->>F: Click "Empezar / Acceder"
    F->>FB: signInWithPopup(GoogleAuthProvider)
    FB->>G: Abrir popup OAuth 2.0
    G->>U: Mostrar selector de cuenta
    U->>G: Seleccionar cuenta Google
    G->>FB: Authorization code
    FB->>FB: Generar ID Token (JWT)
    FB-->>F: Token JWT + datos de usuario

    F->>B: POST /api/auth/google<br/>Authorization: Bearer {token}
    B->>FB: Verificar token con<br/>Firebase Admin SDK
    FB-->>B: Token valido + uid + email

    B->>DB: SELECT * FROM usuario<br/>WHERE firebase_uid = ?

    alt Usuario existe
        DB-->>B: Datos del usuario
    else Usuario nuevo
        B->>DB: INSERT INTO usuario<br/>(uid, email, nombre, rol=USER)
        DB-->>B: Usuario creado
    end

    B->>DB: INSERT INTO auditoria<br/>(accion=LOGIN, severidad=INFO)
    B-->>F: HTTP 200 + UsuarioDto (JSON)
    F->>F: Almacenar token en memoria
    F-->>U: Redirigir al Panel de Usuario
```

**Flujo detallado:**

1. El usuario pulsa "Iniciar sesión con Google" en el frontend
2. Firebase abre un popup de OAuth 2.0 de Google
3. El usuario selecciona su cuenta y concede permisos
4. Google devuelve un token de autorización a Firebase
5. Firebase genera un token JWT (ID Token) y lo devuelve al frontend
6. El frontend envía el token JWT a `POST /api/auth/google` en el backend
7. El backend verifica el token con Firebase Admin SDK
8. El backend busca al usuario por `firebase_uid` en la base de datos:
   - Si existe: devuelve los datos del usuario existente
   - Si no existe: crea un nuevo usuario con rol USER por defecto
9. Se registra la acción en la tabla de auditoría
10. El frontend almacena el token en memoria y redirige al dashboard

### Diagrama de Secuencia — Creación de Ticket de Soporte

*Figura 27: Diagrama de secuencia — Creación de ticket*

```mermaid
%%{init: {'theme': 'dark'}}%%
sequenceDiagram
    actor U as Usuario
    participant F as Frontend<br/>Angular/Ionic
    participant B as Backend<br/>Spring Boot
    participant DB as PostgreSQL
    participant FCM as Firebase<br/>Cloud Messaging
    actor S as Staff / Admin

    U->>F: Accede a Tickets > "Nuevo Ticket"
    F-->>U: Muestra formulario<br/>(titulo, descripcion, prioridad)
    U->>F: Rellena y pulsa "Enviar"

    F->>B: POST /api/tickets<br/>Authorization: Bearer {JWT}<br/>Body: {titulo, descripcion, prioridad}

    B->>B: Validar token JWT<br/>+ permisos del usuario
    B->>B: Validar datos de entrada<br/>(titulo no vacio, etc.)

    B->>DB: INSERT INTO ticket<br/>(titulo, desc, estado=ABIERTO,<br/>prioridad, usuario_id)
    DB-->>B: ticket_id generado

    B->>DB: INSERT INTO ticket_historico<br/>(ticket_id, estado_ant=null,<br/>estado_nuevo=ABIERTO)
    DB-->>B: OK

    B->>DB: INSERT INTO auditoria<br/>(accion=CREAR, recurso=Ticket,<br/>severidad=INFO)
    DB-->>B: OK

    B->>FCM: Enviar notificacion push<br/>al staff (nuevo ticket)
    FCM-->>S: Notificacion push

    B-->>F: HTTP 201 Created<br/>+ TicketDto (JSON)
    F-->>U: Redirigir a lista de tickets<br/>+ confirmacion visual
```

**Flujo detallado:**

1. El usuario accede a la página "Nuevo Ticket" desde el Panel de Usuario
2. El frontend muestra el formulario de creación (título, descripción, prioridad)
3. El usuario rellena el formulario y pulsa "Enviar"
4. El frontend envía `HTTP POST /api/tickets` con el token JWT en la cabecera
5. El backend valida el token JWT y los permisos del usuario
6. El backend inserta el nuevo ticket en la base de datos con estado ABIERTO
7. Se registra la acción en la tabla de auditoría (INSERT ticket)
8. El backend registra la entrada en ticket_historico (estado inicial)
9. Se envía notificación al staff vía FCM
10. El backend devuelve `HTTP 201 Created` con los datos del ticket
11. El frontend redirige al listado de tickets y muestra confirmación

### Diagrama de Flujo — Ciclo de Vida de un Ticket

*Figura 28: Diagrama de flujo — Estados del ticket*

```mermaid
%%{init: {'theme': 'dark'}}%%
stateDiagram-v2
    [*] --> ABIERTO: Usuario crea ticket
    ABIERTO --> EN_PROGRESO: Staff/Admin asigna
    EN_PROGRESO --> RESUELTO: Staff/Admin resuelve
    EN_PROGRESO --> ABIERTO: Staff/Admin reabre

    ABIERTO: Estado inicial
    ABIERTO: Prioridad: ALTA / MEDIA / BAJA
    ABIERTO: Visible para el usuario y staff

    EN_PROGRESO: Staff trabajando en el ticket
    EN_PROGRESO: Se registra en ticket_historico
    EN_PROGRESO: Notificacion push al usuario

    RESUELTO: Ticket cerrado
    RESUELTO: Se registra en ticket_historico
    RESUELTO: Notificacion push al usuario
    RESUELTO: Visible en historial

    note right of ABIERTO
        Cada transicion:
        1. Registra en ticket_historico
        2. Genera notificacion FCM
        3. Registra en auditoria
    end note
```

```
ABIERTO → EN_PROGRESO → RESUELTO
   ↑          ↓
   └──────────┘
   (reapertura)
```

Cada transición de estado:
- Es ejecutada por un usuario con rol STAFF o ADMIN
- Genera un registro en `ticket_historico` con el estado anterior, el nuevo, el usuario que lo cambió y la fecha
- Genera una notificación push al creador del ticket
- Se registra en la tabla de auditoría

### Diagrama de Componentes

*Figura 29: Diagrama de componentes del sistema*

```mermaid
%%{init: {'theme': 'dark'}}%%
graph TB
    subgraph Cliente["Cliente (Navegador / Dispositivo)"]
        direction TB
        subgraph FE["Frontend - Angular 20 + Ionic 8"]
            direction LR
            subgraph Publicas["Paginas Publicas"]
                Landing["Landing Page"]
                About["Sobre Nosotros"]
                Contact["Contacto"]
                Blog["Blog"]
                FAQ["FAQ / Ayuda"]
                Privacy["Privacidad"]
            end
            subgraph UserPanel["Panel de Usuario"]
                UPerfil["Mi Perfil"]
                UDiario["Diario"]
                UTickets["Tickets"]
                UMensajes["Mensajes"]
                UAvisos["Notificaciones"]
                UEventos["Eventos"]
            end
            subgraph AdminPanel["Panel de Administracion"]
                AUsers["Usuarios"]
                AChat["Servicio Tecnico"]
                ATickets["Tickets Admin"]
                AMensajes["Mensajeria Pro"]
                AEventos["Eventos Admin"]
                ADiarios["Diarios Admin"]
                AAudit["Auditoria"]
                APerfil["Perfil Admin"]
            end
            subgraph Shared["Servicios Compartidos"]
                AuthSvc["AuthService"]
                ApiSvc["ApiService"]
                NotifSvc["NotificationService"]
                EventSvc["EventsService"]
                Guards["AuthGuard + RoleGuard"]
                Interceptor["TokenInterceptor"]
            end
        end
    end

    subgraph Servidor["Servidor (Docker Host)"]
        direction TB
        subgraph BE["Backend - Spring Boot 3.5.7 + Kotlin"]
            direction LR
            subgraph Controllers["Controllers (15)"]
                AuthCtrl["AuthController"]
                UserCtrl["UsuarioController"]
                DiarioCtrl["DiarioController"]
                TicketCtrl["TicketController"]
                MsgCtrl["MensajeController"]
                EventCtrl["EventoController"]
                NotifCtrl["NotificacionController"]
                AuditCtrl["AuditoriaController"]
                OtherCtrl["+ 7 controllers mas"]
            end
            subgraph Services["Services (13)"]
                AuthSvcBE["SecurityService"]
                UserSvcBE["UsuarioService"]
                DiarioSvcBE["DiarioService"]
                TicketSvcBE["TicketService"]
                OtherSvc["+ 9 services mas"]
            end
            subgraph Repos["Repositories (16)"]
                RepoJPA["Spring Data JPA<br/>Interfaces"]
            end
            subgraph Security["Security"]
                FirebaseFilter["FirebaseAuthFilter"]
                SecurityCfg["SecurityConfig"]
                UserPrincipal["UserPrincipal"]
            end
            AuditAspect["AuditoriaAspect<br/>(Spring AOP)"]
        end
        subgraph DB["Base de Datos"]
            PG["PostgreSQL 17<br/>17 tablas"]
        end
    end

    subgraph Externos["Servicios Externos"]
        FirebaseAuth["Firebase<br/>Authentication"]
        FirebaseFCM["Firebase<br/>Cloud Messaging"]
        NeonDB["Neon<br/>PostgreSQL Cloud"]
        GroqAI2["Groq AI<br/>Llama Vision + 70B"]
    end

    FE -->|"HTTP/HTTPS + JWT"| BE
    Controllers --> Services
    Services --> Repos
    Repos --> DB
    Security -->|"Verifica JWT"| FirebaseAuth
    BE -->|"Push notifications"| FirebaseFCM
    Services -->|"IA generativa"| GroqAI2
    DB -.->|"Cloud hosting"| NeonDB
    AuditAspect -->|"Intercepta"| Controllers

    style Cliente fill:#1e1b4b,stroke:#6366f1,color:#fff
    style Servidor fill:#1a1a2e,stroke:#e94560,color:#fff
    style Externos fill:#0f3460,stroke:#16213e,color:#fff
```

El sistema se compone de los siguientes componentes principales:

**Frontend (Angular/Ionic):**
- Módulo de Páginas Públicas (Dashboard, About, Contact, Blog, FAQ, Privacy)
- Módulo de Usuario (Profile, Diary, Tickets, Messages, Notifications, Events)
- Módulo de Administración (Users, Support Chat, Tickets, Messages, Events, Diaries, Audit, Profile)
- Servicios compartidos (AuthService, ApiService, NotificationService, EventsService, etc.)
- Guards (AuthGuard, RoleGuard)
- Interceptor HTTP (TokenInterceptor)

**Backend (Spring Boot):**
- Controladores REST (15 controllers)
- Servicios de negocio (13 services)
- Repositorios JPA (16 repositories)
- Modelo de datos (16 entities)
- DTOs (entrada y salida)
- Security (FirebaseAuthFilter, SecurityConfig)
- Aspecto de Auditoría (AuditoriaAspect)
- Configuración (Firebase, OpenAPI, DataInitializer)

**Servicios externos:**
- Firebase Authentication (OAuth 2.0 + JWT)
- Firebase Cloud Messaging (notificaciones push)
- Neon PostgreSQL (base de datos gestionada)

### Diagrama de Despliegue

*Figura 30: Diagrama de despliegue UML*

```mermaid
%%{init: {'theme': 'dark'}}%%
graph TB
    subgraph Internet["Internet"]
        Browser["Navegador Web<br/>Chrome / Firefox / Safari"]
        Mobile["Dispositivo Movil<br/>PWA / Capacitor"]
    end

    subgraph DockerHost["Servidor / VPS (Docker Host)"]
        subgraph DockerCompose["Docker Compose - Red: tfg-net"]
            subgraph FrontContainer["Contenedor Frontend"]
                Nginx["Nginx :80<br/>nginx:alpine"]
                StaticFiles["Angular Build<br/>/usr/share/nginx/html"]
                NginxConf["nginx.conf<br/>SPA routing"]
            end

            subgraph BackContainer["Contenedor Backend"]
                SpringBoot["Spring Boot :8080<br/>temurin:17-jre-alpine"]
                JAR["app.jar<br/>Kotlin + JPA + Security"]
                Swagger["Swagger UI<br/>/swagger-ui.html"]
            end

            subgraph DBContainer["Contenedor Base de Datos"]
                Postgres["PostgreSQL :5432<br/>postgres:16-alpine"]
                Volume["Volume:<br/>postgres_data"]
                HealthCheck["Health Check:<br/>pg_isready"]
            end
        end
    end

    subgraph CloudServices["Servicios en la Nube"]
        Firebase["Google Firebase<br/>Authentication + FCM"]
        NeonCloud["Neon Cloud<br/>PostgreSQL (produccion)"]
    end

    Browser -->|"HTTPS :443"| Nginx
    Mobile -->|"HTTPS :443"| Nginx
    Nginx -->|"Sirve SPA"| StaticFiles
    Nginx -.->|"Proxy pass /api"| SpringBoot

    SpringBoot -->|"JDBC :5432"| Postgres
    SpringBoot -->|"Firebase Admin SDK"| Firebase
    SpringBoot -->|"FCM push"| Firebase

    Postgres --> Volume
    Postgres --> HealthCheck

    SpringBoot -.->|"Alternativa cloud"| NeonCloud

    BackContainer -->|"depends_on:<br/>service_healthy"| DBContainer

    style Internet fill:#1e1b4b,stroke:#6366f1,color:#fff
    style DockerHost fill:#1a1a2e,stroke:#e94560,color:#fff
    style CloudServices fill:#0f3460,stroke:#16213e,color:#fff
    style FrontContainer fill:#2d1b69,stroke:#8b5cf6,color:#fff
    style BackContainer fill:#3b1a45,stroke:#d946ef,color:#fff
    style DBContainer fill:#1e3a5f,stroke:#3b82f6,color:#fff
```

```
┌─────────────────────────────────────────────┐
│           SERVIDOR / VPS (Docker Host)       │
│  ┌───────────────┐  ┌───────────────────┐   │
│  │  Contenedor    │  │  Contenedor        │   │
│  │  Frontend      │  │  Backend           │   │
│  │  (Nginx:80)    │──│  (Spring Boot:8080)│   │
│  │  Angular build │  │  Kotlin + JRE 17   │   │
│  └───────────────┘  └────────┬──────────┘   │
│                               │              │
│                     ┌────────┴──────────┐   │
│                     │  Contenedor        │   │
│                     │  PostgreSQL (:5432) │   │
│                     │  postgres:16-alpine │   │
│                     └───────────────────┘   │
└─────────────────────────────────────────────┘
           │                    │
     ┌─────┴─────┐      ┌─────┴──────────┐
     │  Firebase  │      │  Neon Cloud     │
     │  Auth+FCM  │      │  PostgreSQL     │
     └───────────┘      └────────────────┘
```

### Modelo Entidad–Relación

*Figura 31: Diagrama Entidad-Relación completo*

```mermaid
%%{init: {'theme': 'dark'}}%%
erDiagram
    USUARIO {
        bigint id PK
        varchar firebase_uid UK
        varchar email UK
        varchar nombre
        text biografia
        varchar foto_perfil
        bigint rol_id FK
        bigint departamento_id FK
        varchar fcm_token
        boolean permite_contacto
        text motivo_no_contacto
        timestamp fecha_creacion
    }

    ROL {
        bigint id PK
        varchar nombre UK "USER STAFF ADMIN"
    }

    DEPARTAMENTO {
        bigint id PK
        varchar nombre
    }

    DIARIO {
        bigint id PK
        text contenido
        timestamp fecha_creacion
        varchar visibilidad "PRIVADO PENDIENTE PUBLICO"
        bigint usuario_id FK
        bigint tema_id FK
        bigint revisado_por FK
        text revision_comentario
        timestamp revision_en
    }

    DIARIO_TEMA {
        bigint id PK
        varchar titulo
        text descripcion
        bigint usuario_id FK
    }

    DIARIO_COLABORACION {
        bigint id PK
        bigint tema_id FK
        bigint usuario_id FK
        varchar estado "PENDIENTE ACEPTADA RECHAZADA"
        timestamp fecha_invitacion
    }

    DIARIO_COMENTARIO {
        bigint id PK
        bigint diario_id FK
        bigint autor_id FK
        text texto
        timestamp fecha
    }

    TICKET {
        bigint id PK
        varchar titulo
        text descripcion
        varchar estado "ABIERTO EN_PROGRESO RESUELTO"
        varchar prioridad "ALTA MEDIA BAJA"
        bigint usuario_id FK
        timestamp fecha_creacion
    }

    TICKET_COMENTARIO {
        bigint id PK
        bigint ticket_id FK
        bigint usuario_id FK
        text texto
        timestamp fecha_envio
    }

    TICKET_HISTORICO {
        bigint id PK
        bigint ticket_id FK
        varchar estado_anterior
        varchar estado_nuevo
        bigint usuario_id FK
        text comentario
        timestamp fecha
    }

    CONVERSACION {
        bigint id PK
        varchar titulo
        varchar tipo "individual grupal"
        bigint creado_por FK
        timestamp fecha_creacion
    }

    CONVERSACION_PARTICIPANTE {
        bigint conversacion_id PK
        bigint usuario_id PK
        timestamp fecha_entrada
        timestamp fecha_salida
    }

    MENSAJE {
        bigint id PK
        bigint conversacion_id FK
        bigint autor_id FK
        text texto
        timestamp fecha_envio
        timestamp leido_en
    }

    EVENTO {
        bigint id PK
        varchar titulo
        text descripcion
        date fecha_evento
        time hora_evento
        varchar visibilidad "PRIVADO PUBLICO"
        bigint usuario_id FK
    }

    NOTIFICACION {
        bigint id PK
        bigint usuario_id FK
        text mensaje
        timestamp fecha
        boolean leida
    }

    AUDITORIA {
        bigint id PK
        varchar accion
        varchar recurso
        text descripcion
        varchar severidad "INFO WARNING DANGER"
        timestamp fecha
        bigint usuario_id FK
        varchar usuario_email
    }

    ROL ||--o{ USUARIO : "tiene"
    DEPARTAMENTO ||--o{ USUARIO : "pertenece"
    USUARIO ||--o{ DIARIO : "crea"
    USUARIO ||--o{ DIARIO_TEMA : "crea"
    DIARIO_TEMA ||--o{ DIARIO : "agrupa"
    DIARIO_TEMA ||--o{ DIARIO_COLABORACION : "tiene"
    USUARIO ||--o{ DIARIO_COLABORACION : "colabora"
    DIARIO ||--o{ DIARIO_COMENTARIO : "tiene"
    USUARIO ||--o{ DIARIO_COMENTARIO : "escribe"
    USUARIO ||--o{ TICKET : "crea"
    TICKET ||--o{ TICKET_COMENTARIO : "tiene"
    USUARIO ||--o{ TICKET_COMENTARIO : "escribe"
    TICKET ||--o{ TICKET_HISTORICO : "registra"
    USUARIO ||--o{ TICKET_HISTORICO : "cambia"
    USUARIO ||--o{ CONVERSACION : "crea"
    CONVERSACION ||--o{ CONVERSACION_PARTICIPANTE : "tiene"
    USUARIO ||--o{ CONVERSACION_PARTICIPANTE : "participa"
    CONVERSACION ||--o{ MENSAJE : "contiene"
    USUARIO ||--o{ MENSAJE : "envia"
    USUARIO ||--o{ EVENTO : "crea"
    USUARIO ||--o{ NOTIFICACION : "recibe"
    USUARIO ||--o{ AUDITORIA : "genera"
```

Las entidades principales del sistema y sus relaciones:

| Relación | Cardinalidad | Descripción |
|---|---|---|
| Usuario ↔ Ticket | 1:N | Un usuario crea múltiples tickets |
| Ticket ↔ TicketComentario | 1:N | Un ticket tiene múltiples comentarios |
| Ticket ↔ TicketHistorico | 1:N | Un ticket tiene múltiples cambios de estado |
| Usuario ↔ Diario | 1:N | Un usuario crea múltiples diarios |
| DiarioTema ↔ Diario | 1:N | Un tema agrupa múltiples diarios |
| DiarioTema ↔ DiarioColaboracion ↔ Usuario | N:M | Colaboración entre usuarios en temas |
| Diario ↔ DiarioComentario | 1:N | Un diario tiene múltiples comentarios |
| Usuario ↔ Conversacion (via Participante) | N:M | Usuarios participan en conversaciones |
| Conversacion ↔ Mensaje | 1:N | Una conversación tiene múltiples mensajes |
| Usuario ↔ Evento | 1:N | Un usuario crea múltiples eventos |
| Usuario ↔ Notificacion | 1:N | Un usuario recibe múltiples notificaciones |
| Rol ↔ Usuario | 1:N | Un rol agrupa múltiples usuarios |
| Departamento ↔ Usuario | 1:N | Un departamento agrupa múltiples usuarios |
| Usuario ↔ Auditoria | 1:N | Un usuario genera múltiples registros de auditoría |

*El detalle completo de los atributos de cada entidad se encuentra en el Anexo A.*

---

# 11. INSTALACIÓN Y PREPARACIÓN

## 11.1 Procedimientos necesarios para hacer funcionar el proyecto

### Prerrequisitos del entorno de desarrollo

Para trabajar con el proyecto en local se necesitan los siguientes componentes instalados:

1. **Java JDK 17** (OpenJDK o Eclipse Temurin): `java -version` debe mostrar versión 17.x
2. **Maven 3.9+**: `mvn -version`
3. **Node.js 20 LTS**: `node -v` debe mostrar v20.x
4. **Angular CLI 20**: `npm install -g @angular/cli`
5. **Ionic CLI**: `npm install -g @ionic/cli`
6. **Docker Desktop** (para despliegue containerizado)
7. **Git**: para clonar el repositorio

### Configuración del backend

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd Back/SpringBoot-TFG
```

2. Crear el archivo `.env` en el directorio raíz del backend con las siguientes variables:
```
DB_HOST=[host_bd]
DB_PORT=5432
DB_NAME=[nombre_bd]
DB_USER=[usuario_bd]
DB_PASS=[contraseña_bd]
FIREBASE_SA_B64=[credenciales_firebase_en_base64]
```

3. Construir el proyecto:
```bash
mvn clean package -DskipTests
```

4. Ejecutar el backend:
```bash
java -jar target/SpringBoot-TFG-*.jar
```
El backend estará disponible en `http://localhost:8080`

5. Acceder a la documentación de la API (Swagger UI):
```
http://localhost:8080/swagger-ui.html
```

### Configuración del frontend

1. Acceder al directorio del frontend:
```bash
cd Front
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar las variables de entorno en `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  firebase: {
    apiKey: "[FIREBASE_API_KEY]",
    authDomain: "[FIREBASE_AUTH_DOMAIN]",
    projectId: "[FIREBASE_PROJECT_ID]",
    messagingSenderId: "[SENDER_ID]",
    appId: "[APP_ID]"
  }
};
```

4. Iniciar el servidor de desarrollo:
```bash
npm start
```
La aplicación estará disponible en `http://localhost:8100` (según la configuración del proyecto).

### Despliegue con Docker Compose

1. Asegurarse de que Docker Desktop está ejecutándose.

2. Desde el directorio `Back/SpringBoot-TFG`, ejecutar:
```bash
docker-compose up --build
```

3. Los servicios quedarán disponibles en:
   - Frontend: `http://localhost:80`
   - Backend: `http://localhost:8080`
   - API Docs: `http://localhost:8080/swagger-ui.html`

## 11.2 Procedimientos para el control de versiones

El proyecto utiliza **Git** como sistema de control de versiones y **GitHub** como plataforma de alojamiento del repositorio.

### Estrategia de ramas
- `main`: rama principal con el código estable de producción
- `develop`: rama de integración donde se fusionan las funcionalidades
- `feature/[nombre]`: ramas para el desarrollo de nuevas funcionalidades
- `hotfix/[nombre]`: ramas para corrección urgente de errores en producción

### Convención de commits
Se sigue el formato **Conventional Commits**:
```
tipo(ámbito): descripción breve

Ejemplos:
feat(tickets): añadir filtro de prioridad en lista de tickets
fix(auth): corregir validación del token expirado
docs: actualizar README con instrucciones de despliegue
refactor(diario): extraer lógica de visibilidad a servicio
```

### Flujo de trabajo
1. Crear rama `feature/nueva-funcionalidad` desde `develop`
2. Implementar la funcionalidad con commits frecuentes
3. Crear Pull Request hacia `develop`
4. Revisar y fusionar
5. Al finalizar una fase estable, fusionar `develop` en `main`

## 11.3 Procedimientos para registrar las incidencias

Durante el desarrollo del proyecto, las incidencias se registran mediante:

1. **Issues de GitHub:** Cada incidencia se crea como un issue en el repositorio, incluyendo:
   - Título descriptivo del problema
   - Descripción detallada con pasos para reproducirlo
   - Comportamiento esperado vs comportamiento obtenido
   - Capturas de pantalla o logs si aplica
   - Etiquetas: `bug`, `enhancement`, `documentation`, `question`
   - Asignación y estado: `open`, `in progress`, `closed`

2. **Sistema de tickets de la propia aplicación:** En el entorno de pruebas, los errores de usuario se registran como tickets de soporte dentro de la plataforma, validando simultáneamente el módulo de tickets.

3. **Log del sistema:** El backend registra errores en el log de Spring Boot, consultable en tiempo real durante el desarrollo con `docker-compose logs -f backend`.

### Registro resumido de incidencias cerradas

| ID | Tipo | Descripción | Causa raíz | Resolución | Evidencia | Estado |
|---|---|---|---|---|---|---|
| INC-001 | Documentación/API | Inconsistencia entre endpoint de auditoría documentado y backend real. | Persistían referencias en singular (`/api/auditoria`). | Se normaliza toda la documentación a `/api/auditorias` y `/api/auditorias/{id}`. | Tablas PF + Anexo de endpoints corregidos. | Cerrada |
| INC-002 | Testing E2E | Flujos con listas virtuales no renderizaban ítems en Cypress. | Supresión de `ResizeObserver` en entorno E2E impactando CDK Virtual Scroll. | Validación por estado de componente (`window.ng.getComponent`) y esperas con `intercept/wait`. | `Front/cypress/support/e2e.ts` y specs E2E de mensajería/soporte. | Cerrada |

### Matriz de cobertura de auditoría (SGE)

| Acción | Cobertura | Mecanismo |
|---|---|---|
| Creación de recursos (POST) | Sí | `AuditoriaAspect` + `AuditoriaService` |
| Modificación de recursos (PUT/PATCH) | Sí | `AuditoriaAspect` + `AuditoriaService` |
| Eliminación de recursos (DELETE) | Sí | `AuditoriaAspect` + `AuditoriaService` |
| Acciones de dominio (evento público, eliminación admin) | Sí | Registro explícito en servicios de negocio |
| Consultas GET | Sí (consultas críticas y administrativas) | Trazabilidad funcional + controles de acceso por rol |

### Cierre SGE: justificación de manipulación y consulta de datos

| Bloque | Implementación | Justificación |
|---|---|---|
| Consulta de datos | Endpoints GET por módulo (`/api/usuarios`, `/api/diarios`, `/api/tickets`, `/api/auditorias`) con filtros y restricciones por rol | Permite explotar información operativa y administrativa de forma controlada |
| Manipulación de datos | Operaciones POST/PUT/PATCH/DELETE validadas en capa servicio + permisos JWT por rol | Asegura integridad funcional y evita modificaciones no autorizadas |
| Verificación y trazabilidad | Registro automático con `AuditoriaAspect` y evidencia en pruebas PF/CP | Permite atribuir autoría, reconstruir cambios y justificar incidencias cerradas |

Con esta cobertura queda justificada la **manipulación y consulta de datos** conforme al criterio de SGE, con evidencia funcional y trazabilidad reproducible.

---

# 12. DOCUMENTACIÓN DE EJECUCIÓN Y PLAN DE CALIDAD

## 12.1 Procedimientos operativos

### Inicio del sistema en producción

El sistema en producción opera sobre un **VPS dedicado** gestionado con **Dokploy**. La base de datos PostgreSQL está instalada directamente en el VPS (no en contenedor), por lo que el orden de disponibilidad es:

1. **PostgreSQL** — siempre disponible como servicio del sistema operativo del VPS.
2. **Backend Spring Boot** — contenedor Docker gestionado por Dokploy; arranca con política `restart: always`.

Dokploy gestiona el proxy inverso, el enrutamiento HTTPS y la renovación de certificados SSL (Let's Encrypt) de forma automática.

**Comprobación del estado desde Dokploy (interfaz web):**
- Panel → Servicios → estado en tiempo real de cada contenedor.

**Comprobación manual desde el VPS:**
```bash
docker ps
docker logs spring-tfg-prod
docker logs devnexus-front
```

**Reinicio de un servicio:**
```bash
docker restart spring-tfg-prod
```

**Actualización del sistema (nueva imagen):**
1. Publicar la nueva imagen en Docker Hub.
2. En Dokploy: panel del servicio → "Redeploy".
3. Dokploy descarga la nueva imagen y reemplaza el contenedor sin downtime.

### Copias de seguridad de la base de datos

PostgreSQL está instalado directamente en el VPS. Los backups se realizan de dos formas:

**Backup manual desde el VPS:**
```bash
pg_dump -U [USER] -d [DATABASE] > backup_$(date +%Y%m%d).sql

# Restauración
psql -U [USER] -d [DATABASE] < backup_YYYYMMDD.sql
```

**Backup automático a NeonDB:**
El sistema tiene configurado un backup periódico hacia NeonDB (PostgreSQL gestionado en la nube), que actúa como copia de seguridad externa. Esto garantiza recuperabilidad ante pérdida total del VPS.

### Matriz de responsabilidad operativa

| Tarea | Responsable | Frecuencia |
|---|---|---|
| Monitorización de contenedores | Administrador del sistema | Continua (bot Telegram) |
| Copias de seguridad a NeonDB | Administrador del sistema | Diaria (automática) |
| Actualización de imágenes Docker | Desarrollador | Por versión/release |
| Revisión de entradas pendientes (diarios) | Staff designado | Bajo demanda |
| Gestión de usuarios y asignación de roles | Administrador | Bajo demanda |
| Renovación de certificados SSL | Automática (Dokploy + Let's Encrypt) | Cada 90 días |

## 12.2 Registro de pruebas

### Pruebas funcionales del backend (mediante Swagger UI)

| ID | Endpoint | Método | Descripción | Resultado |
|---|---|---|---|---|
| PF-01 | /api/auth/google | POST | Autenticación con token Firebase válido | ✅ OK |
| PF-02 | /api/auth/google | POST | Autenticación con token inválido → 401 | ✅ OK |
| PF-03 | /api/usuarios/perfil | GET | Obtener perfil autenticado | ✅ OK |
| PF-04 | /api/usuarios/perfil | PUT | Actualizar datos del perfil | ✅ OK |
| PF-05 | /api/diarios | POST | Crear diario con visibilidad privada | ✅ OK |
| PF-06 | /api/diarios/{id} | GET | Obtener diario propio | ✅ OK |
| PF-07 | /api/diarios/{id} | GET | Acceder a diario ajeno privado → 403 | ✅ OK |
| PF-08 | /api/tickets | POST | Crear ticket con datos válidos | ✅ OK |
| PF-09 | /api/tickets | POST | Crear ticket con campos vacíos → 400 | ✅ OK |
| PF-10 | /api/tickets/{id}/estado | PUT | Cambiar estado (ADMIN) | ✅ OK |
| PF-11 | /api/tickets/{id}/estado | PUT | Cambiar estado (USER) → 403 | ✅ OK |
| PF-12 | /api/conversaciones | POST | Crear conversación individual | ✅ OK |
| PF-13 | /api/mensajes | POST | Enviar mensaje en conversación propia | ✅ OK |
| PF-14 | /api/eventos | POST | Crear evento con fecha válida | ✅ OK |
| PF-15 | /api/auditorias | GET | Listar auditoría (ADMIN) | ✅ OK |
| PF-16 | /api/auditorias | GET | Listar auditoría (USER) → 403 | ✅ OK |
| PF-17 | /api/diarios/tema/{temaId}/export.csv | GET | Exportación de diarios de tema a CSV | ✅ OK |

### Pruebas de seguridad

| ID | Vector de ataque | Método de prueba | Resultado |
|---|---|---|---|
| PS-01 | SQL injection | Payload `' OR 1=1 --` en campos de texto enviados al backend | ✅ OK — JPA/Hibernate usa queries parametrizadas; sin concatenación SQL directa |
| PS-02 | XSS reflejado | `<script>alert(1)</script>` en título y descripción de tickets/diarios | ✅ OK — Angular sanitiza automáticamente interpolación `{{ }}` e `[innerHTML]` |
| PS-03 | CORS — origen no autorizado | Petición con `Origin: https://atacante.com` | ✅ OK — Spring devuelve 403; solo orígenes configurados en `WebMvcConfig` son permitidos |
| PS-04 | CSRF | POST sin token JWT desde origen externo | ✅ OK — Autenticación stateless con JWT; sin cookies de sesión; CSRF no aplicable |
| PS-05 | Acceso sin autenticación | GET `/api/diarios` sin cabecera `Authorization` | ✅ OK — Spring Security devuelve 401 Unauthorized |
| PS-06 | Escalada de privilegios | Usuario USER intenta GET `/api/auditorias` | ✅ OK — `@PreAuthorize` devuelve 403 Forbidden |
| PS-07 | HTTPS enforcement | Petición HTTP a `http://devnexus.es` | ✅ OK — Traefik redirige automáticamente a HTTPS con código 301 |

### Evidencia ADA: comparación BD vs ficheros (lectura/escritura)

Para la gestión operativa se utiliza **base de datos relacional** como fuente de verdad, y para interoperabilidad se utiliza **fichero CSV** mediante `GET /api/diarios/tema/{temaId}/export.csv`.

| Escenario | Base de datos (PostgreSQL + JPA) | Fichero (CSV) | Decisión técnica |
|---|---|---|---|
| Operación diaria de negocio (crear/editar diarios, tickets, mensajes) | Transaccional, consistente y con control por relaciones/roles | No apto para operaciones concurrentes complejas | Priorizar BD |
| Intercambio y explotación externa de datos | Requiere acceso técnico o consultas SQL | Apertura directa en Excel/LibreOffice, fácil compartir y archivar | Priorizar fichero |
| Trazabilidad y control de acceso | Integrado con auditoría, JWT y validaciones de servicio | Sin control de acceso inherente al formato | BD para trazabilidad + CSV para salida |

Con este enfoque se cubren ambas necesidades de ADA: **escritura de fichero** en el proceso de exportación y **lectura del fichero** en herramientas externas para análisis y evidencias de seguimiento.

### Grafo de navegación funcional (Angular Router)

```mermaid
graph TD
  A[/dashboard/] --> B[/user-profile/]
  A --> C[/admin-profile/]
  B --> B1[/perfil/]
  B --> B2[/diario/]
  B --> B3[/tickets/]
  B --> B4[/mensajes/]
  B --> B5[/mensajes/:id/]
  B --> B6[/notificaciones/]
  B --> B7[/eventos/]
  C --> C1[/admin-user/]
  C --> C2[/admin-tickets/]
  C --> C3[/admin-mensajes/]
  C --> C4[/admin-mensajes/:id/]
  C --> C5[/admin-eventos/]
  C --> C6[/admin-diarios/]
  C --> C7[/admin-auditar/]
  C --> C8[/admin-personal/]
  C --> C9[/staff-inbox/]
```

- `authGuard`: protege acceso a `/user-profile`.
- `authGuard + adminGuard`: protege acceso a `/admin-profile`.
- Navegación móvil: botón atrás gestionado en `AppComponent` para cerrar app cuando no hay historial.

### Pruebas de integración frontend–backend

| ID | Escenario | Resultado |
|---|---|---|
| PI-01 | Login con Google → redirección al dashboard | ✅ OK |
| PI-02 | Crear ticket desde frontend → aparece en lista | ✅ OK |
| PI-03 | Enviar mensaje → aparece en conversación del receptor | ✅ OK |
| PI-04 | Cambiar estado de ticket (admin) → notificación al creador | ✅ OK |
| PI-05 | Token expirado → interceptor renueva automáticamente | ✅ OK |
| PI-06 | Usuario sin rol ADMIN accede a /admin-profile → redirección | ✅ OK |

### Pruebas de validación de datos

| ID | Campo | Caso de prueba | Resultado |
|---|---|---|---|
| PV-01 | Título del ticket | Vacío → error 400 | ✅ OK |
| PV-02 | Contenido del diario | Vacío → error 400 | ✅ OK |
| PV-03 | Email del usuario | Formato inválido → rechazado | ✅ OK |
| PV-04 | Fecha del evento | Fecha pasada → aceptada (sin restricción de negocio) | ✅ OK |

### Pruebas unitarias del backend

Se han implementado **168 tests** con JUnit 5, Mockito y `@WebMvcTest`, todos en verde (`BUILD SUCCESS`). Los tests de servicio utilizan `@ExtendWith(MockitoExtension::class)` con mocks de dependencias; los tests de controlador usan `@WebMvcTest` + `MockMvc` con `@MockBean` para aislar la capa web.

#### Tests de servicios (JUnit 5 + Mockito)

| Archivo | Casos cubiertos | Tests | Resultado |
|---|---|---|---|
| `AuditoriaServiceTest` | registrar (con datos, desde contexto, sin usuario, severidades), listarPaginado, obtenerPorId | 9 | ✅ OK |
| `ConversacionServiceTest` | listarMisConversaciones, crearOObtener (individual/grupal/existente), eliminarConversacion (creador/admin/forbidden), eliminarParticipante | 11 | ✅ OK |
| `DiarioColaboracionServiceTest` | invitarUsuario (ok/forbidden/duplicado/404), responderInvitacion (aceptar/rechazar/forbidden/404), getColaboradores, misInvitacionesPendientes | 13 | ✅ OK |
| `DiarioServiceTest` | create (ok/sin-tema/forbidden), getById, update (ok/forbidden/404), delete (ok/forbidden/404), publicos, publicosPorTema | 14 | ✅ OK |
| `DiarioTemaServiceTest` | listMisTemas, create, getById, delete (ok/forbidden), actualizarTema, cambiarVisibilidad, listPublicos, listByUserId | 14 | ✅ OK |
| `EventoServiceTest` | listarSeguro (USER/ADMIN), crearEventoSeguro (user/admin), eliminarEventoSeguro (ok/forbidden/404) | 7 | ✅ OK |
| `MensajeServiceTest` | marcarComoLeidos (query específica), obtenerMensajes (ok/forbidden/admin-bypass) | 5 | ✅ OK |
| `NotificacionServiceTest` | listarMisNotificaciones, enviar (con/sin token), marcarLeida (ok/forbidden/404), marcarTodasLeidas, eliminar | 10 | ✅ OK |
| `SecurityServiceTest` | getUserPrincipal (ok/sin-auth/principal-incorrecto), hasRole (con/sin/múltiples), checkRole, checkAccess (dueño/rol/forbidden) | 12 | ✅ OK |
| `TicketServiceTest` | crearTicket (estado ABIERTO + notificación), listarMisTickets, listarTodos (STAFF) | 4 | ✅ OK |
| `UsuarioServiceTest` | listAll, getById/ByFirebaseUid (ok/404), buscarPorDepartamento, create (ok/conflict), sincronizarGoogle, update, delete | 16 | ✅ OK |

#### Tests de controladores (@WebMvcTest + MockMvc)

| Archivo | Endpoints cubiertos | Tests | Resultado |
|---|---|---|---|
| `AuthControllerTest` | POST `/auth/sync` (login Google) | 2 | ✅ OK |
| `DiarioControllerTest` | GET list (ADMIN/USER), GET byId (ok/403/404), POST crear, DELETE, GET publicos, GET publicosPorTema | 10 | ✅ OK |
| `DiarioTemaControllerTest` | GET list, GET byId, POST crear, DELETE, POST invitar, POST responder, GET colaboradores, GET invitaciones, GET publicos | 12 | ✅ OK |
| `EventoControllerTest` | GET list (vacía/con datos), POST crear (201 + service call), DELETE | 5 | ✅ OK |
| `MensajeControllerTest` | GET deConversacion (ok/vacía), POST enviar (201 + service call), PUT marcarLeido | 5 | ✅ OK |
| `NotificacionControllerTest` | GET list (ok/vacía), PATCH marcarLeida (ok + service call), PATCH marcarTodas, DELETE | 6 | ✅ OK |
| `TicketControllerTest` | GET listarTodos (ok/vacía), GET mis-tickets, POST crear (201 + service call), PUT cambiarEstado | 6 | ✅ OK |
| `UsuarioControllerTest` | GET perfil, GET byId, GET por-departamento, PUT perfil (ok + service call), DELETE | 6 | ✅ OK |

**Total: 168 tests — 0 errores — BUILD SUCCESS**

### Pruebas unitarias del frontend

Se han implementado **353 tests** con Jasmine y Karma (Chrome Headless), todos en verde (`TOTAL: 353 SUCCESS`). Los tests cubren componentes, páginas y servicios Angular/Ionic utilizando `TestBed`, spies de Jasmine, `HttpTestingController` y `fakeAsync/tick` para flujos asíncronos.

#### Tests de servicios (Jasmine + HttpTestingController)

| Clase de test | Casos cubiertos | Nº tests | Estado |
|---|---|---|---|
| `DiarioService` | getTemas, crearTema, borrarTema, invitarColaborador, getInvitacionesPendientes, responderInvitacion (true/false), getMisEntradas, getEntradasPublicas, crearEntrada (con y sin tipo/filename), borrarEntrada, actualizarEntrada, crearArchivoIDE, getArchivosActuales | 14 | ✅ OK |

#### Tests de componentes y páginas (Jasmine + TestBed)

| Clase de test | Casos cubiertos | Nº tests | Estado |
|---|---|---|---|
| `IdeViewComponent` | ngOnInit carga archivos, seleccionarArchivo, guardarArchivo (ok/readOnly/sin cambios/sin activo), crearNuevoArchivo (válido/vacío), borrarArchivo (confirmar/cancelar), onEditorChange, getLenguaje, toggleCommitLogPanel, permiteGestionCommits, panel inicial readOnly, getLineCount | 20 | ✅ OK |
| `SandboxPreviewComponent` | ngOnInit sin archivos, construirHtml (HTML+CSS+JS), recargar, toggleConsole, onMessage (log/error/resultado), limpiarConsola, archivos vacíos, HTML único | 11 | ✅ OK |
| `FileTreeComponent` | renderiza archivos, seleccionar archivo emite evento, borrar archivo llama al servicio, crear archivo llama al servicio, crearArchivo con nombre vacío no actúa, extensión -> icono | 13 | ✅ OK |
| `DashboardPage` | carga estadísticas, navega a sección, muestra nombre de usuario, error de stats, redirige si no autenticado | 9 | ✅ OK |
| `UserDiaryPage` | carga temas, crear tema, borrar tema, seleccionar tema activa vista, modo IDE, invitar colaborador, responder invitación, paginación de entradas, crear entrada | 20+ | ✅ OK |

**Total: 353 tests — 0 errores — TOTAL: 353 SUCCESS**

#### Tests e2e (Cypress) — 20/20 passing contra backend de producción

| Fichero | Flujo cubierto | Tests | Estado |
|---|---|---|---|
| `auth-flow.cy.ts` | Login inválido, logout completo, guard bloquea acceso post-logout | 5 | ✅ |
| `ide-create-flow.cy.ts` | Entrar al IDE, crear archivo, ver árbol, ejecutar sandbox-preview | 6 | ✅ |
| `profile-edit-flow.cy.ts` | Acceder a perfil, editar nombre, verificar email, toggle de contacto | 5 | ✅ |
| `admin-flow.cy.ts` | Login admin, navegar a tickets, cargar lista, responder ticket | 4 | ✅ |

**Total: 20 tests e2e — 0 errores — All specs passed (2m 54s)**

> **Nota sobre la cobertura e2e:** Los 4 flujos Cypress cubren los escenarios de mayor riesgo: autenticación, flujo principal de usuario, edición de perfil y administración. La cobertura funcional completa sobre los 41 RF se apoya en los 353 tests unitarios de frontend + 168 tests de backend + 17 pruebas funcionales via Swagger. El número reducido de flujos e2e es una decisión de diseño: ejecutar Cypress contra el entorno de producción real requiere datos de prueba persistentes y un estado de BD controlado. Se priorizaron los 4 flujos de mayor impacto para evitar efectos secundarios sobre los datos de usuarios reales.

### Matriz rápida de evidencia (cierre de rúbrica)

| Tipo de prueba | Caso | Resultado esperado | Resultado obtenido | Evidencia |
|---|---|---|---|---|
| Integración | Login + creación de ticket + refresco de lista | Flujo completo sin errores de autorización | ✅ OK | Tabla PI-01/PI-02 + `support-flow.cy.ts` |
| Seguridad | Usuario USER consulta auditoría | Respuesta 403 Forbidden | ✅ OK | PF-16 + casos CP de seguridad |
| Rendimiento | Tiempo medio API en local | < 500ms | ~150ms promedio | KPI §12.3 |
| Usabilidad | Validación de navegación principal (perfil, tickets, mensajes, eventos) | Flujo comprensible sin bloqueos | ✅ OK (sesión formal completada con usuarios potenciales) | Tabla UX-01/UX-03 + conclusiones |

### Pruebas de usabilidad con usuarios potenciales (DI)

Se realizó una sesión guiada con **4 usuarios potenciales** (2 estudiantes DAM, 1 docente y 1 perfil técnico). Cada participante completó tareas clave sin asistencia funcional.

| ID | Tarea observada | Criterio de aceptación | Resultado |
|---|---|---|---|
| UX-01 | Crear diario y cambiar visibilidad | Completar flujo en < 2 min sin bloqueo | 4/4 completado, media 1m 32s |
| UX-02 | Crear ticket y localizarlo en listado | Flujo completo sin errores de comprensión | 4/4 completado, media 2m 04s |
| UX-03 | Enviar mensaje y verificar notificación | Confirmación visible de entrega/notificación | 4/4 completado, media 1m 14s |

**Conclusión de usabilidad:** no se detectaron bloqueos críticos; solo ajustes menores de copy en botones y etiquetas de navegación.

### Evidencia HLC: construcción del software, POO e integración interfaz-lógica

| Criterio HLC | Evidencia en código | Resultado |
|---|---|---|
| Nomenclatura y estructura consistentes | Backend organizado por capas (`controller`, `service`, `repository`) con nombres explícitos como `DiarioController`, `DiarioService`, `DiarioRepository`. Frontend con separación clara en `pages` y `services` (`UserDiaryPage`, `DiarioService`). | ✅ Cumplido |
| Uso de POO y separación por capas | Flujo desacoplado controller → service → repository: `DiarioController` delega en `DiarioService`, y `DiarioService` encapsula reglas de negocio + acceso JPA (`DiarioRepository`), usando DTOs para intercambio. | ✅ Cumplido |
| Integración interfaz-lógica dentro del framework | Angular/Ionic consume servicios tipados (`DiarioService`) desde componentes (`UserDiaryPage`) y mantiene rutas protegidas con guards (`authGuard`, `adminGuard`) en `app.routes.ts`. | ✅ Cumplido |
| Operaciones de entrada/salida aplicadas a negocio | Exportación de datos en CSV desde backend (`GET /api/diarios/tema/{temaId}/export.csv`) y descarga en frontend con `Blob` (`exportarTemaCsv` / `exportarRepo`). | ✅ Cumplido |

## 12.3 Indicadores de calidad

| Indicador | Objetivo | Resultado |
|---|---|---|
| Cobertura de requisitos funcionales | 100% de los RF definidos | 100% — 41 de 41 RF implementados |
| Endpoints de API documentados en Swagger | >90% | 100% |
| Tiempo medio de respuesta de la API (local) | < 500ms | ~150ms promedio |
| Pruebas unitarias backend | 168 tests (11 services + 8 controllers) | 168/168 ✅ BUILD SUCCESS |
| Pruebas unitarias frontend | 353 tests (Jasmine + Karma, Chrome Headless) | 353/353 ✅ TOTAL SUCCESS |
| Pruebas e2e frontend | 4 flujos Cypress (auth, IDE, perfil, admin) — 20 tests | 20/20 ✅ All specs passed |
| Pruebas funcionales pasadas | >95% | 100% de las definidas |
| Validación de datos en entrada | 100% de campos obligatorios | 100% |
| Código estructurado en capas | Arquitectura por capas completa | ✅ Cumplido |
| Despliegue containerizado funcional | Docker Compose ejecutable | ✅ Cumplido |
| Componentes con OnPush | 100% | 100% (todos los componentes) |

## 12.4 Métodos de verificación

1. **Revisión de código:** Comprobación de la correcta implementación de la arquitectura por capas, nomenclatura de endpoints REST y validaciones.

2. **Pruebas con Swagger UI:** Todos los endpoints probados manualmente verificando códigos de respuesta HTTP y estructura de datos.

3. **Pruebas end-to-end manuales:** Simulación de flujos de usuario completos (registro → creación de tickets → cambio de estado → notificación).

4. **Revisión de seguridad:** Verificación de que endpoints protegidos devuelven 401 sin token, 403 con token insuficiente, y que los recursos de un usuario no son accesibles por otro.

5. **Pruebas de despliegue:** Verificación de que el sistema arranca correctamente con `docker-compose up` y todos los servicios son accesibles.

6. **Pruebas unitarias automatizadas:** Ejecución con `mvn test` validando servicios críticos.

---

## 12.5 Auditoría y Securización de la Plataforma

Una vez finalizado el desarrollo funcional de DevNexus, se realizó una auditoría de seguridad estructurada sobre el código fuente completo de la plataforma — frontend Angular/Ionic y backend Spring Boot/Kotlin — antes de su despliegue público definitivo.

### 12.5.1 Introducción y motivación

La motivación principal es que DevNexus incorpora una funcionalidad de alto riesgo inherente: un IDE en el navegador que ejecuta código del usuario dentro de la misma sesión autenticada. Este vector abre la posibilidad de ataques de tipo Cross-Site Scripting (XSS) con consecuencias graves si no se implementan las barreras de aislamiento correctas.

Adicionalmente, al tratarse de una plataforma multiusuario con datos privados (diarios, proyectos, conversaciones), el modelo de autorización debe garantizar que ningún usuario pueda acceder a recursos de otro — una clase de vulnerabilidad conocida como Broken Object Level Authorization (BOLA) y catalogada por OWASP como la vulnerabilidad #1 en APIs en 2021.

---

### 12.5.2 Metodología y alcance

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

### 12.5.3 Resultados de la auditoría

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

### 12.5.4 Remediaciones aplicadas

#### F-01 — Aislamiento del iframe del IDE

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

#### B-01, B-02, B-03 — Control de acceso a nivel de objeto (BOLA)

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

#### F-02 — Content Security Policy con compatibilidad Monaco Editor

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
| `'unsafe-eval'` en `script-src` | Monaco usa evaluación dinámica de código en su motor de análisis. Sin esto el editor carga pero sin autocompletado ni detección de errores en tiempo real. |
| `worker-src blob:` | Monaco crea Web Workers con `blob:` URLs para ejecutar el servicio de lenguaje en un thread separado. Sin esto, el análisis de código no bloquea la UI pero deja de funcionar. |
| `frame-src blob:` | El iframe del sandbox (F-01) carga `blob:` URLs mediante `URL.createObjectURL()`. |

---

#### B-04 — Rate limiting en endpoints de IA

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

#### B-08 — Validación de payload en el endpoint de visión

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

#### Resto de remediaciones (resumen)

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

### 12.5.5 Análisis de tradeoffs técnicos

Durante la remediación se encontraron dos situaciones donde la solución óptima implica una restricción técnica conocida. Se documentan aquí para transparencia.

#### `'unsafe-eval'` en la Content Security Policy

La directiva `'unsafe-eval'` en `script-src` permite el uso de evaluación dinámica de código y funciones construidas en tiempo de ejecución desde scripts del mismo origen. Idealmente, una CSP estricta no la incluiría. Sin embargo, Monaco Editor — el IDE central de DevNexus — utiliza estas capacidades internamente para su motor de análisis de lenguaje. No existe una configuración de Monaco que evite este requisito sin sacrificar las funcionalidades de autocompletado y análisis semántico.

**Mitigación:** `'unsafe-eval'` solo permite evaluación dinámica desde scripts del mismo origen (`'self'`). No permite dicha evaluación desde scripts inyectados por terceros, lo que limita el vector de explotación a scripts que ya están en el bundle de la aplicación — un escenario equivalente a comprometer el propio repositorio de código.

#### Rate limiting en memoria (B-04)

El filtro de rate limiting almacena los contadores por usuario en un `ConcurrentHashMap` en la memoria del proceso JVM. Esto es correcto para el contexto de un solo nodo. Sin embargo, si el backend en Render se reinicia (por un deploy o por la política de reposo de la capa gratuita), los contadores se ponen a cero.

**Implicación práctica:** un usuario determinado podría explotar ventanas de reinicio para superar el límite de peticiones en ese instante. Para el TFG, donde los usuarios son conocidos y la carga es predecible, este riesgo es aceptable. En una arquitectura de producción con múltiples réplicas del backend se usaría Redis como almacén distribuido de contadores.

---

### 12.5.6 Mapa de cobertura OWASP Top 10 (2021)

| OWASP | Categoría | Hallazgos cubiertos |
|-------|-----------|---------------------|
| **A01:2021** | Broken Access Control | B-01, B-02, B-03 |
| **A03:2021** | Injection (XSS / tabnapping) | F-01, F-03 |
| **A05:2021** | Security Misconfiguration | B-04, B-06, B-08, B-09, B-10, F-02 |
| **A06:2021** | Vulnerable and Outdated Components | N-01 |
| **A09:2021** | Security Logging and Monitoring Failures | B-05, B-07 |

Las categorías **A02** (Cryptographic Failures), **A04** (Insecure Design), **A07** (Authentication Failures), **A08** (Software Integrity Failures) y **A10** (SSRF) no presentaron hallazgos en el análisis estático. La autenticación delegada a Firebase Auth con verificación de tokens JWT en el filtro de Spring Boot (`FirebaseAuthFilter`) cubre A07 de forma robusta.

---

### 12.5.7 Estado de seguridad post-remediación

| Vector de ataque | Estado |
|------------------|--------|
| XSS desde el IDE (ejecución de código del usuario) | ✅ Eliminado — iframe con origen opaco |
| Robo de sesión / cookies desde iframe | ✅ Eliminado — `window.parent` inaccesible |
| BOLA en proyectos privados y mensajes | ✅ Eliminado — verificación de permisos en los 3 métodos afectados |
| Fuga de código privado a la API de Groq | ✅ Eliminado — `findPermitidosByTemaId()` filtra antes de enviar |
| Abuso de API de IA por usuarios autenticados | ✅ Mitigado — 10 req/min por usuario |
| Exfiltración de arquitectura interna vía Actuator | ✅ Eliminado — solo `/health` es público |
| Exfiltración de arquitectura interna vía Swagger | ✅ Eliminado — restringido a ROLE_ADMIN |
| Payload masivo en endpoint de visión (OOM/DoS) | ✅ Mitigado — límite de 5 MB con validación Bean |
| Inyección SQL en JPQL custom | ✅ Sin riesgo — todos los repositorios usan parámetros nombrados |
| Amplificación de XSS por ausencia de CSP | ✅ Mitigado — CSP aplicada con compatibilidad Monaco |
| Tabnapping en enlaces externos | ✅ Eliminado — `rel="noopener noreferrer"` |
| Fuga de datos en logs de producción | ✅ Eliminado — `show-sql: false` + `println()` eliminados |
| CVEs críticos en dependencias runtime | ✅ Mitigado — `npm audit fix` + override de `dompurify` |

---

### 12.5.8 Conclusiones

La auditoría identificó vulnerabilidades reales en la plataforma, siendo la más crítica el bypass del sandbox del IDE que permitía a un usuario robar tokens de sesión de otros usuarios con un simple script. Esta vulnerabilidad fue detectada mediante análisis semántico del código — no es detectable por escáneres automáticos que únicamente comprueban versiones de librerías.

Las 14 remediaciones aplicadas eliminan todos los vectores de ataque identificados sin modificar la funcionalidad de la plataforma. El único tradeoff no eliminable es la directiva `'unsafe-eval'` en la CSP, que es un requisito técnico no negociable de Monaco Editor y cuyo riesgo residual se considera aceptable dado que no permite evaluación dinámica desde orígenes externos.

El proyecto puede considerarse seguro para su uso público con las remediaciones aplicadas, con la recomendación de ejecutar `./mvnw dependency:check` periódicamente para mantener actualizadas las dependencias Maven y repetir `npm audit` tras cada actualización de dependencias frontend.

---

# 13. DISTRIBUCIÓN

## 13.1 Tecnología de distribución

La distribución de DevNexus se realiza mediante **contenedores Docker** gestionados con **Dokploy**, desplegados en un **VPS dedicado** con las siguientes características:

| Recurso | Especificación |
|---|---|
| vCores | 4 |
| Memoria RAM | 8 GB |
| Almacenamiento | 75 GB SSD |
| Contrato | 1 año |
| Sistema operativo | Ubuntu 22.04 LTS |

Los componentes del sistema se distribuyen como imágenes Docker publicadas en Docker Hub:

| Componente | Imagen | Tecnología de servicio |
|---|---|---|
| Backend | `tagoh1/springboot-tfg:latest` | Spring Boot 3.5.7 en JRE Alpine |
| Frontend | `tagoh1/devnexus-front:latest` | Nginx Alpine (servidor de estáticos) |
| Base de datos | PostgreSQL 17 instalado en el VPS | Auto-hospedado (no en contenedor) |
| Proxy conexiones | `edoburu/pgbouncer` (contenedor Docker) | PgBouncer — pool de conexiones a PostgreSQL |
| Backup BD | NeonDB (externo) | PostgreSQL gestionado en la nube |

### Rol de cada componente de distribución

**Nginx (dentro del contenedor frontend):**
Nginx no actúa como proxy de la aplicación, sino exclusivamente como servidor de ficheros estáticos del build de Angular. Su configuración (`nginx.conf`) implementa `try_files` para que Angular gestione las rutas sin producir errores 404 al refrescar.

**Dokploy (en el VPS):**
Dokploy es el orquestador de producción. Actúa como proxy inverso (recibe el tráfico de `devnexus.es` y lo enruta al contenedor correspondiente), gestiona los certificados SSL vía Let's Encrypt, y permite desplegar nuevas versiones desde la interfaz web sin acceso SSH directo.

**PgBouncer (contenedor Docker independiente):**
Proxy de conexiones que se sitúa entre Spring Boot y PostgreSQL. Mantiene un pool estático de 20 conexiones permanentes a PostgreSQL y acepta hasta 10.000 clientes simultáneos, evitando que la base de datos sufra saturación en escenarios de alta concurrencia. Se despliega como servicio Docker separado en Dokploy usando la imagen `edoburu/pgbouncer`. Ver **Anexo D** para la documentación técnica completa.

**Bot de Telegram:**
Bot personalizado integrado con Dokploy que envía notificaciones a Telegram sobre eventos de despliegue y estado del servidor.

![Figura: Panel de Dokploy — servicios desplegados en producción](img/dokploy.png)
*Figura: Dokploy mostrando los 4 servicios del proyecto TFG-DevNexus en producción: Backend, Frontend, tfg-database y Pg-admin — todos en estado Running (punto verde)*

## 13.2 Descripción del proceso de distribución

### Dockerfile del backend (multi-stage)

```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Dockerfile del frontend (multi-stage)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine
COPY --from=builder /app/www /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

La configuración `nginx.conf` garantiza el correcto funcionamiento de las rutas de Angular (SPA routing):

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Proceso de despliegue en producción

El despliegue se gestiona íntegramente desde la interfaz web de **Dokploy**, sin necesidad de comandos manuales en el servidor:

1. Se construye la imagen Docker localmente o en CI.
2. Se publica en Docker Hub (`tagoh1/springboot-tfg:latest`, `tagoh1/devnexus-front:latest`).
3. Dokploy detecta la nueva imagen y despliega el contenedor actualizado.
4. Dokploy gestiona el enrutamiento HTTPS y el certificado SSL automáticamente.

Para entorno local (desarrollo):

```bash
# 1. Construir y arrancar todos los servicios
docker-compose up --build -d

# 2. Verificar estado de los contenedores
docker-compose ps

# 3. Ver logs en tiempo real
docker-compose logs -f

# 4. Detener el sistema
docker-compose down
```

### Infraestructura multi-proyecto en el VPS

El VPS no está dedicado exclusivamente a DevNexus. Sobre la misma infraestructura corren, de forma independiente y sin interferencias:

| Proyecto | Descripción |
|---|---|
| DevNexus (`devnexus.es`) | Plataforma colaborativa — este TFG |
| Portfolio personal | Sitio web personal del desarrollador |
| App móvil | Aplicación de dispositivo móvil |
| Proyecto adicional | En desarrollo |

Esto demuestra la estabilidad de la infraestructura y la capacidad de gestionar múltiples servicios de producción sobre una única plataforma auto-hospedada.

![Figura: pgAdmin — vista de la base de datos de DevNexus en producción](img/pgadmin.png)
*Figura: pgAdmin 4 accesible en `db.devnexus.es` mostrando las 18 tablas del esquema (16 de dominio de negocio + `flyway_schema_history` + `proyecto`)*

![Figura: Bot de Telegram — notificaciones de despliegue](img/bot_telegram.png)
*Figura: Bot "Aviso tfg" notificando Build Success del backend en producción tras cada despliegue desde Dokploy*

![Figura: devnexus.es con certificado HTTPS activo](img/httpss.png)
*Figura: devnexus.es en producción con certificado SSL/TLS activo gestionado automáticamente por Dokploy (Let's Encrypt)*

---

# 14. MANUALES

## 14.1 Manual de instalación

### Instalación para entorno de producción (Docker)

**Prerrequisitos:**
- Servidor Linux (Ubuntu 22.04 LTS recomendado) o Windows con Docker Desktop
- Docker Engine 24.x o superior
- Docker Compose 2.x o superior
- Acceso a Internet para descargar imágenes base

**Pasos de instalación:**

1. **Clonar el repositorio en el servidor:**
```bash
git clone [URL_REPOSITORIO] devnexus
cd devnexus
```

2. **Crear el archivo de variables de entorno:**
```bash
cd Back/SpringBoot-TFG
cp .env.example .env
nano .env
```
Configurar las variables:
```
DB_HOST=tu_host_bd
DB_PORT=5432
DB_NAME=tu_bd
DB_USER=tu_usuario
DB_PASS=contraseña_segura
FIREBASE_SA_B64=base64_de_las_credenciales_firebase
```
**Importante:** no subir `.env` al repositorio ni incluirlo en artefactos de entrega. Mantener únicamente `.env.example` sin secretos.

3. **Construir y arrancar los contenedores:**
```bash
docker-compose up --build -d
```

4. **Verificar que el sistema está operativo:**
```bash
docker-compose ps
# Debe mostrar los tres servicios con estado "running"
```

5. **Acceder a la aplicación:**
   - Frontend: `http://[IP_DEL_SERVIDOR]`
   - API Backend: `http://[IP_DEL_SERVIDOR]:8080`
   - Swagger UI: `http://[IP_DEL_SERVIDOR]:8080/swagger-ui.html`

## 14.2 Manual de usuario

### Registro e inicio de sesión

La aplicación soporta dos métodos de autenticación:

**Opción A — Google OAuth2 (recomendado):**
1. Acceder a la aplicación desde el navegador en `https://devnexus.es`.
2. En la página de inicio, hacer clic en el botón **"Empezar / Acceder"**.
3. Seleccionar **"Continuar con Google"** en el panel de autenticación.
4. Elegir la cuenta de Google en el popup que se abrirá.
5. Una vez autenticado, el sistema redirigirá automáticamente al Panel de Usuario.

**Opción B — Registro con email y contraseña:**
1. Acceder a la aplicación y hacer clic en **"Empezar / Acceder"**.
2. Seleccionar **"¿No tienes cuenta? Regístrate"** para cambiar al modo registro.
3. Introducir nombre completo, email y contraseña (mínimo 6 caracteres).
4. Confirmar el registro. El sistema creará la cuenta y pedirá iniciar sesión.
5. Introducir email y contraseña para acceder.

**Recuperación de contraseña:**
- En el panel de login, introducir el email registrado y pulsar **"¿Olvidaste tu contraseña?"**.
- Firebase enviará un correo de recuperación automáticamente.

*Nota: El primer acceso creará automáticamente una cuenta de usuario con rol USER.*

![Figura 32: Captura del botón de acceso en la landing page](img/1.png)

*Figura 32: Landing page — botón de acceso*

### Gestión del perfil

1. Acceder a **Mi Perfil** desde las pestañas del Panel de Usuario.
2. Editar los campos: nombre completo, especialidad técnica (Backend / Frontend / Full Stack).
3. Configurar las preferencias de contacto (permitir/no permitir que otros usuarios inicien conversaciones, con motivo opcional).
4. Los cambios se guardan automáticamente.

![Figura 33: Captura del perfil de usuario](img/16.png)

*Figura 33: Panel de Usuario — Mi Perfil*

### Uso del módulo de diarios

**Crear un nuevo diario:**
1. Acceder a **Diario** desde las pestañas del Panel de Usuario.
2. En la sección "Nuevo Repositorio / Proyecto", introducir el nombre y descripción del tema.
3. Crear una nueva entrada asociada al tema.
4. Escribir el contenido (soporta Markdown).
5. Seleccionar la visibilidad: Privada / Pendiente de revisión / Pública.
6. Guardar la entrada.

**Gráfico de actividad:** La sección de diario muestra un gráfico de contribuciones similar a GitHub, que refleja la actividad del usuario a lo largo del tiempo.

**Colaborar en un tema:**
1. En la sección de temas, pulsar el botón de invitar colaboradores.
2. Buscar al usuario por nombre o email.
3. Enviar la invitación. El usuario recibirá una notificación y podrá aceptar o rechazar.

**Exportar entradas del diario:**
1. Con un tema seleccionado, pulsar el botón **CSV** en la barra de acciones superior para descargar todos los datos estructurados.
2. Pulsar el botón **MD** para exportar las entradas como fichero Markdown, listo para usar con herramientas de IA, editores o sistemas de documentación.
- En Android (APK), ambas opciones abren el menú nativo del sistema para guardar o compartir el archivo.

**Transcripción de código con IA (Scan IA):**
1. Con un tema seleccionado, crear una nueva entrada y pulsar el botón **"Scan IA"** (icono de cámara) en la fila de plantillas.
2. En dispositivo móvil, se abre directamente la cámara trasera para fotografiar el código. En web, se abre el selector de archivos de imagen.
3. La imagen se envía al servidor, que llama al servicio de IA generativa (Groq Llama Vision) para extraer el texto del código.
4. El código transcrito se inserta automáticamente en el editor como bloque de código Markdown, listo para editar y guardar.
5. El botón muestra "Procesando..." mientras la IA trabaja y vuelve a su estado normal al finalizar.

> **Nota técnica:** La clave del servicio de IA reside únicamente en el servidor backend — no se expone al cliente en ningún momento.

**Code Review IA por entrada:**
1. En la lista de entradas, pulsar el botón ✨ en las acciones de cualquier nota.
2. El sistema envía el contenido al servicio de IA y muestra el análisis técnico directamente bajo la entrada, con secciones de calidad, mejoras y buenas prácticas.
3. Pulsar de nuevo el botón colapsa el panel de review.

**Sugerencia de etiquetas IA:**
1. En el formulario de nueva entrada, escribir el contenido y pulsar el botón **"Etiquetas IA"** (icono de etiquetas).
2. El sistema analiza el texto y muestra chips de etiquetas sugeridas bajo la fila de plantillas.
3. Hacer clic en un chip añade la etiqueta como `#tag` al final del texto.

**Resumen ejecutivo IA del proyecto:**
1. Con un tema seleccionado, pulsar el botón **"Resumen IA"** (icono de destellos) en la barra de acciones superior.
2. El sistema analiza hasta las últimas 30 entradas del tema y genera un resumen estructurado con: estado general, tecnologías detectadas, hitos, problemas resueltos y próximos pasos.
3. El resumen se muestra en un panel Markdown desplegable sobre las entradas. Pulsar "Ocultar" lo cierra.

![Figura 34: Captura del módulo de diario — vista de proyectos y gráfico de actividad](img/22.png)

*Figura 34: Panel de Usuario — Diario de progreso con listado de proyectos y gráfico de actividad heatmap*

![Figura 34a: IDE integrado — Editor Monaco con árbol de archivos](img/23.png)

*Figura 34a: IDE integrado — árbol de archivos navegable y editor Monaco con resaltado de sintaxis*

![Figura 34b: IDE integrado — Panel de Análisis IA](img/24.png)

*Figura 34b: IDE integrado — Panel lateral de herramientas IA (code review, etiquetas, resumen del proyecto)*

![Figura 34c: IDE integrado — Invitar colaborador](img/25.png)

*Figura 34c: IDE integrado — Modal para invitar colaboradores al proyecto*

![Figura 34d: IDE integrado — Historial de commits](img/26.png)

*Figura 34d: IDE integrado — Panel de historial de commits y entradas de diario*

![Figura 34e: IDE integrado — Feedback de staff](img/27.png)

*Figura 34e: IDE integrado — Sección de feedback de staff sobre el proyecto*

### Flujo de revisión de diarios (usuarios con rol STAFF)

Los usuarios con rol **STAFF** tienen acceso al panel de administración para revisar los proyectos de diario enviados a revisión por los usuarios.

**Proceso de revisión paso a paso:**

1. Acceder a la aplicación con una cuenta con rol STAFF o ADMIN.
2. En la barra de navegación inferior, pulsar el icono de **Panel de Administración** para ir a `/admin-profile`.
3. Navegar a la sección **"Revisión de Diarios"** (`admin-diarios`).
4. El panel muestra todos los proyectos con visibilidad `PENDIENTE` que esperan revisión.
5. Pulsar sobre un proyecto para abrirlo en **modo solo lectura** del IDE integrado.
6. Revisar las entradas del usuario, los archivos del IDE y el historial de commits.
7. Dejar comentarios de feedback detallados en la sección **"Comentarios del staff"** dentro de la vista del proyecto (comentarios privados, solo visibles para el staff y el propietario).
8. Tomar una decisión y cambiar la visibilidad del proyecto usando el selector de estado:
   - **Aprobar → `PUBLICA`:** el proyecto pasa a ser visible en el blog de la comunidad.
   - **Devolver a revisión → `PRIVADA`:** el proyecto vuelve al propietario con el feedback en los comentarios.
   - **Mantener en espera → `PENDIENTE`:** sin cambio, el proyecto sigue en cola de revisión.
9. El propietario del proyecto recibe automáticamente una **notificación push** (Firebase FCM) informando del cambio de estado.

> **Nota:** Todos los cambios de visibilidad quedan registrados automáticamente en el **log de auditoría** del sistema, con usuario responsable, timestamp y acción realizada (ver módulo de auditoría en el panel de administración).

### Uso del módulo de tickets

**Crear un ticket de soporte:**
1. Acceder a **Tickets** desde las pestañas del Panel de Usuario.
2. Pulsar **"Nuevo Ticket"**.
3. Completar el título y descripción. La prioridad se asigna por defecto como MEDIA.
4. Pulsar **"Enviar"**.

**Seguimiento de tickets:**
- La lista muestra los tickets organizados por pestañas: Activos, Historial, Todos.
- Al expandir un ticket se muestra el chat integrado para comunicarse con el staff.
- El estado del ticket se muestra con badges de color (ABIERTO, RESUELTO).

![Figura 35: Captura del centro de soporte con chat integrado](img/18.png)

*Figura 35: Panel de Usuario — Centro de Soporte con chat integrado*

### Uso de la mensajería

**Iniciar una conversación:**
1. Acceder a **Mensajes** desde las pestañas del Panel de Usuario.
2. Pulsar el botón **"+"** para nueva conversación.
3. Filtrar por departamento (Todos, Backend Developer, Frontend Developer) o buscar por nombre.
4. Seleccionar el usuario y empezar a escribir.

![Figura 36: Captura de la mensajería con filtro por departamento](img/19.png)

*Figura 36: Panel de Usuario — Mensajería con filtro por departamento*

### Uso del calendario de eventos

1. Acceder a **Eventos** desde las pestañas del Panel de Usuario.
2. El calendario Syncfusion muestra todos los eventos con vistas de Día, Semana, Mes y Agenda.
3. El panel lateral derecho muestra los "Próximos Eventos".
4. Para crear un evento: pulsar **"+"**, completar título, fecha, hora, visibilidad y descripción.

![Figura 37: Captura del calendario de eventos](img/21.png)

*Figura 37: Panel de Usuario — Agenda y Eventos (Calendario Syncfusion)*

### Centro de notificaciones

1. Acceder a **Avisos** desde las pestañas del Panel de Usuario.
2. Se muestra el número de notificaciones nuevas.
3. Cada notificación muestra el mensaje y la hora.
4. Pulsar **"Marcar todo leído"** para limpiar todas las alertas.

![Figura 38: Captura del centro de notificaciones](img/20.png)

*Figura 38: Panel de Usuario — Centro de Notificaciones*

### Chat flotante de soporte

En cualquier página de la aplicación, el botón flotante de chat (esquina inferior derecha) permite al usuario abrir una conversación directa con el equipo de soporte sin salir de la página actual.

### Blog de la comunidad — publicar y explorar proyectos

**Publicar un proyecto en el blog:**
1. Acceder a **Diario** desde las pestañas del Panel de Usuario.
2. En la tarjeta del proyecto, pulsar el botón de visibilidad (icono de globo).
3. Se abre el modal **"Publicar en el blog"** — introducir un **título de publicación** y una **descripción** para la comunidad. El nombre interno del proyecto no cambia.
4. Pulsar **"Publicar"**. El proyecto aparece inmediatamente en el blog público con los archivos del IDE visibles.
5. Para despublicarlo, pulsar de nuevo el icono de globo → el proyecto vuelve a ser privado.

![Figura 38a: Modal "Publicar en el blog" con título y descripción de publicación](img/28.png)

*Figura 38a: Modal de publicación — el nombre interno del proyecto no se modifica; el título y la descripción son exclusivos del blog*

**Explorar el blog:**
1. Acceder a **Blog** desde el menú lateral de la aplicación.
2. Los proyectos publicados por la comunidad aparecen como tarjetas con gradiente, título de publicación, descripción y autor.
3. Hacer clic en una tarjeta abre el modal del proyecto.

![Figura 38b: Blog — tarjetas de proyectos publicados por la comunidad](img/29.png)

*Figura 38b: Blog "Comunidad & Updates" — cada tarjeta muestra el título de publicación, la descripción y el autor del proyecto*

**Modal del proyecto en el blog:**
- La sección **"Archivos del proyecto"** muestra el código del IDE con resaltado de sintaxis y una etiqueta con el lenguaje detectado (HTML, CSS, JS, Kotlin, etc.).
- Si el proyecto contiene archivos web (`.html`, `.css`, `.js`), aparece el botón **"Preview"** para ejecutar el código en un sandbox en vivo.
- La sección **"Comentarios de la comunidad"** permite a cualquier usuario registrado dejar un comentario sobre el proyecto.

![Figura 38c: Modal de proyecto en el blog — código con syntax highlighting y comentarios de comunidad](img/30.png)

*Figura 38c: Modal del proyecto en el blog — archivos de código del IDE con syntax highlighting, botón de preview en vivo y sección de comentarios de la comunidad*

### Panel de administración (solo ADMIN y STAFF)

El panel de administración está accesible mediante `/admin-profile` y contiene 8 secciones:

| Sección | Funcionalidad |
|---|---|
| **Usuarios** | Lista completa con búsqueda, edición de rol/departamento, eliminación |
| **Chats-Servicio técnico** | Tickets activos con chat en vivo por ticket |
| **Tickets** | Gestión global con código, usuario, asunto, prioridad, estado y chat |
| **Mensajes** | Mensajería Pro administrativa |
| **Eventos** | Creación y gestión de eventos globales con filtros |
| **Diarios** | Revisión por usuario para mentoría y aprobación |
| **Auditoría** | Registro completo con nivel, acción, recurso, usuario, detalles y fecha |
| **Perfil** | Perfil del administrador |

![Figura 39: Panel de Administración — Gestión de Usuarios](img/6.png)

*Figura 39: Panel de Administración — Gestión de Usuarios*

![Figura 40: Panel de Administración — Chats-Servicio Técnico](img/8.png)

*Figura 40: Panel de Administración — Chats-Servicio Técnico*

![Figura 41: Panel de Administración — Gestión de Tickets](img/9.png)

*Figura 41: Panel de Administración — Gestión de Tickets*

![Figura 42: Panel de Administración — Mensajería Pro](img/10.png)

*Figura 42: Panel de Administración — Mensajería Pro*

![Figura 43: Panel de Administración — Gestión de Eventos](img/11.png)

*Figura 43: Panel de Administración — Gestión de Eventos*

![Figura 44: Panel de Administración — Gestión de Diarios](img/12.png)

*Figura 44: Panel de Administración — Gestión de Diarios*

![Figura 45: Panel de Administración — Registro de Auditoría](img/13.png)

*Figura 45: Panel de Administración — Registro de Auditoría*

![Figura 46: Panel de Administración — Perfil del Administrador](img/14.png)

*Figura 46: Panel de Administración — Perfil del Administrador*

---

# 15. CONCLUSIONES

## 15.1 Informe final

El proyecto DevNexus ha sido completado satisfactoriamente, alcanzando todos los objetivos definidos en la fase de planificación y superando en varios aspectos las expectativas iniciales. Se ha desarrollado una plataforma web full-stack completamente funcional que integra cinco módulos principales (diarios de progreso, tickets de soporte, mensajería, eventos y auditoría) con un sistema de roles diferenciado y una interfaz moderna con diseño profesional.

La aplicación ha sido desplegada en un entorno real mediante Docker Compose en el dominio `devnexus.es`, demostrando la capacidad para llevar un proyecto desde el análisis hasta la producción, cubriendo todas las fases del ciclo de vida del software.

## 15.2 Resultados obtenidos

- **Backend:** 16 controladores REST, 13 servicios de negocio, 17 entidades JPA, sistema de seguridad con Firebase JWT + Spring Security, auditoría con Spring AOP, migraciones con Flyway (V1–V4) y documentación completa con Swagger/OpenAPI.

- **Frontend:** Aplicación Angular 20 / Ionic 8 con 20+ páginas, componentes standalone con ChangeDetectionStrategy.OnPush, routing con guards, interceptor HTTP, integración con Firebase (Auth + FCM), calendario Syncfusion y diseño visual profesional con tema oscuro.

- **Base de datos:** Esquema PostgreSQL 17 normalizado (3FN) con 17 tablas, índices en campos críticos, integridad referencial, migraciones versionadas con Flyway y proxy de conexiones PgBouncer en modo transaction.

- **Despliegue:** Sistema containerizado con Docker Compose listo para producción, con Nginx sirviendo el frontend y Spring Boot el backend. Desplegado en producción en `devnexus.es`.

- **Calidad:** 100% de los requisitos funcionales implementados (29/29), 100% de las pruebas funcionales pasadas, pruebas unitarias automatizadas para servicios críticos.

## 15.3 Viabilidad del proyecto

**Técnicamente:** La arquitectura elegida (Spring Boot + Angular + PostgreSQL + Docker) es una combinación madura y ampliamente utilizada en la industria. Las tecnologías son estables, tienen soporte activo y una comunidad grande.

**Económicamente:** El coste de los servicios utilizados en la versión gratuita es cero:

| Servicio | Plan | Coste |
|---|---|---|
| Firebase (Auth + FCM) | Spark (gratuito) | 0 €/mes |
| Neon PostgreSQL | Free tier | 0 €/mes |
| GitHub | Free | 0 €/mes |
| **Total (desarrollo)** | | **0 €/mes** |

Para un entorno de producción real, el coste mensual estimado sería:

| Servicio | Coste estimado |
|---|---|
| VPS básico (2 vCores, 4 GB RAM) | 10–15 €/mes |
| PostgreSQL gestionado (Neon Basic) | 20 €/mes |
| Firebase | Gratuito para el volumen esperado |
| Dominio (.es) | ~10 €/año |
| **Total (producción)** | **~30–35 €/mes** |

**Operativamente:** El sistema requiere mantenimiento mínimo: actualizaciones de dependencias trimestrales y backups periódicos de la base de datos.

## 15.4 Mejoras futuras

1. **Sistema de archivos adjuntos:** Integrar almacenamiento (Firebase Storage o S3) para adjuntar documentos a diarios y tickets.

2. **Pipeline CI/CD:** Configurar GitHub Actions para automatizar build, tests y despliegue en cada push.

3. **Analítica y reportes:** Panel de estadísticas para administradores: tickets por período, usuarios activos, contenido más popular.

4. **Escalabilidad horizontal:** Migrar a microservicios y Kubernetes para soportar mayor carga.

5. **Búsqueda full-text:** Integrar Elasticsearch para búsqueda avanzada en diarios, tickets y mensajes.

6. **Sistema de gamificación:** Badges y logros por contribuciones al diario y participación en la comunidad.

7. **Expansión de la IA generativa:** Ampliar las capacidades de Groq ya integradas hacia detección de duplicados en tickets, generación de changelogs automáticos y asistente de código contextual por proyecto.

---

# 16. ANEXOS

## Anexo A: Diagrama Entidad–Relación completo

### Tabla: usuario
| Campo | Tipo | Restricciones |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| firebase_uid | VARCHAR(255) | UNIQUE, NOT NULL, INDEX |
| email | VARCHAR(255) | UNIQUE, NOT NULL, INDEX |
| nombre | VARCHAR(255) | NOT NULL |
| biografia | TEXT | NULLABLE |
| foto_perfil | VARCHAR(500) | NULLABLE |
| rol_id | BIGINT | FK → rol(id), NOT NULL |
| departamento_id | BIGINT | FK → departamento(id), NULLABLE |
| fcm_token | VARCHAR(500) | NULLABLE |
| permite_contacto | BOOLEAN | DEFAULT TRUE |
| motivo_no_contacto | TEXT | NULLABLE |
| fecha_creacion | TIMESTAMP | NOT NULL |

### Tabla: rol
| Campo | Tipo | Restricciones |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| nombre | VARCHAR(50) | UNIQUE, NOT NULL (USER / STAFF / ADMIN) |

### Tabla: departamento
| Campo | Tipo | Restricciones |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| nombre | VARCHAR(255) | NOT NULL |

### Tabla: diario
| Campo | Tipo | Restricciones |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| contenido | TEXT | NOT NULL |
| fecha_creacion | TIMESTAMP | NOT NULL |
| visibilidad | VARCHAR(20) | NOT NULL (PRIVADO / PENDIENTE / PUBLICO) |
| usuario_id | BIGINT | FK → usuario(id), NOT NULL, INDEX |
| tema_id | BIGINT | FK → diario_tema(id), NULLABLE |
| revisado_por | BIGINT | FK → usuario(id), NULLABLE |
| revision_comentario | TEXT | NULLABLE |
| revision_en | TIMESTAMP | NULLABLE |

### Tabla: diario_tema
| Campo | Tipo | Restricciones |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| titulo | VARCHAR(255) | NOT NULL |
| descripcion | TEXT | NULLABLE |
| usuario_id | BIGINT | FK → usuario(id), NOT NULL, INDEX |

### Tabla: diario_colaboracion
| Campo | Tipo | Restricciones |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| tema_id | BIGINT | FK → diario_tema(id), NOT NULL |
| usuario_id | BIGINT | FK → usuario(id), NOT NULL |
| estado | VARCHAR(20) | NOT NULL (PENDIENTE / ACEPTADA / RECHAZADA) |
| fecha_invitacion | TIMESTAMP | NOT NULL |

### Tabla: diario_comentario
| Campo | Tipo | Restricciones |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| diario_id | BIGINT | FK → diario(id), NOT NULL |
| autor_id | BIGINT | FK → usuario(id), NOT NULL |
| texto | TEXT | NOT NULL |
| fecha | TIMESTAMP | NOT NULL |

### Tabla: ticket
| Campo | Tipo | Restricciones |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| titulo | VARCHAR(255) | NOT NULL |
| descripcion | TEXT | NOT NULL |
| estado | VARCHAR(20) | NOT NULL (ABIERTO / EN_PROGRESO / RESUELTO) |
| prioridad | VARCHAR(10) | NOT NULL (ALTA / MEDIA / BAJA) |
| usuario_id | BIGINT | FK → usuario(id), NOT NULL |
| fecha_creacion | TIMESTAMP | NOT NULL |

### Tabla: ticket_comentario
| Campo | Tipo | Restricciones |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| ticket_id | BIGINT | FK → ticket(id), NOT NULL |
| usuario_id | BIGINT | FK → usuario(id), NOT NULL |
| texto | TEXT | NOT NULL |
| fecha_envio | TIMESTAMP | NOT NULL |

### Tabla: ticket_historico
| Campo | Tipo | Restricciones |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| ticket_id | BIGINT | FK → ticket(id), NOT NULL |
| estado_anterior | VARCHAR(20) | NOT NULL |
| estado_nuevo | VARCHAR(20) | NOT NULL |
| usuario_id | BIGINT | FK → usuario(id), NOT NULL |
| comentario | TEXT | NULLABLE |
| fecha | TIMESTAMP | NOT NULL |

### Tabla: conversacion
| Campo | Tipo | Restricciones |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| titulo | VARCHAR(255) | NULLABLE |
| tipo | VARCHAR(20) | NOT NULL (individual / grupal) |
| creado_por | BIGINT | FK → usuario(id), NOT NULL, INDEX |
| fecha_creacion | TIMESTAMP | NOT NULL |

### Tabla: conversacion_participante
| Campo | Tipo | Restricciones |
|---|---|---|
| conversacion_id | BIGINT | FK → conversacion(id), PK compuesta |
| usuario_id | BIGINT | FK → usuario(id), PK compuesta |
| fecha_entrada | TIMESTAMP | NOT NULL |
| fecha_salida | TIMESTAMP | NULLABLE |

### Tabla: mensaje
| Campo | Tipo | Restricciones |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| conversacion_id | BIGINT | FK → conversacion(id), NOT NULL, INDEX |
| autor_id | BIGINT | FK → usuario(id), NOT NULL, INDEX |
| texto | TEXT | NOT NULL |
| fecha_envio | TIMESTAMP | NOT NULL, INDEX |
| leido_en | TIMESTAMP | NULLABLE |

### Tabla: evento
| Campo | Tipo | Restricciones |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| titulo | VARCHAR(255) | NOT NULL |
| descripcion | TEXT | NULLABLE |
| fecha_evento | DATE | NOT NULL |
| hora_evento | TIME | NULLABLE |
| visibilidad | VARCHAR(20) | NOT NULL (PRIVADO / PUBLICO) |
| usuario_id | BIGINT | FK → usuario(id), NOT NULL |

### Tabla: notificacion
| Campo | Tipo | Restricciones |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| usuario_id | BIGINT | FK → usuario(id), NOT NULL |
| mensaje | TEXT | NOT NULL |
| fecha | TIMESTAMP | NOT NULL |
| leida | BOOLEAN | DEFAULT FALSE |

### Tabla: auditoria
| Campo | Tipo | Restricciones |
|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT |
| accion | VARCHAR(50) | NOT NULL (LOGIN / CREAR / ELIMINAR / etc.) |
| recurso | VARCHAR(50) | NOT NULL (Usuario / Ticket / Evento / etc.) |
| descripcion | TEXT | NULLABLE |
| severidad | VARCHAR(20) | NOT NULL (INFO / WARNING / DANGER) |
| fecha | TIMESTAMP | NOT NULL |
| usuario_id | BIGINT | FK → usuario(id), NULLABLE |
| usuario_email | VARCHAR(255) | NULLABLE |

## Anexo B: Descripción detallada de la API REST

### Autenticación
| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | /api/auth/google | NO | Login/registro con token Firebase |

### Usuarios
| Método | Endpoint | Auth | Roles | Descripción |
|---|---|---|---|---|
| GET | /api/usuarios | JWT | ADMIN | Listar todos los usuarios |
| GET | /api/usuarios/{id} | JWT | ADMIN | Obtener usuario por ID |
| GET | /api/usuarios/perfil | JWT | ANY | Obtener perfil propio |
| GET | /api/usuarios/departamentos | JWT | ANY | Listar departamentos |
| GET | /api/usuarios/buscar | JWT | ANY | Buscar usuarios por nombre/email |
| POST | /api/usuarios/registro | JWT | ANY | Registrar usuario |
| PUT | /api/usuarios/perfil | JWT | ANY | Actualizar perfil propio |
| PUT | /api/usuarios/{id} | JWT | ADMIN | Actualizar usuario (admin) |
| DELETE | /api/usuarios/perfil | JWT | ANY | Eliminar cuenta propia |
| DELETE | /api/usuarios/{id} | JWT | ADMIN | Eliminar usuario (admin) |

### Roles
| Método | Endpoint | Auth | Roles | Descripción |
|---|---|---|---|---|
| GET | /api/roles | JWT | ADMIN | Listar todos los roles |

### Departamentos
| Método | Endpoint | Auth | Roles | Descripción |
|---|---|---|---|---|
| GET | /api/departamentos | JWT | ANY | Listar departamentos |
| POST | /api/departamentos | JWT | ADMIN | Crear departamento |
| DELETE | /api/departamentos/{id} | JWT | ADMIN | Eliminar departamento |

### Diarios
| Método | Endpoint | Auth | Roles | Descripción |
|---|---|---|---|---|
| GET | /api/diarios | JWT | ANY | Listar diarios visibles |
| GET | /api/diarios/mis-diarios | JWT | ANY | Mis diarios |
| GET | /api/diarios/publicos | JWT | ANY | Diarios públicos |
| GET | /api/diarios/{id} | JWT | ANY | Ver diario (con control de acceso) |
| GET | /api/diarios/{id}/comentarios | JWT | ANY | Comentarios del diario |
| GET | /api/diarios/tema/{temaId}/export.csv | JWT | ANY | Exportar diarios del tema en CSV |
| GET | /api/diarios/usuario/{userId} | JWT | STAFF, ADMIN | Diarios de un usuario |
| POST | /api/diarios | JWT | ANY | Crear diario |
| POST | /api/diarios/{id}/comentarios | JWT | ANY | Añadir comentario |
| PUT | /api/diarios/{id} | JWT | ANY | Actualizar diario propio |
| PUT | /api/diarios/{id}/revisar | JWT | STAFF, ADMIN | Aprobar o rechazar entrada pendiente de revisión |
| DELETE | /api/diarios/{id} | JWT | ANY | Eliminar diario propio |

### Visión IA
| Método | Endpoint | Auth | Roles | Descripción |
|---|---|---|---|---|
| POST | /api/vision/extraer-codigo | JWT | ANY | Extraer código de imagen con IA (Groq Llama Vision) |

**Request:** `{ "imageBase64": "string (Base64)", "mimeType": "image/jpeg" }`  
**Response:** `{ "texto": "string" }`

### IA de Diario
| Método | Endpoint | Auth | Roles | Descripción |
|---|---|---|---|---|
| POST | /api/diario-ai/code-review/{diarioId} | JWT | ANY | Code review IA de una entrada |
| POST | /api/diario-ai/sugerir-etiquetas | JWT | ANY | Sugerir etiquetas para un texto |
| POST | /api/diario-ai/resumir-tema/{temaId} | JWT | ANY | Resumen ejecutivo del proyecto |

**Modelo:** `llama-3.3-70b-versatile` (Groq, texto). La clave `GROQ_API_KEY` reside exclusivamente en el servidor.

### Temas de diario
| Método | Endpoint | Auth | Roles | Descripción |
|---|---|---|---|---|
| GET | /api/diario-temas | JWT | ANY | Listar temas propios |
| GET | /api/diario-temas/usuario/{userId} | JWT | STAFF, ADMIN | Listar temas de un usuario específico |
| POST | /api/diario-temas | JWT | ANY | Crear tema |
| PUT | /api/diario-temas/{id} | JWT | ANY | Actualizar tema |
| DELETE | /api/diario-temas/{id} | JWT | ANY | Eliminar tema |

### Comentarios de tema de diario (feedback de proyecto)
| Método | Endpoint | Auth | Roles | Descripción |
|---|---|---|---|---|
| GET | /api/diario-tema-comentarios/tema/{temaId} | JWT | ANY | Obtener comentarios de feedback de un tema |
| POST | /api/diario-tema-comentarios | JWT | STAFF, ADMIN | Añadir comentario de feedback sobre un tema |
| DELETE | /api/diario-tema-comentarios/{id} | JWT | STAFF, ADMIN | Eliminar comentario de feedback |

### Tickets
| Método | Endpoint | Auth | Roles | Descripción |
|---|---|---|---|---|
| GET | /api/tickets | JWT | STAFF, ADMIN | Listar todos los tickets |
| GET | /api/tickets/mis-tickets | JWT | ANY | Mis tickets |
| POST | /api/tickets | JWT | ANY | Crear ticket |
| PATCH | /api/tickets/{id} | JWT | ADMIN | Actualizar ticket (admin) |
| PUT | /api/tickets/{id}/estado | JWT | STAFF, ADMIN | Cambiar estado del ticket |

### Comentarios de tickets
| Método | Endpoint | Auth | Roles | Descripción |
|---|---|---|---|---|
| GET | /api/ticket-comentarios/ticket/{id} | JWT | ANY | Comentarios de un ticket |
| POST | /api/ticket-comentarios | JWT | ANY | Añadir comentario a ticket |

### Historial de tickets
| Método | Endpoint | Auth | Roles | Descripción |
|---|---|---|---|---|
| GET | /api/ticket-historico/ticket/{id} | JWT | ANY | Historial de un ticket |

### Conversaciones
| Método | Endpoint | Auth | Roles | Descripción |
|---|---|---|---|---|
| GET | /api/conversaciones | JWT | ANY | Mis conversaciones |
| POST | /api/conversaciones | JWT | ANY | Crear conversación |
| DELETE | /api/conversaciones/{id} | JWT | ANY | Eliminar conversación |

### Participantes de conversación
| Método | Endpoint | Auth | Roles | Descripción |
|---|---|---|---|---|
| POST | /api/conversacion-participantes | JWT | ANY | Añadir participante |
| DELETE | /api/conversacion-participantes | JWT | ANY | Eliminar participante |

### Mensajes
| Método | Endpoint | Auth | Roles | Descripción |
|---|---|---|---|---|
| GET | /api/mensajes/conversacion/{id} | JWT | ANY | Mensajes de conversación |
| POST | /api/mensajes | JWT | ANY | Enviar mensaje |
| PUT | /api/mensajes/leer-todo/{id} | JWT | ANY | Marcar todos como leídos |

### Eventos
| Método | Endpoint | Auth | Roles | Descripción |
|---|---|---|---|---|
| GET | /api/eventos | JWT | ANY | Listar eventos visibles |
| GET | /api/eventos/todos | JWT | ADMIN | Listar todos los eventos |
| POST | /api/eventos | JWT | ANY | Crear evento |
| DELETE | /api/eventos/{id} | JWT | ANY | Eliminar evento propio |

### Notificaciones
| Método | Endpoint | Auth | Roles | Descripción |
|---|---|---|---|---|
| GET | /api/notificaciones | JWT | ANY | Mis notificaciones |
| PUT | /api/notificaciones/{id}/leer | JWT | ANY | Marcar como leída |
| DELETE | /api/notificaciones/{id} | JWT | ANY | Eliminar notificación |

### Auditoría
| Método | Endpoint | Auth | Roles | Descripción |
|---|---|---|---|---|
| GET | /api/auditorias | JWT | ADMIN | Listar registros de auditoría |
| GET | /api/auditorias/{id} | JWT | ADMIN | Ver registro de auditoría |

## Anexo C: Casos de prueba detallados

### CP-001: Autenticación correcta con Google
- **Precondición:** Cuenta de Google válida disponible
- **Entrada:** Token JWT válido de Firebase
- **Resultado esperado:** HTTP 200 + datos del usuario (o creación si es nuevo)
- **Resultado obtenido:** HTTP 200 ✅

### CP-002: Acceso a endpoint protegido sin token
- **Precondición:** Ninguna
- **Entrada:** GET /api/usuarios/perfil sin cabecera Authorization
- **Resultado esperado:** HTTP 401 Unauthorized
- **Resultado obtenido:** HTTP 401 ✅

### CP-003: Acceso a funcionalidad de admin con rol USER
- **Precondición:** Usuario autenticado con rol USER
- **Entrada:** GET /api/auditorias con token JWT de usuario USER
- **Resultado esperado:** HTTP 403 Forbidden
- **Resultado obtenido:** HTTP 403 ✅

### CP-004: Crear ticket con campos válidos
- **Precondición:** Usuario autenticado
- **Entrada:** POST /api/tickets con `{"titulo": "Error en login", "descripcion": "No puedo acceder", "prioridad": "ALTA"}`
- **Resultado esperado:** HTTP 201 Created + ticket creado
- **Resultado obtenido:** HTTP 201 ✅

### CP-005: Crear ticket con campos vacíos
- **Precondición:** Usuario autenticado
- **Entrada:** POST /api/tickets con `{"titulo": "", "descripcion": ""}`
- **Resultado esperado:** HTTP 400 Bad Request
- **Resultado obtenido:** HTTP 400 ✅

### CP-006: Acceder a diario privado ajeno
- **Precondición:** Usuario A autenticado; diario privado creado por Usuario B
- **Entrada:** GET /api/diarios/{id_diario_de_B} con token de A
- **Resultado esperado:** HTTP 403 Forbidden
- **Resultado obtenido:** HTTP 403 ✅

### CP-007: Flujo completo de ticket (crear → resolver)
- **Precondición:** Usuario USER y usuario ADMIN autenticados
- **Paso 1:** USER crea ticket → Estado: ABIERTO ✅
- **Paso 2:** ADMIN cambia estado a EN_PROGRESO → Historial registrado ✅
- **Paso 3:** ADMIN cambia estado a RESUELTO → Notificación enviada a USER ✅
- **Resultado:** Ciclo de vida completo funcionando ✅

### CP-008: Envío de mensaje y lectura
- **Precondición:** Dos usuarios autenticados con conversación activa
- **Paso 1:** Usuario A envía mensaje → aparece en conversación ✅
- **Paso 2:** Usuario B consulta mensajes → mensaje visible ✅
- **Paso 3:** Usuario B marca como leído → leido_en se actualiza ✅

### CP-009: Creación de evento con visibilidad
- **Precondición:** Usuario autenticado
- **Paso 1:** Crear evento PUBLICO → visible para todos ✅
- **Paso 2:** Crear evento PRIVADO → visible solo para el creador ✅

### CP-010: Registro de auditoría automático
- **Precondición:** Usuario ADMIN autenticado
- **Paso 1:** Realizar acción (crear ticket) ✅
- **Paso 2:** Consultar /api/auditorias → acción registrada con actor, recurso, descripción, severidad y fecha ✅

---

## Anexo D: Configuración técnica de PgBouncer

### D.1 ¿Qué es PgBouncer y por qué lo necesita DevNexus?

PostgreSQL gestiona cada conexión de cliente como un proceso del sistema operativo independiente. Esto tiene un coste real: en sistemas con alta concurrencia, abrir miles de conexiones directas a PostgreSQL consume RAM, descriptores de archivo y tiempo de CPU en el handshake TCP+autenticación, degradando el rendimiento incluso antes de ejecutar una sola consulta.

**PgBouncer** es un proxy ligero de conexiones para PostgreSQL. Se sitúa entre la aplicación (Spring Boot) y la base de datos, manteniendo un número pequeño y fijo de conexiones abiertas a PostgreSQL mientras sirve a miles de clientes simultáneos.

```
                     ┌────────────────────────────────────────────┐
Cliente 1 ─────────▶│                                            │
Cliente 2 ─────────▶│  PgBouncer                                 │──▶ PostgreSQL 17
...                  │  max_client_conn = 10.000                  │    (20 conexiones)
Cliente 10.000 ─────▶│  default_pool_size = 20                    │
                     └────────────────────────────────────────────┘
```

Sin PgBouncer, 10.000 clientes simultáneos implicarían 10.000 procesos activos en PostgreSQL. Con PgBouncer, PostgreSQL nunca recibe más de 25 conexiones activas, independientemente de la carga.

### D.2 Modo de operación: `transaction` vs `session` vs `statement`

PgBouncer ofrece tres modos de pool:

| Modo | Comportamiento | Cuándo usarlo |
|---|---|---|
| `session` | La conexión del pool se asigna al cliente durante toda su sesión. Se libera al desconectar. | Aplicaciones con variables de sesión, cursores nombrados o `LISTEN/NOTIFY`. |
| `transaction` | La conexión vuelve al pool tras cada transacción completa. | **La mayoría de aplicaciones web. Máxima eficiencia.** |
| `statement` | La conexión vuelve al pool tras cada consulta individual. | Solo aplicaciones sin transacciones multi-query. |

**DevNexus usa `transaction` mode** porque es el modo óptimo para Spring Boot + Hibernate: cada petición HTTP abre una transacción `@Transactional`, ejecuta sus queries y la cierra. Entre transacciones, la conexión queda libre para otros clientes, maximizando la reutilización del pool.

#### Integración con Hibernate

La integración de PgBouncer con Hibernate se configura mediante el parámetro `prepareThreshold=0` en la URL JDBC. Esto hace que Hibernate use el extended query protocol sin prepared statements con nombre en el servidor, plenamente compatible con `transaction` mode y con el modelo de reutilización de conexiones de PgBouncer.

```
SPRING_DATASOURCE_URL=jdbc:postgresql://tfgdevnexus-pgbouncer-bpkf6a:5432/postgres?prepareThreshold=0
```

### D.3 Autenticación: `scram-sha-256`

PgBouncer está configurado con `AUTH_TYPE=scram-sha-256`, el protocolo de autenticación estándar de PostgreSQL 17. A diferencia de MD5, `scram-sha-256` implementa un protocolo de desafío-respuesta que protege las credenciales sin transmitir la contraseña en texto plano ni en forma de hash estático, garantizando la integridad de la autenticación en ambos extremos del proxy: entre la aplicación y PgBouncer, y entre PgBouncer y PostgreSQL.

### D.4 Configuración completa del contenedor en Dokploy

PgBouncer se despliega como un **servicio Docker independiente** en Dokploy, usando la imagen pública `edoburu/pgbouncer`. No requiere modificaciones en los archivos del proyecto ni acceso SSH directo al VPS — toda la configuración se declara mediante variables de entorno en la interfaz de Dokploy.

#### Variables de entorno del servicio PgBouncer

| Variable | Valor | Descripción |
|---|---|---|
| `DB_HOST` | `<host_postgres_interno>` | Hostname interno de PostgreSQL en la red de Dokploy |
| `DB_PORT` | `5432` | Puerto estándar de PostgreSQL |
| `DB_NAME` | `postgres` | Nombre de la base de datos objetivo |
| `DB_USER` | `<usuario_postgres>` | Usuario con permisos de conexión a PostgreSQL |
| `DB_PASSWORD` | `<contraseña>` | Contraseña del usuario de PostgreSQL |
| `POOL_MODE` | `transaction` | Modo de pool: conexión liberada tras cada transacción |
| `MAX_CLIENT_CONN` | `10000` | Máximo de conexiones cliente simultáneas admitidas |
| `DEFAULT_POOL_SIZE` | `20` | Conexiones permanentes mantenidas hacia PostgreSQL |
| `AUTH_TYPE` | `scram-sha-256` | Método de autenticación (obligatorio con PostgreSQL 17) |
| `SERVER_RESET_QUERY` | `DISCARD ALL` | Limpia el estado de sesión al devolver la conexión al pool |

#### ¿Por qué `SERVER_RESET_QUERY=DISCARD ALL`?

En `transaction` mode, una conexión puede haber sido usada previamente por un cliente que dejó variables de sesión activas (`SET search_path`, tablas temporales, configuraciones locales). `DISCARD ALL` garantiza que cada transacción nueva empieza con un estado de sesión limpio, evitando filtraciones de estado entre peticiones de distintos usuarios.

### D.5 Capacidad y métricas de escalabilidad

| Métrica | Valor | Observación |
|---|---|---|
| Conexiones permanentes a PostgreSQL | 20 | PostgreSQL nunca ve más de 25 conexiones activas |
| Conexiones cliente máximas | 10.000 | Soportadas concurrentemente por PgBouncer |
| Throughput teórico | ~2.000 queries/s | Con latencia media de 10 ms por query |
| Overhead por cliente adicional | ~1–2 KB RAM | PgBouncer guarda solo el estado del socket cliente, no una conexión de BD |

Esta arquitectura permite **escalar el backend horizontalmente** (añadiendo más réplicas del contenedor Spring Boot) sin incrementar la carga sobre PostgreSQL, ya que todas las instancias comparten el mismo pool de conexiones a través de PgBouncer.

### D.6 Flujo completo de una petición HTTP

```
Usuario (navegador)
       │
       ▼ HTTPS
  Dokploy (proxy inverso + SSL)
       │
       ▼ HTTP interno
  Spring Boot :8080
       │
  HikariCP (pool local — conexiones hacia PgBouncer)
       │
       ▼ TCP :5432
  PgBouncer  ←─── max_client_conn = 10.000
       │
  pool de 20 conexiones estáticas
       │
       ▼ TCP :5432
  PostgreSQL 17
```

Secuencia de una petición:

1. El usuario hace una petición HTTP → Dokploy la enruta al contenedor Spring Boot.
2. Spring Boot abre una transacción `@Transactional` → HikariCP toma una conexión de su pool interno (que apunta a PgBouncer).
3. PgBouncer asigna una de sus 20 conexiones a PostgreSQL para ejecutar las queries.
4. Al cerrar la transacción, PgBouncer ejecuta `DISCARD ALL` y devuelve la conexión al pool.
5. Si los 20 slots están temporalmente ocupados, las peticiones esperan en la cola de PgBouncer — no en PostgreSQL.

### D.7 Verificación del funcionamiento en producción

El correcto arranque del sistema integrado con PgBouncer se confirma en los logs del contenedor backend:

```
HikariPool-1 - Start completed.
Flyway Community Edition will be used.
Database: jdbc:postgresql://tfgdevnexus-pgbouncer-bpkf6a:5432/postgres (PostgreSQL 17.x)
Successfully validated X migrations.
Successfully applied X migrations.
```

---

# 17. ÍNDICE DE TABLAS E IMÁGENES

## Tablas

| Nº | Tabla | Sección |
|---|---|---|
| 1 | Análisis comparativo de aplicaciones similares | §3.2 |
| 2 | Requisitos funcionales — Gestión de usuarios | §7.1 |
| 3 | Requisitos funcionales — Sistema de diarios | §7.1 |
| 4 | Requisitos funcionales — Sistema de tickets | §7.1 |
| 5 | Requisitos funcionales — Mensajería | §7.1 |
| 6 | Requisitos funcionales — Eventos | §7.1 |
| 7 | Requisitos funcionales — Notificaciones | §7.1 |
| 8 | Requisitos funcionales — Auditoría | §7.1 |
| 9 | Requisitos técnicos — Backend | §7.2 |
| 10 | Requisitos técnicos — Base de datos | §7.2 |
| 11 | Requisitos técnicos — Frontend | §7.2 |
| 12 | Requisitos técnicos — Despliegue | §7.2 |
| 13 | Requisitos legales — RGPD | §7.3 |
| 14 | Cronograma del proyecto | §8.2 |
| 15 | Recursos técnicos — Software | §8.3 |
| 16 | Recursos técnicos — Servicios en la nube | §8.3 |
| 17 | Identificación y evaluación de riesgos | §9.1 |
| 18 | Plan de mitigación de riesgos | §9.3 |
| 19 | Stack tecnológico completo | §10.2 |
| 20 | Relaciones del modelo E-R | §10.3 |
| 21 | Secciones del panel de administración | §14.2 |
| 22 | Pruebas funcionales del backend | §12.2 |
| 23 | Pruebas de integración | §12.2 |
| 24 | Pruebas de validación | §12.2 |
| 25 | Pruebas unitarias | §12.2 |
| 26 | Indicadores de calidad | §12.3 |
| 27 | Componentes de distribución Docker | §13.1 |
| 28 | Viabilidad económica — Desarrollo | §15.3 |
| 29 | Viabilidad económica — Producción | §15.3 |
| 30–45 | Tablas del modelo de datos (17 entidades) | Anexo A |
| 46–56 | Tablas de endpoints de la API REST | Anexo B |

## Imágenes y figuras

| Nº | Descripción | Sección |
|---|---|---|
| 1 | Diagrama de roles y permisos del sistema | §4.3 |
| 2 | Diagrama de Gantt del proyecto | §8.2 |
| 3 | Landing page — Sección hero | §10.1 |
| 4 | Landing page — Características | §10.1 |
| 5 | Página "Sobre la comunidad" | §10.1 |
| 6 | Página de Contacto | §10.1 |
| 7 | Página FAQ / Ayuda | §10.1 |
| 8 | Panel de Usuario — Mi Perfil | §10.1 |
| 9 | Panel de Usuario — Diario (vista de proyectos) | §10.1 |
| 9a | IDE integrado — Editor Monaco con árbol de archivos | §10.1 |
| 9b | IDE integrado — Panel de Análisis IA | §10.1 |
| 9c | IDE integrado — Invitar colaborador | §10.1 |
| 9d | IDE integrado — Historial de commits | §10.1 |
| 9e | IDE integrado — Feedback de staff | §10.1 |
| 10 | Panel de Usuario — Tickets | §10.1 |
| 11 | Panel de Usuario — Mensajería | §10.1 |
| 12 | Panel de Usuario — Notificaciones | §10.1 |
| 13 | Panel de Usuario — Calendario | §10.1 |
| 14 | Panel de Administración — Usuarios | §10.1 |
| 15 | Panel de Administración — Editar usuario | §10.1 |
| 16 | Panel de Administración — Servicio técnico | §10.1 |
| 17 | Panel de Administración — Tickets | §10.1 |
| 18 | Panel de Administración — Mensajería Pro | §10.1 |
| 19 | Panel de Administración — Crear evento | §10.1 |
| 20 | Panel de Administración — Diarios | §10.1 |
| 21 | Panel de Administración — Auditoría | §10.1 |
| 22 | Panel de Administración — Perfil | §10.1 |
| 23 | Blog — Tarjetas de proyectos publicados | §10.1 |
| 23a | Blog — Modal de publicación (título y descripción) | §10.1 |
| 23b | Blog — Modal de proyecto con código y comentarios | §10.1 |
| 24 | Diagrama de arquitectura global | §10.2 |
| 25 | Diagrama de Casos de Uso UML | §10.3 |
| 26 | Diagrama de secuencia — Autenticación | §10.3 |
| 27 | Diagrama de secuencia — Creación de ticket | §10.3 |
| 28 | Diagrama de flujo — Ciclo de vida del ticket | §10.3 |
| 29 | Diagrama de componentes | §10.3 |
| 30 | Diagrama de despliegue UML | §10.3 |
| 31 | Diagrama Entidad-Relación completo | §10.3 |
| 32–38 | Capturas del manual de usuario | §14.2 |
| 39–46 | Capturas del panel de administración | §14.2 |

---

# 18. BIBLIOGRAFÍA Y REFERENCIAS

## Documentación oficial

- **Spring Boot Documentation** (3.5.x). Pivotal/VMware. https://docs.spring.io/spring-boot/docs/current/reference/html/

- **Spring Security Reference** (6.x). Spring Framework. https://docs.spring.io/spring-security/reference/

- **Spring Data JPA Reference**. Spring Framework. https://docs.spring.io/spring-data/jpa/reference/

- **Kotlin Documentation**. JetBrains. https://kotlinlang.org/docs/home.html

- **Angular Documentation** (v20). Google. https://angular.dev/

- **Ionic Framework Documentation** (v8). Ionic Team. https://ionicframework.com/docs

- **Capacitor Documentation** (v7). Ionic Team. https://capacitorjs.com/docs

- **Firebase Documentation** — Authentication & Cloud Messaging. Google. https://firebase.google.com/docs

- **PostgreSQL Documentation** (16). The PostgreSQL Global Development Group. https://www.postgresql.org/docs/16/

- **Flyway Documentation**. Red Gate. https://documentation.red-gate.com/flyway

- **Docker Documentation**. Docker Inc. https://docs.docker.com/

- **Docker Compose Reference**. Docker Inc. https://docs.docker.com/compose/

- **SpringDoc OpenAPI Documentation**. https://springdoc.org/

- **Syncfusion EJ2 Angular Schedule**. Syncfusion. https://ej2.syncfusion.com/angular/documentation/schedule/

- **Nginx Documentation**. F5 Inc. https://nginx.org/en/docs/

## Libros y recursos técnicos

- Craig Walls. *Spring in Action* (6ª edición). Manning Publications, 2022.

- Venkat Subramaniam. *Programming Kotlin*. Pragmatic Bookshelf, 2019.

- Sam Newman. *Building Microservices* (2ª edición). O'Reilly Media, 2021.

- Roy T. Fielding. *Architectural Styles and the Design of Network-based Software Architectures*. Doctoral dissertation, UC Irvine, 2000.

- Robert C. Martin. *Clean Architecture*. Prentice Hall, 2017.

## Artículos y recursos en línea

- Baeldung. *Spring Security with JWT*. https://www.baeldung.com/spring-security-oauth-jwt

- Auth0. *Introduction to JSON Web Tokens*. https://jwt.io/introduction

- Mozilla Developer Network. *Progressive Web Apps*. https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps

- OWASP. *Top Ten Web Application Security Risks*. https://owasp.org/www-project-top-ten/

## Normativa

- Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo (RGPD). https://www.boe.es/doue/2016/119/L00001-00088.pdf

- Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD). https://www.boe.es/eli/es/lo/2018/12/05/3

- Web Content Accessibility Guidelines (WCAG) 2.1. W3C. https://www.w3.org/TR/WCAG21/
