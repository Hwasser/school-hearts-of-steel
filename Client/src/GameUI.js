import axios from 'axios';
import './GameUI.css';
import { useEffect } from 'react';  

export default function GameUI( {onSelectAction, names} ) {

  function onSelectProvince(index) {
    // TODO: Only fetch one, not every freaking thing!
    axios.get('http://localhost:8082/api/provinces/', {
      params: { id: index}
    })
    .then( (res) => {
      if (res.data.length !== 0) {
          onSelectAction(res.data[0]);
      }
    })
    .catch( (e) => {
      console.log(e)
    });
  }

  const worldSize = 3;
  function BuildBody() {
      const body = [];
      for (let i = 0; i < worldSize; i++) {
          let listItems = []
          for (let j = 0; j < worldSize; j++) {
            const index = i * worldSize + j;
            const name = names[index];
              // TODO: click-function just placeholder
              listItems.push(<Province 
                id={index} 
                key={index}
                onProvinceClick={ () => onSelectProvince(index) }
                name={name} 
              />);
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

function Province({ id, onProvinceClick, name }) {
    return (
        <div className='province' id={id} >
        <button className='province_name' onClick={onProvinceClick}>{name}</button>
        <button className='province_army' id='army1' onClick={console.log("Army 1")}>Army 1</button>
        <button className='province_army' id='army2' onClick={console.log("Army 2")}>Army 2</button>
        <button className='province_army' id='army3' onClick={console.log("Army 3")}>Army 3</button>
        <button className='province_army' id='army4' onClick={console.log("Army 4")}>Army 4</button>
        </div>
    );
  }