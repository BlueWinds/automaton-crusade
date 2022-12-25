import {createStore} from 'redux'
import { Peer } from 'peerjs'

import reducer from './reducer'


export default function state() {
  const initialState = localStorage.automatonCrusade ? JSON.parse(localStorage.automatonCrusade) : {}
  const store = createStore(reducer, initialState)

  const peerId = localStorage.automatonCrusadePeerID || Math.random()
  localStorage.automatonCrusadePeerID = peerId

  const peer = new Peer(peerId)

  peer.on('connection', connection => {

  })

  // If we have a roster already stored, we want to re-load it, in case the parsing logic has changed since it
  // was loaded in.
  const armyList = store.getState().rosterXML
  if (armyList) {
    store.dispatch({type: 'LOAD_ROSTER', armyList})
  }

  return store
}
