# Guión de Defensa — DevNexus TFG
### IES Rafael Alberti · DAM 2º · Jesús Alfonso Pedreño Domínguez

> **Tiempo total estimado: 20–25 minutos de exposición + 10–15 de preguntas**
> Preparación antes de entrar: app abierta en devnexus.es, sesión iniciada como ADMIN en una pestaña, sesión de USER en modo incógnito en otra.

---

## 🎯 Estructura general

| Bloque | Contenido | Tiempo |
|--------|-----------|--------|
| 1 | Presentación: qué problema resuelve y por qué | 2 min |
| 2 | Arquitectura técnica (el "cómo") | 3 min |
| 3 | Demo en vivo — módulo por módulo | 12 min |
| 4 | Testing, calidad y despliegue | 3 min |
| 5 | Cierre personal | 1 min |
| — | Preguntas del tribunal | 10–15 min |

---

## BLOQUE 1 — El problema y la solución (2 min)

### Qué decir:

> *"Buenos días. Mi TFG se llama DevNexus, y nació de observar un problema real:
> los equipos de desarrolladores junior usan Notion para documentar, Slack para comunicarse,
> Jira para incidencias y Google Calendar para eventos — cuatro herramientas distintas,
> cuatro logins distintos, cero trazabilidad entre ellas.*
>
> *DevNexus unifica todo eso en una sola plataforma: diarios de progreso colaborativos,
> sistema de tickets, mensajería interna, calendario de eventos y notificaciones push.
> Todo con roles diferenciados (USER, STAFF, ADMIN), auditoría automática de cada acción
> y despliegue real en producción en devnexus.es."*

### Qué mostrar:
- La **landing page** de devnexus.es con el vídeo hero de fondo
- El botón "Empezar / Acceder" visible sin hacer click todavía

---

## BLOQUE 2 — Arquitectura técnica (3 min)

### Qué decir:

> *"La arquitectura es cliente-servidor desacoplada. El backend es Spring Boot con Kotlin,
> expone una API REST documentada con Swagger. El frontend es Angular 18 con Ionic 7,
> funciona como PWA y tiene compilación nativa Android mediante Capacitor.*
>
> *La autenticación usa Firebase — tanto Google OAuth2 como email y contraseña propios.
> El token de Firebase lo verifica el backend en cada petición. Las notificaciones push
> funcionan mediante Firebase Cloud Messaging.*
>
> *La base de datos es PostgreSQL 16 auto-hospedada en un VPS propio, con 17 entidades
> JPA optimizadas con índices, relaciones lazy y transacciones. El VPS tiene 4 vCores,
> 8 GB de RAM y 75 GB de almacenamiento, y utilizo Dokploy como orquestador — que gestiona
> el proxy inverso, los contenedores Docker y los certificados SSL de forma automática.
> Además tengo un bot de Telegram que me avisa si el servidor se reinicia."*

### Qué mostrar (opcional, si tenéis proyector o pantalla):
- Un **diagrama de arquitectura** de la documentación (§7 o §10)
- O simplemente el Swagger UI en `https://devnexus.es/swagger-ui.html` para que vean los endpoints reales

---

## BLOQUE 3 — Demo en vivo (12 min)

> **REGLA DE ORO:** Cada cosa que enseñes tiene que tener un "y esto cumple con [módulo]".
> No lo digas en voz alta como un checklist, intégralo de forma natural.

---

### 3.1 — Autenticación y roles (1.5 min)

**Pantalla:** devnexus.es → pulsar "Empezar"

**Qué demostrar:**
- Panel de login con **dos opciones visibles**: botón Google + formulario email/contraseña
- Iniciar sesión como **USER** (modo incógnito)

**Qué decir:**
> *"El sistema soporta dos métodos de autenticación — Google OAuth2 y registro propio
> con email y contraseña. Firebase gestiona la identidad y nos devuelve un JWT
> que el backend valida en cada petición mediante un filtro de seguridad de Spring Security."*

**Vincula con rúbrica:** DI (adaptación, distribución), HLC (integración código-interfaz), PMDM (librerías: Firebase)

---

### 3.2 — Dashboard y navegación (1 min)

**Pantalla:** Panel de usuario recién autenticado

**Qué demostrar:**
- Side menu animado con Rive (abrirlo y cerrarlo)
- Bottom tabs con iconos animados
- Navegación entre secciones

**Qué decir:**
> *"La navegación sigue el grafo de Angular Router con guards de autenticación.
> El menú lateral y los tabs usan animaciones Rive — una librería vectorial que genera
> animaciones de alta calidad con un peso mínimo. El diseño es mobile-first,
> funciona igual en móvil, tablet y escritorio."*

