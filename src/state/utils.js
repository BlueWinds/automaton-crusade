import {useSelector} from 'react-redux'
import fromPairs from 'lodash/fp/fromPairs'

export const useRoster = () => useSelector(state => state.roster)
export const useDefaultBehaviors = () => useSelector(state => state.defaultBehaviors)
export const useGame = () => useSelector(state => state.game)

export const sumPower = (units) => Object.values(units).reduce((sum, u) => sum + u.power, 0)

export const rollD3 = () => Math.ceil(Math.random() * 3)
export const rollD6 = () => Math.ceil(Math.random() * 6)
export const roll2D6 = () => rollD6() + rollD6()
export const rollDirection = () => ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'][Math.floor(Math.random() * 8)]

export const behaviors = ['Erratic', 'Tactical', 'Berserk', 'Skittish']
export const rollBehavior = (unit, unitBehaviors) => {
  let b = behaviors[Math.floor(Math.random() * 3)]
  if (b === 'Berserk') {
    b = unitBehaviors[unit.name]
  }
  return b
}

export const rollList = ({ roster, defaultBehaviors, game }) => {
  const newList = roster.map(u => ({
    ...u,
    behavior: rollBehavior(u, defaultBehaviors),
    defaultBehavior: defaultBehaviors[u.name],
    action: '',
    retinue: '',
    retinueOf: '',
    transport: '',
    transporting: '',
    reserved: false,
    embarked: false,
    dead: false
  }))

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

  return fromPairs(newList.map(u => [u.displayName, u]))
}

export const getCurrentBehavior = (unit, units) => {
  if (unit.transporting && units[unit.transporting].embarked) {
    return [getCurrentBehavior(units[unit.transporting], units)[0], 'Transports gain the behavior of units embarked in them.']
  }

  if (unit.retinueOf && !units[unit.retinueOf].dead) {
    return [units[unit.retinueOf].behavior, "Retinues gain the behavior of the character they're attached to."]
  }

  return [unit.behavior]
}

export function htmlDecode(s) {
  var e = document.createElement('div')
  e.innerHTML = s
  return e.childNodes[0].nodeValue
}
