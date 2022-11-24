import { useState } from 'react';
import ActiveUnit from './ActiveUnit';

export const sumPower = (units) => units.reduce((sum, u) => sum + u.power, 0)

const behaviors = ['Erratic', 'Tactical', 'Berserk', 'Skittish']

const randomBehavior = (unit, unitBehaviors) => {
  let b = behaviors[Math.floor(Math.random() * 3)]
  if (b === 'Berserk') {
    b = unitBehaviors[unit.baseName]
  }
  return b
}

export const parseArmyList = (armyList, unitBehaviors) => {
  const units = []

  if (armyList) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(armyList, "text/xml");

    Array.from(xml.querySelectorAll('force > selections > [type="model"]')).forEach(unit => {
      units.push({
        name: name(unit),
        power: powerLevel(unit),
        baseName: unit.getAttribute('name'),
      })
    })

    Array.from(xml.querySelectorAll('force > selections > [type="unit"]')).forEach(unit => {
      units.push({
        name: name(unit),
        power: powerLevel(unit),
        baseName: unit.getAttribute('name'),
      })
    })
  }

  return units
}

export const UnitTable = ({units, unitBehaviors, setUnitBehavior}) => {
  return (<table className="roster">
    <thead>
      <tr>
        <th>Power</th>
        <th>Basic Behavior</th>
        <th>Unit</th>
      </tr>
    </thead>
    <tbody>
      {units.map((unit, i) => (<tr key={i}>
        <td>{unit.power}</td>
        <td>
          <select value={unitBehaviors[unit.baseName] || ''} onChange={e => {setUnitBehavior(unit.baseName, e.target.value)}}>
            <option value=""></option>
            <option value="Berserk">Berserk</option>
            <option value="Skittish">Skittish</option>
          </select>
        </td>
        <td>{unit.name}</td>
      </tr>))}
    </tbody>
    <tfoot>
      <tr>
        <th>{sumPower(units)}</th>
        <td>Basic Behavior</td>
        <td>Unit</td>
      </tr>
    </tfoot>
  </table>)
}

const Phase = ({ phase, setPhase }) => {
  return (<nav className="button-group">
    <ul>
      <li><button className={phase === 'Deploy' ? 'outline' : 'outline secondary'} onClick={() => setPhase('Deploy')}>Deploy</button></li>
      <li><button className={phase === 'Move' ? 'outline' : 'outline secondary'} onClick={() => setPhase('Move')}>Move</button></li>
      <li><button className={phase === 'Shoot' ? 'outline' : 'outline secondary'} onClick={() => setPhase('Shoot')}>Shoot</button></li>
      <li><button className={phase === 'Charge' ? 'outline' : 'outline secondary'} onClick={() => setPhase('Charge')}>Charge</button></li>
    </ul>
  </nav>)
}

const ActiveUnitTable = ({units, spawnPoints}) => {
  const [phase, setPhase] = useState('Deploy')

  return (<table className="unit-list">
    <thead>
      <tr>
        <td><span data-tooltip={`${sumPower(units)} PL`}>Units</span></td>
        <th>Behavior</th>
        <th><Phase phase={phase} setPhase={setPhase} /></th>
        <th><span data-tooltip="Track unit's status between turns">Status</span></th>
      </tr>
    </thead>
    <tbody>
      {units.map((unit, i) => (<ActiveUnit key={i} unit={unit} phase={phase} spawnPoints={spawnPoints} />))}
    </tbody>
    <tfoot>
      <tr>
        <td><span data-tooltip={`${sumPower(units)} PL`}>Units</span></td>
        <td>Behavior</td>
        <th><Phase phase={phase} setPhase={setPhase} /></th>
        <th><span data-tooltip="Track unit kills to update enemy Crusade Cards after the battle">Kills</span></th>
        <th><span data-tooltip="Mark the unit as dead">Dead</span></th>
      </tr>
    </tfoot>
  </table>)
}

const EnemyListSelection = ({ units, unitBehaviors }) => {
  const totalEnemyPower = sumPower(units)
  const [playerPower, setPlayerPower] = useState(100)
  const [enemyBonus, setEnemyBonus] = useState(33)
  const [spawnPoints, setSpawnPoints] = useState(4)

  const [list, setList] = useState(localStorage.activeList ? JSON.parse(localStorage.activeList) : [])

  const generateList = () => {
    const newList = [...units.map(u => ({behavior: randomBehavior(u, unitBehaviors), ...u}))]
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

    newList.sort((u1, u2) => behaviors.indexOf(u1.behavior) - behaviors.indexOf(u2.behavior))

    localStorage.activeList = JSON.stringify(newList)
    setList(newList)
  }

  const maxEnemyBonus = (totalEnemyPower / playerPower * 100) - 100

  const hasAllUnitBehaviors = units.every(unit => unitBehaviors[unit.baseName])

  return (<div>
    <div className="grid">
      <div>
        <label htmlFor="playerPower">Player Power Level
          <input type="number" min="10" max={totalEnemyPower / (enemyBonus / 100  + 1)} value={playerPower} step="10" name="playerPower" onChange={e => setPlayerPower(e.target.value)} />
        </label>
      </div>
      <div>
        <label htmlFor="enemyBonus">Enemy Bonus</label>
        <select name="enemyBonus" value={enemyBonus} onChange={e => setEnemyBonus(e.target.value)} >
          <option value="0">0%</option>
          <option value="15" disabled={maxEnemyBonus < 15}>15%</option>
          <option value="25" disabled={maxEnemyBonus < 25}>25%</option>
          <option value="33" disabled={maxEnemyBonus < 34}>33%</option>
          <option value="50" disabled={maxEnemyBonus < 50}>50%</option>
        </select>
      </div>
      <div>
        <label htmlFor="spawnPoints"><span data-tooltip="You can change this at any time without re-generating the enemy list.">Spawn Points</span>
          <input type="number" min="3" max="6" value={spawnPoints} name="spawnPoints" onChange={e => setSpawnPoints(e.target.value)} />
        </label>
      </div>
      <div>
        <label htmlFor="generate" data-tooltip={hasAllUnitBehaviors ? undefined : "Select the basic behavior of all units before generating an enemy list."}>Let's go!
          <button name="generate" className="outline" onClick={generateList} disabled={!hasAllUnitBehaviors}>Generate</button>
        </label>
      </div>
      <div></div>
    </div>
    {list.length ? <ActiveUnitTable units={list} spawnPoints={spawnPoints} /> : ''}
  </div>)
}

const modelCount = (unit) => Array.from(unit.querySelectorAll('[type="model"]'))
  .map(u => parseInt(u.getAttribute('number'), 10))
  .reduce((sum, c) => sum + c, 0)

const powerLevel = (unit) => Array.from(unit.querySelectorAll('[name=" PL"]'))
  .map(u => parseInt(u.getAttribute('value'), 10))
  .reduce((sum, c) => sum + c, 0)

const name = (unit) => {
  let str = unit.getAttribute('name')

  if (modelCount(unit) > 1) {
    str += ' x' + modelCount(unit)
  }

  if (unit.getAttribute('customName')) {
    str = unit.getAttribute('customName') + ' (' + str + ')'
  }

  return str
}

const EnemyArmy = ({ units, unitBehaviors }) => {
  return (<>
    <details open={units.length}>
      <summary>Muster an enemy army</summary>
      <EnemyListSelection units={units} unitBehaviors={unitBehaviors} />
    </details>
  </>)
}

export default EnemyArmy
