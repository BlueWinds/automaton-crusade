import shuffle from 'lodash/fp/shuffle'
import set from 'lodash/fp/set'
import mapValues from 'lodash/fp/mapValues'
import badAssign from 'lodash/fp/assign'
import flow from 'lodash/fp/flow'
import update from 'lodash/fp/update'

import cardsMd from '../markdown/cards.md'

import { rollD6, roll2D6, rollDirection, rollList, getCurrentBehavior, behaviors } from './utils'

const assign = badAssign.convert({ 'rearg': true })

const defaultState = {
  phase: 'Deploy',
  playerPower: 100,
  enemyBonus: 33,
  crusadePoints: 0,
  commandPoints: 0,
  enemyStrategem: '',
  units: {},
  actionOrder: [],
}

const strats = cardsMd.split('###').filter(Boolean).map(card => {
  return '###' + card
})

const rollStrategem = (oldStrat) => {
  let strat = oldStrat
  while (strat === oldStrat) {
    strat = strats[Math.floor(Math.random() * strats.length)]
  }

  return strat
}

const sortFn = (u1, u2) => {
  if (!u1.dead && u2.dead) { return -1 }
  if (u1.dead && !u2.dead) { return 1 }

  if (!u1.reserved && u2.reserved) { return -1 }
  if (u1.reserved && !u2.reserved) { return 1 }

  if (u1.keywords.Transport && !u2.keywords.Transport) { return -1 }
  if (!u1.keywords.Transport && u2.keywords.Transport) { return 1 }

  if (u1.keywords.Character && !u2.keywords.Character) { return -1 }
  if (!u1.keywords.Character && u2.keywords.Character) { return 1 }

  return behaviors.indexOf(u1.behavior) - behaviors.indexOf(u2.behavior)
}

const actionOrder = (units) => Object.keys(units).sort((name1, name2) => {
  return sortFn(units[name1], units[name2])
})

