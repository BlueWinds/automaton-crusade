import cardsMd from '../markdown/cards.md'

import { sumPower, rollD3, rollD6, roll2D6, rollDirection } from './utils'

const defaultState = {
  phase: 'Deploy',
  playerPower: 100,
  enemyBonus: 33,
  enemyStrategem: '',
  spawnPoints: [],
  units: [],
  afterBattle: [],
}

const behaviors = ['Erratic', 'Tactical', 'Berserk', 'Skittish']
const randomBehavior = (unit, unitBehaviors) => {
  let b = behaviors[Math.floor(Math.random() * 3)]
  if (b === 'Berserk') {
    b = unitBehaviors[unit.name]
  }
  return b
}

const deployOrder = (u1, u2) => {
  return !u1.keywords['Character'] * 1024 - !u2.keywords['Character'] * 1024 + turnOrder(u1, u2)
}

const turnOrder = (u1, u2) => {
  return !!u1.dead * 32 - !!u2.dead * 32
    + !!u1.reserved * 16 - !!u2.reserved * 16
    + !!u1.retinueOf * 8 - !!u2.retinueOf * 8
    + behaviors.indexOf(u1.behavior) - behaviors.indexOf(u2.behavior)
}

const generateList = ({ roster, defaultBehaviors, game }) => {
  const newList = [...roster.map(u => ({
    ...u,
    behavior: randomBehavior(u, defaultBehaviors),
    action: '',
    retinue: '',
    retinueOf: '',
    reserved: false,
    dead: false,
    kills: 0,
  }))]

  const discards = []
  const targetPowerLevel = game.playerPower * (1 + game.enemyBonus / 100)

  while (sumPower(newList) > targetPowerLevel) {
    let i = Math.floor(Math.random() * newList.length)
    discards.push(newList.splice(i, 1)[0])
  }

  discards.sort((u1, u2) => u2.power - u1.power)
  for (let i = 0; i < discards.length; i++) {
    if (sumPower(newList) + discards[i].power <= targetPowerLevel) {
      newList.push(discards[i])
    }
  }

  newList.sort(deployOrder)

  return newList
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

const generateAction = (phase, spawnPoints, unit, retinueOf) => {
  if (phase === 'Deploy') {
    if (retinueOf && !retinueOf.dead && retinueOf.reserved) {
      unit.reserved = true
      return 'Place in reserve along with ' + retinueOf.displayName
    }

    if (retinueOf && !retinueOf.dead) {
      return 'Deploy as near as possible to ' + retinueOf.displayName
    }

    if (rollD6() >= 5) {
      unit.reserved = true
      return 'Place in reserve'
    }

    return `Set up ${rollD6() + rollD6()}" ${rollDirection()} from spawn point ${Math.ceil(Math.random() * spawnPoints.length)}`
  }

  if (phase === 'Move') {
    if (retinueOf && !retinueOf.dead && retinueOf.reserved) {
      return 'Unit remains in reserves alongside ' + retinueOf.displayName
    }

    if (retinueOf && !retinueOf.dead) {
      return 'Unit moves as close as possible to ' + retinueOf.displayName
    }

    if (unit.reserved) {
      if (rollD6() >= 5) {
        return 'Unit remains in reserves.'
      }

      unit.reserved = false
      if (unit.behavior === 'Erratic') {
        return `Select a random board edge the unit can arrive from. It arrives ${roll2D6()}" to the ${rollD6() > 4 ? 'left' : 'right'} of the center of that edge, as far onto the battlefield as possible.`
      }

      if (unit.behavior === 'Tactical') {
        return `Deploy as near as possible to an objective the enemy does not control. If there are multiple objectives equally distant from a board edge the enemy does not control, choose one to deploy near at random.`
      }

      if (unit.behavior === 'Berserk') {
        return `Deploy as close as possible to a player unit. If it can deploy within 6" of multiple player units, determine which one it will deploy near randomly.`
      }

      if (unit.behavior === 'Berserk/Skittish') {
        return `Locate all pieces of cover within 12" of a valid board edge, from which the unit can fire at a player unit. Select one at random. The unit will deploy as near (or in) this piece of cover as possible.`
      }
    }

    if (unit.behavior === 'Erratic') {
      if (rollD6() >= 5) {
        return 'Unit remains stationary.'
      }
      return `Unit moves ${roll2D6()}" ${rollDirection()}, up to its normal move speed. Double the distance if its base move is greater than 12".`
    }

    if (unit.behavior === 'Tactical') {
      return 'If the unit can perform a mission action, it does so.\nOtherwise, if the unit does not control an objective, it moves towards the closest objective marker that the enemy does not already control or a location to perform a mission action.\nIf the unit is controlling or contesting an objective, it stays on the objective and tries to gain line of sight to the nearest player unit.'
    }

    if (unit.behavior === 'Berserk') {
      return 'Unit moves towards the nearest player unit.'
    }

    if (unit.behavior === 'Skittish') {
      return 'If the unit is in cover and can fire at a player unit, it stays in place. Otherwise, it moves towards the nearest unoccupied piece of cover from which it can fire at a player unit.'
    }
  }

  if (phase === 'Shoot') {
    if (unit.behavior === 'Erratic') {
      if (rollD6() >= 5) {
        return 'Unit does not fire.'
      }

      return 'Find all player units this unit can shoot at. It fires all weapons at a random one.'
    }

    if (unit.behavior === 'Tactical') {
      return 'If doing so would not interrupt a mission action, then for each weapon this unit fires it at the player unit whose toughness most closely matches the strength of the weapon. To break ties, it fires at the unit with the highest power level.'
    }

    if (unit.behavior === 'Berserk') {
      return 'The unit fires all weapons at the closest player unit.'
    }

    if (unit.behavior === 'Skittish') {
      return 'This unit fires at the player unit whose toughness most closely matches the strength of the weapon. To break ties, it fires at the unit with the highest power level.'
    }
  }

  if (phase === 'Charge') {
    if (retinueOf && !retinueOf.dead) {
      return 'Unit attempts to charge all targets ' + retinueOf.displayName + ' is engaged with. Otherwise, it does not charge.'
    }

    if (unit.behavior === 'Erratic') {
      if (rollD6() >= 5) {
        return 'Unit does not charge.'
      }
      return 'If within 12" of a player unit, this unit attempts to charge the closest one (and no others).'
    }

    if (unit.behavior === 'Tactical') {
      return 'If within 12" of a player unit, and charging would not break the enemy’s control of an objective or interrupt an action, it will attempt to charge the closest player unit (and no others).'
    }

    if (unit.behavior === 'Berserk') {
      return "Roll the unit's charge. It declares a charge against as many player units as it can reach."
    }

    if (unit.behavior === 'Skittish') {
      return "The unit does not charge."
    }
  }
}

const spawnPoint = () => `${roll2D6()}" ${rollDirection()} of an objective`

const rollRequisition = () => ([
  'Add a new unit to the enemy Order of Battle, of any Power Level, as feels appropriate to the players. Remove other units until the total Power Level is again around 200, preferring units that do not have special names yet.',
  'The enemy uses Rearm/Requisition twice. Change the loadout of two enemy units.',
  'Remove one battle scar from an enemy unit. If none of its units have scars, reroll.',
  'An enemy character model that participated in the battle gains a warlord trait. If all characters that participated already have one, reroll.',
  'An enemy unit that participated in the battle gains a relic. If there are none available or none feel relevant, reroll.',
  'An enemy unit that participated in the battle gains a faction specific upgrade. If none are available, reroll.',
][rollD6() - 1])

export default function defaultBehaviors(state = defaultState, action) {
  switch (action.type) {
    case 'ADD_SPAWN_POINT':
      return {
        ...state,
        spawnPoints: [...state.spawnPoints, spawnPoint()],
      }
    case 'REMOVE_SPAWN_POINT':
      return {
        ...state,
        spawnPoints: [...state.spawnPoints].slice(0, state.spawnPoints.length - 1)
      }
    case 'PLAYER_POWER':
      return {
        ...state,
        playerPower: action.playerPower,
      }
    case 'ENEMY_BONUS':
      return {
        ...state,
        enemyBonus: action.enemyBonus,
      }
    case 'GENERATE_ARMY':
      return {
        ...state,
        phase: 'Deploy',
        spawnPoints: [spawnPoint(), spawnPoint(), spawnPoint(), spawnPoint()],
        enemyStrategem: '',
        units: generateList(action.state),
        afterBattle: [],
      }
    case 'SET_RETINUE': {
      const newState = {
        ...state,
        units: state.units.map(u => ({
          ...u,
          retinue: u.retinue === action.character.retinue ? '' : u.retinue,
          retinueOf: u.retinueOf === action.character.displayName ? '' : u.retinueOf,
        }))
      }

      newState.units[state.units.indexOf(action.character)] = {...action.character, retinue: action.unit ? action.unit.displayName : ''}

      if (action.unit) {
        const unit = {
          ...action.unit,
          retinueOf: action.character.displayName,
        }
        newState.units[state.units.indexOf(action.unit)] = unit
      }

      newState.units.sort(deployOrder)
      return newState
    }
    case 'ENEMY_STRATEGEM':
      return {
        ...state,
        enemyStrategem: rollStrategem(state.enemyStrategem)
      }
    case 'CHANGE_PHASE': {
      const newState = {
        ...state,
        phase: action.phase,
        units: state.units.map(u => ({...u, action: ''}))
      }
      console.log(action.phase)
      newState.units.sort(action.phase === 'Deploy' ? deployOrder : turnOrder)
      return newState
    }
    case 'UNIT_ACT': {
      const newState = {
        ...state,
        units: [...state.units],
      }
      const unit = {...action.unit}
      const retinueOf = unit.retinueOf ? state.units.find(u => u.displayName === unit.retinueOf) : undefined
      unit.action = generateAction(state.phase, state.spawnPoints, unit, retinueOf)
      newState.units[state.units.indexOf(action.unit)] = unit

      return newState
    }
    case 'SET_KILLS': {
      const newState = {
        ...state,
        units: [...state.units],
      }
      newState.units[state.units.indexOf(action.unit)] = {...action.unit, kills: action.kills}
      return newState
    }
    case 'SET_RESERVED': {
      const newState = {
        ...state,
        units: [...state.units],
      }
      newState.units[state.units.indexOf(action.unit)] = {...action.unit, reserved: action.reserved, action: ''}
      return newState
    }
    case 'SET_DEAD': {
      const newState = {
        ...state,
        units: [...state.units],
      }
      newState.units[state.units.indexOf(action.unit)] = {...action.unit, dead: action.dead, action: ''}
      return newState
    }
    case 'BONUS_XP': {
      const units = [...state.units]
      return {
        ...state,
        afterBattle: [
          `${rollD3()}xp bonus for ${units.splice(Math.floor(Math.random() * units.length), 1)[0].displayName}`,
          `${rollD3()}xp bonus for ${units.splice(Math.floor(Math.random() * units.length), 1)[0].displayName}`,
          rollRequisition(),
        ]
      }
    }
    default:
      return state
  }
}
