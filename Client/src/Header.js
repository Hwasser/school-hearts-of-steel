import './Header.css';

export default function Header( {player, session, slotIndex} ) {

  return (
    <div className="header">

      <div className="header_box">
        <span id="player_text"> Player: </span>
        <span id="player_value"> {player.name} </span> 
      </div>

      <div className="header_box">
        <span id="name1"> Food: </span>
        <span id="value1"> {(session == null) ? 0 : session.food[slotIndex]} </span> 
      </div>

      <div className="header_box">
        <span id="name2"> Fuel: </span>
        <span id="value2"> {(session == null == null) ? 0 : session.fuel[slotIndex]} </span> 
      </div>

      <div className="header_box">
        <span id="name3"> Tools: </span>
        <span id="value3"> {(session == null == null) ? 0 : session.tools[slotIndex]} </span> 
      </div>

      <div className="header_box">
        <span id="name4"> Material: </span>
        <span id="value4"> {(session == null == null) ? 0 : session.material[slotIndex]} </span> 
      </div>
    </div>
  );
}

