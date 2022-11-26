import { useDispatch } from 'react-redux'

import { useGame } from './state/utils'

const ActiveUnit = ({ unit }) => {
  const dispatch = useDispatch()

  return (<tr data-dead={unit.dead}>
    <td>{unit.displayName}</td>
    <td>{unit.retinueOf ? <span>Retinue: {unit.retinueOf}<br />(Base: {unit.behavior})</span> : unit.behavior}</td>
    <td>{unit.dead ? '' : <UnitAction unit={unit} />}</td>
    <td className="unit-status">
      <label>
        <span data-tooltip="Track unit kills to update enemy Crusade Cards after the battle">Kills</span>
        <UnitKillCounter unit={unit} />
      </label>
      <label>
        <span data-tooltip="Mark the unit as dead">Dead</span>
        <input type="checkbox" checked={unit.dead} onChange={e => dispatch({type: 'SET_DEAD', unit, dead: e.target.checked})} />
      </label>
      <label>
        <span data-tooltip="Mark the unit as in reserves; It may deploy in future movement phases">Reserved</span>
        <input type="checkbox" checked={unit.reserved} onChange={e => dispatch({type: 'SET_RESERVED', unit, reserved: e.target.checked})} />
      </label>
    </td>
    <td></td>
  </tr>)
}

const retinueCantActYet = (unit, units, phase) => {
  if (!unit.retinueOf) { return '' }
  const character = units.find(u => u.displayName === unit.retinueOf)

  return !character.dead && !character.action && `Retinues ${phase.toLowerCase()} after their character`
}

const cantActBecauseReserved = (unit, phase) => unit.reserved && (phase === 'Shoot' || phase === 'Charge') && "In reserves"

const UnitAction = ({ unit }) => {
  const { phase, units } = useGame()
  const dispatch = useDispatch()

  if (unit.action) { return unit.action }

  return (<>
    {phase === 'Deploy' && unit.keywords['Character'] && <label className="retinue">
      <span>Retinue</span>
      <select value={unit.retinue} onChange={e => dispatch({type: 'SET_RETINUE', character: unit, unit: units.find(u => u.displayName === e.target.value)})}>
        <option value=''></option>
        {units.filter(u => !u.keywords['Character']).map(u => <option key={u.displayName} value={u.displayName}>{u.displayName}</option>)}
      </select>
    </label>}
    {cantActBecauseReserved(unit, phase) || retinueCantActYet(unit, units, phase) || <button className="outline small" onClick={() => dispatch({type: 'UNIT_ACT', unit})}>+</button>}
  </>)
}

const UnitKillCounter = ({ unit }) => {
  const dispatch = useDispatch()
  return <input type="number" value={unit.kills} onChange={e => dispatch({type: 'SET_KILLS', unit, kills: parseInt(e.target.value, 10)})} />
}

export default ActiveUnit
