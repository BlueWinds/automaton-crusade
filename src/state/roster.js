const defaultState = []

const modelCount = (unit) => Array.from(unit.querySelectorAll('[type="model"]'))
  .map(u => parseInt(u.getAttribute('number'), 10))
  .reduce((sum, c) => sum + c, 0)

const powerLevel = (unit) => Array.from(unit.querySelectorAll('[name=" PL"]'))
  .map(u => parseInt(u.getAttribute('value'), 10))
  .reduce((sum, c) => sum + c, 0)

const pointsCost = (unit) => Array.from(unit.querySelectorAll('[name="pts"]'))
  .map(u => parseInt(u.getAttribute('value'), 10))
  .reduce((sum, c) => sum + c, 0)

const displayName = (unit) => {
  let str = unit.getAttribute('name')

  if (modelCount(unit) > 1) {
    str = modelCount(unit) + 'x ' + str
  }

  if (unit.getAttribute('customName')) {
    str = unit.getAttribute('customName') + ' (' + str + ')'
  }

  return str
}

const parseArmyList = (armyList) => {
  const displayNames = {}
  const units = []

  const parseUnit = unit => {
    let name = displayName(unit) + ' #'

    let i = 1
    while (displayNames[name + i]) { i++ }
    name += i

    displayNames[name] = true

    const u = {
      name: unit.getAttribute('name'),
      displayName: name,
      power: powerLevel(unit),
      points: pointsCost(unit),
      keywords: {},
      abilities: {},
      psychicPowers: {},
      deepstriker: !!unit.innerHTML.match("the Reinforcements step"),
      commandPhase: !!unit.innerHTML.match("In your Command phase"),
      stats: {},
      weapons: {},
    };

    for (const c of unit.querySelectorAll('category')) {
      u.keywords[c.getAttribute('name')] = true
    }

    for (const a of unit.querySelectorAll('[typeName="Abilities"]')) {
      u.abilities[a.getAttribute('name')] = a.querySelector('characteristic[name="Description"]').innerHTML
    }

    for (const a of unit.querySelectorAll('[typeName="Psychic Power"]')) {
      u.psychicPowers[a.getAttribute('name')] = {
        warpCharge: a.querySelector('characteristic[name="Warp Charge"]').innerHTML,
        range: a.querySelector('characteristic[name="Range"]').innerHTML,
        details: a.querySelector('characteristic[name="Details"]').innerHTML,
      }
    }

    for (const s of unit.querySelectorAll('profile[typeName="Unit"]')) {
      u.stats[s.getAttribute('name')] = {
        move: s.querySelector('characteristic[name="M"]').innerHTML,
        weaponSkill: s.querySelector('characteristic[name="WS"]').innerHTML,
        ballisticSkill: s.querySelector('characteristic[name="BS"]').innerHTML,
        strength: s.querySelector('characteristic[name="S"]').innerHTML,
        toughness: s.querySelector('characteristic[name="T"]').innerHTML,
        wounds: s.querySelector('characteristic[name="W"]').innerHTML,
        attacks: s.querySelector('characteristic[name="A"]').innerHTML,
        leadership: s.querySelector('characteristic[name="Ld"]').innerHTML,
        save: s.querySelector('characteristic[name="Save"]').innerHTML,
      }
    }

    for (const s of unit.querySelectorAll('profile[typeName="Weapon"]')) {
      u.weapons[s.getAttribute('name')] = {
        range: s.querySelector('characteristic[name="Range"]').innerHTML,
        type: s.querySelector('characteristic[name="Type"]').innerHTML,
        strength: s.querySelector('characteristic[name="S"]').innerHTML,
        armorPierce: s.querySelector('characteristic[name="AP"]').innerHTML,
        damage: s.querySelector('characteristic[name="D"]').innerHTML,
        abilities: s.querySelector('characteristic[name="Abilities"]').innerHTML,
      }
    }

    return u
  }

  const parser = new DOMParser();
  const xml = parser.parseFromString(armyList, "text/xml");

  units.push(...Array.from(xml.querySelectorAll('force > selections > [type="model"]')).map(parseUnit))
  units.push(...Array.from(xml.querySelectorAll('force > selections > [type="unit"]')).map(parseUnit))

  units.forEach(u => {
    if (u.displayName.match(' #1') && !displayNames[u.displayName.replace(' #1', ' #2')]) {
      u.displayName = u.displayName.replace(' #1', '')
    }
  })

  return units
}

export default function roster(state = defaultState, action) {
  switch (action.type) {
    case 'LOAD_ROSTER':
      return parseArmyList(action.armyList)
    default:
      return state
  }
}

export const rosterXML = (state = '', action) => {
  switch (action.type) {
    case 'LOAD_ROSTER':
      return action.armyList
    default:
      return state
  }
}