**Vincula con rúbrica:** PMDM (grafo de navegación, librerías multimedia, ciclo de vida), DI (responsive, intuitiva)

---

### 3.3 — Módulo de Diarios (2.5 min)

**Pantalla:** Mi Perfil → Diarios

**Qué demostrar paso a paso:**
1. Crear una entrada de diario (escribir algo breve)
2. Cambiar visibilidad: PRIVADO → PÚBLICO
3. Mostrar que la entrada aparece en el Blog (pestaña Blog)
4. **⭐ CLAVE ADA:** Pulsar "Exportar CSV" del tema → descarga real del fichero

**Qué decir en la exportación:**
> *"Este es el criterio de ficheros del módulo ADA: el sistema genera un fichero CSV
> en el backend — lectura desde base de datos, escritura a un ByteArray con cabeceras RFC 4180 —
> y el frontend lo descarga como Blob. En la documentación §12.1 hay una tabla comparativa
> donde justifico cuándo usar base de datos y cuándo fichero según el escenario de negocio."*

**Vincula con rúbrica:** ADA (ficheros lectura+escritura + justificación), SGE (exportación), HLC (E/S solvente)

---

### 3.4 — Sistema de Tickets / Incidencias (2 min)

**Pantalla:** Sección Tickets (como USER)

**Qué demostrar paso a paso:**
1. Crear un nuevo ticket con título, descripción y prioridad ALTA
2. Ver el ticket en la lista con su estado "ABIERTO"
3. Abrir el chat interno del ticket y enviar un comentario
4. Cambiar a la sesión ADMIN → ver el mismo ticket desde el panel admin
5. Cambiar el estado del ticket a "EN REVISIÓN"

**Qué decir:**
> *"El sistema de tickets implementa un ciclo de vida completo: ABIERTO → EN REVISIÓN →
> RESUELTO → con posibilidad de solicitar reapertura. Cada transición tiene validaciones
> de negocio en el servicio y auditoría automática. Los computed signals de Angular
> actualizan la vista sin necesidad de detectar cambios manualmente."*

**Vincula con rúbrica:** PMDM (data binding con Signals, ciclo de vida), HLC (POO, capas), SGE (auditoría)

---

### 3.5 — Mensajería interna (1.5 min)

**Pantalla:** Sección Mensajes (como USER)

**Qué demostrar:**
1. Buscar a otro usuario por nombre o filtrar por departamento
2. Iniciar un chat nuevo
3. Enviar un mensaje
4. Mostrar que llega la notificación en la otra sesión (si se puede)

**Qué decir:**
> *"La mensajería usa API REST con actualización bajo demanda y CDK Virtual Scroll
> para renderizar listas de mensajes de forma eficiente — solo se renderizan
> los elementos visibles en el viewport. Las notificaciones push funcionan con
> Firebase Cloud Messaging: el token FCM del dispositivo se persiste en base de datos
> vinculado al usuario."*

**Vincula con rúbrica:** PMDM (librerías: CDK, FCM), DI (distribución adecuada), ADA (BD optimizada)

---

### 3.6 — Panel de Administración + Auditoría (2 min)

**Pantalla:** Cerrar sesión USER → entrar como ADMIN

**Qué demostrar:**
1. Acceder a `/admin-profile` (ruta protegida por guard de ADMIN)
2. Ver el panel de gestión de usuarios
3. **⭐ CLAVE SGE:** Abrir la tabla de Auditoría — mostrar registros de las acciones que hicimos en la demo
4. Mostrar el filtrado por tipo de acción o usuario

**Qué decir:**
> *"La auditoría es automática mediante un Aspecto de Spring AOP. Intercepta todos los
> métodos POST, PUT, PATCH y DELETE de todos los controladores sin que cada uno
> tenga que implementar nada — principio de separación transversal de responsabilidades.
> Aquí podemos ver exactamente qué hicimos en los últimos minutos: creé el diario,
> creé el ticket, cambié su estado. Cada acción con recurso, método, usuario y timestamp."*

**Vincula con rúbrica:** SGE (mecanismos efectivos en TODAS las acciones), HLC (POO: AOP), PMDM (código robusto)

---

### 3.7 — Calendario de Eventos (1 min)

**Pantalla:** Sección Eventos

**Qué demostrar:**
1. Vista mensual del calendario Syncfusion
2. Crear un evento rápido (click en un día)
3. Cambiar a vista semanal

**Qué decir:**
> *"El calendario usa Syncfusion Schedule, una librería enterprise de componentes.
> Los eventos se persisten en base de datos con validaciones de solapamiento
> y visibilidad por rol."*

**Vincula con rúbrica:** PMDM (diversas librerías — nivel muy alto), DI (componentes adecuados)

---

## BLOQUE 4 — Testing, calidad y despliegue (3 min)

