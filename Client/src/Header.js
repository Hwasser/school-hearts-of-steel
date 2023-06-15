import './Header.css';
import axios from 'axios';

function getRandomInt(min, range) {
    return min + Math.floor(Math.random() * range);
  }

export default function Header() {

  // When starting a new game, reset all provinces
  function onStartNewGame() {
    const nProvinces = 9
    const provinces = Array(9);
  
    function RemoveOldProvinces() {
        function CreateNewProvinces() {
            for (let i = 0; i < nProvinces; i++) {
              // TODO:
            }
        }
    }
  
    function CreateNewProvinces() {
        for (let i = 0; i < nProvinces; i++) {
          const province = {
            id: i,
            name: 'province name',
            houses: getRandomInt(1, 3),
            workshops: getRandomInt(0, 3),
            farms: getRandomInt(0, 3),
            mines: getRandomInt(0, 3),
            food: getRandomInt(100, 1000),
            fuel: getRandomInt(100, 1000),
            material: getRandomInt(100, 1000),
            tools: getRandomInt(100, 1000),
            workforce: getRandomInt(10, 100)
          };

          axios
          .post('http://localhost:8082/api/provinces', province)
          .catch((err) => {
            console.log('Error in creating a province!');
          });
          console.log('created province: ' + province);
        }
    }

    RemoveOldProvinces();
    CreateNewProvinces();
  }    
  
  return (
    <div className="header">

      <div className="header_box">
        <span id="player_text">
          Player: 
        </span>
        <span id="player_value">
          player name
        </span> 
      </div>

      <div className="header_box">
        <span id="money_text">
          Money:
        </span>
        <span id="money_value">
          10000
        </span> 
      </div>

      <div className="header_box">
        <span id="soldiers_text">
          Soldiers:
        </span>
        <span id="soldiers_value">
          100
        </span> 
      </div>

      <button className='restart_button' onClick={onStartNewGame}> 
        Restart Game 
      </button>

    </div>
  );
}

