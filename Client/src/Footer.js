import './Footer.css';
  

export default function Footer( {properties} ) {

  return (
    <div className="footer">
      <div className='province_image'>Image</div>
      
      <div className='property'>
        <span id="name1"> Property: </span>
        <span id="value1"> {properties[0]} </span>
      </div>

      <div className='property'>
        <span id="name2"> Property: </span>
        <span id="value2"> {properties[1]} </span>
      </div>

      <div className='property'>
        <span id="name3"> Property: </span>
        <span id="value3"> {properties[2]} </span>
      </div>

      <div className='property'>
        <span id="name4"> Property: </span>
        <span id="value4"> {properties[3]} </span>
      </div>

    </div>
  );
}

