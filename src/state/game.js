import shuffle from 'lodash/fp/shuffle'
import set from 'lodash/fp/set'
import get from 'lodash/fp/get'
import mapValues from 'lodash/fp/mapValues'
import badAssign from 'lodash/fp/assign'
import concat from 'lodash/fp/concat'
import flow from 'lodash/fp/flow'
import drop from 'lodash/fp/drop'
import update from 'lodash/fp/update'
import sum from 'lodash/fp/sum'

import cardsMd from '../markdown/cards.md'

import { rollD6, roll2D6, rollDirection, rollList, getCurrentBehavior } from './utils'

const assign = badAssign.convert({ 'rearg': true })

const defaultState = {
  phase: 'Deploy',
  playerPower: 100,
  enemyBonus: 33,
  crusadePoints: 0,
  commandPoints: 0,
  enemyStrategem: '',
  spawnPoints: [],
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

// Ordered from top down, with lower ones being more important.
const turnSort = [
  u => u.behavior === 'Erratic',
  u => u.behavior === 'Tactical',
  u => u.behavior === 'Brserk',
  u => u.behavior === 'Skittish',
  u => !!u.keywords.Transport,
  u => !!u.retinue,
  u => u.reserved,
  u => u.reserved && !u.keywords.Transport,
  u => u.dead,
]

const deploySort = [
  u => u.behavior === 'Erratic',
  u => u.behavior === 'Tactical',
  u => u.behavior === 'Brserk',
  u => u.behavior === 'Skittish',
  u => !u.keywords.Transport,
  u => !!u.keywords.Character,
]

const actionOrder = (phase, units) => {
  const sort = phase === 'Deploy' ? deploySort : turnSort
  const sortFn = (u1, u2) => {
    const mapFn = (s, i) => ((s(units[u1]) - s(units[u2])) << i)
    return sum(sort.map(mapFn))
  }

  return Object.keys(units).sort(sortFn)
}

const generateAction = (unit, game) => {
  let transport = game.units[unit.transport]
  if (transport?.dead || !unit.embarked) { transport = undefined }

  let retinue = game.units[unit.retinue]
  if (retinue?.dead) { retinue = undefined }

  const phase = game.phase
  const [behavior] = getCurrentBehavior(unit, game.units)

  if (phase === 'Deploy') {
    if (transport && transport.reserved) {
      unit.reserved = true
      return `Place unit in reserve, embarked on ${transport.displayName}.`
    }

    if (transport) {
      return `Unit is embarked in ${transport.displayName}.`
    }

    if (retinue?.reserved || transport?.reserved) {
      unit.reserved = true
      return `Place in reserve along with ${retinue.displayName}.`
    }

    if (retinue) {
      return `Deploy as near as possible to ${retinue.displayName}, seeking an ideal location from which to charge, fire, use pyschic powers or be in cover, as appropriate to the character.`
    }

    if (unit.deepstriker) {
      if (rollD6() >= 3) {
        unit.reserved = true
        return 'Place the unit ready ready to deep-strike using its special rule if able. Otherwise, reroll.'
      }
    } else if (rollD6() >= 5) {
      unit.reserved = true
      return 'Place unit in strategic reserve.'
    }

    unit.reserved = false
    return `Set up ${rollD6() + rollD6()}" ${rollDirection()} from spawn point ${Math.ceil(Math.random() * game.spawnPoints.length)}.`
  }

  if (phase === 'Move') {
    if (transport) {
      unit.reserved = transport.reserved

      if (unit.reserved) {
        return 'The unit remains in reserve with its transport.'
      }

      if (retinue && !retinue.embarked) {
        unit.embarked = false
        return `The character disembarks as close as possible to ${retinue.displayName}, seeking an ideal location from which to charge, fire, use pyschic powers or be in cover, as appropriate to the character.`
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

    if (retinue && retinue.reserved) {
      return `The character remains in reserve alongside ${retinue.displayName}.`
    }

    if (retinue) {
      return `The character moves as close as possible to ${retinue.displayName}, seeking an ideal location from which to charge, fire, use pyschic powers or be in cover, as appropriate to the character.`
    }

    if (unit.reserved) {
      if (retinue && !retinue.reserved) {
        unit.reserved = false
        return `Character deploys alongside ${retinue.displayName}, seeking an ideal location from which to charge, fire, use pyschic powers or be in cover, as appropriate to the character..`
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
    if (retinue) {
      return `The character attempts to charge all targets ${retinue.displayName} is engaged with. Otherwise, it does not charge.`
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

const spawnPoint = () => `${roll2D6()}" ${rollDirection()} of an objective`

export default function defaultBehaviors(state = defaultState, action) {
  switch (action.type) {
    case 'ADD_SPAWN_POINT':
      return set('spawnPoints', concat(spawnPoint(), state.spawnPoints), state)

    case 'REMOVE_SPAWN_POINT':
      return set('spawnPoints', drop(1, state.spawnPoints), state)

    case 'PLAYER_POWER':
      return set('playerPower', action.playerPower, state)

    case 'ENEMY_BONUS':
      return set('enemyBonus', action.enemyBonus, state)

    case 'CRUSADE_POINTS':
      return set('crusadePoints', action.crusadePoints, state)

    case 'GENERATE_ARMY': {
      const units = rollList(action.state)
      return {
        ...state,
        phase: 'Deploy',
        spawnPoints: [spawnPoint(), spawnPoint(), spawnPoint(), spawnPoint()],
        enemyStrategem: '',
        units,
        actionOrder: actionOrder('Deploy', units),
      }
    }


    case 'SET_RETINUE': {
      const c = action.character.displayName
      const u = action.unit?.displayName || ''

      return flow([
        action.character.retinue && set(`units.${action.character.retinue}.retinueOf`, ''),
        update(`units.${c}`, assign({
          retinue: u,
          transport: action.unit?.transport || '',
          embarked: action.unit?.embarked || false,
          reserved: action.unit?.reserved || false
        })),
        u && set(`units.${u}.retinueOf`, c),
      ].filter(Boolean))(state)
    }

    case 'SET_TRANSPORT': {
      const t = action.transport.displayName
      const u = action.unit.displayName

      return flow([
        action.transport.transporting && update(`units.${action.transport.transporting}`, assign({transport: '', embarked: false})),
        set(`units.${t}.transporting`, u),
        set(`units.${u}.transport`, t),
        set(`units.${u}.embarked`, true),
      ].filter(Boolean))(state)
    }

    case 'ENEMY_STRATEGEM':
      return set('enemyStrategem', rollStrategem(state.enemyStrategem), state)

    case 'CHANGE_PHASE':
      return {
        ...state,
        phase: action.phase,
        units: mapValues(set('action', ''), state.units),
        actionOrder: actionOrder(action.phase, state.units),
      }

    case 'UNIT_ACT': {
      const a = generateAction(action.unit, state)
      if (!a) { throw new Error() }
      return set(`units.${action.unit.displayName}.action`, a, state)
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
