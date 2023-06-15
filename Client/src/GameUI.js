import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './GameUI.css';

export default function GameUI( {onSelectAction} ) {

  function onSelectProvince(index) {
    /*
    TODO:
    1. Fetch data from database
    2. Send data to footer through onSelectionAction
    */
  }

  const worldSize = 3;
  function BuildBody() {
      const body = [];
      for (let i = 0; i < worldSize; i++) {
          let listItems = []
          for (let j = 0; j < worldSize; j++) {
              const index = i * worldSize + j;
              // TODO: click-function just placeholder
              listItems.push(<Province id={index} onProvinceClick={ () => onSelectProvince(index) } />);
          }
          body.push(<div className='world_row'> {listItems} </div>);
      }
      return body;
  }


  return (
    <>
    <div className="main_screen">
        <BuildBody />
    </div>
    </>
  );
}

function Province({ id, onProvinceClick }) {
    return (
        <button className='province' id={id} onClick={onProvinceClick}> 
            province name
        </button>
    );
  }