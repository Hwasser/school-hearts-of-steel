import './Header.css';

export default function Header( {playerData, sessionData} ) {
  // Get slot index of player in session
  const slotIndex = sessionData.slot_names.findIndex( (e) => e == playerData.name);

  return (
    <div className="header">

      <div className="header_box">
        <span id="player_text"> Player: </span>
        <span id="player_value"> {playerData.name} </span> 
      </div>

      <div className="header_box">
        <span id="name1"> Food: </span>
        <span id="value1"> {(sessionData == null) ? 0 : sessionData.food[slotIndex]} </span> 
      </div>

      <div className="header_box">
        <span id="name2"> Fuel: </span>
        <span id="value2"> {(sessionData == null == null) ? 0 : sessionData.fuel[slotIndex]} </span> 
      </div>

      <div className="header_box">
        <span id="name3"> Tools: </span>
        <span id="value3"> {(sessionData == null == null) ? 0 : sessionData.tools[slotIndex]} </span> 
      </div>

      <div className="header_box">
        <span id="name4"> Material: </span>
        <span id="value4"> {(sessionData == null == null) ? 0 : sessionData.material[slotIndex]} </span> 
      </div>
    </div>
  );
}

