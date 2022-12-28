const defaultState = 'power'

export default function help(state = defaultState, action) {
  switch (action.type) {
    case 'SET_MODE':
      return action.mode
    default:
      return state
  }
}
