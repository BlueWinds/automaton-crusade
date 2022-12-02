const defaultState = []

const modelCount = (unit) => Array.from(unit.querySelectorAll('[type="model"]'))
  .map(u => parseInt(u.getAttribute('number'), 10))
  .reduce((sum, c) => sum + c, 0)

const powerLevel = (unit) => Array.from(unit.querySelectorAll('[name=" PL"]'))
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
    let name = displayName(unit)
    if (displayNames[name]) {
      let i = 2
      name += ' #'
      while (displayNames[name + i]) { i++ }
      name += i
    }
    displayNames[name] = true

    const u = {
      name: unit.getAttribute('name'),
      displayName: name,
      power: powerLevel(unit),
      keywords: {},
      abilities: {},
      psychicPowers: [],
    };

    for (const c of unit.querySelectorAll('category')) {
      u.keywords[c.getAttribute('name')] = true
    }

    for (const a of unit.querySelectorAll('[typeName="Abilities"]')) {
      u.abilities[a.getAttribute('name')] = a.querySelector('characteristic[name="Description"]').innerHTML
    }

    for (const a of unit.querySelectorAll('[typeName="Psychic Power"]')) {
      u.psychicPowers.push(a.getAttribute('name'))
    }

    return u
  }

  const parser = new DOMParser();
  const xml = parser.parseFromString(armyList, "text/xml");

  units.push(...Array.from(xml.querySelectorAll('force > selections > [type="model"]')).map(parseUnit))
  units.push(...Array.from(xml.querySelectorAll('force > selections > [type="unit"]')).map(parseUnit))

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
