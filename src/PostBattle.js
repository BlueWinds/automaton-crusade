import { useDispatch } from 'react-redux'

import { useGame } from './state/utils'

const PostBattle = () => {
  const { units, afterBattle } = useGame()
  const dispatch = useDispatch()

  return <div className="post-battle">
    <button className="outline" disabled={!units.length} onClick={() => dispatch({type: 'BONUS_XP'})}>Generate</button>
    {afterBattle.length ? <table><tbody>
      <tr><td>Players nominate a unit to be Marked for Greatness</td></tr>
      {afterBattle.map((b, i) => <tr key={i}><td>{b}</td></tr>)}
    </tbody></table> : ''}
  </div>
}

export default PostBattle
