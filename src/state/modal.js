const defaultState = {
  type: '',
  data: {},
}

export default function help(state = defaultState, action) {
  switch (action.type) {
    case 'OPEN_UNIT_MODAL':
      return {
        ...state,
        type: 'unit',
        data: action.unit,
      }
    case 'CLOSE_MODAL':
      return defaultState
    default:
      return state
  }
}
