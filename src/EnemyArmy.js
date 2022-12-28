import { useSelector, useDispatch } from 'react-redux'

import { useGame, sumPower, sumPoints, useMode } from './state/utils'
import ActiveUnit from './ActiveUnit'

export const Phase = () => {
  const { phase } = useGame()
  const dispatch = useDispatch()
  const onClick = (newPhase) => () => {
    if (phase === newPhase) { return }

    document.getElementById("top-of-turn").scrollIntoView()
    dispatch({type: 'CHANGE_PHASE', phase: newPhase})
  }

  return (<nav className="button-group">
    <ul>
      <li><button className={phase === 'Deploy' ? 'outline' : 'outline secondary'} onClick={onClick('Deploy')}>Deploy</button></li>
      <li><button className={phase === 'Move' ? 'outline' : 'outline secondary'} onClick={onClick('Move')}>Move</button></li>
      <li><button className={phase === 'Psychic' ? 'outline' : 'outline secondary'} onClick={onClick('Psychic')}>Psychic</button></li>
      <li><button className={phase === 'Shoot' ? 'outline' : 'outline secondary'} onClick={onClick('Shoot')}>Shoot</button></li>
      <li><button className={phase === 'Charge' ? 'outline' : 'outline secondary'} onClick={onClick('Charge')}>Charge</button></li>
    </ul>
  </nav>)
}

export const ActiveUnitTable = () => {
  const { units, actionOrder } = useGame()
  const mode = useMode()

  const tooltip = mode === 'power' ? `${sumPower(units)} PL` : `${sumPoints(units)} points`

  return (<table className="unit-list" role="grid">
    <thead>
      <tr>
        <td><span data-tooltip={tooltip}>Units</span></td>
        <th>Behavior</th>
        <th></th>
        <th><span data-tooltip="Track unit's status between turns">Status</span></th>
      </tr>
    </thead>
    <tbody>
      {actionOrder.filter(name => !units[name].retinueOf && !units[name].transporting).map((name, i) => (<ActiveUnit key={i} unit={units[name]} />))}
    </tbody>
    <tfoot>
      <tr>
        <td><span data-tooltip={tooltip}>Units</span></td>
        <td>Behavior</td>
        <th></th>
        <th><span data-tooltip="Track unit's status between turns">Status</span></th>
      </tr>
    </tfoot>
  </table>)
}

const EnemyArmy = () => {
  const dispatch = useDispatch()
  const state = useSelector(state => state)
  const { playerPower, enemyBonus, crusadePoints } = state.game

  const hasAllUnitBehaviors = state.roster.every(unit => state.defaultBehaviors[unit.name])
  const totalEnemyPower = state.mode === 'power' ? sumPower(state.roster) : sumPoints(state.roster)
  const maxEnemyBonus = (totalEnemyPower / playerPower * 100) - 100

  return (<div className="grid">
    <div>
      <label>Player {state.mode === 'power' ? 'Power Level' : 'Points'}
        <input type="number" min={state.mode === 'power' ? 10 : 200} max={totalEnemyPower / (enemyBonus / 100  + 1)} value={playerPower} step={state.mode === 'power' ? 5 : 100} onChange={e => dispatch({ type: 'PLAYER_POWER', playerPower: parseInt(e.target.value)})} />
      </label>
    </div>
    <div>
      <label>Enemy Bonus</label>
      <select value={enemyBonus} onChange={e => dispatch({type: 'ENEMY_BONUS', enemyBonus: parseInt(e.target.value, 10)})} >
        <option value="0">0%</option>
        <option value="15" disabled={maxEnemyBonus < 15}>15%</option>
        <option value="25" disabled={maxEnemyBonus < 25}>25%</option>
        <option value="33" disabled={maxEnemyBonus < 34}>33%</option>
        <option value="50" disabled={maxEnemyBonus < 50}>50%</option>
      </select>
    </div>
    <div>
      <label>Player Crusade Points
        <input type="number" min="0" value={crusadePoints} step="1" onChange={e => dispatch({ type: 'CRUSADE_POINTS', crusadePoints: parseInt(e.target.value)})} />
      </label>
    </div>
    <div>
      <label htmlFor="generate" data-tooltip={hasAllUnitBehaviors ? undefined : "Select the basic behavior of all units before generating an enemy list."}>Let's go!
        <button name="generate" className="outline" onClick={() => dispatch({type: 'GENERATE_ARMY', state})} disabled={!hasAllUnitBehaviors}>Generate</button>
      </label>
    </div>
  </div>)
}

export default EnemyArmy
