import { useDispatch } from 'react-redux'
import ReactMarkdown from 'react-markdown'

import { useGame, htmlDecode } from './state/utils'
import strategemsMd from './markdown/strategems.md'

const strats = strategemsMd.split('###').filter(Boolean).map(strat => '###' + strat)

const EnemyStrategem = () => {
  const dispatch = useDispatch()
  const { enemyStrategem, units, commandPoints } = useGame()
  const filtered = Object.values(units).filter(u => u.commandPhase)

  return (<article className="strategem">
    <div className="grid">
      {strats.map(strat => <div key={strat}><ReactMarkdown>{strat}</ReactMarkdown></div>)}
      {!!filtered.length && (<div>
          <h3>Command phase</h3>
          <ul>
            {filtered.map(unit => <li key={unit.displayName}>
              <span data-tooltip={htmlDecode(Object.values(unit.abilities).find(a => a.match('In your Command phase')))} onClick={() => {dispatch({type: 'OPEN_UNIT_MODAL', unit})}}>{unit.displayName}</span>
            </li>)}
          </ul>
        </div>)}
    </div>
    <br />
    <div className="grid">
      <div></div>
        <label>Enemy Command Points
          <input type="number" min="0" value={commandPoints} step="1" onChange={e => dispatch({ type: 'COMMAND_POINTS', commandPoints: parseInt(e.target.value)})} />
        </label>
        <label>
          Enemy Strategem
          <button className="outline" onClick={() => dispatch({type: 'ENEMY_STRATEGEM'})}>Draw</button>
        </label>
      <div></div>
    </div>
    <div><ReactMarkdown>{enemyStrategem}</ReactMarkdown></div>
  </article>)
}

export default EnemyStrategem
