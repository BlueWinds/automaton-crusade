import { useEffect, useState } from 'react';

const sumPower = (units) => units.reduce((sum, u) => sum + u.power, 0)

const behaviors = ['Erratic', 'Tactical', 'Berserk/Skittish']

const UnitTable = ({units}) => {
  return (<table className="unit-list">
    <thead>
      <tr>
        <th>Power</th>
        <th>Behavior</th>
        <th>Unit</th>
      </tr>
    </thead>
    <tbody>
      {units.map((unit, i) => (<tr key={i}>
        <td>{unit.power}</td>
        <td>{behaviors[unit.behavior]}</td>
        <td>{unit.name}</td>
      </tr>))}
    </tbody>
    <tfoot>
      <tr>
        <th>{sumPower(units)}</th>
        <td>Behavior</td>
        <td>Unit</td>
      </tr>
    </tfoot>
  </table>)
}

const EnemyListSelection = ({ units }) => {
  const totalEnemyPower = sumPower(units)
  const [playerPower, setPlayerPower] = useState(100)
  const [enemyBonus, setEnemyBonus] = useState(25)

  const [list, setList] = useState([])

  useEffect(() => setList([]), [units])

  const generateList = () => {
    const newList = [...units.map(u => ({behavior: Math.floor(Math.random() * behaviors.length), ...u}))]
    const discards = []
    const targetPowerLevel = playerPower * (1 + enemyBonus / 100)

    while (sumPower(newList) > targetPowerLevel) {
      let i = Math.floor(Math.random() * newList.length)
      discards.push(newList.splice(i, 1)[0])
    }

    discards.sort((u1, u2) => u2.power - u1.power)
    for (let i = 0; i < discards.length; i++) {
      if (sumPower(newList) + discards[i].power <= targetPowerLevel) {
        newList.push(discards[i])
      }
    }

    newList.sort((u1, u2) => u1.behavior - u2.behavior)

    setList(newList)
  }

  return (<div>
    <div className="grid">
      <div>
        <label htmlFor="playerPower">Player Power Level
          <input type="number" min="10" max={totalEnemyPower / (enemyBonus / 100  + 1)} value={playerPower} step="10" name="playerPower" onChange={e => setPlayerPower(e.target.value)} />
        </label>
      </div>
      <div>
        <label htmlFor="enemyBonus">Enemy Bonus %
          <input type="number" min="0" max={(totalEnemyPower / playerPower * 100) - 100} value={enemyBonus} step="5" name="enemyBonus" onChange={e => setEnemyBonus(e.target.value)} />
        </label>
      </div>
      <div>
        <label htmlFor="generate">Let's go!
          <button name="generate" className="outline" onClick={generateList}>Generate</button>
        </label>
      </div>
      <div></div>
    </div>
    {list.length ? <UnitTable units={list} /> : ''}
  </div>)
}

const modelCount = (unit) => Array.from(unit.querySelectorAll('[type="model"]'))
  .map(u => parseInt(u.getAttribute('number'), 10))
  .reduce((sum, c) => sum + c, 0)

const powerLevel = (unit) => Array.from(unit.querySelectorAll('[name=" PL"]'))
  .map(u => parseInt(u.getAttribute('value'), 10))
  .reduce((sum, c) => sum + c, 0)

const EnemyArmy = ({ armyList, onFile }) => {
  let units = []

  if (armyList) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(armyList, "text/xml");

    Array.from(xml.querySelectorAll('force > selections > [type="model"]')).forEach(unit => {
      units.push({
        name: unit.getAttribute('customName') || unit.getAttribute('name'),
        power: powerLevel(unit),
      })
    })

    Array.from(xml.querySelectorAll('force > selections > [type="unit"]')).forEach(unit => {
      units.push({
        name: `${unit.getAttribute('customName') || unit.getAttribute('name')} x${modelCount(unit)}`,
        power: powerLevel(unit),
      })
    })
  }

  return (<>
    <details>
      <summary>Enemy Order of Battle</summary>
      <UnitTable units={units} />
    </details>
    <details open={!!armyList}>
      <summary>Muster an enemy army</summary>
      <EnemyListSelection units={units} />
    </details>
  </>)
}

export default EnemyArmy
