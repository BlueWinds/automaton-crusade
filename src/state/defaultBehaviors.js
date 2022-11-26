const defaultState = {}

export default function defaultBehaviors(state = defaultState, action) {
  switch (action.type) {
    case 'DEFAULT_BEHAVIOR':
      return {
        ...state,
        [action.name]: action.behavior
      }
    default:
      return state
  }
}
