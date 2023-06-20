import axios from 'axios';
import './GameUI.css';
import { useEffect } from 'react';  

export default function GameUI( {onSelectAction, names, owners} ) {

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
            const owner = owners[index];
              // TODO: click-function just placeholder
              listItems.push(<Province 
                id={index} 
                key={index}
                onProvinceClick={ () => onSelectProvince(index) }
                owner={owner}
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

function Province({ id, onProvinceClick, name, owner}) {
  const color = playerColors[owner];
  return (
      <div className='province' id={id} owner={owner} style={{background: color}}>
      <button className='province_name' onClick={onProvinceClick}>{name}</button>
      <button className='province_army' id='army1' onClick={() => 0}>Army 1</button>
      <button className='province_army' id='army2' onClick={() => 0}>Army 2</button>
      <button className='province_army' id='army3' onClick={() => 0}>Army 3</button>
      <button className='province_army' id='army4' onClick={() => 0}>Army 4</button>
      </div>
  );
}

const playerColors = {
  Player1: "rgb(135, 245, 66)",
  Player2: "rgb(219, 78, 46)",
  Player3: "rgb(194, 85, 224)",
  Player4: "rgb(82, 212, 217)",
  Neutral: "rgb(216, 217, 167)"
};