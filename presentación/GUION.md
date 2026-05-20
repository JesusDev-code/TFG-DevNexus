# GUIÓN — DevNexus TFG (20 min)

> **Tiempo objetivo:** 20 min de exposición + 10 min de preguntas = 30 min totales.
> **Estrategia:** defender DECISIONES de arquitectura, no describir features. El tribunal evalúa criterio profesional, no inventario de funcionalidades.
>
> **REGLA DE ORO — "tecnicismo en slide, palabra llana en boca":**
> Los términos técnicos (Spring Security, Signals, RxJS, AOP, PgBouncer, HSTS, RBAC, Capacitor...) están en los slides como apoyo visual y en la sección de Preguntas Frecuentes para tu defensa. En el guión hablado vas con analogías y palabras llanas — el tribunal LEE los tecnicismos en la pantalla y los ASOCIA con lo que vos estás explicando. Bajo nervios esto te salva: si te quedás en blanco, mirás el slide y arrancás.

---

## [0:00 – 0:30] — SLIDE 0: Portada

> **[ INICIO · SLIDE 0 visible al entrar ]**

*"Buenos días. Mi proyecto se llama DevNexus — una plataforma SaaS diseñada para centralizar la gestión de diarios técnicos, incidencias y comunicación en equipos de desarrollo. Desarrollada durante cuatro meses y medio como TFG del ciclo de DAM, en el IES Rafael Alberti."*

---

## [0:30 – 2:30] — SLIDE 1: Problema & Solución

> **[ → AVANZAR A SLIDE 1 · pulsar flecha derecha ]**

*"El problema que quise resolver es concreto y lo viven todos los equipos pequeños: la información crítica está dispersa entre demasiadas herramientas. Slack para hablar, Excel para hacer seguimiento, Jira para tickets, GitHub para el código, y la documentación técnica termina en correos o en chats privados que nadie vuelve a abrir.*

*El resultado es que las auditorías son prácticamente imposibles, el conocimiento del equipo no se queda en ningún sitio, y cuando alguien se va se lleva contexto que tarda meses en recuperarse.*

*DevNexus parte de una idea sencilla: una única fuente de verdad técnica. Diarios de progreso con IDE integrado, sistema de tickets con chat interno, mensajería directa entre usuarios, y — esto es importante — auditoría automática de todas las operaciones. Todo bajo el mismo techo, todo desplegado en producción real, todo accesible desde web y desde una aplicación Android nativa.*

*Lo que vais a ver a continuación es la aplicación funcionando en producción, sin trucos, sin entornos locales."*

---

## [2:30 – 12:30] — SIN SLIDE — Demo en vivo (10 min)

> **[ ⤴ SALIR DE PRESENTACIÓN · ALT+TAB a la pestaña del navegador con la app ]**
>
> **Bloque crítico.** Ensayar al menos cinco veces con cronómetro. Tener el usuario de demo cargado, la app despierta, y un proyecto de respaldo creado por si algo falla.

### [2:30 – 2:50] Páginas públicas (20s)

*"Antes de entrar a la aplicación os enseño las páginas públicas — landing, about y FAQ. Diseño responsive, chat flotante de soporte. No es lo principal pero forma parte del producto."*

### [2:50 – 3:10] Login (20s)

*"Para entrar a la aplicación tengo dos caminos: registrarme con email y contraseña, o entrar directamente con Google. En los dos casos, quien gestiona la identidad es **Firebase Auth** — mi backend nunca toca la contraseña del usuario, solo recibe un **token JWT firmado por Firebase** y lo valida. Es una buena práctica de seguridad: delegar la identidad en quien se dedica a esto profesionalmente, en lugar de inventarte tu propio sistema y arriesgar fugas de datos."*

### [3:10 – 7:00] Diario + IDE (3:50)

> **Bloque ampliado +1 min** para incluir la demo en vivo del papel → IA visión → código ejecutándose. Para compensar: el subbloque final "Notificaciones y APK" pasa de 1:00 a 0:30.


*"Voy a crear un proyecto nuevo en directo. Esto es el diario — el núcleo de DevNexus. Creo un proyecto y entro directamente al IDE personal — un entorno de desarrollo completo dentro del navegador, con **Monaco Editor**, el mismo motor que usa Visual Studio Code.*

*Y aquí hay un detalle de diseño importante: el árbol de archivos empieza VACÍO. El usuario decide qué estructura le hace falta. Desde esta barra lateral puedo crear archivos sueltos o carpetas, y dentro de cada carpeta puedo anidar subcarpetas y más archivos hasta donde quiera. **Toda la jerarquía se persiste en PostgreSQL** — el árbol no es solo cosmético, es estructura real navegable, igual que un proyecto en disco.*

*Y aquí está una de las funcionalidades más potentes: cuando escribo código web y pulso el botón de play, el resultado se previsualiza al instante dentro de la misma plataforma — sin abrir un navegador aparte ni copiar el código a ningún sitio. Y esto no es solo para mí: cuando publico el proyecto en el blog comunitario, cualquier visitante puede pulsar ese mismo botón y ver el resultado funcionando en su propio navegador, sin instalar nada.*

