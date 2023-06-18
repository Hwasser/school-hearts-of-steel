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
        <button className='province' id={id} onClick={onProvinceClick}>
        <ul> 
          <li className='province_name'>{name}</li>
          <li className='province_army'>Army 1</li>
          <li className='province_army'>Army 2</li>
          <li className='province_army'>Army 3</li>
          <li className='province_army'>Army 4</li>
        </ul>
        </button>
    );
  }