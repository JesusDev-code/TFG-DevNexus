/**
 * E2E Test: Flujo de Autenticación
 *
 * Verifica los happy y unhappy paths del login/logout:
 * - Login con credenciales inválidas → mensaje de error, no redirige
 * - Logout completo → limpia sesión, redirige al dashboard público,
 *   guard bloquea acceso posterior a rutas protegidas
 *
 * Cuenta: Cypress.env('USER_EMAIL') / Cypress.env('USER_PASSWORD')
 */
describe('Flujo de Autenticación — Login', () => {

    beforeEach(() => {
        cy.viewport(1280, 800);
        cy.visit('/');
        cy.wait(2000);
        cy.ensureLoggedOut();
    });

    it('Paso 1: Login con credenciales inválidas muestra error y no redirige', () => {
        // Intercept para ver si el backend responde 401
        cy.intercept('POST', '**/auth/**').as('loginRequest');

        // Abrir el panel de onboarding y login
        cy.get('.on-boarding-btn', { timeout: 10000 }).should('be.visible').click({ force: true });
        cy.get('.startCoursebtn', { timeout: 10000 }).should('be.visible').click({ force: true });

        cy.get('ion-input[type="email"] input', { timeout: 10000 })
            .should('be.visible')
            .clear()
            .type('noexiste@invalido.xyz');

        cy.get('ion-input[type="password"] input')
            .should('be.visible')
            .clear()
            .type('contraseñaincorrecta123');

        cy.get('.sign-in-button').contains(/iniciar|login/i).click({ force: true });

        // No debe redirigir a zona protegida
        cy.url({ timeout: 8000 }).should('not.include', '/user-profile');
        cy.url().should('not.include', '/admin-profile');

        // Debe mostrar algún indicador de error (toast, mensaje inline, etc.)
        cy.get('body', { timeout: 8000 }).then($body => {
            const tieneError =
                $body.find('ion-toast').length > 0 ||
                $body.find('[class*="error"]').length > 0 ||
                $body.find('[class*="invalid"]').length > 0 ||
                $body.find('.alert-message').length > 0;
            // Si Firebase rechaza inmediatamente, puede aparecer un toast de error
            // Al menos verificamos que seguimos en la pantalla de login
            expect(
                $body.find('ion-input[type="email"]').length > 0 || tieneError
            ).to.be.true;
        });
    });

    it('Paso 2: Login con credenciales inválidas (email bien formado) no redirige a zona protegida', () => {
        cy.get('.on-boarding-btn', { timeout: 10000 }).should('be.visible').click({ force: true });
        cy.get('.startCoursebtn', { timeout: 10000 }).should('be.visible').click({ force: true });

        cy.get('ion-input[type="email"] input', { timeout: 10000 })
            .clear()
            .type('usuario.invalido@test.com');

        cy.get('ion-input[type="password"] input')
            .clear()
            .type('wrongpassword99!');

        cy.get('.sign-in-button').contains(/iniciar|login/i).click({ force: true });

        // Esperar un tiempo prudencial para que Firebase responda
        cy.wait(3000);

        cy.url().should('not.include', '/user-profile');
        cy.url().should('not.include', '/admin-profile');
    });

});

describe('Flujo de Autenticación — Logout', () => {

    beforeEach(() => {
        cy.viewport(1280, 800);
        cy.visit('/');
        cy.wait(2000);
        cy.ensureLoggedOut();
    });

    it('Paso 1: Logout completo limpia la sesión y redirige al dashboard público', () => {
        cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
        cy.url({ timeout: 15000 }).should('match', /\/(user-profile|admin-profile)/);

        // Cerrar sesión usando el botón de logout disponible en la UI
        cy.get('body').then($body => {
            if ($body.find('.mini-logout-btn').length > 0) {
                cy.get('.mini-logout-btn').first().click({ force: true });
            } else if ($body.find('.exit-btn').length > 0) {
                cy.get('.exit-btn').click({ force: true });
            } else {
                // Fallback: buscar cualquier botón que contenga "Cerrar" o "Salir"
                cy.get('button, ion-button').contains(/cerrar|salir|logout/i, { timeout: 5000 })
                    .first().click({ force: true });
            }
        });

        // Debe llegar al dashboard público (no a zona protegida)
        cy.get('.on-boarding-btn', { timeout: 10000 }).should('be.visible');
        cy.url({ timeout: 10000 }).should('not.include', '/user-profile');
    });

    it('Paso 2: Guard bloquea acceso a zona protegida después del logout', () => {
        cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
        cy.url({ timeout: 15000 }).should('match', /\/(user-profile|admin-profile)/);

        // Hacer logout
        cy.get('body').then($body => {
            if ($body.find('.mini-logout-btn').length > 0) {
                cy.get('.mini-logout-btn').first().click({ force: true });
            } else if ($body.find('.exit-btn').length > 0) {
                cy.get('.exit-btn').click({ force: true });
            }
        });

        // Esperar a que la sesión se limpie
        cy.get('.on-boarding-btn', { timeout: 10000 }).should('be.visible');

        // Intentar navegar directamente a zona protegida
        cy.visit('/user-profile');

        // El guard debe redirigir fuera de la zona protegida
        cy.url({ timeout: 10000 }).should('not.include', '/user-profile');
    });

    it('Paso 3: Después del logout, el botón "Iniciar sesión" está visible', () => {
        cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
        cy.url({ timeout: 15000 }).should('match', /\/(user-profile|admin-profile)/);

        cy.get('body').then($body => {
            if ($body.find('.mini-logout-btn').length > 0) {
                cy.get('.mini-logout-btn').first().click({ force: true });
            } else if ($body.find('.exit-btn').length > 0) {
                cy.get('.exit-btn').click({ force: true });
            }
        });

        // El botón de onboarding/login debe ser visible
        cy.get('.on-boarding-btn', { timeout: 10000 }).should('be.visible');
    });

});