*Dentro del IDE también tenemos inteligencia artificial integrada con Groq Llama 3.3. Puedo hacer un code review automático de una entrada — la IA me devuelve feedback técnico, mejoras y posibles bugs.*

*Y ahora os quiero enseñar algo en vivo que para mí es el ejemplo más claro de cómo se integran todas las piezas del proyecto.* **[ SACAR PAPEL CON CÓDIGO IMPRESO ]**

*Tengo aquí un código escrito en papel. Voy a abrir la APK de Android de DevNexus en mi móvil, hacer una foto a este papel, y veréis cómo la inteligencia artificial lo transcribe directamente al diario en pantalla. En unos segundos pasamos de papel físico a código ejecutándose — sin teclado, sin copiar y pegar.*

**[ HACER FOTO DESDE LA APP MÓVIL → ESPERAR TRANSCRIPCIÓN ~5s ]**

*Y ahí lo tenemos. Pulso el botón de play... y el resultado se ejecuta dentro de la propia plataforma. La foto que tomé con el móvil pasa por mi servidor, que actúa solo de intermediario seguro — la imagen nunca se guarda en ningún sitio, ni en disco, ni en base de datos. La inteligencia artificial nos devuelve el texto, y ese texto sí queda persistido en el diario y se ejecuta en el sandbox. Todo el TFG funcionando en menos de un minuto.*

> **PLAN B obligatorio**: si la foto NO transcribe bien (luz mala, Wi-Fi lento, OCR falla):
> *"El reconocimiento ha tenido un problema por las condiciones de luz, lo pego desde el portapapeles para que veáis igualmente el resultado."* → pegás el código exacto desde el portapapeles del portátil (lo tenés preparado de antes) → pulsás play → continuás como si nada.
> NUNCA te disculpes. NUNCA canceles la demo. La funcionalidad es real, el fallo es contextual.

*El sistema replica el flujo de Git real: cuando termino una tanda de cambios, describo qué hice en el mensaje y pulso Commit. Decidí conscientemente NO hacer autoguardado por cada cambio — eso convertiría el historial en ruido. El desarrollador decide cuándo un cambio merece quedar registrado, igual que en Git desde hace veinte años. Así tengo trazabilidad real de DECISIONES, no de teclazos.*

*Desde aquí mismo puedo publicar este proyecto en el blog comunitario con un título y descripción separados del nombre interno, para que otros usuarios puedan verlo, comentarlo e interactuar.*

*Y también puedo invitar a un colaborador al proyecto y enviarle un mensaje directo en el momento — sin salir del flujo de trabajo.*

*Un detalle importante para el aprendizaje del equipo: cualquier diario se puede descargar entero en dos formatos. En Markdown, que es el formato estándar de documentación técnica — ideal para subirlo a otras herramientas o para pasárselo a una inteligencia artificial como contexto. Y en CSV, el formato típico de análisis de datos, ideal para abrirlo en Excel o procesarlo después. Los datos del usuario son del usuario — el diario no es una jaula."*

### [6:00 – 6:45] Mensajes (45s)

*"El sistema de mensajería permite conversaciones directas entre usuarios. Buscador de contactos, emojis, historial completo. La interfaz se adapta a móvil con la misma codebase — esto lo veremos en el slide de stack."*

### [6:45 – 7:45] Tickets + chat (1:00)

*"El sistema de tickets permite crear incidencias con título, descripción y prioridad — alta, media o baja. Cada ticket tiene su propio canal de chat interno donde usuario y staff se comunican sin perder contexto.*

*El estado transiciona de Abierto a En Curso a Cerrado, y aquí está la clave: cada cambio queda auditado automáticamente, sin que el desarrollador tenga que escribir una sola línea de logging. Ahora os enseño cómo."*

### [7:45 – 8:30] Calendario (45s)

*"El módulo de calendario tiene vistas de día, semana, mes y agenda. Y aquí hay una regla de permisos importante: un usuario normal solo puede crear **eventos privados** — sus propios recordatorios, sus deadlines personales. La administración tiene un permiso extra: crear **eventos públicos**, que disparan automáticamente una notificación push a TODOS los usuarios registrados vía **Firebase Cloud Messaging**. Así el calendario sirve a la vez como agenda personal y como canal oficial de avisos del equipo."*

### [8:30 – 10:30] Panel de administración + Auditoría (2:00)

> **Este es el momento estrella técnico de la demo. Tomarse el tiempo.**

*"Llegamos al panel de administración. Aquí gestiono usuarios, roles y departamentos — lo típico de cualquier panel de control.*

*Pero hay una pestaña que para mí es la más valiosa del panel: **Diarios de usuarios**. Desde aquí el administrador o el profesor accede a los proyectos de cualquier alumno y abre su IDE en **modo lectura con feedback** — escribe comentarios sobre el código del alumno que quedan persistidos en la base de datos junto a la entrada. Esto convierte DevNexus en una herramienta real de acompañamiento docente — no solo un editor, sino un canal de revisión técnica con trazabilidad.*

