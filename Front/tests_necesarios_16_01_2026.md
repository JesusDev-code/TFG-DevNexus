# Tests Pendientes — 16/01/2026

## Estado actual
- **Unit tests (Karma):** 96/96 ✅
- **E2E (Cypress):** 11/11 ✅

---

## Unit Tests que faltan

### Servicios sin spec.ts

#### 1. `src/app/services/diario.service.ts` (89 líneas)
- Métodos a testear: CRUD de entradas del diario (GET, POST, PUT, DELETE)
- Usar `HttpClientTestingModule` + `HttpTestingController`
- Verificar que las URLs del API son correctas
- Verificar que los datos se transforman correctamente

#### 2. `src/app/services/support-chat.service.ts` (114 líneas)
- Métodos a testear: obtener mensajes del chat de soporte, enviar mensaje
- Usar `HttpClientTestingModule`
- Verificar headers de autenticación si los hay

#### 3. `src/app/services/events.service.ts` (24 líneas)
- Servicio pequeño — test rápido
- Verificar llamadas HTTP al endpoint de eventos

#### 4. `src/app/services/notificacion.service.ts` (32 líneas)
- Servicio pequeño — test rápido
- Verificar obtención y marcado como leídas de notificaciones

#### 5. `src/app/services/fcm.service.ts` (99 líneas)
- Firebase Cloud Messaging — el más difícil de testear
- Mockear `AngularFireMessaging` o los módulos de Firebase
- Verificar `obtenerToken()` y `iniciarEscucha()`
- **Opcional:** puede dejarse sin test por ser infraestructura nativa

### Páginas sin spec.ts

#### 6. `src/app/pages/dashboard/dashboard.page.ts`
#### 7. `src/app/pages/dashboard/dash-board.page.ts`
- Verificar que el componente se crea correctamente
- Tests básicos de renderizado

---

## E2E Tests que faltan

### Flujos no cubiertos por Cypress

#### 1. Flujo Diario (`/user-profile/diario`)
- Login → navegar a diario
- Crear entrada nueva
- Editar entrada existente
- Eliminar entrada

#### 2. Flujo Eventos (`/user-profile/eventos`)
- Login → navegar a eventos
- Ver calendario
- Crear/ver evento

#### 3. Flujo Notificaciones (`/user-profile/notificaciones`)
- Login → navegar a notificaciones
- Verificar que la lista carga
- Marcar como leída

#### 4. Flujo Registro de Usuario
- Rellenar formulario de registro
- Verificar redirección/confirmación

#### 5. Flujo Edición de Perfil (`/user-profile/perfil`)
- Login → editar nombre/foto
- Guardar cambios y verificar actualización

---

## Notas técnicas importantes

### CDK Virtual Scroll en Cypress
Todos los componentes que usen `cdk-virtual-scroll-viewport` con `*cdkVirtualFor`
tienen el mismo problema: Cypress suprime `ResizeObserver` (ver `cypress/support/e2e.ts`),
lo que impide que el CDK calcule la altura del viewport y renderice ítems en el DOM.

**Solución probada y funcional:**
```javascript
// En lugar de cy.get('.lista .item').click()
cy.window().then((win: any) => {
    const appEl = win.document.querySelector('app-nombre-componente');
    const comp = win.ng?.getComponent(appEl);
    if (comp) comp.metodoDelComponente(datos);
});
```

Para verificar que los datos están en el estado del componente tras una recarga:
```javascript
// 1. Esperar la llamada INICIAL al montar el componente
cy.wait('@alias', { timeout: 15000 });
// 2. Hacer la acción (crear/modificar)
// 3. Esperar la SEGUNDA llamada (recarga tras la acción)
cy.wait('@alias', { timeout: 15000 });
// 4. Verificar via Angular API
cy.window().then((win: any) => {
    const comp = win.ng?.getComponent(win.document.querySelector('app-x'));
    const items = comp.señalFiltrada();
    expect(items.some(i => i.campo === valor)).to.be.true;
});
```

### Cuentas de test
- Usuario normal: `testing1@gmail.com` / `123456`
- Admin: `testing2@gmail.com` / `123456`

### Arrancar el servidor antes de Cypress
```bash
ng serve   # puerto 8100
npx cypress run --headless
```