### Qué mostrar y decir:

**A) Lint y calidad de código** *(abrir terminal o mostrar captura)*
> *"El frontend tiene 42 archivos de especificaciones y pasa lint con cero errores.
> Angular ESLint con reglas `prefer-inject`, nomenclatura de componentes y prefijos.
> Todo verificado antes de esta presentación."*

**B) Tests unitarios** *(mostrar terminal con resultado del backend)*
> *"El backend tiene 5 clases de test con Mockito y JUnit 5 cubriendo los servicios
> de negocio más críticos: EventoService, MensajeService, TicketService.
> BUILD SUCCESS, 4 tests pasados."*

**C) Tests E2E** *(abrir cypress o mostrar captura)*
> *"Tres flujos end-to-end en Cypress: flujo de admin, flujo de mensajería y flujo de soporte.
> Validan la integración real entre frontend, backend y base de datos."*

**D) Despliegue** *(mostrar devnexus.es con el candado HTTPS, o el panel de Dokploy)*
> *"Lo que acabáis de ver es la app real en producción, no un entorno local.
> Corre en un VPS propio con 4 vCores y 8 GB de RAM que tengo alquilado por un año.
> El backend y el frontend son dos imágenes Docker publicadas en Docker Hub.
> Dokploy actúa como orquestador: gestiona el proxy inverso, enruta el tráfico de
> devnexus.es y renueva los certificados SSL automáticamente.
> PostgreSQL está instalado directamente en el VPS y se administra con pgAdmin.
> Tengo un backup automático a NeonDB y un bot de Telegram que me avisa si el servidor
> se reinicia. El VPS además aloja otros tres proyectos míos sin interferencias."*

**Vincula con rúbrica:** DI (pruebas integración+rendimiento+seguridad+usabilidad), PMDM (app funciona perfectamente), SGE (configuración verificada garantizando funcionalidad)

---

## BLOQUE 5 — Cierre personal (1 min)

### Qué decir:

> *"Este proyecto me ha permitido aplicar todo el stack de un desarrollador full stack
> junior-medio en un contexto real: arquitectura por capas, patrones de diseño como AOP
> y Repository, autenticación federada, despliegue Docker, testing automatizado y
> una interfaz mobile-first.*
>
> *Lo más valioso no es el resultado — es haber enfrentado y documentado los problemas reales:
> el control de acceso colaborativo en diarios, la gestión de tokens FCM,
> los errores de CDK Virtual Scroll en E2E. Eso está en §11.3 de la documentación.*
>
> *DevNexus está en producción, el código está en GitHub, y la documentación es pública.
> Gracias."*

---

## ❓ PREGUNTAS PROBABLES DEL TRIBUNAL — Cómo responderlas

### Sobre ADA:

**P: "¿Por qué usas ficheros CSV y no exportar a Excel directamente?"**
> *"El CSV es el formato de interoperabilidad universal — cualquier herramienta puede leerlo:
> Excel, LibreOffice, Python, R. Un .xlsx requeriría una dependencia de Apache POI o similar
> que añadiría complejidad sin un beneficio claro para el caso de uso. La decisión está
> justificada en la tabla comparativa del §12.1."*

**P: "¿Qué ventajas tiene JPA sobre JDBC plano?"**
> *"JPA nos da abstracción del motor de base de datos, caché de primer nivel automática,
> gestión del ciclo de vida de entidades, lazy loading para evitar N+1 queries,
> y `@Transactional` declarativo. Con JDBC tendríamos que gestionar todo eso manualmente.
> En este proyecto uso `FetchType.LAZY` en todas las relaciones ManyToOne para no arrastrar
> entidades completas en cada consulta."*

---

### Sobre DI:

**P: "¿Cómo garantizás la accesibilidad de la interfaz?"**
> *"Los componentes de Ionic implementan ARIA roles por defecto. El contraste de colores
> cumple con WCAG AA en el modo oscuro principal. Y durante las pruebas de usabilidad
> con 4 usuarios ninguno reportó dificultad de lectura o navegación."*

**P: "¿Qué diferencia hay entre la versión web y la móvil?"**
> *"Es la misma base de código. Capacitor compila la app Angular como una WebView nativa
> en Android. Las diferencias son adaptaciones de plataforma: `SafeAreaController` para
> el notch en iOS/Android, `Platform.backButton` para el botón de retroceso físico de Android,
> y permisos de notificaciones push gestionados con el plugin FCM de Capacitor."*

---

### Sobre HLC:

**P: "¿Por qué Kotlin en el backend en vez de Java?"**
> *"Kotlin es null-safe por diseño — elimina los NullPointerExceptions en tiempo de compilación.
> La sintaxis de data classes elimina boilerplate de POJO. Las funciones de extensión
> como `fun Diario.toDto()` permiten añadir comportamiento sin herencia. Y es 100%
> interoperable con Java y Spring Boot."*

