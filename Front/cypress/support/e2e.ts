// Soporte global para Cypress
// Se ejecuta antes de cada spec file

// Deshabilitar errores no capturados para que no rompan los tests
// (Firebase SDK, Zone.js e Ionic lanzan errores en modo test que no impactan la funcionalidad)
Cypress.on('uncaught:exception', (err) => {
    if (
        err.message.includes('messaging/failed-service-worker-registration') ||
        err.message.includes('firebase') ||
        err.message.includes('FirebaseError') ||
        err.message.includes('service-worker') ||
        err.message.includes('ResizeObserver') ||
        err.message.includes('Non-Error promise rejection') ||
        err.message.includes('Cannot read properties of null') ||
        err.message.includes('ChunkLoadError')
    ) {
        // Ignore Rive animation errors
        if (err.message.includes('input.fire is not a function')) {
            return false;
        }

        return false;
    }
    return true;
});

// ─── Custom Commands ────────────────────────────────────────────────

/**
 * Comando reutilizable de login.
 * Elimina la duplicación de código en todos los spec files.
 */
Cypress.Commands.add('login', (email: string, password: string) => {
    cy.get('.on-boarding-btn', { timeout: 10000 }).should('be.visible').click({ force: true });
    cy.get('.startCoursebtn', { timeout: 10000 }).should('be.visible').click({ force: true });

    cy.get('ion-input[type="email"] input', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(email);

    cy.get('ion-input[type="password"] input')
        .should('be.visible')
        .clear()
        .type(password);

    cy.get('.sign-in-button').contains(/iniciar|login/i).click({ force: true });
});

/**
 * Asegurar sesión limpia: cierra sesión si hay una activa.
 */
Cypress.Commands.add('ensureLoggedOut', () => {
    cy.get('body').then($body => {
        if ($body.find('.mini-logout-btn').length > 0) {
            cy.get('.mini-logout-btn').first().click({ force: true });
            cy.get('.on-boarding-btn', { timeout: 10000 }).should('be.visible');
        } else if ($body.find('.exit-btn').length > 0) {
            cy.get('.exit-btn').click({ force: true });
            cy.get('.on-boarding-btn', { timeout: 10000 }).should('be.visible');
        }
    });
});

// ─── Type Declarations ──────────────────────────────────────────────

declare global {
    namespace Cypress {
        interface Chainable {
            login(email: string, password: string): Chainable<void>;
            ensureLoggedOut(): Chainable<void>;
        }
    }
}

export { };
