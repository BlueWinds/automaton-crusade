import { stubRoller } from '../support/e2e'

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

describe('roster parsing', () => {
  const powerLevel = (name) => cy.get('.roster tr', { log: false }).contains(name).closest('tr', { log: false }).find('td:first-child', { log: false }).invoke('text')

  it('loads a roster', () => {
    cy.loadNids()
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

  it('loads another roster', () => {
    cy.loadOrks()
    cy.get('.roster')
      .should('contain', '10x Boyz #4')
      .should('contain', '5x Nobz #1')

    powerLevel('Warboss in Mega Armour').should('equal', '6')
    powerLevel('30x Boyz').should('equal', '15')
  })

  it('saves base natures across army lists', () => {
    cy.loadNids()

    cy.get('#loadRoster').selectFile('cypress/fixtures/Nids_3k.rosz', { force: true})

    cy.contains('Load enemy .rosz').click()

    cy.get('.roster select').each($select => {
      expect($select.val()).not.to.eql('')
    })
  })
})

describe('generating an army', () => {
  const havePLIn = (min, max) => span => {
    const PL = parseInt(span.attr('data-tooltip').split(' ')[0], 10)
    expect(PL).to.be.gte(min).and.lte(max)
  }

  it('generates an army of appropriate power levels', () => {
    cy.loadNids()

    cy.contains('Generate').click()
    cy.contains('Units').should(havePLIn(126, 133))

    cy.contains('Enemy Bonus').next().select('50%')
    cy.contains('Generate').click()
    cy.contains('Units').should(havePLIn(143, 150))

    cy.contains('Player Power Level').find('input').clear().type('60')
    cy.contains('Enemy Bonus').next().select('0%')
    cy.contains('Generate').click()
    cy.contains('Units').should(havePLIn(53, 60))
  })

  it('asks for retinues and transports', () => {
    cy.loadOrks()

    // Transported units can't be selected by another transport
    cy.get('.transport select').eq(0).find('option[value="10x Boyz #4"]').should('be.disabled')

    // Transports gain the behavior of the embarked unit
    cy.unitRow('Trukk #4').should('contain', 'Skittish')
      .find('strike').should('contain', 'Berserk').should('have.attr', 'data-tooltip', 'Transports gain the behavior of units embarked in them.')

    // Units gain the behavior of characters they're retinues for
    cy.unitRow('5x Nobz #1').should('contain', 'Berserk')
      .find('strike').should('contain', 'Tactical').should('have.attr', 'data-tooltip', "Retinues gain the behavior of the character they're attached to.")

    // Transports with characters and a retinue should get the character's behavior'
    cy.unitRow('Battlewagon').should('contain', 'Berserk')
      .find('strike').should('contain', 'Skittish').should('have.attr', 'data-tooltip', "Transports gain the behavior of units embarked in them.")

    cy.unitRow('10x Boyz #3').find('.unit-status .embarked').should('be.checked')

    // Embarked units and transports enter or exit reserves together.
    cy.unitRow('10x Boyz #3').find('.unit-status .reserved').should('not.be.checked')
    cy.unitRow('Trukk #4').find('.unit-status .reserved').click()

    cy.unitRow('10x Boyz #3').find('.unit-status .reserved').should('be.checked')
      .click()

    cy.unitRow('Trukk #4').find('.unit-status .reserved').should('not.be.checked')
  })

  it.only('Sorts reserved units to last, and lets them act', () => {
    cy.loadOrks()

    cy.unitRow('Trukk #4').find('.unit-status .reserved').click()
    cy.unitRow('Trukk #5').find('.unit-status .reserved').click()

    cy.get('#top-of-turn').contains('Move').click()

    cy.then(() => {
//       const dice = stubRoller()
//       dice.d6(3)
    })

//     cy.unitRow('20x Boyz').find('.roll-action').click()
//     cy.unitRow('Deff Dreads').find('.roll-action').click()
//     cy.unitRow('3x Killa Kans').find('.roll-action').click()
  })
})
