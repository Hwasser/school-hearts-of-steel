import axios from 'axios';
import './GameUI.css';
import Province from './components/Province';
import React, { useEffect } from 'react';  

export default function GameUI( {onSelectAction, names, owners, objectIds, army1, army2, army3, army4} ) {

  function onSelectProvince(index) {
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

  function onMoveArmy(fromProvince, toProvince, army) {
    console.log("move army " + army + " from province " + fromProvince + " to " + toProvince);
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
            const objectId = objectIds[index];
            const armies = [army1[index], army2[index], army3[index], army4[index]]
              // TODO: click-function just placeholder
              listItems.push(<Province 
                id={index} 
                objectId={objectId}
                key={index}
                onProvinceClick={ () => onSelectProvince(index) }
                owner={owner}
                name={name} 
                armies={armies}
                moveArmy={onMoveArmy}
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



