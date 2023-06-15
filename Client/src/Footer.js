import './Footer.css';
  

export default function Footer( {properties} ) {

  return (
    <div className="footer">

      <div className='footer_row'>
        <div className='property_name'>
          <span id="name1"> Province: </span>
          <span id="value1"> {properties['name']} </span>
        </div>
        <div className='property'>
          <span id="name10"> Manpower: </span>
          <span id="value10"> {properties['workforce']} </span>
        </div>
        <button className='property_button'>
          <span id="name12"> Raise Army </span>
        </button>
        
      </div>

      <div className='footer_row'>

        <button className='property_button'>
          <span id="name6"> Houses: </span>
          <span id="value6"> {properties['houses']} </span>
        </button>

        <button className='property_button'>
          <span id="name7"> Mines: </span>
          <span id="value7"> {properties['mines']} </span>
        </button>

        <button className='property_button'>
          <span id="name8"> Workshops: </span>
          <span id="value8"> {properties['workshops']} </span>
        </button>

        <button className='property_button'>
          <span id="name9"> Farms: </span>
          <span id="value9"> {properties['farms']} </span>
        </button>

        <button className='property_button'>
          <span id="name11"> Fortifications: </span>
          <span id="value11"> {properties['forts']} </span>
        </button>

      </div>
  
      <div className='footer_row'>

        <div className='property'>
          <span id="name2"> Food: </span>
          <span id="value2"> {properties['food']} </span>
        </div>

        <div className='property'>
          <span id="name3"> Fuel: </span>
          <span id="value3"> {properties['fuel']} </span>
        </div>

        <div className='property'>
          <span id="name4"> Tools: </span>
          <span id="value4"> {properties['tools']} </span>
        </div>

        <div className='property'>
          <span id="name5"> Material: </span>
          <span id="value5"> {properties['material']} </span>
        </div>

      </div>

    </div>
  );
}