**P: "¿Qué es ChangeDetectionStrategy.OnPush y por qué lo usás?"**
> *"Por defecto Angular comprueba todos los componentes en cada ciclo de detección de cambios.
> Con OnPush, un componente solo se re-renderiza cuando cambia su referencia de Input,
> se emite un evento, o se llama `markForCheck()`. Combinado con Signals, que son reactivos
> por naturaleza, el rendimiento es equivalente a una SPA optimizada con memoización."*

---

### Sobre PMDM:

**P: "¿Por qué Angular + Ionic y no React Native o Flutter?"**
> *"Angular es el framework más cercano a la programación orientada a objetos — módulos,
> inyección de dependencias, tipado fuerte. Para DAM eso es una ventaja pedagógica.
> Ionic añade los componentes nativos multiplataforma sin cambiar el paradigma.
> Flutter requeriría aprender Dart; React Native está más orientado a JavaScript puro
> que a TypeScript empresarial. La elección fue deliberada y está justificada en §3.2
> con una tabla comparativa de alternativas."*

**P: "¿Cómo gestionás el estado global de la app?"**
> *"Con Angular Signals. `currentUser()` en `AuthService` es un Signal que cualquier
> componente puede observar reactivamente con `effect()`. Cuando el usuario hace logout,
> todos los componentes suscritos reaccionan automáticamente — sin Redux, sin BehaviorSubject,
> sin gestión manual de subscripciones. Es el patrón recomendado en Angular 17+."*

---

### Sobre SGE:

**P: "¿Cómo funciona exactamente la auditoría?"**
> *"Uso Spring AOP con el patrón Aspect. La clase `AuditoriaAspect` tiene cuatro advice
> `@AfterReturning` que se ejecutan DESPUÉS de que el método del controlador devuelve
> exitosamente — si falla, no se audita. Extrae el nombre del controlador para inferir
> el recurso, obtiene el usuario actual del SecurityContext, y llama a `AuditoriaService`
> para persistirlo. El código tiene apenas 58 líneas y cubre todos los controllers
> automáticamente sin tocar ninguno de ellos."*

**P: "¿Qué pasaría si el servidor de base de datos cae?"**
> *"El backend respondería con 503 Service Unavailable. En producción, Neon tiene
> alta disponibilidad gestionada. Para un siguiente paso de mejora documentado en §13
> (trabajo futuro), estaría la implementación de un circuit breaker con Resilience4j
> y un mecanismo de reintentos para operaciones críticas."*

---

## 📋 Checklist de preparación — DÍA ANTES

- [ ] Abrir devnexus.es y confirmar que está funcionando
- [ ] Tener sesión ADMIN preparada en pestaña normal
- [ ] Tener sesión USER preparada en pestaña incógnito
- [ ] Tener Swagger UI accesible: `https://devnexus.es/swagger-ui.html`
- [ ] Tener el PDF de la documentación descargado (por si falla internet)
- [ ] Tener una captura de `npm run lint` → "All files pass linting"
- [ ] Tener una captura del build exitoso (`Application bundle generation complete`)
- [ ] Tener una captura de los tests backend → "BUILD SUCCESS"
- [ ] Saber el número exacto: **42 spec files** (frontend) + **3 E2E Cypress** + **5 clases de test backend**
- [ ] Practicar el bloque 3 completo una vez en voz alta

## 📋 Checklist de preparación — DÍA DEL TRIBUNAL

- [ ] Llegar 15 minutos antes
- [ ] Conectar el portátil antes de entrar
- [ ] Abrir todas las pestañas necesarias
- [ ] Deshabilitar notificaciones del sistema operativo
- [ ] Poner el teléfono en modo avión
- [ ] Tener agua

---

## 💡 Tips de presentación

1. **Empezá por el problema, no por la tecnología.** El tribunal quiere entender el valor antes que el stack.
2. **Controlá el ritmo.** Si vas rápido, el tribunal no entiende. 3 segundos de pausa después de cada demo importan.
3. **No leas la pantalla.** Mirá al tribunal cuando hables, señalá la pantalla solo cuando sea necesario.
4. **Si algo falla en la demo**, lo decís con naturalidad: *"En entornos de red compartida puede haber latencia, pero aquí en la documentación §14.2 podéis ver las capturas del flujo completo."*
5. **Las preguntas son buenas.** Significa que están interesados. Si no sabés algo, decí: *"Eso está fuera del alcance del proyecto, pero lo que sí implementé es..."*
6. **El cierre personal vale.** El tribunal recuerda la última frase. Que sea tuya, auténtica.
