import { useDispatch } from 'react-redux'
import { useRoster, useDefaultBehaviors, sumPower } from './state/utils'
import Unit from './Unit'

const SetUp = () => {
  const roster = useRoster()
  const defaultBehaviors = useDefaultBehaviors()
  const dispatch = useDispatch()

  return (<table className="roster">
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
