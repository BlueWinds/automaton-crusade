import {createStore} from 'redux'

import reducer from './reducer'

const initialState = localStorage.automatonCrusade ? JSON.parse(localStorage.automatonCrusade) : {}

export default function state() {
  return createStore(reducer, initialState)
}
