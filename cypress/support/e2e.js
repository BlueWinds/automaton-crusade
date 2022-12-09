
Cypress.Commands.add('loadNids', () => {
  cy.session('Nids3k', () => {
    cy.visit('/')
    cy.contains('Hide help')
      .click()

    cy.get('#loadRoster')
      .selectFile('cypress/fixtures/Nids_3k.rosz', { force: true})
    cy.contains('Tervigon') // Needed to wait for session to finish validating
  }, { validate: () => {
//     cy.visit('/') // Needed because otherwise we're validating about:blank
    cy.contains('Tervigon')
  }})
})
