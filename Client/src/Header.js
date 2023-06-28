import './Header.css';
import startNewGame from './functionality/startNewGame';

export default function Header( {updateProvinceNames, playerData} ) {

  // When starting a new game, reset all provinces and return names to view
  const onStartNewGame = () => { startNewGame(updateProvinceNames) }    
  
  return (
    <div className="header">

      <div className="header_box">
        <span id="player_text"> Player: </span>
        <span id="player_value"> {playerData.name} </span> 
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