*Pero quiero pararme en esto: los registros de auditoría. Mirad esta tabla. Cada vez que alguien crea, modifica o borra algo en cualquier parte del sistema, queda registrado automáticamente con cinco datos: quién lo hizo, qué hizo, sobre qué objeto, lo importante que es esa acción, y cuándo ocurrió.*

*Y esto no lo programé pantalla por pantalla. Lo hace una sola clase que está "escuchando" todas las operaciones de escritura desde fuera, como un vigilante de seguridad que ve todo lo que pasa por las puertas sin tener que estar dentro de cada habitación. La técnica concreta la veréis en el slide de stack enseguida.*

*Puedo filtrar por usuario, por tipo de acción, por gravedad. Esto es exactamente lo que un cliente real necesitaría para pasar una auditoría legal — y está construido en un par de clases, no en cientos."*

### [10:30 – 11:30] Swagger + API en vivo (1:00)

*"Para cerrar la demo técnica os enseño la API directamente. Esto es Swagger autodocumentado — cualquier desarrollador puede explorar todos los endpoints, ver los esquemas de petición y respuesta, y probarlos en vivo autenticándose con su token de Firebase.*

*Mirad: ejecuto un GET de proyectos ahora mismo, autenticado, contra el backend en producción. La API es REST estándar, autenticada con JWT, documentada. Está lista para cualquier integración futura — una app móvil distinta, un cliente CLI, lo que sea."*

### [11:30 – 12:30] Notificaciones y APK (1:00)

*"Y por último, dos cosas que quería mencionar antes de pasar a la infraestructura:*

*Primero, todo el sistema soporta notificaciones push en tiempo real mediante Firebase Cloud Messaging. Cuando alguien me envía un mensaje o me asignan un ticket, recibo la notificación al instante — tanto en el navegador como en el móvil.*

*Segundo, esto que estáis viendo no es solo web. Tengo aquí la APK firmada de Android — la misma codebase, compilada con Capacitor, que se comporta como una aplicación nativa con notificaciones push del sistema operativo. Está disponible para descargar desde GitHub Releases."*

---

## [12:30 – 15:00] — SLIDE 2: Stack Tecnológico (2:30 — ajustable)

> El bloque Backend pasó a 60s para incluir la diferenciación Firebase + Spring Security. Si en ensayo se te va a 2:40, recortá 10s del subbloque "Notificaciones y APK" en la demo (subbloque final, fácil de comprimir).


> **[ ⤵ VOLVER A LA PRESENTACIÓN · ALT+TAB · ya estarás en SLIDE 1, pulsar → para ir a SLIDE 2 ]**

### Frontend (50s)

*"Empezamos por el frontend. Como veis en el slide, una sola base de código que funciona a la vez como página web, como aplicación instalable en el móvil y como APK nativa de Android. Esto no es teoría: la APK que mencioné en la demo se construye desde estos mismos archivos con **Capacitor**, sin tener un proyecto Android paralelo.*

*La seguridad del frontend no se basa solo en ocultar botones. Cada ruta protegida pasa por un **guard** de Angular — un `authGuard` para usuarios autenticados y un `adminGuard` para las rutas de administración. Si entrás sin sesión válida o sin rol suficiente, el router te redirige antes incluso de cargar el componente. Es una segunda barrera por delante de la del backend.*

*Para gestionar los datos dentro de la aplicación uso dos herramientas distintas según el caso, que es justo lo que recomienda hoy el equipo de Angular. Una es ligera y la uso para cosas sencillas dentro de una pantalla — por ejemplo, si un panel está abierto o cerrado. La otra es más potente y la uso cuando hay que coordinar varias cosas que cambian a la vez — peticiones al servidor, datos en tiempo real, eventos. Los nombres técnicos están en el slide. La idea de fondo es usar la herramienta justa para cada problema, no la misma para todo.*

*Y el editor de código que visteis dentro del diario no es una imitación: es exactamente el mismo motor que usa Visual Studio Code, integrado dentro de mi aplicación."*

### Backend (60s)

*"El backend está hecho con Spring Boot y Kotlin. Elegí Kotlin porque es más seguro al programar — el propio lenguaje te avisa cuando algo puede fallar antes de que lo ejecutes — y porque se entiende a la perfección con todo el ecosistema de Java que ya existe.*

*Como veis en el slide, la seguridad la cubren dos capas distintas, no una sola. Firebase responde a la pregunta '¿quién eres?'. Spring Security responde a '¿qué puedes hacer?'. Son cosas diferentes y por eso cada una vive en su sitio.*

