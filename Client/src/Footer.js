import './Footer.css';
  

export default function Footer( {properties} ) {

  return (
    <div className="footer">
      <div className='province_image'>Image</div>
      
      <div className='property'>
        <span id="name1"> Name: </span>
        <span id="value1"> {properties['name']} </span>
      </div>

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

      <div className='property'>
        <span id="name6"> Houses: </span>
        <span id="value6"> {properties['houses']} </span>
      </div>

      <div className='property'>
        <span id="name7"> Mines: </span>
        <span id="value7"> {properties['mines']} </span>
      </div>

      <div className='property'>
        <span id="name8"> Workshops: </span>
        <span id="value8"> {properties['workshops']} </span>
      </div>

      <div className='property'>
        <span id="name9"> Farms: </span>
        <span id="value9"> {properties['farms']} </span>
      </div>

      <div className='property'>
        <span id="name10"> Labour: </span>
        <span id="value10"> {properties['workforce']} </span>
      </div>

    </div>
  );
}

