import {useDispatch, useSelector} from 'react-redux'
import ReactMarkdown from 'react-markdown'

function htmlDecode(input){
  var e = document.createElement('div');
  e.innerHTML = input;
  return e.childNodes[0].nodeValue;
}

const Modal = () => {
  const {type, data} = useSelector(state => state.modal)
  const dispatch = useDispatch()

  if (!type) { return null }

  return (<dialog open onClick={(e) => {
    if (e.target.tagName === 'DIALOG') { dispatch({type: 'CLOSE_MODAL'}) }
  }}>
    <article>
      <header>
        <a href="#close" aria-label="Close" className="close" onClick={() => dispatch({type: 'CLOSE_MODAL'})}>Close</a>
        {data.displayName}
      </header>
      <table role="grid">
        <thead>
          <tr>
            <td>Unit</td>
            <td>M</td>
            <td>WS</td>
            <td>BS</td>
            <td>S</td>
            <td>T</td>
            <td>W</td>
            <td>A</td>
            <td>LD</td>
            <td>SV</td>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data.stats || {}).map(([unit, stats]) => <tr key={unit}>
            <td>{unit}</td>
            <td>{stats.move}</td>
            <td>{stats.weaponSkill}</td>
            <td>{stats.ballisticSkill}</td>
            <td>{stats.strength}</td>
            <td>{stats.toughness}</td>
            <td>{stats.wounds}</td>
            <td>{stats.attacks}</td>
            <td>{stats.leadership}</td>
            <td>{stats.save}</td>
          </tr>)}
        </tbody>
      </table>
      <table role="grid">
        <thead>
          <tr>
            <td>Weapon</td>
            <td>Range</td>
            <td>Type</td>
            <td>S</td>
            <td>AP</td>
            <td>D</td>
            <td>Abilities</td>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data.weapons || {}).map(([weapon, stats]) => <tr key={weapon}>
            <td>{weapon}</td>
            <td>{stats.range}</td>
            <td>{stats.type}</td>
            <td>{stats.strength}</td>
            <td>{stats.armorPierce}</td>
            <td>{stats.damage}</td>
            <td>{stats.abilities}</td>
          </tr>)}
        </tbody>
      </table>
      <p><strong>Categories:</strong> <i>{Object.keys(data.keywords).join(', ')}</i></p>
      {Object.entries((data.abilities || {})).map(([name, ability]) => <ReactMarkdown key={name}>{`**${name}:** ${ability}`}</ReactMarkdown>)}
    </article>
  </dialog>)
}

export default Modal
