import { useDispatch } from 'react-redux'
import ReactMarkdown from 'react-markdown'

import { useGame, getCurrentBehavior } from './state/utils'
import Unit from './Unit'

const ActiveUnit = ({ unit }) => {
  const { phase, units } = useGame()
  const dispatch = useDispatch()

  if (phase === 'Psychic' && !unit.psychicPowers?.length) { return null }

  const [behavior, why] = getCurrentBehavior(unit, units)

  return (<tr data-dead={unit.dead}>
    <td><Unit unit={unit} /></td>
    <td>{behavior !== unit.behavior ? <span>{behavior}<br /><strike data-tooltip={why}>{unit.behavior}</strike></span> : unit.behavior}</td>
    <td>{unit.dead ? '' : <UnitAction unit={unit} />}</td>
    <td className="unit-status">
      <label>
        <span data-tooltip="Mark the unit as dead">Dead</span>
        <input type="checkbox" checked={unit.dead} onChange={e => dispatch({type: 'SET_DEAD', unit, dead: e.target.checked})} />
      </label>
      <label>
        <span data-tooltip="Mark the unit as in reserves; It may deploy in future movement phases">Rsrvd</span>
        <input type="checkbox" checked={unit.reserved} onChange={e => dispatch({type: 'SET_RESERVED', unit, reserved: e.target.checked})} />
      </label>
      {unit.transport  && <label>
        <span data-tooltip="Mark the unit as in reserves; It may deploy in future movement phases">Embarked</span>
        <input type="checkbox" checked={unit.embarked} onChange={e => dispatch({type: 'SET_EMBARKED', unit, embarked: e.target.checked})} />
      </label>}
    </td>
  </tr>)
}

const characterCantActYet = (unit, units, phase) => {
  if (!unit.retinue) { return '' }
  const retinue = units[unit.retinue]

  return !retinue.dead && !retinue.action && `Characters ${phase.toLowerCase()} after their retinue`
}

const cantActBecauseReserved = (unit, phase, units) => {
  if (unit.embarked && units[unit.transport].reserved) { return "Reserved units stay in their transports" }
  if (unit.reserved && phase ==='Move' && !Object.values(units).every(u => u.reserved || u.action)) { return "Reserves move last" }
  if (unit.reserved && (phase === 'Shoot' || phase === 'Charge')) { return "In reserves" }
}

const UnitAction = ({ unit }) => {
  const { phase, units } = useGame()
  const dispatch = useDispatch()

  if (unit.action) { return <ReactMarkdown>{unit.action}</ReactMarkdown> }

  return (<>
    {phase === 'Deploy' && unit.keywords['Character'] && <label className="retinue">
      <span>Retinue</span>
      <select value={unit.retinue} onChange={e => dispatch({type: 'SET_RETINUE', character: unit, unit: units[e.target.value]})}>
        <option value=''></option>
        {Object.values(units).filter(u => !u.keywords['Character']).map(u => <option key={u.displayName} value={u.displayName} disabled={u.retinueOf && u.retinueOf !== unit.displayName}>{u.displayName}</option>)}
      </select>
    </label>}
    {phase === 'Deploy' && unit.keywords['Transport'] && <label className="transport">
      <span>Transporting</span>
      <select value={unit.transporting} onChange={e => dispatch({type: 'SET_TRANSPORT', transport: unit, unit: units[e.target.value]})}>
        <option value=''></option>
        {Object.values(units).filter(u => !u.keywords['Transport']).map(u => <option key={u.displayName} value={u.displayName} disabled={u.transport && u.transport !== unit.displayName}>{u.displayName}</option>)}
      </select>
    </label>}
    {cantActBecauseReserved(unit, phase, units) || characterCantActYet(unit, units, phase) || <button className="outline small" onClick={() => dispatch({type: 'UNIT_ACT', unit})}>+</button>}
  </>)
}

export default ActiveUnit