*Spring Security se ocupa de los permisos. Cada usuario tiene un rol — administrador, staff o usuario común — y cada acción comprueba ese rol antes de dejar pasar. Si un usuario normal intenta entrar al panel de administración, le bloqueamos antes incluso de tocar la base de datos. Y aparte añade un escudo en la capa del navegador: protege contra los ataques típicos de la web, fuerza siempre conexión segura, y solo acepta peticiones desde los dominios que yo le indico. Es como tener un portero que mira el DNI y la lista de invitados a la vez.*

*La auditoría que enseñé antes funciona con una sola clase. Pongo una etiqueta en ella y queda automáticamente vigilando todas las operaciones que crean, modifican o borran datos. Si mañana añado un endpoint nuevo, ya queda auditado sin tocar nada más. Una sola clase, en vez de repetir el mismo código en cada controlador.*

*Y aquí hay una decisión consciente: la API completa está documentada con Swagger, lo habéis visto en la demo. Esto NO viene por defecto en Spring Boot — a diferencia, por ejemplo, de FastAPI en Python que sí lo trae nativo, en Spring hay que añadirlo y configurarlo. Lo hice porque permite que cualquier desarrollador, ahora o en el futuro, explore y pruebe la API sin tener que leerse el código fuente."*

### Persistencia (50s)

*"La base de datos es PostgreSQL, una de las más usadas profesionalmente. Para gestionar los cambios en el esquema uso **Flyway** — que veis en el slide — y la idea es como Git pero para la base de datos: cada cambio queda guardado como un fichero SQL numerado dentro del repositorio. Si mañana levantamos el proyecto en otro servidor, Flyway aplica los cambios pendientes en orden, sin ejecutar comandos sueltos a mano. La alternativa sería dejar que Hibernate decida solo qué tocar en producción — y eso, sinceramente, es jugar a la ruleta rusa con los datos.*

*Entre el backend y la base de datos hay un intermediario llamado **PgBouncer** que veremos en el slide de arquitectura. Sirve para que el servidor no colapse cuando hay muchos usuarios a la vez — un problema típico de cualquier aplicación profesional.*

*Y para las tareas de inteligencia artificial uso Groq con el modelo Llama 3.3. ¿Por qué no usé ChatGPT? Por dos razones: las respuestas tardan menos de un segundo, y tengo una cuota gratuita generosa, perfecta para un TFG."*

---

## [15:00 – 16:30] — SLIDE 3: Infraestructura & Observabilidad (1:30)

> **[ → AVANZAR A SLIDE 3 · pulsar flecha derecha ]**

*"Y todo esto, ¿dónde corre? En un servidor propio. No estoy usando servicios de pago como los típicos de cloud — es un servidor real, con las características que veis en el slide.*

*Lo que se encarga de levantar la aplicación es una herramienta llamada Dokploy, que veis en pantalla. Coge mi código del repositorio, lo construye dentro de contenedores aislados, los enciende y los conecta. Funciona como los servicios cloud típicos pero corriendo en mi propio servidor, sin depender de nadie.*

*Para vigilar que todo funciona — porque un producto en producción sin vigilancia es una bomba de relojería — tengo un bot de Telegram que me avisa al móvil en tiempo real si algo se cae, si el servidor consume demasiada memoria, o si la base de datos no responde. Esto me deja reaccionar antes de que el usuario se entere de que ha habido un problema.*

*Y tengo una copia de seguridad automática cada noche en otro proveedor diferente. Si mi servidor se cayera por completo, los datos estarían a salvo en otro sitio del mundo. Esto es redundancia geográfica básica, pero efectiva.*

*El coste total de infraestructura es solo el del servidor — unos pocos euros al mes. Sin facturas variables, sin sorpresas. El producto es viable comercialmente desde el día uno."*

---

## [16:30 – 18:00] — SLIDE 4: Arquitectura de capas (1:30)

> **[ → AVANZAR A SLIDE 4 · pulsar flecha derecha ]**

*"Quiero enseñaros cómo se conecta todo dentro de ese servidor, porque las decisiones de arquitectura son lo que diferencia un prototipo de un producto real.*

*Como veis en el diagrama, el usuario — da igual si entra por la web, por la aplicación instalada o por la APK de Android — siempre llega a la misma puerta de entrada: **Traefik**. Pensad en Traefik como el recepcionista de un edificio: ve quién llega y decide a qué apartamento mandarlo — al frontend si pide la web, al backend si pide la API. Eso es, simplificándolo mucho, lo que hace un **proxy inverso**. Y además gestiona el candado seguro de la conexión: el certificado lo emite y lo renueva **Let's Encrypt** automáticamente, sin que yo tenga que tocar nada.*

*Una vez dentro del apartamento del frontend hay otro servidor distinto: **Nginx**. Nginx no decide rutas — eso ya lo hizo Traefik fuera —, simplemente sirve los archivos del Angular ya compilado: el HTML, el JavaScript y el CSS. Son dos servidores web, sí, pero con roles muy diferentes: Traefik fuera, enruta y protege; Nginx dentro, entrega los archivos estáticos.*

