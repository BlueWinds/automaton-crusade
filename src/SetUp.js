import { useDispatch } from 'react-redux'
import { useRoster, useDefaultBehaviors, sumPower } from './state/utils'
import Unit from './Unit'

const SetUp = () => {
  const roster = useRoster()
  const defaultBehaviors = useDefaultBehaviors()
  const dispatch = useDispatch()

  return (<table className="roster" role="grid">
    <thead>
      <tr>
        <th>Power</th>
        <th>Basic Behavior</th>
        <th>Unit</th>
      </tr>
    </thead>
    <tbody>
      {roster.map((unit, i) => (<tr key={i}>
        <td>{unit.power}</td>
        <td>
          <select value={defaultBehaviors[unit.name] || ''} onChange={e => dispatch({
            type: 'DEFAULT_BEHAVIOR',
            name: unit.name,
            behavior: e.target.value
          })}>
            <option value=""></option>
            <option value="Berserk">Berserk</option>
            <option value="Skittish">Skittish</option>
          </select>
        </td>
        <td><Unit unit={unit} /></td>
        <td className="unit-status">
          <label>
            <span data-tooltip="Mark the unit as capable of deep-striking (having a special rule letting it set up anywhere on the board in a Deployment phase)">Deep Striker</span>
            <input className="deepstrike" type="checkbox" checked={unit.deepstriker} onChange={e => dispatch({type: 'SET_DEEPSTRIKER', unit, deepstriker: e.target.checked})} />
          </label>
        </td>
      </tr>))}
    </tbody>
    <tfoot>
      <tr>
        <th>{sumPower(roster)}</th>
        <td>Basic Behavior</td>
        <td>Unit</td>
      </tr>
    </tfoot>
  </table>)
}

export default SetUp
