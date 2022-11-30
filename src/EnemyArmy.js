import { useSelector, useDispatch } from 'react-redux'

import { useGame, sumPower } from './state/utils'
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
  const { units } = useGame()

  return (<table className="unit-list">
    <thead>
      <tr>
        <td><span data-tooltip={`${sumPower(units)} PL`}>Units</span></td>
        <th>Behavior</th>
        <th></th>
        <th><span data-tooltip="Track unit's status between turns">Status</span></th>
      </tr>
    </thead>
    <tbody>
      {units.map((unit, i) => (<ActiveUnit key={i} unit={unit} />))}
    </tbody>
    <tfoot>
      <tr>
        <td><span data-tooltip={`${sumPower(units)} PL`}>Units</span></td>
        <td>Behavior</td>
        <th></th>
        <th><span data-tooltip="Track unit's status between turns">Status</span></th>
      </tr>
    </tfoot>
  </table>)
}

export const SpawnPoints = () => {
  const { spawnPoints } = useGame()
  const dispatch = useDispatch()

  return (<table className="spawn-points">
    <thead><tr>
      <th colSpan="2">
        <span data-tooltip="Place at least 4 spawn points">Spawn Points</span>
        <button className="small outline" onClick={() => dispatch({type: 'ADD_SPAWN_POINT'})}>+</button>
        {spawnPoints.length > 4 ? <button className="small outline" onClick={() => dispatch({type: 'REMOVE_SPAWN_POINT'})}>-</button> : ''}
      </th>
    </tr></thead>
    <tbody>
      {spawnPoints.map((sp, i) => <tr key={i}><td></td><td>{sp}</td></tr>)}
    </tbody>
  </table>)
}

const EnemyArmy = () => {
  const dispatch = useDispatch()
  const state = useSelector(state => state)
  const { playerPower, enemyBonus } = state.game

  const hasAllUnitBehaviors = state.roster.every(unit => state.defaultBehaviors[unit.name])
  const totalEnemyPower = sumPower(state.roster)
  const maxEnemyBonus = (totalEnemyPower / playerPower * 100) - 100

  return (<div className="grid">
    <div>
      <label htmlFor="playerPower">Player Power Level
        <input type="number" min="10" max={totalEnemyPower / (enemyBonus / 100  + 1)} value={playerPower} step="10" name="playerPower" onChange={e => dispatch({ type: 'PLAYER_POWER', playerPower: parseInt(e.target.value)})} />
      </label>
    </div>
    <div>
      <label htmlFor="enemyBonus">Enemy Bonus</label>
      <select name="enemyBonus" value={enemyBonus} onChange={e => dispatch({type: 'ENEMY_BONUS', enemyBonus: parseInt(e.target.value, 10)})} >
        <option value="0">0%</option>
        <option value="15" disabled={maxEnemyBonus < 15}>15%</option>
        <option value="25" disabled={maxEnemyBonus < 25}>25%</option>
        <option value="33" disabled={maxEnemyBonus < 34}>33%</option>
        <option value="50" disabled={maxEnemyBonus < 50}>50%</option>
      </select>
    </div>
    <div>
      <label htmlFor="generate" data-tooltip={hasAllUnitBehaviors ? undefined : "Select the basic behavior of all units before generating an enemy list."}>Let's go!
        <button name="generate" className="outline" onClick={() => dispatch({type: 'GENERATE_ARMY', state})} disabled={!hasAllUnitBehaviors}>Generate</button>
      </label>
    </div>
  </div>)
}

export default EnemyArmy