*Y aquí está la decisión arquitectónica más importante de toda la pila: cada componente — el frontend con Nginx, el backend de Spring, **PgBouncer** y PostgreSQL — corre dentro de su propio contenedor Docker, todos compartiendo una **red privada Docker dentro del mismo VPS**. ¿Qué significa esto en la práctica? Dos cosas. Primera: la comunicación entre capas NO sale a internet, viaja por la red interna del host con latencia de microsegundos — es casi instantáneo. Segunda: superficie de ataque mínima — el único componente expuesto al exterior es Traefik. El backend y la base de datos no tienen puerto público, son INVISIBLES desde fuera del servidor. Y, además, el sistema entero se replica en otro VPS con un par de comandos. Adiós al clásico "en mi máquina sí funciona".*

*El frontend lo sirve **Nginx** dentro de su contenedor — un servidor pequeño y rapidísimo. Tiene una configuración específica para que las rutas internas de la aplicación funcionen bien al refrescar una página — un detalle pequeño pero que rompe el producto si no lo solucionás.*

*El backend recibe las peticiones y, en lugar de hablar directamente con la base de datos, pasa por **PgBouncer** que gestiona el pool de conexiones. La razón es simple: abrir y cerrar conexiones contra PostgreSQL es caro. PgBouncer mantiene un grupo de conexiones siempre abiertas y se las va prestando al backend según las necesite. Es como tener un parking compartido en vez de aparcar y desaparcar en la calle cada vez.*

*Y por encima de todas estas capas está la auditoría que enseñé en el panel de administración: cualquier cosa que alguien haga, venga de la web, de la app móvil o de un cliente externo que se conecte mañana, queda registrada sin que tenga que pedirlo.*

*El backend es stateless — no guarda sesión propia —, la base de datos está optimizada con PgBouncer por delante, y Traefik gestiona los certificados solo. Esto es arquitectura pensada para producción, no académica."*

---

## [18:00 – 19:30] — SLIDE 5: Conclusiones (1:30)

> **[ → AVANZAR A SLIDE 5 · pulsar flecha derecha ]**

*"DevNexus demuestra que se puede construir una herramienta seria de gestión técnica usando tecnologías libres y arquitecturas modernas — con un coste casi cero.*

*En números: cumple el cien por cien de los requisitos que planifiqué al principio, tiene más de quinientos tests automáticos entre frontend y backend, está desplegado en producción real y funciona tanto en navegador como en Android nativo.*

*Pero lo más valioso que me llevo de este TFG no es el código. El código se reescribe. Lo que me llevo son las decisiones de arquitectura reales que tuve que tomar y poder defenderlas. Saber cuándo usar una herramienta y cuándo otra dentro del frontend. Saber por qué la auditoría se programa una sola vez y no en cada pantalla. Entender por qué la base de datos necesita un intermediario para no colapsar bajo carga. Comprender por qué no gestiono contraseñas propias y delego en alguien que se dedica a eso profesionalmente.*

*Eso es lo que diferencia un proyecto académico de uno profesional. Y eso es lo que me llevo."*

---

## [19:30 – 20:00] — SLIDE 6: Despedida

> **[ → AVANZAR A SLIDE 6 · pulsar flecha derecha ]**

*"Muchas gracias por vuestra atención. Quedo a vuestra disposición para cualquier pregunta técnica o funcional."*

---

## CRONOMETRAJE RESUMEN

| Bloque | Inicio | Duración | Slide |
|---|---|---|---|
| Portada | 0:00 | 0:30 | 0 |
| Problema & Solución | 0:30 | 2:00 | 1 |
| Demo en vivo | 2:30 | 10:00 | — |
| Stack | 12:30 | 2:30 | 2 |
| Infraestructura | 15:00 | 1:30 | 3 |
| Arquitectura | 16:30 | 1:30 | 4 |
| Conclusiones | 18:00 | 1:30 | 5 |
| Despedida | 19:30 | 0:30 | 6 |
| **TOTAL** | | **20:00** | |

---

## ENSAYO CON PROYECTOR — Presentar con soltura

> Tener proyector en casa es una ventaja enorme. La mayoría llega al tribunal habiendo ensayado solo frente al portátil — vos vas a llegar con la sensación física de presentar a una pantalla grande, que es algo completamente distinto.

### 1 · Setup técnico (verificar en CADA sesión de ensayo)

- **Cable HDMI propio + adaptador USB-C/Mini-DisplayPort** — no confíes en el cable del aula
- **Modo de pantalla**: `Win+P → Duplicada`, nunca extendida. Extendida = perdés de vista lo que se proyecta
- **"No molestar" activado** en Windows antes de empezar
- **Cerrá Discord, mail, Slack, navegador con pestañas personales** — todo lo que pueda saltar
- **Volumen al 30%** — suficiente para que se oigan las notificaciones FCM en la demo, no estridente
- **Resolución forzada a 1920×1080** si el proyector lo soporta. Si es 1024×768, avisame y subo los textos pequeños
- **Verificar legibilidad desde 4 metros**: si las fuentes pequeñas del slide (las de 8-9px en métricas y descripciones) no se leen, decímelo y las subo a 11-12px

