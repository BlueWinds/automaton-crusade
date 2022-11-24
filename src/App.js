import { useState } from 'react';
import { FileDrop } from 'react-file-drop';
import {
  BlobReader,
  TextWriter,
  ZipReader,
} from '@zip.js/zip.js';

import '@picocss/pico';
import './App.css';

import EnemyArmy, { UnitTable, parseArmyList, sumPower } from './EnemyArmy';

function App() {
  const [err, setErr] = useState(false);
  const [armyList, setArmyList] = useState(localStorage.armyList);
  const [unitBehaviors, setUnitBehaviors] = useState(JSON.parse(localStorage.unitBehaviors || '{}'));

  const setUnitBehavior = (baseName, behavior) => {
    const newBehaviors = {...unitBehaviors, [baseName]: behavior}
    localStorage.unitBehaviors = JSON.stringify(newBehaviors)
    setUnitBehaviors(newBehaviors)
  }

  const onFile = async (files) => {
    let armyListXML

    try {
      const buf = await files[0].arrayBuffer()
      const blob = new Blob([buf]);

      const zipFileReader = new BlobReader(blob);
      const zipReader = new ZipReader(zipFileReader);
      const firstEntry = (await zipReader.getEntries()).shift();
      const textWriter = new TextWriter();
      armyListXML = await firstEntry.getData(textWriter);
      await zipReader.close();

      localStorage.armyList = armyListXML;
      setArmyList(armyListXML);
    } catch (e) {
      setErr('This does not appear to be a valid zip file')
      setTimeout(() => setErr(false), 3000)
    }
  }

  const units = parseArmyList(armyList, unitBehaviors)

  return (<FileDrop onDrop={onFile}>
      <div data-theme="dark" className="container">
        <article>
          <header>The Automaton Crusade</header>
          <details open={!armyList}>
            <summary>Load enemy .rosz ({units.length ? `${sumPower(units)} PL` : 'No army loaded'})</summary>
            <button className="outline" onClick={() => document.getElementById('loadRoster').click() }>Drop a .rosz roster for the enemy anywhere on the page, or click to select one</button>
            <input type="file" style={{display: 'none'}} id="loadRoster" onChange={e => onFile(e.target.files) } />
            <p>{err || ' '}</p>
            <UnitTable units={units} unitBehaviors={unitBehaviors} setUnitBehavior={setUnitBehavior} />
          </details>
          <EnemyArmy units={units} unitBehaviors={unitBehaviors} />
        </article>
      </div>
    </FileDrop>
  );
}

export default App;
