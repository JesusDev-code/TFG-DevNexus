  Batería de pruebas — Todo lo implementado

  GRUPO 1 — Exportación CSV y MD (Web)

  ┌─────┬─────────────────────────────────────────────┬─────────────────────────────────────────────────────────────┐
  │  #  │                   Acción                    │                     Resultado esperado                      │
  ├─────┼─────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
  │ P01 │ Entrar al Diario → seleccionar un tema con  │ Se descarga un fichero .csv con las entradas del tema       │
  │     │ entradas → pulsar botón CSV                 │                                                             │
  ├─────┼─────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
  │ P02 │ Abrir el CSV descargado                     │ Tiene cabecera tema_id,tema_titulo,diario_id,... y una fila │
  │     │                                             │  por entrada                                                │
  ├─────┼─────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
  │ P03 │ Con el mismo tema → pulsar botón MD         │ Se descarga un fichero .md                                  │
  ├─────┼─────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
  │ P04 │ Abrir el MD descargado                      │ Tiene # Título del tema, separadores --- y el contenido     │
  │     │                                             │ Markdown de cada entrada                                    │
  ├─────┼─────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
  │ P05 │ Tema sin entradas → pulsar MD               │ Se descarga un .md solo con el título (sin entradas, sin    │
  │     │                                             │ errores)                                                    │
  └─────┴─────────────────────────────────────────────┴─────────────────────────────────────────────────────────────┘

  ---
  GRUPO 2 — Exportación CSV y MD (Android APK) ⚠️ Requiere rebuild

  ┌─────┬───────────────────────────────────────────────┬───────────────────────────────────────────────────────────┐
  │  #  │                    Acción                     │                    Resultado esperado                     │
  ├─────┼───────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
  │ P06 │ APK → Diario → tema con entradas → botón CSV  │ Se abre el diálogo nativo del sistema "Guardar /          │
  │     │                                               │ Compartir"                                                │
  ├─────┼───────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
  │ P07 │ APK → mismo tema → botón MD                   │ Mismo diálogo nativo para el .md                          │
  ├─────┼───────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
  │ P08 │ Guardar el archivo → buscarlo en el           │ Fichero accesible y con contenido correcto                │
  │     │ explorador                                    │                                                           │
  └─────┴───────────────────────────────────────────────┴───────────────────────────────────────────────────────────┘

  ---
  GRUPO 3 — Scan IA (foto → código)

  ┌─────┬──────────────────────────────────────────┬────────────────────────────────────────────────────────────────┐
  │  #  │                  Acción                  │                       Resultado esperado                       │
  ├─────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
  │ P09 │ Diario → tema → formulario nueva entrada │ Se abre el selector de imágenes (web) o la cámara (Android)    │
  │     │  → pulsar Scan IA                        │                                                                │
  ├─────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
  │ P10 │ Seleccionar una foto de código           │ El botón muestra "Procesando..." y se deshabilita              │
  ├─────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
  │ P11 │ Esperar respuesta                        │ El código extraído aparece en el textarea como bloque          │
  │     │                                          │ ```código```                                                   │
  ├─────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
  │ P12 │ Pulsar Scan IA con otro fragmento        │ El código nuevo se añade al final del existente, no reemplaza  │
  ├─────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
  │ P13 │ Imagen sin código (p.ej. foto de un      │ La IA devuelve texto vacío o descriptivo — no rompe, muestra   │
  │     │ paisaje)                                 │ toast de éxito o error legible                                 │
  ├─────┼──────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
  │ P14 │ Backend caído / GROQ_API_KEY incorrecta  │ Toast "No se pudo procesar la imagen" — no pantalla en blanco  │
  └─────┴──────────────────────────────────────────┴────────────────────────────────────────────────────────────────┘

  ---
  GRUPO 4 — Sugerencia de etiquetas IA

  ┌─────┬──────────────────────────────────────────────────┬────────────────────────────────────────────────────────┐
  │  #  │                      Acción                      │                   Resultado esperado                   │
  ├─────┼──────────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
  │ P15 │ Formulario vacío → botón Etiquetas IA            │ Botón deshabilitado (no hace nada)                     │
  ├─────┼──────────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
  │ P16 │ Escribir texto técnico → pulsar Etiquetas IA     │ Aparecen 3–5 chips de etiquetas bajo la fila de        │
  │     │                                                  │ plantillas                                             │
  ├─────┼──────────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
  │ P17 │ Hacer clic en un chip de etiqueta                │ Se añade #etiqueta al final del textarea               │
  ├─────┼──────────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
  │ P18 │ Hacer clic en otro chip                          │ Se añade otro #etiqueta — los anteriores no se borran  │
  ├─────┼──────────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
  │ P19 │ Escribir nuevo texto → volver a pulsar Etiquetas │ Los chips anteriores desaparecen y aparecen los nuevos │
  │     │  IA                                              │                                                        │
  └─────┴──────────────────────────────────────────────────┴────────────────────────────────────────────────────────┘

  ---
  GRUPO 5 — Code Review IA

  ┌─────┬────────────────────────────────────────────┬──────────────────────────────────────────────────────────────┐
  │  #  │                   Acción                   │                      Resultado esperado                      │
  ├─────┼────────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ P20 │ Entrada con código → pulsar ✨ en sus      │ Botón se deshabilita mientras carga                          │
  │     │ acciones                                   │                                                              │
  ├─────┼────────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ P21 │ Esperar respuesta                          │ Aparece un panel violeta bajo la entrada con el review en    │
  │     │                                            │ Markdown                                                     │
  ├─────┼────────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ P22 │ Pulsar ✨ de nuevo                         │ El panel desaparece (toggle)                                 │
  ├─────┼────────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ P23 │ Pedir review de dos entradas distintas a   │ Cada una muestra su propio panel independiente               │
  │     │ la vez                                     │                                                              │
  ├─────┼────────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ P24 │ Entrada sin código (solo texto)            │ La IA analiza el enfoque técnico — no rompe                  │
  ├─────┼────────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
  │ P25 │ Error de red                               │ Toast "No se pudo obtener el code review" — el panel no      │
  │     │                                            │ aparece                                                      │
  └─────┴────────────────────────────────────────────┴──────────────────────────────────────────────────────────────┘

  ---
  GRUPO 6 — Resumen ejecutivo IA

  ┌─────┬────────────────────────────────────────┬──────────────────────────────────────────────────────────────────┐
  │  #  │                 Acción                 │                        Resultado esperado                        │
  ├─────┼────────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
  │ P26 │ Tema con entradas → pulsar Resumen IA  │ Botón muestra "..." mientras carga                               │
  ├─────┼────────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
  │ P27 │ Esperar respuesta                      │ Aparece panel con resumen estructurado (estado, tecnologías,     │
  │     │                                        │ hitos, próximos pasos)                                           │
  ├─────┼────────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
  │ P28 │ Pulsar Ocultar                         │ El panel se cierra                                               │
  ├─────┼────────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
  │ P29 │ Pulsar Resumen IA de nuevo (resumen ya │ Se muestra instantáneamente sin nueva llamada                    │
  │     │  cargado)                              │                                                                  │
  ├─────┼────────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
  │ P30 │ Tema sin entradas → pulsar Resumen IA  │ Toast de error — no pantalla en blanco                           │
  ├─────┼────────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
  │ P31 │ Volver a temas y entrar a otro →       │ Se genera el resumen del nuevo tema, no del anterior             │
  │     │ pulsar Resumen IA                      │                                                                  │
  └─────┴────────────────────────────────────────┴──────────────────────────────────────────────────────────────────┘

  ---
  GRUPO 7 — Menú safe area Android ⚠️ Requiere rebuild

  ┌─────┬─────────────────────────────────┬─────────────────────────────────────────────────────────────────────────┐
  │  #  │             Acción              │                           Resultado esperado                            │
  ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ P32 │ APK → entrar al perfil de       │ El menú de pestañas (Diario, Tickets...) aparece por debajo de la barra │
  │     │ usuario                         │  de estado, sin solaparse                                               │
  ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ P33 │ APK → entrar al panel de        │ El título "Panel de Administración" y el menú de tabs respetan la       │
  │     │ administración                  │ notch/status bar                                                        │
  ├─────┼─────────────────────────────────┼─────────────────────────────────────────────────────────────────────────┤
  │ P34 │ Web → mismas páginas            │ El menú sigue en la misma posición que antes (sin cambios en web)       │
  └─────┴─────────────────────────────────┴─────────────────────────────────────────────────────────────────────────┘

  ---
  GRUPO 8 — Prueba de seguridad (API key)

  ┌─────┬──────────────────────────────────────┬────────────────────────────────────────────────────────────────────┐
  │  #  │                Acción                │                         Resultado esperado                         │
  ├─────┼──────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
  │ P35 │ Abrir DevTools → Network → hacer     │ La request va a tudominio/api/diario-ai/... o /api/vision/...,     │
  │     │ cualquier llamada de IA              │ nunca a api.groq.com directamente                                  │
  ├─────┼──────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤
  │ P36 │ Inspeccionar el payload de la        │ No contiene ninguna API key ni token de Groq                       │
  │     │ request                              │                                                                    │
  └─────┴──────────────────────────────────────┴────────────────────────────────────────────────────────────────────┘

  ---
  Prioridad de ejecución:
  1. Grupos 3–6 (todo web, se puede probar ahora)
  2. Grupo 8 (seguridad, 2 minutos en DevTools)
  3. Grupos 1–2 y 7 (Android, tras rebuild)
Errores---

en proyectos los botonces csv y md siguen sin descargarse, sale para compartir pero no se comparte, además los botones no hacen scroll,por otro lado, se ha movido el botón eliminar pero ahora en su lugar se ha cambiado a editar y el botón de chat lo oculta, además el botón de hambirgesa sigue ocultando prte del menú.