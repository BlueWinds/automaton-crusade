import { useEffect, useState } from 'react';

const rollD6 = () => Math.ceil(Math.random() * 6)
const roll2D6 = () => rollD6() + rollD6()
const rollDirection = () => ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'][Math.floor(Math.random() * 8)]

const ActiveUnit = ({unit, phase, spawnPoints}) => {
  const [dead, setDead] = useState(false)
  const [reserved, setReserved] = useState(false)

  return (<tr data-dead={dead}>
    <td>{unit.name}</td>
    <td>{unit.behavior}</td>
    <td>{dead ? '' : <UnitAction unit={unit} phase={phase} spawnPoints={spawnPoints} reserved={reserved} setReserved={setReserved} />}</td>
    <td className="unit-status">
      <label>
        <span data-tooltip="Track unit kills to update enemy Crusade Cards after the battle">Kills</span>
        <UnitKillCounter />
      </label>
      <label>
        <span data-tooltip="Mark the unit as dead">Dead</span>
        <input type="checkbox" checked={dead} onChange={e => setDead(e.target.checked)} />
      </label>
      <label>
        <span data-tooltip="Mark the unit as in reserves; It may deploy in future movement phases">Reserved</span>
        <input type="checkbox" checked={reserved} onChange={e => setReserved(e.target.checked)} />
      </label>
    </td>
    <td></td>
  </tr>)
}

const UnitAction = ({unit, phase, spawnPoints, reserved, setReserved}) => {
  const [action, setAction] = useState(null)

  useEffect(() => setAction(null), [phase])

  const generateAction = () => {
    if (phase === 'Deploy') {
      if (rollD6() >= 5) {
        setReserved(true)
        return setAction('Place in reserve')
      }

      return setAction(`Set up ${rollD6() + rollD6()}" ${rollDirection()} from spawn point ${Math.ceil(Math.random() * spawnPoints)}`)
    }
    if (phase === 'Move') {
      if (reserved) {
        if (rollD6() >= 5) {
          return setAction('Unit remains in reserves.')
        }

        setReserved(false)
        if (unit.behavior === 'Erratic') {
          return setAction(`Select a random board edge the unit can arrive from. It arrives ${roll2D6()}" to the ${rollD6() > 4 ? 'left' : 'right'} of the center of that edge, as far onto the battlefield as possible.`)
        }

        if (unit.behavior === 'Tactical') {
          return setAction(`Deploy as near as possible to an objective the enemy does not control. If there are multiple objectives equally distant from a board edge the enemy does not control, choose one to deploy near at random.`)
        }

        if (unit.behavior === 'Berserk') {
          return setAction(`Deploy as close as possible to a player unit. If it can deploy within 6" of multiple player units, determine which one it will deploy near randomly.`)
        }

        if (unit.behavior === 'Berserk/Skittish') {
          return setAction(`Locate all pieces of cover within 12" of a valid board edge, from which the unit can fire at a player unit. Select one at random. The unit will deploy as near (or in) this piece of cover as possible.`)
        }
      }

      if (unit.behavior === 'Erratic') {
        if (rollD6() >= 5) {
          return setAction('Unit remains stationary.')
        }
        return setAction(`Unit moves ${roll2D6()}" ${rollDirection()}, up to its normal move speed. Double the distance if its base move is greater than 12".`)
      }

      if (unit.behavior === 'Tactical') {
        return setAction('If the unit does not control an objective, it moves towards the closest objective marker that the enemy does not already control.\nIf the unit is controlling or contesting an objective, it stays on the objective and tries to gain line of sight to the nearest player unit.')
      }

      if (unit.behavior === 'Berserk') {
        return setAction('Unit moves towards the nearest player unit.')
      }

      if (unit.behavior === 'Skittish') {
        return setAction('If the unit is in cover and can fire at a player unit, it stays in place. Otherwise, it moves towards the nearest unoccupied piece of cover from which it can fire at a player unit.')
      }
    }

    if (phase === 'Shoot') {
      if (unit.behavior === 'Erratic') {
        return setAction('Find all player units this unit can shoot at. It fires all weapons at a random one.')
      }

      if (unit.behavior === 'Tactical') {
        return setAction('For each weapon, this unit fires at the player unit whose toughness most closely matches the strength of the weapon. To break ties, it fires at the unit with the highest power level.')
      }

      if (unit.behavior === 'Berserk') {
        return setAction('The unit fires all weapons at the closest player unit.')
      }

      if (unit.behavior === 'Skittish') {
        return setAction('This unit fires at the player unit whose toughness most closely matches the strength of the weapon. To break ties, it fires at the unit with the highest power level.')
      }
    }

    if (phase === 'Charge') {
      if (unit.behavior === 'Erratic') {
        if (rollD6() >= 5) {
          return setAction('Unit does not charge.')
        }
        return setAction('If within 12" of a player unit, this unit attempts to charge the closest one (and no others).')
      }

      if (unit.behavior === 'Tactical') {
        return setAction('If within 12" of a player unit, and charging would not break the enemy’s control of an objective or interrupt an action, it will attempt to charge the closest player unit (and no others).')
      }

      if (unit.behavior === 'Berserk') {
        return setAction("Roll the unit's charge. It declares a charge against as many player units as it can reach.")
      }

      if (unit.behavior === 'Skittish') {
        return setAction("The unit does not charge.")
      }
    }
  }

  return (<>
    {action ? action : <button className="outline small" onClick={generateAction}>+</button>}
  </>)
}

const UnitKillCounter = () => {
  const [kills, setKills] = useState(0)

  return <input type="number" className="tiny" value={kills} onChange={e => setKills(e.target.value)} />
}

export default ActiveUnit
