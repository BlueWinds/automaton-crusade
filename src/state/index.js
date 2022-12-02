import {createStore} from 'redux'

import reducer from './reducer'

const initialState = localStorage.automatonCrusade ? JSON.parse(localStorage.automatonCrusade) : {}

export default function state() {
  const store = createStore(reducer, initialState)

  // If we have a roster already stored, we want to re-load it, in case the parsing logic has changed since it
  // was loaded in.
  const armyList = store.getState().rosterXML
  if (armyList) {
    store.dispatch({type: 'LOAD_ROSTER', armyList})
  }

  return store
}