### 2 · Postura corporal — dónde te ponés y cómo

- **NUNCA de espaldas a la audiencia** — ni para mirar la pantalla un segundo
- **Posicionate en el lado izquierdo de la pantalla** desde el punto de vista del tribunal. Leemos de izquierda a derecha: vos sos el ancla, la pantalla es la continuación visual de tu palabra
- **Pies fijos**, no balancees el cuerpo ni te muevas de un lado a otro
- **Hombros abiertos hacia el tribunal**, no hacia el proyector
- Cuando señales la pantalla: brazo extendido, gesto firme, volvés a la posición. No te quedes mirando lo que señalaste — quien tiene que mirar es el tribunal

### 3 · Mirada — dónde van tus ojos

- **80% al tribunal, 20% a la pantalla.** Esto es lo más importante de toda esta sección.
- **Nunca leas el slide en voz alta** — el tribunal lo lee tres veces más rápido que vos. Si lees, te conviertes en subtítulos
- **Barrido lento entre los miembros del tribunal**: uno cada 5-7 segundos, buscando los ojos
- **Si te perdés un momento**, mirá al techo un segundo. Al suelo NO — al suelo = inseguridad
- **En la demo en vivo**: 50/50. Mirás la pantalla cuando haces la acción, mirás al tribunal cuando explicás lo que pasó

### 4 · Voz y ritmo — la herramienta más subestimada

- **Hablá MÁS DESPACIO de lo que te sale natural.** Bajo nervios todos aceleran un 30%. Tenés que pelearlo activamente.
- **Pausas DESPUÉS de afirmaciones técnicas fuertes**: *"Spring AOP intercepta todos los controladores anotados. [PAUSA 2s] Una sola clase."* La pausa es lo que le da peso a la frase.
- **Volumen alto**: tiene que llegar al fondo del aula. Si dudás, subí.
- **Variá el ritmo**: información dura → lenta. Transiciones → fluida. Conclusiones → con peso.

### 5 · Cómo señalar en pantalla

- **Si tenés puntero láser**, usalo SOLO en momentos clave. Si lo usás de muletilla, pierde peso
- **Sin láser**: dedo extendido, brazo recto. Lo señalado tiene que durar mínimo 3 segundos
- **No señales todo.** Solo lo que querés que el tribunal mire específicamente. Cuanto más señalás, menos peso tiene cada gesto

### 6 · El silencio es tu amigo

- **Después de afirmación importante**: SILENCIO 2-3 segundos. Que respire.
- **Al cambiar de slide**: 1 segundo de silencio ANTES de hablar del nuevo. Da tiempo al ojo a procesar el visual
- **Si te quedás en blanco**: silencio 3-5 segundos mirando al tribunal. NO rellenes con "eh", "este…", "bueno…". El silencio bajo control proyecta seguridad. El relleno proyecta nervios

### 7 · Si algo falla durante la demo

- **No te disculpes.** Una disculpa convierte un detalle en problema visible
- **Si la app no carga**: *"Hay un detalle de red, paso a las capturas de respaldo"* → Plan B activado, seguís
- **Si te equivocás verbalmente**: corregí UNA vez y seguí. No vuelvas atrás dos veces — eso amplifica el error
- **Si te quedás colgado en una pregunta**: *"Buena pregunta, dejame pensarlo un segundo"* → te da aire para responder bien

### 8 · Plan de ensayo escalonado con tu proyector

| Sesión | Foco | Duración | Qué hacer |
|---|---|---|---|
| 1 | **Lectura sentada** | 30 min | Leer el guión completo con cronómetro. Anotar bloques que se pasan o quedan cortos |
| 2 | **Lectura en pie** | 45 min | Frente al proyector enchufado. Voz alta. Sin público. Foco: ritmo y respiración |
| 3 | **Simulacro completo grabado** | 60 min | Móvil en trípode, presentación entera con demo incluida. Sin parar aunque falles |
| 4 | **Análisis del video** | 30 min | Ver el video con auriculares. Anotar muletillas, gestos nerviosos, tiempos malos |
| 5 | **Simulacro con público real** | 45 min | Familiar/amigo como "tribunal". Al final que te haga 3 preguntas técnicas |
| 6 (día previo) | **Simulacro final** | 60 min | TODO el setup del aula: proyector, cable propio, app despierta, modo no-molestar. Mismo orden, misma ropa |

**Tip brutal**: ver tu propio video grabado baja las muletillas a la mitad. Es incómodo, pero funciona. Hacé al menos un ciclo grabar → ver → repetir.

### 9 · Lo que SOLO se descubre con proyector

Cosas que no vas a notar hasta enchufar:

- **El dorado `brand-gold`** puede verse opaco contra ciertos proyectores con tonos amarillentos. Anotá si pierde contraste.
- **Las fuentes de 8-9px** (las descripciones bajo cada métrica/tag) pueden ser ilegibles desde 4 metros. **Decímelo y las subo.**
- **El tiempo de fade-in del proyector** al cambiar de ventana (de slides a la app y vuelta). Algunos proyectores tardan 1-2 segundos en mostrar la nueva imagen → ajustá el ritmo de tus transiciones para compensar
- **El contraste de las cajas glassmorphism** sobre el negro `#0A0A0A` puede verse plano en proyector con bajo brillo. Si pasa, decimelo y subimos opacidad

---

## DEMO EN VIVO — Código en papel → IA → Pantalla

> Este es el momento WOW de la presentación. Si sale bien, te llevás la matrícula. Si falla, el Plan B te protege. La única forma de que falle DE VERDAD es que improvises — por eso este protocolo es estricto.

### El código exacto que va impreso en el papel

```html
<style>
body{background:linear-gradient(135deg,#c5a059,#0a0a0a);
color:#fff;font:bold 40px sans-serif;
text-align:center;padding:80px;margin:0}
h1{font-size:64px}
</style>
<h1>DevNexus</h1>
<p>De papel a pantalla en 5 segundos</p>
```

**Por qué este código y no otro:**
- Output VISUAL inmediato: degradado dorado→negro de tu marca + título grande. El tribunal ve algo BONITO ejecutándose, no consola.
- Solo 7 líneas. Foto fácil, OCR fiable.
- Sin lógica compleja — si la IA transcribe una letra mal, sigue funcionando.
- El propio contenido del código es PUBLICIDAD del proyecto. Teatro intencional.

### Cómo preparar el papel

1. **Imprime, NO escribas a mano** — el OCR falla mucho más con manuscrita
2. **Fuente Courier New o Consolas, tamaño 18-20pt, en bold**
3. **Hoja A5 o media A4** — tamaño tarjeta grande, fácil de fotografiar
4. **Fondo blanco mate, tinta negra** — máximo contraste
5. **Tené DOS copias del papel** por si una se arruga o pierde
6. **Lleva una funda transparente** para protegerlo en el bolsillo

### Setup del Plan B (CRÍTICO)

Antes de empezar la presentación:
1. **Abrí un editor de texto** (Notepad, Sublime, lo que sea) MINIMIZADO en la barra de tareas
2. **Pegá el código exacto del papel** en ese editor
3. **Seleccionalo todo y copialo al portapapeles** — para que `Ctrl+C` esté listo
4. Si la IA falla, abrís el editor, `Ctrl+A`, `Ctrl+C`, vas al diario, `Ctrl+V` en el archivo `index.html`. Sin drama, sin disculpas.

### Setup del archivo en el diario

Antes de empezar la presentación, en tu proyecto de demo:
1. **Creá un tema vacío** llamado "Demo Tribunal" (o como quieras)
2. **Creá un archivo `index.html` vacío** dentro
3. **Dejalo abierto en pantalla** justo antes de pasar a la demo del papel
4. La IA escribirá EN ese archivo cuando le mandes la foto

### Ensayo específico de este momento

Esto NO se ensaya tres veces — se ensaya VEINTE veces. En condiciones distintas:
- Con buena luz natural
- Con luz artificial fluorescente (típica del aula)
- A contraluz
- Con la mano temblando un poco (simulá nervios)
- Desde distancia corta (30cm)
- Desde distancia media (50cm)

**Métrica de éxito**: si en 15 de 20 ensayos la IA transcribe el código completo en menos de 8 segundos, está listo. Si no, hay que considerar saltarse este momento o reforzar el Plan B.

### Si vas SUPER bien de tiempo (raro pero posible)

Después de que el código se ejecute, podés añadir 10 segundos de remate:
> *"Esto que veis se llama Live Sandbox. Y como mencioné antes, si yo publico este proyecto en el blog comunitario, cualquier visitante del blog puede pulsar este mismo botón y ver el resultado en su navegador. Es el TFG mostrándose a sí mismo."*

Pero solo si tenés margen. Si no, después del play seguís con el bloque de mensajes.

---

## RECOMENDACIONES FINALES

