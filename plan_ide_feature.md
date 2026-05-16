# Plan — DevNexus IDE Feature

## Visión general

Transformar la vista de detalle de proyecto en un **entorno de desarrollo integrado** (IDE) dentro de la propia app. El usuario podrá crear y editar archivos de código (HTML, CSS, JS, Markdown), ver el historial de cambios como commits, y ejecutar el proyecto en un sandbox de preview en tiempo real. La IA analiza el proyecto en ejecución y da retroalimentación.

```
ANTES:  Lista de entradas markdown sueltas, sin unidad de proyecto
DESPUÉS: VS Code-like IDE — árbol de archivos + editor + preview + commit log + AI
```

---

## Arquitectura objetivo

```
┌────────────────────────────────────────────────────────────────────────┐
│  IDE View (/user-profile/diario + temaSeleccionado)                    │
│                                                                        │
│  ┌──────────────┬──────────────────────────────┬─────────────────────┐ │
│  │  FILE TREE   │       MONACO EDITOR           │   AI PANEL          │ │
│  │  220px       │       flex: 1                 │   300px (toggle)    │ │
│  │              │                               │                     │ │
│  │  📁 src/     │  // index.html                │  ✦ AI Feedback      │ │
│  │    index.html│  <!DOCTYPE html>              │  ─────────────────  │ │
│  │    style.css │  <html>                       │  Tu estructura HTML │ │
│  │    script.js │    ...                        │  está bien. Te      │ │
│  │  📄 README.md│                               │  falta un meta      │ │
│  │              │                               │  viewport...        │ │
│  │  [+ Archivo] │                               │                     │ │
│  └──────────────┴──────────────────────────────┴─────────────────────┘ │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  STATUS BAR:  index.html · HTML · 24 líneas · UTF-8 · [▶ Run]  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  [COMMIT LOG — panel inferior, toggle]                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  ● hace 2h — "Añadí el nav responsive"                         │   │
│  │  ● ayer    — "Fix del botón de submit"                         │   │
│  │  ● hace 3d — "Init del proyecto"                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Modelo de datos — cambios

### Filosofía
El modelo backend **no se rompe**. Las entradas existentes funcionan como antes (tipo LOG). Los nuevos archivos son entradas con dos campos nuevos: `tipo` y `filename`. Retrocompatible al 100%.

### Backend — Diario.kt (2 campos nuevos)

```kotlin
// Nuevos campos a añadir:
@Column(length = 20, nullable = true)
var tipo: String? = null                // "FILE" | "LOG" | null (null = LOG legacy)

@Column(length = 255, nullable = true)
var filename: String? = null           // "index.html", "style.css", "script.js", etc.
```

### Backend — DiarioCreateDto.kt (2 campos nuevos)

```kotlin
val tipo: String? = null               // opcional, default = "LOG"
val filename: String? = null           // obligatorio si tipo == "FILE"
```

### Backend — DiarioDto.kt (2 campos nuevos)

```kotlin
val tipo: String?
val filename: String?
```

### Frontend — models.ts (actualizar DiarioDto y DiarioCreateDto)

```typescript
// DiarioDto: añadir
tipo?: string;      // "FILE" | "LOG" | null
filename?: string;  // nombre del archivo

