const defaultState = {}

export default function help(state = defaultState, action) {
  switch (action.type) {
    case 'CLOSE_HELP':
      return {
        ...state,
        [action.title]: true
      }
    case 'OPEN_HELP':
      return {
        ...state,
        [action.title]: false
      }
    case 'RESET_HELP':
      return {}
    default:
      return state
  }
}
