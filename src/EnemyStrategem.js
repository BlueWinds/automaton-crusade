import { useDispatch } from 'react-redux'
import ReactMarkdown from 'react-markdown'

import { useGame } from './state/utils'

const EnemyStrategem = () => {
  const dispatch = useDispatch()
  const { enemyStrategem } = useGame()

  return (<article className="strategem">
    <button className="outline" onClick={() => dispatch({type: 'ENEMY_STRATEGEM'})}>Draw an enemy Strategem</button>
    <ReactMarkdown>{enemyStrategem}</ReactMarkdown>
  </article>)
}

export default EnemyStrategem