// DiarioCreateDto: añadir
tipo?: string;
filename?: string;
```

---

## Backend — cambios y nuevos endpoints

### 1. Migración de base de datos

Añadir columnas `tipo` y `filename` a la tabla `diario`. Spring Boot con `spring.jpa.hibernate.ddl-auto=update` lo hace automáticamente en dev. En prod necesitás el script:

```sql
ALTER TABLE diario ADD COLUMN tipo VARCHAR(20) NULL;
ALTER TABLE diario ADD COLUMN filename VARCHAR(255) NULL;
```

### 2. Nuevo endpoint: obtener archivos actuales de un proyecto

```
GET /api/diarios/tema/{temaId}/archivos
```

Devuelve la **versión más reciente** de cada archivo (agrupado por filename, ordenado por fechaCreacion DESC, take 1 por grupo). Respuesta:

```json
[
  { "id": 42, "filename": "index.html", "contenido": "<!DOCTYPE...", "tipo": "FILE", "fechaCreacion": "..." },
  { "id": 38, "filename": "style.css",  "contenido": "body {...",   "tipo": "FILE", "fechaCreacion": "..." },
  { "id": 35, "filename": "script.js",  "contenido": "const app=...", "tipo": "FILE", "fechaCreacion": "..." }
]
```

**Implementación backend (DiarioService.kt):**

```kotlin
fun getArchivosActuales(temaId: Int): List<DiarioDto> {
    // Obtener todas las entradas de tipo FILE del tema
    // Agrupar por filename
    // Por cada grupo tomar la más reciente (maxBy fechaCreacion)
    // Mapear a DiarioDto
}
```

### 3. Nuevo endpoint: análisis IA del proyecto completo

```
POST /api/diario-ai/analizar-proyecto/{temaId}
```

Recibe el temaId, obtiene todos los archivos actuales, los envía a Groq con un prompt de análisis de código, devuelve feedback estructurado.

**Respuesta:**
```json
{
  "feedback": "## Análisis del proyecto\n...",
  "score": 85,
  "sugerencias": ["Añadir meta viewport", "Separar lógica en funciones"],
  "errores": ["Script sin defer/async"]
}
```

**Implementación (DiarioAIService.kt):**

```kotlin
fun analizarProyecto(temaId: Int): Map<String, Any> {
    val archivos = diarioService.getArchivosActuales(temaId)
    val prompt = buildAnalysisPrompt(archivos)
    val respuesta = groqClient.chat(prompt)
    return parseAnalysisResponse(respuesta)
}
```

### 4. Actualizar DiarioService.kt — método create y update

Asegurarse que al crear/actualizar una entrada se persistan los nuevos campos `tipo` y `filename` si vienen en el DTO.

---

## Frontend — nuevos componentes

### Estructura de archivos a crear

```
Front/src/app/pages/user-profile/user-diary/
├── user-diary.page.ts           (modificar)
├── user-diary.page.html         (modificar)
├── user-diary.page.scss         (modificar)
│
├── ide-view/                    ← NUEVO
│   ├── ide-view.component.ts
│   ├── ide-view.component.html
│   └── ide-view.component.scss
│
├── file-tree/                   ← NUEVO
│   ├── file-tree.component.ts
│   ├── file-tree.component.html
│   └── file-tree.component.scss
│
├── sandbox-preview/             ← NUEVO
│   ├── sandbox-preview.component.ts
│   ├── sandbox-preview.component.html
│   └── sandbox-preview.component.scss
│
├── commit-log/                  ← NUEVO
│   ├── commit-log.component.ts
│   ├── commit-log.component.html
│   └── commit-log.component.scss
│
└── ai-feedback-panel/           ← NUEVO
    ├── ai-feedback-panel.component.ts
    ├── ai-feedback-panel.component.html
    └── ai-feedback-panel.component.scss
```

### Dependencias a instalar

```bash
npm install @monaco-editor/angular monaco-editor
```

En `angular.json` → `assets`, añadir:
```json
{
  "glob": "**/*",
  "input": "node_modules/monaco-editor/min/vs",
  "output": "assets/monaco/vs"
}
```

En el módulo o bootstrap de la app, configurar Monaco:
```typescript
// En app.config.ts o donde se bootstrapea:
provideMonacoEditor({
  defaultOptions: { scrollBeyondLastLine: false, theme: 'vs-dark' }
})
```

---

## Especificación detallada de componentes

### IdeViewComponent

**Responsabilidad:** Orquestador del IDE. Gestiona el estado del editor: archivo activo, archivos del proyecto, paneles abiertos/cerrados.

**Estado:**
```typescript
archivos: DiarioDto[]           // archivos actuales del proyecto
archivoActivo: DiarioDto | null // archivo abierto en el editor
contenidoEditor: string         // contenido actual del editor (puede tener cambios sin guardar)
tienesCambios: boolean          // true si el editor tiene cambios sin pushear
commitLog: DiarioDto[]          // todas las entradas LOG del proyecto
mostrarPreview: boolean
mostrarAI: boolean
mostrarCommitLog: boolean
cargandoAI: boolean
feedbackAI: any | null
```

**Métodos:**
```typescript
cargarArchivos(temaId)           // GET /api/diarios/tema/{temaId}/archivos
seleccionarArchivo(archivo)      // actualiza archivoActivo y contenidoEditor
guardarArchivo()                 // POST /api/diarios con tipo=FILE, filename, contenido
nuevoArchivo(nombre)             // abre dialog, crea entrada FILE vacía
ejecutarProyecto()               // abre SandboxPreview con archivos actuales
analizarConIA()                  // POST /api/diario-ai/analizar-proyecto/{temaId}
getIconForFile(filename)         // retorna ionicon según extensión
```

**Layout SCSS:**
```scss
.ide-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  grid-template-rows: 1fr auto auto;
  height: calc(100vh - 120px);  // ajustar según header de la app
  gap: 0;
  overflow: hidden;
}

