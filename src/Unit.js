import { useDispatch } from 'react-redux'

const Unit = ({unit}) => {
  const dispatch = useDispatch()
  const abilities = Object.keys((unit.abilities || {})).join('\n') || undefined

  return (<span data-tooltip={abilities} onClick={() => {dispatch({type: 'OPEN_UNIT_MODAL', unit})}}>{unit.displayName}</span>)
}

export default Unit
