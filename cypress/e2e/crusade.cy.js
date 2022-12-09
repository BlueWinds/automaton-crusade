describe('help', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('hides all help', () => {
    cy.contains('Hide help').click()

    cy.contains('Introduction').should('not.exist')
    cy.contains('h2', 'The Automaton Crusade').should('not.exist')

    cy.contains('Show help').click()
    cy.contains('h2', 'The Automaton Crusade').should('be.visible')
  })

  it('collapses individual help', () => {
    cy.get('.close-help:first').click()
    cy.contains('Warhammer 40k has always been a competitive game').should('not.exist')
    cy.get('.open-help').click()
    cy.contains('Warhammer 40k has always been a competitive game').should('be.visible')
  })
})

describe.only('roster parsing', () => {
  beforeEach(() => {
    cy.loadNids()
    cy.visit('/')
  })

  const powerLevel = (name) => cy.get('.roster tr', { log: false }).contains(name).closest('tr', { log: false }).find('td:first-child', { log: false }).invoke('text')

  it('loads a roster', () => {
    cy.get('.roster')
      .should('contain', 'Tervigon')
      .should('contain', 'Hive Tyrant')
      .should('not.contain', 'Hive Tyrant #1')
      .should('contain', '4x Tyranid Warriors #1')
      .should('contain', '4x Tyranid Warriors #2')
      .should('contain', '4x Tyranid Warriors #3')

    powerLevel('Tervigon').should('equal', '11')
    powerLevel('4x Tyranid Warriors #1').should('equal', '8')
    powerLevel('3x Pyrovores #2').should('equal', '6')
  })

  it('sets base natures', () => {})
})