.ide-layout.with-ai {
  grid-template-columns: 220px 1fr 300px;
}
```

---

### FileTreeComponent

**Inputs:** `archivos: DiarioDto[]`, `archivoActivo: DiarioDto | null`
**Outputs:** `archivoSeleccionado: EventEmitter<DiarioDto>`, `nuevoArchivo: EventEmitter<void>`, `borrarArchivo: EventEmitter<DiarioDto>`

**Estructura visual:**
```
📁 {nombre-proyecto}
├── 📄 index.html     ← activo (resaltado)
├── 🎨 style.css
├── ⚡ script.js
└── 📝 README.md

[+ Nuevo archivo]
```

**Iconos por extensión:**
- `.html` → `code-slash-outline`
- `.css` → `color-palette-outline`
- `.js` / `.ts` → `logo-javascript` / `logo-angular`
- `.md` → `document-text-outline`
- `.json` → `layers-outline`
- default → `document-outline`

---

### SandboxPreviewComponent

**Responsabilidad:** Recibe los archivos del proyecto, construye el HTML combinado, lo ejecuta en un iframe con `srcdoc`. También captura los errores de consola del sandbox.

**Inputs:** `archivos: DiarioDto[]`, `nombreProyecto: string`

**Lógica de build del sandbox:**
```typescript
buildSandboxContent(archivos: DiarioDto[]): string {
  const html = archivos.find(f => f.filename === 'index.html')?.contenido ?? '<p>Sin index.html</p>';
  const css  = archivos.find(f => f.filename?.endsWith('.css'))?.contenido ?? '';
  const js   = archivos.find(f => f.filename?.endsWith('.js'))?.contenido ?? '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>
          // Interceptar errores y mandarlos al parent
          window.onerror = (msg, src, line, col, err) => {
            window.parent.postMessage({ type: 'sandbox-error', msg, line, col }, '*');
          };
          console.error = (...args) => {
            window.parent.postMessage({ type: 'console-error', args: args.map(String) }, '*');
          };
        </script>
        <script>${js}</script>
      </body>
    </html>
  `;
}
```

**El iframe:**
```html
<iframe
  [srcdoc]="sandboxContent"
  sandbox="allow-scripts allow-same-origin"
  class="preview-frame">
</iframe>
```

**Captura de errores del sandbox (en el componente padre):**
```typescript
@HostListener('window:message', ['$event'])
onSandboxMessage(event: MessageEvent) {
  if (event.data?.type === 'sandbox-error') {
    this.sandboxErrors.push(event.data);
  }
}
```

**Cómo se abre:** En una ruta nueva `/user-profile/diario/preview/:temaId` O como modal fullscreen con `ion-modal`. Recomendado: **modal fullscreen** para no necesitar cambios de routing.

---

### CommitLogComponent

**Responsabilidad:** Muestra el historial de entradas LOG del proyecto (no archivos FILE). Es el historial de trabajo del developer.

**Inputs:** `temaId: number`, `entradas: DiarioDto[]`

**Visual:** Timeline vertical con:
- Hash corto simulado (primeros 7 chars del id en hex)
- Fecha relativa
- Preview del contenido (primeras 80 chars)
- Badge de tipo (daily/bug/feature)
- Hover: botones de Code Review IA, pin, eliminar

---

### AiFeedbackPanelComponent

**Responsabilidad:** Panel lateral que muestra el análisis IA del proyecto en su estado actual.

**Inputs:** `feedback: any | null`, `cargando: boolean`
**Outputs:** `solicitarAnalisis: EventEmitter<void>`

**Secciones del panel:**
```
✦ AI  [ANALIZAR]

── Puntuación general ──
  [████████░░] 82/100

── Sugerencias ──
  ① Añadir meta viewport
  ② Separar lógica de presentación

── Errores detectados ──
  ⚠ Script sin atributo defer

── Análisis completo ──
  [markdown expandible]
```

---

## Fases de implementación

### FASE 1 — Backend (2-3 días)
Objetivo: la API soporta el nuevo modelo de archivos.

- [ ] Añadir campos `tipo` y `filename` a `Diario.kt`
- [ ] Actualizar `DiarioCreateDto.kt` y `DiarioDto.kt`
- [ ] Actualizar mapper en `DiarioService.kt` para persistir/retornar los nuevos campos
- [ ] Implementar `getArchivosActuales(temaId)` en `DiarioService.kt`
- [ ] Añadir endpoint `GET /api/diarios/tema/{temaId}/archivos` en `DiarioController.kt`
- [ ] Implementar `analizarProyecto(temaId)` en `DiarioAIService.kt`
- [ ] Añadir endpoint `POST /api/diario-ai/analizar-proyecto/{temaId}` en `DiarioAIController.kt`
- [ ] Test manual: crear entrada FILE via Postman, verificar que GET archivos la devuelve

### FASE 2 — Infraestructura frontend (1 día)
Objetivo: Monaco Editor funcionando en la app.

- [ ] Instalar `@monaco-editor/angular` y `monaco-editor`
- [ ] Configurar assets de Monaco en `angular.json`
- [ ] Configurar `provideMonacoEditor` en `app.config.ts`
- [ ] Añadir métodos nuevos a `diario.service.ts`: `getArchivosActuales()`, `analizarProyecto()`
- [ ] Actualizar `DiarioDto` y `DiarioCreateDto` en `models.ts`
- [ ] Verificar que el app compila sin errores

### FASE 3 — IdeViewComponent (2-3 días)
Objetivo: el layout VS Code completo con editor funcional.

- [ ] Crear `ide-view.component` (ts, html, scss)
- [ ] Crear `file-tree.component` (ts, html, scss)
- [ ] Integrar Monaco Editor con lenguaje automático según extensión del archivo
- [ ] Implementar guardado de archivo (= crear nueva entrada FILE en backend)
- [ ] Indicador de "cambios sin guardar" (punto en la tab del archivo activo)
- [ ] Status bar inferior con: nombre archivo, lenguaje, líneas, botón Run
- [ ] Integrar IdeViewComponent en `user-diary.page.html` (reemplaza la vista de detalle actual)
- [ ] Botón "Volver" que lleva de vuelta a la lista de proyectos

### FASE 4 — SandboxPreviewComponent (1-2 días)
Objetivo: el botón Run ejecuta el proyecto.

- [ ] Crear `sandbox-preview.component` (ts, html, scss)
- [ ] Implementar `buildSandboxContent()` con combinación de archivos
- [ ] Iframe con `srcdoc` y `sandbox="allow-scripts"`
- [ ] Captura de errores del sandbox via `postMessage`
- [ ] Panel de consola/errores debajo del iframe
- [ ] Abrir como modal fullscreen con `ion-modal`
- [ ] Botón "Cerrar preview" en la modal

### FASE 5 — CommitLogComponent (1 día)
Objetivo: historial de trabajo visible.

- [ ] Crear `commit-log.component` (ts, html, scss)
- [ ] Panel inferior toggle (chevron up/down)
- [ ] Renderizar entradas LOG con hash simulado, fecha relativa, preview de contenido
- [ ] Integrar en IdeViewComponent como panel colapsable
- [ ] Formulario quick-commit en el panel (textarea + botón "Commit")

### FASE 6 — AiFeedbackPanelComponent (1 día)
Objetivo: la IA da feedback sobre el proyecto en ejecución.

- [ ] Crear `ai-feedback-panel.component` (ts, html, scss)
- [ ] Llamada a `POST /api/diario-ai/analizar-proyecto/{temaId}`
- [ ] Parsear y mostrar: score, sugerencias, errores, análisis completo
- [ ] Panel lateral toggle (botón en topbar del IDE)
- [ ] Integrar con el botón "Run": al ejecutar, disparar análisis IA automáticamente

### FASE 7 — Pulido y fix (1 día)
- [ ] Fix del bug freeze al editar (ChangeDetectionStrategy.OnPush + hover state)
- [ ] Responsive: en mobile el IDE pasa a layout stacked (tree arriba, editor abajo)
- [ ] Soporte de múltiples archivos con tabs (si da tiempo)
- [ ] Empty state del IDE cuando el proyecto no tiene archivos aún
- [ ] Transición animada entre la lista de proyectos y el IDE

---

## Decisiones técnicas

| Decisión | Opción elegida | Alternativa descartada | Por qué |
|---|---|---|---|
| Editor de código | `@monaco-editor/angular` | CodeMirror 6 | Monaco es el mismo engine de VS Code, mejor UX y soporte de lenguajes |
| Sandbox de preview | iframe con `srcdoc` | iframe con `src` externo / WebContainers | Más simple, no necesita servidor, funciona offline, seguro con `sandbox` attr |
| Apertura del preview | Modal fullscreen (`ion-modal`) | Nueva ruta/página | Evita cambios de routing, mantiene estado del editor |
| Persistencia de archivos | Entradas Diario con tipo=FILE | Nuevo modelo/tabla | Reutiliza toda la infraestructura existente (auth, permisos, historial, IA) |
| Lenguaje del editor | Autodetectado por extensión | Manual | Mejor UX, Monaco tiene detección automática |
| AI del proyecto | Nuevo endpoint en DiarioAIController | Prompt en frontend | Mantiene lógica de negocio en backend, reutiliza Groq client existente |

---

## Consideraciones de seguridad del sandbox

El iframe usa `sandbox="allow-scripts"` (sin `allow-same-origin`). Esto significa:
- El código del usuario **no puede** acceder a cookies, localStorage ni al DOM del parent
- El código **sí puede** ejecutar JavaScript
- Ideal para HTML/CSS/JS básico
- Limitación: no puede hacer fetch a APIs externas sin `allow-same-origin` — para el TFG es aceptable

---

## Flujo completo del usuario

```
1. Usuario en lista de proyectos
   → Click en proyecto "Mi Portfolio"
   
2. Abre IDE view
   → Árbol de archivos vacío
   → Empty state: "Creá tu primer archivo — index.html"
   
3. Crea index.html
   → Monaco Editor se abre en modo HTML
   → Escribe código
   → Click "Push" (= guardar = crear entrada FILE en backend)
   → El archivo aparece en el árbol
   
4. Crea style.css, script.js
   → Mismo flujo

5. Click "▶ Run"
   → Modal fullscreen se abre
   → iframe renderiza el proyecto
   → Automáticamente: AI analiza el código
   → Panel IA aparece con feedback: "Tu proyecto tiene un 78/100..."
   
6. Usuario cierra preview, vuelve al editor
   → Hace cambios en style.css
   → Escribe un commit en el CommitLog: "Arreglé el responsive del nav"
   → Este commit es una entrada LOG (texto libre, como antes)
   
7. Historial final:
   FILE: index.html  (v3, última edición)
   FILE: style.css   (v2)
   FILE: script.js   (v1)
   LOG:  "Arreglé el responsive del nav"
   LOG:  "Añadí animaciones"
   LOG:  "Init del proyecto"
```

---

## Stack final del feature

| Capa | Tecnología |
|---|---|
| Editor | Monaco Editor via `@monaco-editor/angular` |
| Sandbox | Native HTML `<iframe srcdoc>` |
| Comunicación sandbox↔app | `window.postMessage` API |
| AI análisis | Groq (ya integrado en el backend) |
| Persistencia de archivos | Spring Boot + tabla `diario` (campos nuevos) |
| UI layout | CSS Grid 3 columnas + ion-modal |
