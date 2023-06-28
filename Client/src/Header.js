import './Header.css';

export default function Header( {playerData} ) {

  // When starting a new game, reset all provinces and return names to view
  
  return (
    <div className="header">

      <div className="header_box">
        <span id="player_text"> Player: </span>
        <span id="player_value"> {playerData.name} </span> 
      </div>

      <div className="header_box">
        <span id="name1"> Food: </span>
        <span id="value1"> {(playerData.food == null) ? 0 : playerData.food} </span> 
      </div>

      <div className="header_box">
        <span id="name2"> Fuel: </span>
        <span id="value2"> {(playerData.food == null) ? 0 : playerData.food} </span> 
      </div>

      <div className="header_box">
        <span id="name3"> Tools: </span>
        <span id="value3"> {(playerData.food == null) ? 0 : playerData.food} </span> 
      </div>

      <div className="header_box">
        <span id="name4"> Material: </span>
        <span id="value4"> {(playerData.food == null) ? 0 : playerData.food} </span> 
      </div>
    </div>
  );
}

