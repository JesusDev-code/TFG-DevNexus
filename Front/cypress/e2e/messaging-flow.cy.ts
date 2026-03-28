/**
 * E2E Test: Flujo de Mensajería
 *
 * Deep Dive: Verifica el sistema de mensajería instantánea.
 * El módulo de mensajes usa Signals computadas para filtrar
 * conversaciones y Optimistic UI para el envío de mensajes.
 *
 * Cuenta: Cypress.env('USER_EMAIL') / Cypress.env('USER_PASSWORD')
 */
describe('Flujo de Mensajería — Chat entre Usuarios', () => {

    beforeEach(() => {
        cy.viewport(1280, 800);
        cy.visit('/');
        cy.wait(2000);
        cy.ensureLoggedOut();
    });

    it('Paso 1: Login y navegar a la sección de Mensajes', () => {
        cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
        cy.url({ timeout: 15000 }).should('include', '/user-profile');

        // Navegar a mensajes usando selector preciso
        cy.get('.premium-user-bar .user-tab', { timeout: 10000 })
            .contains(/mensaje/i)
            .click({ force: true });
        cy.url().should('include', '/mensajes');
    });

    it('Paso 2: Verificar que la lista de conversaciones carga', () => {
        cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
        cy.url({ timeout: 15000 }).should('include', '/user-profile');

        cy.get('.premium-user-bar .user-tab', { timeout: 10000 })
            .contains(/mensaje/i)
            .click({ force: true });
        cy.url().should('include', '/mensajes');

        // Verificar que el layout de mensajería existe
        cy.get('.glass-layout-container, app-user-messages', { timeout: 15000 }).should('exist');
    });

    it('Paso 3: Abrir buscador de usuarios', () => {
        cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
        cy.url({ timeout: 15000 }).should('include', '/user-profile');

        cy.get('.premium-user-bar .user-tab', { timeout: 10000 })
            .contains(/mensaje/i)
            .click({ force: true });
        cy.url().should('include', '/mensajes');

        // Esperar a que el layout del chat se renderice completamente
        // antes de buscar el botón del buscador
        cy.get('.glass-layout-container', { timeout: 15000 }).should('exist');
        cy.get('.glass-sidebar', { timeout: 10000 }).should('exist');

        cy.wait(1000); // estabilizar overlay
        cy.get('.btn-add-glass', { timeout: 15000 }).should('exist').click({ force: true });

        // Verificar que aparece el panel de búsqueda
        cy.get('.user-finder-premium-panel', { timeout: 10000 }).should('exist');
        cy.get('.finder-input-wrapper input').should('exist');
    });

    it('Paso 4: Enviar mensaje de texto y emoji (conversación controlada)', () => {
        /**
         * Se usa cy.intercept para proveer una conversación y mensajes controlados.
         * El entorno de test solo tiene 2 usuarios (testing1, testing2-admin) y
         * la búsqueda de usuarios no devuelve al admin en el directorio regular.
         * Stubbear la lista de conversaciones permite verificar el comportamiento
         * real del componente de mensajería (ngModel, optimistic UI, emoji picker)
         * sin depender de datos preexistentes en el servidor.
         *
         * Nota sobre CDK Virtual Scroll: Cypress suprime ResizeObserver (ver e2e.ts),
         * lo que impide que el CDK viewport calcule su altura y renderice ítems en el DOM.
         * Para evitar este problema, se selecciona la conversación directamente mediante
         * la API de debugging de Angular (window.ng.getComponent), disponible en dev mode.
         */
        const CONV_ID = 1;
        const mockConv = { id: CONV_ID, titulo: 'Chat de Test', esAdmin: false, ultimoMensaje: 'Hola', unreadCount: 0, avatarUrl: null };

        // Stub: la lista de conversaciones devuelve 1 chat conocido
        cy.intercept('GET', '**/conversaciones', {
            delay: 300,
            statusCode: 200,
            body: [mockConv]
        }).as('getConversaciones');

        // Stub: mensajes iniciales vacíos
        cy.intercept('GET', `**/mensajes/conversacion/${CONV_ID}`, {
            delay: 200,
            statusCode: 200,
            body: []
        }).as('getMensajes');

        // Stub: envío de mensaje devuelve el mensaje enviado
        cy.intercept('POST', '**/mensajes', (req) => {
            req.reply({
                statusCode: 201,
                body: {
                    id: Date.now(),
                    conversacionId: CONV_ID,
                    texto: req.body.texto,
                    autorId: -1,      // -1 nunca coincide con miId() real → clase 'ajeno'
                    autorNombre: 'Tester',
                    esStaff: false,
                    fechaEnvio: new Date().toISOString()
                }
            });
        }).as('enviarMensaje');

        cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
        cy.url({ timeout: 15000 }).should('include', '/user-profile');

        cy.get('.premium-user-bar .user-tab', { timeout: 10000 })
            .contains(/mensaje/i)
            .click({ force: true });
        cy.url().should('include', '/mensajes');

        // Esperar al render completo del layout y carga de conversaciones
        cy.get('.glass-layout-container', { timeout: 15000 }).should('exist');
        cy.get('.glass-sidebar', { timeout: 10000 }).should('exist');
        cy.wait('@getConversaciones', { timeout: 10000 });

        // 1. Seleccionar la conversación mediante la API de Angular (window.ng.getComponent).
        // Esto evita depender del CDK virtual scroll, que no renderiza ítems en Cypress
        // porque ResizeObserver está suprimido globalmente en e2e.ts.
        cy.window().then((win: any) => {
            const appEl = win.document.querySelector('app-user-messages');
            if (!appEl) throw new Error('No se encontró app-user-messages en el DOM');
            const comp = win.ng?.getComponent(appEl);
            if (!comp) throw new Error('No se pudo obtener el componente Angular (¿ng serve en modo dev?)');
            comp.seleccionarConversacion(mockConv);
        });

        cy.wait('@getMensajes', { timeout: 10000 });

        // Verificar que seguimos en la página de mensajes (no hubo redirección)
        cy.url().should('include', '/mensajes');

        // 2. Verificar que el área de chat se abre
        cy.get('.chat-header', { timeout: 15000 }).should('exist');
        cy.get('.chat-input-area', { timeout: 10000 }).should('exist');

        // 3. Enviar mensaje de texto
        const testMessage = `Hola Cypress ${Date.now()}`;
        cy.get('.chat-input-area input.glass-input')
            .should('exist')
            .type(testMessage, { force: true });
        cy.get('.btn-send').click({ force: true });

        // Esperar confirmación del API
        cy.wait('@enviarMensaje', { timeout: 10000 });

        // Verificar que la burbuja aparece en el historial (cualquier tipo)
        cy.get('.msg-bubble', { timeout: 15000 }).last().should('contain.text', testMessage);

        // 4. Enviar Emoji — usar Angular API para evitar problemas de timing
        // con ChangeDetectionStrategy.OnPush + Signals en Cypress headless.
        // addEmoji() actualiza la señal nuevoMensaje; luego enviarMensaje() la envía.
        cy.window().then((win: any) => {
            const appEl = win.document.querySelector('app-user-messages');
            const comp = win.ng?.getComponent(appEl);
            if (comp) {
                comp.addEmoji('😀');
                comp.enviarMensaje();
            }
        });

        cy.wait('@enviarMensaje', { timeout: 10000 });

        // 5. Verificar que ahora hay más de 1 burbuja de mensaje
        cy.get('.msg-bubble', { timeout: 15000 }).should('have.length.greaterThan', 1);
    });
});
