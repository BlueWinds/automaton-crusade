import { useEffect, useState } from 'react';

const rollD6 = () => Math.ceil(Math.random() * 6)
const roll2D6 = () => rollD6() + rollD6()
const rollDirection = () => ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'][Math.floor(Math.random() * 8)]

const UnitAction = ({unit, phase}) => {
  const [action, setAction] = useState(null)

  useEffect(() => setAction(null), [phase])

  const generateAction = () => {
    if (phase === 'Deploy') {
      if (rollD6() >= 5) {
        return setAction('Place in reserve')
      }

      return setAction(`Set up ${rollD6() + rollD6()}" ${rollDirection()} from random spawn point`)
    }
    if (phase === 'Move') {
      if (unit.behavior === 'Erratic') {
        if (rollD6() >= 5) {
          return setAction('Unit remains stationary.')
        }
        return setAction(`Unit moves ${roll2D6()}" ${rollDirection()}, up to its normal move speed. Double the distance if its base move is greater than 12".`)
      }

      if (unit.behavior === 'Tactical') {
        return setAction('If the unit does not control an objective, it moves towards the closest objective marker that the enemy does not already control.\nIf the unit is controlling or contesting an objective, it stays on the objective and tries to gain line of sight to the nearest player unit.')
      }

      if (unit.behavior === 'Berserk/Skittish') {
        return setAction('If the unit is Berserk, it moves towards the nearest player unit. If Skittish and it can fire at a player unit, it stays there. Otherwise, it moves towards the nearest piece of cover from which it can fire at a player unit.')
      }
    }

    if (phase === 'Shoot') {
      if (unit.behavior === 'Erratic') {
        return setAction('Find all player units this unit can shoot at. It fires all weapons at a random one.')
      }

      if (unit.behavior === 'Tactical') {
        return setAction('For each weapon, this unit fires at the player unit whose toughness most closely matches the strength of the weapon. To break ties, it fires at the unit with the highest power level.')
      }

      if (unit.behavior === 'Berserk/Skittish') {
        return setAction('If the unit is Berserk, it fires all weapons at the closest player unit. If Skittish, this unit fires at the player unit whose toughness most closely matches the strength of the weapon. To break ties, it fires at the unit with the highest power level.')
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

      if (unit.behavior === 'Berserk/Skittish') {
        return setAction("If Berserk, roll the unit's charge. It declares a charge against as many player units as it can reach. If Skittish, it does not charge.")
      }
    }
  }

  return (<>
    {action ? action : <button className="outline small" onClick={generateAction}>+</button>}
  </>)
}

export default UnitAction
