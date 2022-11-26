import {useSelector} from 'react-redux'

export const useRoster = () => useSelector(state => state.roster)
export const useDefaultBehaviors = () => useSelector(state => state.defaultBehaviors)
export const useGame = () => useSelector(state => state.game)

export const sumPower = (units) => units.reduce((sum, u) => sum + u.power, 0)

export const rollD3 = () => Math.ceil(Math.random() * 3)
export const rollD6 = () => Math.ceil(Math.random() * 6)
export const roll2D6 = () => rollD6() + rollD6()
export const rollDirection = () => ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'][Math.floor(Math.random() * 8)]
