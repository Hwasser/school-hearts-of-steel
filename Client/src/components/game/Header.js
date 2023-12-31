import './Header.css';

export default function Header( {onExitGame, onUpgradeView, player, session, slotIndex, upgradeView} ) {

  const upgradeViewtext = (upgradeView) ? "World Map" : "Upgrades"
  const time = (session.time == null) ? 0 : session.time;
  const days = time / 24 | 0;
  const hours = time % 24;

  return (
    <div className="header">

      <div className="header_box">
        <span id="header_player_text"> Player: </span>
        <span id="header_player_value"> {player.name} </span> 
      </div>

      <div className="header_box">
        <span id="header_name1"> Food: </span>
        <span id="header_value1"> {(session == null) ? 0 : session.food[slotIndex]} </span> 
      </div>

      <div className="header_box">
        <span id="header_name2"> Fuel: </span>
        <span id="header_value2"> {(session == null == null) ? 0 : session.fuel[slotIndex]} </span> 
      </div>

      <div className="header_box">
        <span id="header_name3"> Tools: </span>
        <span id="header_value3"> {(session == null == null) ? 0 : session.tools[slotIndex]} </span> 
      </div>

      <div className="header_box">
        <span id="header_name4"> Material: </span>
        <span id="header_value4"> {(session == null == null) ? 0 : session.material[slotIndex]} </span> 
      </div>
      <div className="header_box">
        <span id="header_name5"> Time (d:h): </span>
        <span id="header_value5"> {days}:{hours} </span> 
      </div>
      <button className='header_button' id='header_upgrades' onClick={() => {onUpgradeView()}}>{upgradeViewtext}</button>
      <button className='header_button' id='header_exit' onClick={onExitGame}>Exit</button>
    </div>
  );
}

