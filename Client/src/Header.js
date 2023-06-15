import './Header.css';
import StartNewGame from './components/StartNewGame';

export default function Header( {updateProvinceNames} ) {

  // When starting a new game, reset all provinces and return names to view
  function onStartNewGame() {
    const newNames = StartNewGame(updateProvinceNames);
  }    
  
  return (
    <div className="header">

      <div className="header_box">
        <span id="player_text"> Player: </span>
        <span id="player_value"> player name </span> 
      </div>

      <div className="header_box">
        <span id="name1"> Food: </span>
        <span id="value1"> 100 </span> 
      </div>

      <div className="header_box">
        <span id="name2"> Fuel: </span>
        <span id="value2"> 100 </span> 
      </div>

      <div className="header_box">
        <span id="name3"> Tools: </span>
        <span id="value3"> 100 </span> 
      </div>

      <div className="header_box">
        <span id="name4"> Material: </span>
        <span id="value4"> 100 </span> 
      </div>



      <button className='restart_button' onClick={onStartNewGame}> 
        Restart Game 
      </button>

    </div>
  );
}

