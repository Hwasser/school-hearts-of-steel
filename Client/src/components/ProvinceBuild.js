import './ProvinceBuild.css';  

export default function ProvinceBuild(property, buildingType) {

    function onConfirmButton() {
        console.log("CONFIRMED");   
    }


    function onCancelButton() {
        console.log("CANCELLED");   
    }

    return (
        <>
        <div className='build_building'>
            <h1 className='build_desc'> Construction a {buildingType}</h1>
            <div className='cost_field'> 
              <span>Food:</span>
              <span>{costs[buildingType]['food']}</span> 
            </div>
            <div className='cost_field'> 
              <span>Fuel:</span>
              <span>{costs[buildingType]['fuel']}</span> 
            </div>
            <div className='cost_field'> 
              <span>Tools:</span>
              <span>{costs[buildingType]['tools']}</span> 
            </div>
            <div className='cost_field'> 
              <span>Material:</span>
              <span>{costs[buildingType]['material']}</span> 
            </div>
            <button 
                className='confirm_button'
                onClick={() => {onConfirmButton()}} 
            > 
            Confirm
            </button>
            <button 
                className='cancel_button'
                onClick={() => {onCancelButton()}} 
            > 
            Cancel
            </button>
        </div>
    </>
    );
}

const costs = {
    house: {
        food: 50,
        fuel: 0,
        tools: 50,
        material: 100
    },
    mine: {
        food: 0,
        fuel: 100,
        tools: 100,
        material: 0
    },
    workshop: {
        food: 0,
        fuel: 50,
        tools: 50,
        material: 100
    },
    farm: {
        food: 0,
        fuel: 0,
        tools: 100,
        material: 100
    },
    fort: {
        food: 0,
        fuel: 0,
        tools: 50,
        material: 150
    }
};