const generateAction = (unit, game) => {
  let character = game.units[unit.retinueOf]
  if (character?.dead) { character = undefined }

  let transport = game.units[unit.transport] || game.units[character?.transport]
  if (transport?.dead || (!unit.embarked && !character?.embarked)) { transport = undefined }


  const phase = game.phase
  const [behavior] = getCurrentBehavior(unit, game.units)

  if (phase === 'Deploy') {
    if (transport && transport.reserved) {
      unit.reserved = true
      return `Place unit in reserve, embarked on ${transport.displayName}.`
    }

    if (character?.reserved) {
      unit.reserved = true
      return `Place in reserve along with ${character.displayName}.`
    }

    if (transport?.reserved) {
      unit.reserved = true
      return `Place in reserve along with ${character.displayName}.`
    }

    unit.reserved = false
    if (transport) {
      return `Unit is embarked in ${transport.displayName}.`
    }

    if (character) {
      return `Deploy within 3" of ${character.displayName}, seeking an ideal location from which to charge, fire, or be in cover, as appropriate to the unit.`
    }

    if (unit.deepstriker) {
      if (rollD6() >= 3) {
        unit.reserved = true
        return 'Place the unit ready ready to deep-strike using its special rule if able. Otherwise, reroll.'
      }
    } else if (rollD6() >= 5) {
      unit.reserved = true
      return 'Place unit in strategic reserves.'
    }

    return `Set up ${rollD6() + rollD6()}" ${rollDirection()} from spawn point ${Math.ceil(Math.random() * 4)}.`
  }

  if (phase === 'Move') {
    if (transport) {
      unit.reserved = transport.reserved

      if (unit.reserved) {
        return 'The unit remains in reserve with its transport.'
      }

      if (character && !character.embarked) {
        unit.embarked = false
        return `The retinue disembarks within 3" of ${character.displayName}, seeking an ideal location from which to charge, fire, use pyschic powers or be in cover, as appropriate to the unit.`
      }

      if (behavior === 'Erratic') {
        if (rollD6() >= 4) {
          return 'The unit remains embarked.'
        }
        return 'Unless it is the first turn of the game, the unit disembarks as close to a player unit as possible.'
      }

      if (behavior === 'Tactical') {
        return 'The unit dismounts if it can contest or claim an objective the enemy does not control, if it can fire at a player unit contesting or claiming an objective, or if it can perform a mission action in this location next turn. It seeks cover if possible.'
      }

      if (behavior === 'Berserk') {
        return 'The unit dismounts if it can get within 12" of a player unit.'
      }

      if (behavior === 'Skittish') {
        return 'The unit dismounts if the transport is not Open-Topped and the unit could fire at a player unit by, seeking cover if possible.'
      }
    }

    if (character && character.reserved) {
      return `The retinue remains in reserve alongside ${character.displayName}.`
    }

    if (character) {
      return `The retinue moves as close as possible to ${character.displayName}, seeking an ideal location from which to charge, fire, use pyschic powers or be in cover, as appropriate to the unit.`
    }

    if (unit.reserved) {
      if (character && !character.reserved) {
        unit.reserved = false
        return `The retinue deploys alongside ${character.displayName}, seeking an ideal location from which to charge, fire, use pyschic powers or be in cover, as appropriate to the unit.`
      }

      if (rollD6() >= 5) {
        return 'The unit remains in reserves.'
      }

      unit.reserved = false

      if (unit.deepstriker) {
        if (behavior === 'Erratic') {
          return `If it is the first turn, the unit remains in reserves. Otherwise, locate all general areas of the board the unit could deep-strike into. It arrives at a random one, as close to a player unit as possible.`
        }

        if (behavior === 'Tactical') {
          return `If it is the first turn, the unit remains in reserves. Otherwise, locate all general areas of the board it could arrive in that would place it close to an objective the enemy does not control. It arrives at a random one, as close to an objective as possible.`
        }

        if (behavior === 'Berserk') {
          return `If it is the first turn, the unit remains in reserves. Otherwise, locate all general areas of the board the unit could deep-strike into. It arrives in one at random, as close to as many player units as possible.`
        }

        if (behavior === 'Skittish') {
          return `If it is the first turn, the unit remains in reserves. Otherwise, locate all pieces of cover the unit could deep-strike into, from which the unit can fire at a player unit. The unit arrives at a random one.`
        }
      } else {
        if (behavior === 'Erratic') {
          return `If it is the first turn, the unit remains in reserves. Otherwise, select a random board edge the unit can arrive from. It arrives ${roll2D6()}" to the ${rollD6() > 4 ? 'left' : 'right'} of the center of that edge, as far onto the battlefield as possible.`
        }

        if (behavior === 'Tactical') {
          return `If it is the first turn, the unit remains in reserves. Otherwise, deploy as near as possible to an objective the enemy does not control. If there are multiple objectives equally distant from a board edge the enemy does not control, choose one to deploy near at random.`
        }

        if (behavior === 'Berserk') {
          return `If it is the first turn, the unit remains in reserves. Otherwise, deploy as close as possible to a player unit. If it can deploy within 6" of multiple player units, determine which one it will deploy near randomly.`
        }

        if (behavior === 'Skittish') {
          return `If it is the first turn, the unit remains in reserves. Otherwise, locate all pieces of cover within 12" of a valid board edge, from which the unit can fire at a player unit. Select one at random. The unit will deploy as near (or in) this piece of cover as possible.`
        }
      }
    }

    if (behavior === 'Erratic') {
      switch (rollD6()) {
        case 1:
          return `The unit remains stationary.`
        case 2:
          return `If the unit can perform a mission action, it does so. Otherwise, if the unit does not control an objective, it makes a Tactical Move towards the closest objective marker that the enemy does not already control or a location to perform a mission action. If the unit is controlling or contesting an objective, it stays on the objective and tries to gain line of sight to the nearest player unit.`
        case 3:
          return 'The unit makes a Normal Move towards the nearest player unit.'
        case 4:
          return 'The unit Advances towards the nearest player unit.'
        case 5:
          return `The unit makes a Normal Move as far as possible to the ${rollDirection()}.`
        default:
          return `The unit makes a Advances as far as possible to the ${rollDirection()}.`
      }
    }

    if (behavior === 'Tactical') {
      return `If the unit can perform a mission action, it does so. Otherwise, if the unit does not control an objective, it makes a Tactical Move towards the closest objective marker that the enemy does not already control or a location to perform a mission action. If the unit is controlling or contesting an objective, it stays on the objective and tries to gain line of sight to the nearest player unit.`
    }

    if (behavior === 'Berserk') {
      return 'The unit makes a Tactical Move towards the nearest player unit.'
    }

    if (behavior === 'Skittish') {
      return 'If the unit is in cover and can fire at a player unit, it stays in place. Otherwise, it makes a Tactical Move towards the nearest unoccupied piece of cover from which it can fire at a player unit.'
    }
  }

  if (phase === 'Psychic') {
    if (unit.psychicPowers.length === 0) {
      return ' '
    }

    const powers = shuffle(Object.entries(unit.psychicPowers)).map(([name, p]) => {
      return `- ${name} (Warp Charge ${p.warpCharge}, ${p.range}): ${p.details.replace(/\n/g, '\n  ')}`
    }).join('\n')

    return `The unit uses as many psychic powers as it's able and are relevent, in this order:\n${powers}`
  }

  if (phase === 'Shoot') {
    if (behavior === 'Erratic') {
      if (rollD6() >= 5) {
        return 'The unit does not fire.'
      }

      return 'Find all player units this unit can shoot at. It fires all weapons at a random one.'
    }

    if (behavior === 'Tactical') {
      return 'If doing so would not interrupt a mission action, then for each weapon this unit fires it at the player unit whose toughness most closely matches the strength of the weapon. To break ties, it fires at the unit with the highest power level.'
    }

    if (behavior === 'Berserk') {
      return 'The unit fires all weapons at the closest player unit.'
    }

    if (behavior === 'Skittish') {
      return 'This unit fires at the player unit whose toughness most closely matches the strength of the weapon. To break ties, it fires at the unit with the highest power level.'
    }
  }

  if (phase === 'Charge') {
    if (character) {
      return `The retinue attempts to charge all targets ${character.displayName} is engaged with. Otherwise, it does not charge.`
    }

    if (behavior === 'Erratic') {
      if (rollD6() >= 5) {
        return 'The unit does not charge.'
      }
      return 'If within 12" of a player unit, this unit attempts to charge the closest one.'
    }

    if (behavior === 'Tactical') {
      if (unit.defaultBehavior === 'Berserk') {
        return 'If within 12" of a player unit, and charging would not break the enemy’s control of an objective or interrupt an action, it will attempt to charge the closest player unit (and no others).'
      }

      return 'The unit does not charge.'
    }

    if (behavior === 'Berserk') {
      return "Roll the unit's charge. It declares a charge against as many player units as it can reach."
    }

    if (behavior === 'Skittish') {
      return "The unit does not charge."
    }
  }
}

