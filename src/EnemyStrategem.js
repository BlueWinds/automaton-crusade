import { useDispatch } from 'react-redux'
import ReactMarkdown from 'react-markdown'

import { useGame } from './state/utils'

const EnemyStrategem = () => {
  const dispatch = useDispatch()
  const { enemyStrategem, units } = useGame()
  const filtered = Object.values(units).filter(u => u.commandPhase)

  return (<article className="strategem">
    <button className="outline" onClick={() => dispatch({type: 'ENEMY_STRATEGEM'})}>Draw an enemy Strategem</button>
    <ReactMarkdown>{enemyStrategem}</ReactMarkdown>
    {enemyStrategem && filtered && <div>
        <br />
        <h6>Check for Command phase abilities from:</h6>
        <ul>
          {filtered.map(unit => <li key={unit.displayName}>
            <span data-tooltip={Object.values(unit.abilities).find(a => a.match('In your Command phase'))} onClick={() => {dispatch({type: 'OPEN_UNIT_MODAL', unit})}}>{unit.displayName}</span>
          </li>)}
        </ul>
      </div>}
  </article>)
}

export default EnemyStrategem
