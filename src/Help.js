import ReactMarkdown from 'react-markdown'

import { useSelector, useDispatch } from 'react-redux'

export const HideHelp = () => {
  const show = useSelector(state => !state.help.hideAll)
  const dispatch = useDispatch()

  if (show) {
    return <button className="small outline" onClick={() => dispatch({type: 'CLOSE_HELP', title: 'hideAll'})}>Hide help</button>
  }

  return <button className="small outline" onClick={() => dispatch({type: 'OPEN_HELP', title: 'hideAll'})}>Show help</button>
}

const Help = ({children}) => {
  const [title, ...rest] = children.split('\n')

  const show = useSelector(state => !state.help.hideAll)
  const expanded = useSelector(state => !state.help[title])
  const dispatch = useDispatch()

  if (!show) { return null }

  if (!expanded) {
    return <h6 className="open-help" onClick={() => dispatch({type: 'OPEN_HELP', title})}>{title.replace(/#+ /, '')}</h6>
  }

  return (<article>
    <header>
      <ReactMarkdown>{title}</ReactMarkdown>
      <button className="small outline" onClick={() => dispatch({type: 'CLOSE_HELP', title})}>x</button>
    </header>
    <ReactMarkdown>{rest.join('\n')}</ReactMarkdown>
  </article>)
}

export default Help
