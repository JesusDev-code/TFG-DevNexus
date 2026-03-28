/**
 * E2E Test: Flujo de Administración
 *
 * Deep Dive: Verifica que un usuario con rol ADMIN puede acceder
 * al panel administrativo protegido por authGuard + adminGuard.
 * Valida la redirección post-login a /admin-profile y la carga
 * de la sección de gestión de tickets.
 *
 * Cuenta: Cypress.env('ADMIN_EMAIL') / Cypress.env('ADMIN_PASSWORD')
 */
describe('Flujo de Admin — Gestión de Tickets', () => {

    beforeEach(() => {
        cy.viewport(1280, 800);
        cy.visit('/');
        cy.wait(2000);
        cy.ensureLoggedOut();
    });

    it('Paso 1: Login de admin exitoso con redirección a /admin-profile', () => {
        cy.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
        cy.url({ timeout: 15000 }).should('include', '/admin-profile');
    });

    it('Paso 2: Navegar al panel de gestión de tickets', () => {
        cy.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
        cy.url({ timeout: 15000 }).should('include', '/admin-profile');

        // Usar selector específico de la barra admin (clase .admin-tab dentro de .premium-admin-bar)
        cy.get('.premium-admin-bar .admin-tab', { timeout: 10000 })
            .contains(/ticket/i)
            .click({ force: true });
        cy.url().should('include', '/admin-tickets');

        cy.get('app-admin-tickets, ion-content', { timeout: 10000 }).should('exist');
    });

    it('Paso 3: La lista de tickets de admin debe cargar datos', () => {
        cy.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
        cy.url({ timeout: 15000 }).should('include', '/admin-profile');

        // Navegar a tickets usando selector preciso
        cy.get('.premium-admin-bar .admin-tab', { timeout: 10000 })
            .contains(/ticket/i)
            .click({ force: true });
        cy.url().should('include', '/admin-tickets');

        // Esperar a que la tabla y el virtual scroll rendericen.
        // El cdk-virtual-scroll-viewport necesita tiempo para cargar datos del API
        // y crear los nodos del DOM.
        cy.get('.table-glass-container', { timeout: 15000 }).should('exist');

        // Verificar que hay filas en la tabla (con timeout generoso para API + render)
        cy.get('.table-row', { timeout: 20000 }).should('have.length.greaterThan', 0);
    });

    it('Paso 4: Responder a un ticket', () => {
        // Interceptar peticiones de comentarios para esperar respuestas del API
        cy.intercept('POST', '**/tickets/*/comentarios').as('enviarComentario');
        cy.intercept('GET', '**/tickets/*/comentarios').as('cargarComentarios');

        cy.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
        cy.url({ timeout: 15000 }).should('include', '/admin-profile');

        // Navegar a tickets
        cy.get('.premium-admin-bar .admin-tab', { timeout: 10000 })
            .contains(/ticket/i)
            .click({ force: true });
        cy.url().should('include', '/admin-tickets');

        // Esperar a que las filas de la tabla carguen
        cy.get('.table-row', { timeout: 20000 }).should('have.length.greaterThan', 0);

        // Abrir el primer ticket que NO esté resuelto (Abierto, En Progreso, etc.)
        cy.contains('.table-row', /(Abierto|En\sProgreso|Reapertura)/i, { timeout: 15000 })
            .find('.action-btn.chat')
            .first()
            .click({ force: true });

        // Verificar que el modal se abre.
        // El ion-modal renderiza su ng-template lazily,
        // .modal-wrapper-dark está dentro del template
        cy.get('.modal-wrapper-dark', { timeout: 15000 }).should('be.visible');

        // Esperar a que se carguen los mensajes existentes del ticket
        cy.wait('@cargarComentarios');

        // Escribir respuesta en el input del chat dentro del modal
        const replyText = `Respuesta Admin Cypress ${Date.now()}`;
        cy.get('.chat-input-box input', { timeout: 10000 })
            .should('be.visible')
            .type(replyText, { force: true });

        // Enviar y esperar a que el POST y el GET de recarga completen
        cy.get('.chat-input-box .send-btn').click({ force: true });
        cy.wait('@enviarComentario');
        cy.wait('@cargarComentarios');

        // Verificar que aparece la burbuja staff con el texto
        cy.get('.msg-bubble.staff', { timeout: 15000 }).last().should('contain.text', replyText);

        // Cerrar modal
        cy.get('.close-modal-btn').click({ force: true });
        cy.get('.modal-wrapper-dark', { timeout: 10000 }).should('not.exist');
    });
});
