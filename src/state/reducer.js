import { combineReducers } from 'redux'

import defaultBehaviors from './defaultBehaviors'
import roster, { rosterXML } from './roster'
import game from './game'
import help from './help'
import modal from './modal'
import mode from './mode'

const combined = combineReducers({
  defaultBehaviors,
  roster,
  rosterXML,
  game,
  help,
  modal,
  mode,
});

export default function rootReducer(state = {}, action) {
  const {type, ...payload} = action
  console.groupCollapsed(type)
  console.log('State', state)
  console.log('Payload', payload)
  console.time(type)

  const newState = {
    ...combined(state, action),
  }

  localStorage.automatonCrusade = JSON.stringify(newState)

  console.timeEnd(action.type)
  console.log('Result', newState)
  console.groupEnd()

  return newState
}
