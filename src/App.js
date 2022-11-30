import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FileDrop } from 'react-file-drop'
import {
  BlobReader,
  TextWriter,
  ZipReader,
} from '@zip.js/zip.js'

import '@picocss/pico'
import './App.css'

import introMd from './markdown/intro.md'
import coopMd from './markdown/coop.md'
import setupMd from './markdown/setup.md'
import rosterMd from './markdown/roster.md'
import musterMd from './markdown/muster.md'
import muster2Md from './markdown/muster2.md'
import spawnPointsMd from './markdown/spawnPoints.md'
import retinuesMd from './markdown/retinues.md'
import deploymentMd from './markdown/deployment.md'
import playingMd from './markdown/playing.md'
import postBattleMd from './markdown/postBattle.md'
import { sumPower } from './state/utils'

import Help, { HideHelp } from './Help'
import SetUp from './SetUp'
import EnemyArmy, {ActiveUnitTable, Phase, SpawnPoints} from './EnemyArmy'
import EnemyStrategem from './EnemyStrategem'
import PostBattle from './PostBattle'
import Modal from './Modal'

function App() {
  const [err, setErr] = useState(false)
  const dispatch = useDispatch()

  const { roster, defaultBehaviors, game: { units }} = useSelector(state => state)
  const showIntro = useSelector(state => !state.help.hideAll)

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

    } catch (e) {
      debugger
      setErr('This does not appear to be a valid zip file')
      setTimeout(() => setErr(false), 3000)
    }

    dispatch({ type: 'LOAD_ROSTER', armyList: armyListXML });
  }

  const hasAllUnitBehaviors = roster.every(unit => defaultBehaviors[unit.name])

  return (<FileDrop onDrop={onFile}>
    <div data-theme="dark" className="container">
      <Modal />
      <article>
        <header>The Automaton Crusade <HideHelp /></header>
        {showIntro && <details open={!roster.length || !hasAllUnitBehaviors}>
          <summary>Introduction</summary>
          <Help>{introMd}</Help>
          <Help>{coopMd}</Help>
          <Help>{setupMd}</Help>
        </details>}
        <details open={!roster.length || !hasAllUnitBehaviors}>
          <summary>Load enemy .rosz ({roster.length ? `${sumPower(roster)} PL` : 'No roster loaded'})</summary>
          <Help>{rosterMd}</Help>
          <button className="outline" onClick={() => document.getElementById('loadRoster').click() }>Drop a .rosz roster for the enemy anywhere on the page, or click to select one</button>
          <input type="file" style={{display: 'none'}} id="loadRoster" onChange={e => onFile(e.target.files) } />
          <p>{err || ' '}</p>
          {roster.length ? <SetUp /> : null}
        </details>
        <details open={roster.length && hasAllUnitBehaviors}>
          <summary>Play a game</summary>
          <Help>{musterMd}</Help>
          <EnemyArmy />
          {units.length ? <>
            <Help>{muster2Md}</Help>
            <Help>{spawnPointsMd}</Help>
            <SpawnPoints />
            <Help>{retinuesMd}</Help>
            <Help>{deploymentMd}</Help>
            <Help>{playingMd}</Help>
            <EnemyStrategem />
            <div id="top-of-turn"><Phase /></div>
            <ActiveUnitTable />
            <Phase />
          </>: ''}
        </details>
        <details>
          <summary>After Battle</summary>
          <Help>{postBattleMd}</Help>
          <PostBattle />
        </details>
      </article>
    </div>
  </FileDrop>);
}

export default App;
