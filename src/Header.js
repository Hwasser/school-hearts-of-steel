import './Header.css';

export default function Header() {
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

    </div>
  );
}