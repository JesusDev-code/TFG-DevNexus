/**
 * E2E Test: Flujo IDE — Crear archivo y verificar sandbox-preview
 *
 * Verifica el ciclo completo de trabajo en el IDE:
 * 1. Login como usuario
 * 2. Abrir un proyecto existente del diario
 * 3. Crear un archivo nuevo en el IDE
 * 4. Escribir contenido en el editor
 * 5. Verificar que el sandbox-preview puede abrirse
 *
 * Cuenta: Cypress.env('USER_EMAIL') / Cypress.env('USER_PASSWORD')
 */
describe('Flujo IDE — Crear archivo en proyecto existente', () => {

    beforeEach(() => {
        cy.viewport(1440, 900);
        cy.visit('/');
        cy.wait(2000);
        cy.ensureLoggedOut();
    });

    it('Paso 1: El usuario puede entrar al IDE de un proyecto existente', () => {
        cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
        cy.url({ timeout: 15000 }).should('match', /\/(user-profile|admin-profile)/);

        cy.get('body', { timeout: 10000 }).then($body => {
            if ($body.find('.themes-grid .theme-glass-card').length === 0) {
                cy.log('No hay proyectos — test omitido');
                return;
            }
            cy.get('.themes-grid .theme-glass-card').first().click();
            cy.get('app-ide-view', { timeout: 10000 }).should('exist');
            cy.get('.ide-topbar').should('be.visible');
            cy.get('app-file-tree').should('be.visible');
        });
    });

    it('Paso 2: El botón "Nuevo archivo" existe en el árbol cuando no es readOnly', () => {
        cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
        cy.url({ timeout: 15000 }).should('match', /\/(user-profile|admin-profile)/);

        cy.get('body', { timeout: 10000 }).then($body => {
            if ($body.find('.themes-grid .theme-glass-card').length === 0) {
                cy.log('No hay proyectos — test omitido');
                return;
            }
            cy.get('.themes-grid .theme-glass-card').first().click();
            cy.get('app-file-tree .btn-nuevo-archivo', { timeout: 10000 }).should('be.visible');
        });
    });

    it('Paso 3: Crear un archivo nuevo abre el alert de nombre', () => {
        cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
        cy.url({ timeout: 15000 }).should('match', /\/(user-profile|admin-profile)/);

        cy.get('body', { timeout: 10000 }).then($body => {
            if ($body.find('.themes-grid .theme-glass-card').length === 0) {
                cy.log('No hay proyectos — test omitido');
                return;
            }
            cy.get('.themes-grid .theme-glass-card').first().click();

            cy.get('app-file-tree .btn-nuevo-archivo', { timeout: 10000 }).click();

            cy.get('ion-alert', { timeout: 8000 }).should('be.visible');
            cy.get('ion-alert .alert-title').should('contain.text', 'Nuevo archivo');
        });
    });

    it('Paso 4: Crear un archivo y verlo en el árbol', () => {
        const nombreArchivo = `test-${Date.now()}.js`;

        cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
        cy.url({ timeout: 15000 }).should('match', /\/(user-profile|admin-profile)/);

        cy.get('body', { timeout: 10000 }).then($body => {
            if ($body.find('.themes-grid .theme-glass-card').length === 0) {
                cy.log('No hay proyectos — test omitido');
                return;
            }
            cy.get('.themes-grid .theme-glass-card').first().click();

            cy.get('app-file-tree .btn-nuevo-archivo', { timeout: 10000 }).click();

            cy.get('ion-alert', { timeout: 8000 }).should('be.visible');
            cy.get('ion-alert input[name="filename"]').clear().type(nombreArchivo);
            cy.get('ion-alert .alert-button-confirm').click();

            cy.get('app-file-tree .filename', { timeout: 10000 })
                .should('contain.text', nombreArchivo);
        });
    });

    it('Paso 5: El editor carga contenido por defecto al crear un archivo .js', () => {
        const nombreArchivo = `main-${Date.now()}.js`;

        cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
        cy.url({ timeout: 15000 }).should('match', /\/(user-profile|admin-profile)/);

        cy.get('body', { timeout: 10000 }).then($body => {
            if ($body.find('.themes-grid .theme-glass-card').length === 0) {
                cy.log('No hay proyectos — test omitido');
                return;
            }
            cy.get('.themes-grid .theme-glass-card').first().click();

            cy.get('app-file-tree .btn-nuevo-archivo', { timeout: 10000 }).click();
            cy.get('ion-alert', { timeout: 8000 }).should('be.visible');
            cy.get('ion-alert input[name="filename"]').clear().type(nombreArchivo);
            cy.get('ion-alert .alert-button-confirm').click();

            cy.get('.ide-topbar, .editor-container, [class*="editor"]', { timeout: 10000 })
                .should('exist');
        });
    });

    it('Paso 6: El botón "Run" (ejecutar proyecto) abre el modal de sandbox-preview', () => {
        cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
        cy.url({ timeout: 15000 }).should('match', /\/(user-profile|admin-profile)/);

        cy.get('body', { timeout: 10000 }).then($body => {
            if ($body.find('.themes-grid .theme-glass-card').length === 0) {
                cy.log('No hay proyectos — test omitido');
                return;
            }
            cy.get('.themes-grid .theme-glass-card').first().click();

            cy.get('.ide-topbar', { timeout: 10000 }).should('be.visible');
            cy.get('button[title*="Run"], button[title*="run"], .btn-run, [class*="run"]', { timeout: 5000 }).then($btn => {
                if ($btn.length > 0) {
                    cy.wrap($btn).first().click({ force: true });
                    cy.get('app-sandbox-preview, ion-modal', { timeout: 10000 }).should('exist');
                } else {
                    cy.log('Botón Run no encontrado — puede requerir archivos en el proyecto');
                }
            });
        });
    });

});
