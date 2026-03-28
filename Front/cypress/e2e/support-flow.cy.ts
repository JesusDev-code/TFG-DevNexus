/**
 * E2E Test: Flujo de Soporte (Ciclo de Vida del Ticket)
 *
 * Deep Dive: Este test simula el flujo completo de un usuario
 * creando un ticket de soporte. Valida la autenticación con Firebase,
 * la navegación protegida por guards, y la creación de datos vía API.
 *
 * Cuenta: Cypress.env('USER_EMAIL') / Cypress.env('USER_PASSWORD')
 */
describe('Flujo de Soporte — Ciclo de Vida del Ticket', () => {

    beforeEach(() => {
        cy.viewport(1280, 800);
        cy.visit('/');
        cy.wait(2000);
        cy.ensureLoggedOut();
    });

    /**
     * Helper: Login + navegar a /user-profile/tickets.
     * Incluye esperas de estabilización para auth effects y API calls.
     */
    const loginAndGoToTickets = () => {
        cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
        cy.url({ timeout: 15000 }).should('include', '/user-profile');

        // Esperar a que el panel se monte — usar 'exist' en vez de 'be.visible'
        // porque ion-content puede enmascarar la visibilidad
        cy.get('.premium-user-bar', { timeout: 15000 }).should('exist');

        // Esperar estabilización de auth effects y API calls
        cy.wait(3000);

        // Navegar a tickets
        cy.get('.premium-user-bar .user-tab').contains(/ticket/i).click({ force: true });
        cy.url({ timeout: 10000 }).should('include', '/tickets');

        // Esperar a que la página de tickets se cargue completamente
        cy.get('.tickets-container', { timeout: 15000 }).should('exist');
        cy.wait(1000); // Estabilización del render + API de tickets
    };

    it('Paso 1: Login de usuario exitoso', () => {
        cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
        cy.url({ timeout: 15000 }).should('include', '/user-profile');
    });

    it('Paso 2: Navegar a la sección de Tickets', () => {
        loginAndGoToTickets();
        cy.get('app-user-tickets, ion-content').should('exist');
    });

    it('Paso 3: Crear un nuevo ticket', () => {
        // Interceptar todas las llamadas a mis-tickets para poder consumirlas ordenadamente.
        // La primera ocurre al montar el componente (efecto inicial de carga).
        // La segunda ocurre tras crear el ticket (cargarTickets() en el next del POST).
        cy.intercept('GET', '**/tickets/mis-tickets').as('cargarTickets');

        loginAndGoToTickets();

        // Consumir la llamada inicial (carga al montar el componente)
        cy.wait('@cargarTickets', { timeout: 15000 });

        // Verificar estamos en la ruta correcta
        cy.url().should('include', '/tickets');

        // Abrir formulario de nuevo ticket
        cy.get('.btn-new-ticket', { timeout: 15000 }).should('exist').click({ force: true });

        // Verificar que el formulario aparece
        cy.get('.ticket-form-container', { timeout: 10000 }).should('exist');

        const timestamp = Date.now();
        const ticketTitulo = `Test Ticket E2E - ${timestamp}`;

        // Rellenar título
        cy.get('.ticket-form-container input.premium-input')
            .should('exist')
            .clear({ force: true })
            .type(ticketTitulo, { force: true });

        // Rellenar descripción
        cy.get('.ticket-form-container textarea.premium-input')
            .should('exist')
            .clear({ force: true })
            .type('Descripción generada automáticamente por Cypress E2E', { force: true });

        // Enviar
        cy.get('.ticket-form-container .btn-gradient-save', { timeout: 5000 })
            .should('exist')
            .click({ force: true });

        // Verificar éxito
        cy.get('ion-toast', { timeout: 15000 }).should('exist');

        // Verificar que el formulario se cierra
        cy.get('.ticket-form-container', { timeout: 15000 }).should('not.exist');

        // Esperar la SEGUNDA llamada a mis-tickets: la recarga tras la creación exitosa
        cy.wait('@cargarTickets', { timeout: 15000 });

        // Verificar que el ticket existe en el estado del componente Angular.
        // Nota: el CDK virtual scroll (tickets-list) puede no renderizar el nuevo ítem
        // en Cypress porque ResizeObserver está suprimido (ver e2e.ts), igual que en
        // messaging-flow. Por eso usamos window.ng.getComponent() para inspeccionar
        // directamente la señal ticketsFiltrados() del componente.
        cy.window().then((win: any) => {
            const appEl = win.document.querySelector('app-user-tickets');
            if (!appEl) throw new Error('No se encontró app-user-tickets en el DOM');
            const comp = win.ng?.getComponent(appEl);
            if (!comp) throw new Error('No se pudo obtener el componente Angular (¿ng serve en modo dev?)');
            const tickets = comp.ticketsFiltrados() as Array<{ titulo: string }>;
            const found = tickets.some(t => t.titulo === ticketTitulo);
            expect(found, `Ticket "${ticketTitulo}" no encontrado. Tickets: ${tickets.map(t => t.titulo).join(', ')}`).to.be.true;
        });
    });
});
