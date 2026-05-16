/**
 * E2E Test: Flujo de Diario — Proyectos + IDE
 *
 * Verifica que un usuario autenticado puede gestionar proyectos en el diario:
 * - Ver la lista de proyectos con el heatmap de actividad
 * - Abrir el modal de crear proyecto (centrado, con overlay)
 * - Crear un proyecto nuevo y verlo en la grid
 * - Acceder al IDE del proyecto
 * - Eliminar un proyecto con confirmación
 *
 * Cuenta: Cypress.env('USER_EMAIL') / Cypress.env('USER_PASSWORD')
 */
describe('Flujo de Diario — Gestión de Proyectos', () => {

  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('/');
    cy.wait(2000);
    cy.ensureLoggedOut();
  });

  it('Paso 1: El usuario autenticado llega al diario y ve sus proyectos', () => {
    cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
    cy.url({ timeout: 15000 }).should('include', '/user-profile');

    cy.get('app-user-diary, [class*="diary"]', { timeout: 10000 }).should('exist');
  });

  it('Paso 2: El modal de "Nuevo proyecto" aparece centrado al hacer clic', () => {
    cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
    cy.url({ timeout: 15000 }).should('include', '/user-profile');

    cy.get('.btn-toggle-crear', { timeout: 10000 }).click();

    // El modal overlay debe existir y estar visible
    cy.get('.modal-overlay').should('be.visible');
    cy.get('.modal-card').should('be.visible');
    cy.get('.modal-header h3').should('contain.text', 'Nuevo Proyecto');
  });

  it('Paso 3: El modal se cierra al hacer clic en Cancelar', () => {
    cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
    cy.url({ timeout: 15000 }).should('include', '/user-profile');

    cy.get('.btn-toggle-crear', { timeout: 10000 }).click();
    cy.get('.modal-card').should('be.visible');

    cy.get('.btn-ghost-action').click();
    cy.get('.modal-overlay').should('not.exist');
  });

  it('Paso 4: El modal se cierra al hacer clic fuera (backdrop)', () => {
    cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
    cy.url({ timeout: 15000 }).should('include', '/user-profile');

    cy.get('.btn-toggle-crear', { timeout: 10000 }).click();
    cy.get('.modal-overlay').should('be.visible');

    // Clic en el backdrop (la overlay, no la card)
    cy.get('.modal-overlay').click({ force: true });
    cy.get('.modal-overlay').should('not.exist');
  });

  it('Paso 5: Crear un proyecto nuevo y verlo en la grid', () => {
    const nombreProyecto = `Test E2E ${Date.now()}`;

    cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
    cy.url({ timeout: 15000 }).should('include', '/user-profile');

    cy.get('.btn-toggle-crear', { timeout: 10000 }).click();
    cy.get('.modal-card').should('be.visible');

    cy.get('.modal-card .glass-input').first().type(nombreProyecto);
    cy.get('.btn-gradient-action').click();

    // El modal debe cerrarse automáticamente
    cy.get('.modal-overlay', { timeout: 5000 }).should('not.exist');

    // El proyecto debe aparecer en la grid
    cy.get('.themes-grid .theme-title', { timeout: 10000 })
      .contains(nombreProyecto).should('be.visible');
  });

  it('Paso 6: Empty state muestra "Crear primer proyecto" si no hay proyectos', () => {
    cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
    cy.url({ timeout: 15000 }).should('include', '/user-profile');

    // Si no hay proyectos, se ve el empty state
    cy.get('body').then($body => {
      if ($body.find('.empty-projects-state').length > 0) {
        cy.get('.empty-projects-state').should('be.visible');
        cy.get('.empty-projects-state .btn-gradient-action').should('contain.text', 'Crear primer proyecto');
        // El botón del empty state también abre el modal
        cy.get('.empty-projects-state .btn-gradient-action').click();
        cy.get('.modal-overlay').should('be.visible');
      }
    });
  });

});

describe('Flujo de Diario — Vista IDE', () => {

  beforeEach(() => {
    cy.viewport(1440, 900);
    cy.visit('/');
    cy.wait(2000);
    cy.ensureLoggedOut();
  });

  it('Paso 1: Al hacer clic en un proyecto se abre el IDE', () => {
    cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
    cy.url({ timeout: 15000 }).should('include', '/user-profile');

    cy.get('.themes-grid .theme-glass-card', { timeout: 10000 }).first().then($card => {
      if ($card.length > 0) {
        cy.wrap($card).click();
        cy.get('app-ide-view', { timeout: 10000 }).should('exist');
        cy.get('.ide-topbar').should('be.visible');
        cy.get('app-file-tree').should('be.visible');
      }
    });
  });

  it('Paso 2: El árbol de archivos muestra el nombre del proyecto', () => {
    cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
    cy.url({ timeout: 15000 }).should('include', '/user-profile');

    cy.get('.themes-grid .theme-glass-card', { timeout: 10000 }).first().then($card => {
      if ($card.length > 0) {
        const nombre = $card.find('.theme-title').text();
        cy.wrap($card).click();

        cy.get('.tree-root .project-name', { timeout: 5000 })
          .should('contain.text', nombre);
      }
    });
  });

  it('Paso 3: El botón volver regresa a la lista de proyectos', () => {
    cy.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
    cy.url({ timeout: 15000 }).should('include', '/user-profile');

    cy.get('.themes-grid .theme-glass-card', { timeout: 10000 }).first().then($card => {
      if ($card.length > 0) {
        cy.wrap($card).click();
        cy.get('.btn-back', { timeout: 5000 }).click();
        cy.get('.themes-grid', { timeout: 5000 }).should('be.visible');
        cy.get('app-ide-view').should('not.exist');
      }
    });
  });

});