- **Ensayá con cronómetro mínimo 5 veces**, no 3. Esto es matrícula.
- **El bloque de demo es el más crítico** — practicalo por separado con la app real, no de memoria
- **Tené el usuario de demo cargado y la app despierta** antes de entrar a la sala
- **Antes de la presentación**, accedé a la app desplegada al menos 30 min antes para que no esté dormida
- **Plan B**: si la demo en vivo falla, tené capturas o un video corto de respaldo en el escritorio
- **Preguntas frecuentes que te van a hacer** (preparalas):
  - "¿Dónde se almacena la foto que el usuario envía?" — En ningún sitio. El backend actúa como proxy puro: recibe la imagen en base64, la reenvía a Groq con la clave API protegida, y devuelve solo el texto extraído. La imagen vive en memoria del servidor durante milisegundos. No se persiste en disco, no se guarda en base de datos, no se sube a Firebase Storage. Cero huella. Esto es decisión consciente: privacidad por diseño + cumplimiento RGPD (no procesamos datos personales más allá de lo estrictamente necesario).
  - "¿Y por qué no llamáis a Groq directamente desde el frontend?" — Por seguridad. Si el frontend llamara directo a Groq necesitaría tener la clave API embebida en el código — y cualquiera podría verla con las herramientas de desarrollador del navegador y gastar mi cuota. Pasando por el backend, la clave queda en una variable de entorno del servidor, nunca expuesta al cliente. Es el patrón estándar para integrar servicios de terceros de pago.
  - "¿Por qué Groq con Llama 3.3 y no OpenAI Vision o Google Cloud Vision?" — Tres razones. Primera: latencia. Groq corre los modelos en chips diseñados específicamente para inferencia — las respuestas tardan menos de un segundo, contra los 3-5 segundos típicos de OpenAI. Segunda: coste cero en cuota gratuita generosa, ideal para un TFG y para escalar después sin compromiso económico. Tercera: independencia de proveedor — si mañana Groq sube precios o cierra, puedo cambiar a otro modelo open source con el mismo formato de API. Con OpenAI me ataría al ecosistema cerrado.
  - "¿Y qué hacés si la IA visión falla en producción?" — Hay dos niveles de degradación elegante. Primer nivel: si la API responde con error, muestro al usuario un mensaje específico y le ofrezco pegar el código manualmente. Segundo nivel: si Groq está caído totalmente, la funcionalidad de visión queda bloqueada pero el resto del IDE sigue funcionando con normalidad — no hay acoplamiento. El editor, los commits y el sandbox son independientes de la IA.
  - "¿Por qué Swagger si en Spring no viene nativo?" — Decisión consciente. En FastAPI viene de fábrica, en Spring hay que añadirlo (`springdoc-openapi`). Lo añadí porque permite que cualquier desarrollador explore y pruebe la API sin leerse el código — y porque el tribunal puede probarlo en vivo autenticándose con el token Firebase. Sin Swagger, la API queda como caja negra.
  - "¿Por qué Docker para todo y no instalación directa en el VPS?" — Reproducibilidad. Hoy lo replicás en otro servidor con dos comandos, sin instalar nada a mano. Aísla dependencias entre componentes (el backend no contamina la base de datos ni viceversa). Es el estándar profesional moderno — el mismo enfoque que usa Netflix, Amazon o cualquier empresa que escala.
  - "¿Por qué dos formatos de exportación, CSV y Markdown?" — Cada uno cubre un caso de uso distinto. Markdown es estándar para documentación técnica y para pasarle el contexto a una IA. CSV es estándar para análisis de datos (Excel, Pandas, BI). Y hay un principio detrás: portabilidad. El usuario es dueño de sus datos, no la plataforma — eso es básico en cumplimiento RGPD.
  - "¿Por qué Spring Security si ya tenés Firebase?" — Son capas distintas con responsabilidades distintas. Firebase = AUTENTICACIÓN (quién sos). Spring Security = AUTORIZACIÓN (qué podés hacer) + hardening HTTP (HSTS, CSP, anti-clickjacking, CORS whitelist) + RBAC con `@PreAuthorize`. Un atacante con token válido sigue sin poder salirse de su rol gracias a Spring Security.
  - "¿Y por qué no rolaste tu propio JWT en vez de delegar en Firebase?" — Porque la gestión de identidad es un dominio peligroso: rotación de claves, revocación, MFA, recuperación de contraseña, fraude. Firebase resuelve eso a coste cero y con auditoría profesional. Yo me concentro en el dominio del negocio. Esto es Zero-Trust práctico.
  - "¿Por qué los commits son manuales y no automáticos por cambio?" — Porque autoguardar cada cambio convertiría el historial en ruido ilegible. Git enseña desde hace veinte años que el desarrollador decide cuándo un cambio merece quedar registrado. Repliqué ese flujo a propósito — trazabilidad de DECISIONES, no de teclazos.
  - "¿Por qué Signals si tenés RxJS?" — Signals para estado local, RxJS para streams async. Híbrido recomendado por Angular.
  - "¿Por qué AOP y no un interceptor?" — AOP intercepta a nivel de método con anotación, sin tocar el flujo HTTP. El interceptor mezcla auditoría con la capa de transporte.
  - "¿Por qué Kotlin y no Java?" — Null-safety, data classes, less boilerplate, total interop.
  - "¿Por qué PgBouncer?" — Reutilización del pool, escalabilidad del backend sin saturar PostgreSQL.
  - "¿Qué pasa si Firebase se cae?" — Los usuarios actualmente logueados siguen, los tokens son válidos hasta expirar. Para mitigarlo se podría añadir un proveedor secundario (Auth0, Cognito), pero queda fuera del alcance del TFG.
  - "¿Qué harías diferente si empezaras de cero?" — Tener tests E2E desde el día uno (los añadí tarde), separar el blog comunitario en un microservicio, considerar GraphQL para evitar overfetching en el panel admin.
