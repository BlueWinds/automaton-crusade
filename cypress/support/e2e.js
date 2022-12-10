const behavior = (name, behavior) => cy.get('.roster tr').contains(name).closest('tr').find('select').select(behavior)

Cypress.Commands.add('loadNids', () => {
  cy.session('Nids3k', () => {
    cy.visit('/')
    cy.contains('Hide help')
      .click()

    cy.get('#loadRoster')
      .selectFile('cypress/fixtures/Nids_3k.rosz', { force: true})

    behavior('Tervigon', 'Berserk')
    behavior('Hive Tyrant', 'Berserk')
    behavior('Harpy', 'Skittish')
    behavior('Tyrannofex', 'Berserk')
    behavior('Exocrine', 'Skittish')
    behavior('Toxicrene', 'Berserk')
    behavior('Harridan', 'Skittish')
    behavior('Tyrant Guard', 'Berserk')
    behavior('Tyranid Warriors #1', 'Berserk')
    behavior('Hormagaunts #1', 'Berserk')
    behavior('Termagants', 'Skittish')
    behavior('Pyrovores #1', 'Skittish')
    behavior('Zoanthropes', 'Skittish')
    behavior('Gargoyles', 'Skittish')

    cy.contains('Load enemy .rosz (200 PL)') // Needed to wait for session to finish validating
  }, { validate: () => {
    cy.visit('/') // Needed because otherwise we're validating about:blank
    cy.contains('Load enemy .rosz (200 PL)')
  }})

  cy.visit('/', { log: false })
})

Cypress.Commands.add('loadOrks', () => {
  cy.session('Orks200PL', () => {
    cy.visit('/')
    cy.contains('Hide help')
      .click()

    cy.get('#loadRoster')
      .selectFile('cypress/fixtures/Ork Enemy Mark II.rosz', { force: true})

    behavior('Beastboss', 'Berserk')
    behavior('Trukk', 'Berserk')
    behavior('Wurrboy', 'Skittish')
    behavior('Battlewagon', 'Skittish')
    behavior('Warboss in Mega Armour', 'Berserk')
    behavior(/Warboss$/, 'Berserk')
    behavior('Weirdboy', 'Skittish')
    behavior('Kannonwagon', 'Skittish')
    behavior('Painboss', 'Berserk')
    behavior('Beast Snagga Boyz', 'Berserk')
    behavior('20x Boyz', 'Berserk')
    behavior('3x Meganobz', 'Berserk')
    behavior('Nobz #1', 'Berserk')
    behavior('Boomdakka Snazzwagon', 'Skittish')
    behavior('DeffKoptas', 'Skittish')
    behavior('Deff Dreads', 'Berserk')
    behavior('Burna Boyz', 'Skittish')
    behavior('Nobz on Warbikes', 'Berserk')
    behavior('Warbikers', 'Skittish')
    behavior('Flash Gitz', 'Skittish')
    behavior('Killa Kans', 'Berserk')
    behavior('Mek Gunz', 'Skittish')

    cy.contains('Load enemy .rosz (200 PL)') // Needed to wait for session to finish validating

    cy.then(() => {
      let dice = stubRoller()

      // Behaviors
      dice.d3(1,2,3,1,2,3,1,2,3,1,2,3,1,2,3,1,2,3,1,2,3,1,2,3,1,2,3,1,2,3,1,2,3,1,2)

      // Selecting units
      dice.dX(35,1)
      dice.dX(34,1)
      dice.dX(33,2)
      dice.dX(32,9)
      dice.dX(31,9)
      dice.dX(30,20)
      dice.dX(29,20)
      dice.dX(28,16)
      dice.dX(27,26)
      dice.dX(26,25)
      dice.dX(25,24)

      // Spawn points
      dice.d6(1, 1).direction('north-east')
      dice.d6(6, 6).direction('south')
      dice.d6(3, 4).direction('west')
      dice.d6(3, 4).direction('west')

      cy.contains('Generate').click()

      cy.get('.transport select').eq(0).select('10x Boyz #3')
      cy.get('.transport select').eq(1).select('10x Beast Snagga Boyz')
      cy.get('.transport select').eq(2).select('5x Nobz #1')
      cy.get('.transport select').eq(3).select('10x Boyz #4')

      cy.get('.retinue select').eq(0).select('5x Nobz #1')
      cy.get('.retinue select').eq(1).select('10x Boyz #2')
      cy.get('.retinue select').eq(2).select('5x Flash Gitz')
      cy.get('.retinue select').eq(3).select('3x Meganobz')
      cy.get('.retinue select').eq(4).select('20x Boyz')
      // Painboss intentionally left without retinue

    })

    // Make sure to wait for the list to update after setting the last retinue
    cy.get('.unit-list').contains('span', '20x Boyz').parent().next().as('behavior').should('contain', 'Skittish').find('strike').should('contain', 'Berserk')
  }, { validate: () => {
    cy.visit('/') // Needed because otherwise we're validating about:blank
    cy.get('.unit-list').contains('span', '20x Boyz').parent().next().as('behavior').should('contain', 'Skittish').find('strike').should('contain', 'Berserk')
  }})

  cy.visit('/', { log: false })
})

export const stubRoller = () => {
  const directions = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west']
  const results = []

  const win = cy.$$('body')[0].ownerDocument.defaultView

  cy.stub(win.Math, 'random', () => {
    if (!results.length) {
      const e = new Error('Unstubbed die roll')
      // Webpack hot reload also calls Math.random(), don't want to mess with that.
      if (e.stack.match('initSocket')) { return Math.random() }
      throw e
    }
    return results.shift()
  })

  let roller = {
    d3: (...args) => { results.push(...args.map(n => n / 3)); return roller },
    d6: (...args) => { results.push(...args.map(n => n / 6)); return roller },
    dX: (x, ...args) => { results.push(...args.map(n => n / x)); return roller },
    direction: (...args) => { results.push(...args.map(n => directions.indexOf(n) / 8)); return roller },
  }

  return roller
}

export const logRoller = () => {
  const win = cy.$$('body')[0].ownerDocument.defaultView
  cy.stub(win.Math, 'random', () => {
    const r = Math.random()
    console.log('random', r)
    return r
  })
}

Cypress.Commands.add('unitRow', (name) => {
  return cy.get('.unit-list td:first-child:contains("' + name + '")').closest('tr', { log: false })
})