export default function defaultBehaviors(state = defaultState, action) {
  switch (action.type) {
    case 'PLAYER_POWER':
      return set('playerPower', action.playerPower, state)

    case 'ENEMY_BONUS':
      return set('enemyBonus', action.enemyBonus, state)

    case 'CRUSADE_POINTS':
      return set('crusadePoints', action.crusadePoints, state)

    case 'COMMAND_POINTS':
      return set('commandPoints', action.commandPoints, state)

    case 'GENERATE_ARMY': {
      const units = rollList(action.state)
      return {
        ...state,
        phase: 'Deploy',
        enemyStrategem: '',
        commandPoints: state.crusadePoints,
        units,
        actionOrder: actionOrder(units),
      }
    }

    case 'SET_RETINUE': {
      const c = action.character.displayName
      const u = action.unit?.displayName || ''

      return flow([
        action.character.retinue && set(`units.${action.character.retinue}.retinueOf`, ''),
        set(`units.${c}.retinue`, u),
        u && set(`units.${u}.retinueOf`, c),
      ].filter(Boolean))(state)
    }

    case 'SET_TRANSPORT': {
      const t = action.transport.displayName
      const u = action.unit?.displayName || ''

      return flow([
        action.transport.transporting && update(`units.${action.transport.transporting}`, assign({transport: '', embarked: false})),
        set(`units.${t}.transporting`, u),
        u && set(`units.${u}.transport`, t),
        u && set(`units.${u}.embarked`, true),
      ].filter(Boolean))(state)
    }

    case 'ENEMY_STRATEGEM':
      return set('enemyStrategem', rollStrategem(state.enemyStrategem), state)

    case 'CHANGE_PHASE':
      return {
        ...state,
        phase: action.phase,
        units: mapValues(set('action', ''), state.units),
        actionOrder: actionOrder(state.units),
      }

    case 'UNIT_ACT': {
      const a = generateAction(action.unit, state)
      if (!a) { throw new Error() }
      let newState = set(`units.${action.unit.displayName}.action`, a, state)

      const reserved = newState.units[action.unit.displayName].reserved
      const retinue = newState.units[action.unit.retinue]
      if (retinue) {
        retinue.reserved = reserved
      }

      const transporting = newState.units[action.unit.transporting]
      if (transporting) {
        transporting.reserved = reserved

        const transportingRetinue = newState.units[transporting.retinue]
        if (transportingRetinue) {
          transportingRetinue.reserved = reserved
        }
      }

      return newState
    }

    case 'SET_EMBARKED':
      return set(`units.${action.unit.displayName}.embarked`, action.embarked, state)

    case 'SET_RESERVED': {
      let newState = update(`units.${action.unit.displayName}`, assign({action: '', reserved: action.reserved}), state)

      let transport = state.units[action.unit.transport]
      if (action.unit.embarked && !transport.dead) {
        newState = update(`units.${transport.displayName}`, assign({action: '', reserved: action.reserved}), newState)
      }

      let transporting = state.units[action.unit.transporting]
      if (transporting?.embarked &&  !transporting.dead) {
        newState = update(`units.${transporting.displayName}`, assign({action: '', reserved: action.reserved}), newState)
      }

      return newState
    }

    case 'SET_DEAD': {
      if (action.dead && state.commandPoints >= action.unit.power) {
        let newState = update(`units.${action.unit.displayName}`, assign({action: 'Return the unit to Reserves rather than destroying it. It still counts as having been destroyed for all other rules purposes.', reserved: true}), state)

        newState.commandPoints -= action.unit.power

        return newState
      }

      let newState = update(`units.${action.unit.displayName}`, assign({action: '', dead: action.dead}), state)

      let transporting = state.units[action.unit.transporting]
      if (transporting?.embarked) {
        newState = update(`units.${transporting.displayName}`, assign({embarked: false}), newState)
      }

      return newState
    }

    default:
      return state
  }
}
