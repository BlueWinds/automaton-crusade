import {useDispatch, useSelector} from 'react-redux'

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
    console.log(e.target.tagName)
    if (e.target.tagName === 'DIALOG') { dispatch({type: 'CLOSE_MODAL'}) }
  }}>
    <article>
      <header>
        <a href="#close" aria-label="Close" class="close" onClick={() => dispatch({type: 'CLOSE_MODAL'})}>Close</a>
        {data.displayName}
      </header>
      {Object.entries((data.abilities || {})).map(([name, ability]) => <details>
        <summary>{name}</summary>
        {htmlDecode(ability)}
      </details>)}
    </article>
  </dialog>)
}

export default Modal
