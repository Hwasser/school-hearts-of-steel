import axios from 'axios';
import './GameUI.css';
import { useEffect } from 'react';  

export default function GameUI( {onSelectAction, names, owners, army1, army2, army3, army4} ) {

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
                army1={army1[index]}
                army2={army2[index]}
                army3={army3[index]}
                army4={army4[index]}
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

function Province({ id, onProvinceClick, name, owner, army1, army2, army3, army4}) {
  const color = playerColors[owner];
  const army1Exists = (army1 == null) ? 0.2 : 1.0;
  const army2Exists = (army2 == null) ? 0.2 : 1.0;
  const army3Exists = (army3 == null) ? 0.2 : 1.0;
  const army4Exists = (army4 == null) ? 0.2 : 1.0;
  return (
      <div className='province' id={id} owner={owner} style={{background: color}}>
      <button className='province_name' onClick={onProvinceClick}>{name}</button>
      <button className='province_army' id='army1' style={{opacity: army1Exists}}  
        onClick={() => 0}>Army 1</button>
      <button className='province_army' id='army2' style={{opacity: army2Exists}}
        onClick={() => 0}>Army 2</button>
      <button className='province_army' id='army3' style={{opacity: army3Exists}}
        onClick={() => 0}>Army 3</button>
      <button className='province_army' id='army4' style={{opacity: army4Exists}}
        onClick={() => 0}>Army 4</button>
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