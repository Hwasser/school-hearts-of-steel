import React from 'react'
import  { useEffect } from 'react';

/**
 * A component for receiving push events from the backend
 */

const nProvinces = 9;

function Receive({setSession, setArmies, setProvinceOwners, armies, provinceOwners, hasStarted}) {
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:5001/rec');


    // Event handler for receiving SSE messages
    eventSource.onmessage = (event) => {

        const message = event.data;
        try {
          console.log(message);
          const document = JSON.parse(message)
          if (document.purpose == 'update_resources') {
            setSession(document.package);
          } else if (document.purpose == 'update_province') {
            const province = document.package;
            // Make a copy of old state
            const army1Copy = armies[0].slice(0,nProvinces);
            const army2Copy = armies[1].slice(0,nProvinces);
            const army3Copy = armies[2].slice(0,nProvinces);
            const army4Copy = armies[3].slice(0,nProvinces);
            const ownersCopy = provinceOwners.slice(0,nProvinces);
            console.log("provinceOwners:", provinceOwners);
            console.log("ownersCopy:", ownersCopy);
            // Put new values into copy
            army1Copy[province.id] = province['army1']
            army2Copy[province.id] = province['army2']
            army3Copy[province.id] = province['army3']
            army4Copy[province.id] = province['army4']
            ownersCopy[province.id] = province.owner;
            // Replace with copy
            setArmies([army1Copy, army2Copy, army3Copy, army4Copy]);
            //setProvinceOwners(ownersCopy);
          } else if (document.purpose == 'army_won') {
            // TODO: Update the provinces on the map
            // TODO: Update the province owners
          }
        } catch {
          console.log('Received message:', message);
        }
 
    };

    // Event handler for SSE errors
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
    };

    // Event handler for SSE connection closure
    eventSource.onclose = () => {
      console.log('SSE connection closed');
    };

    // Clean up the event source when the component unmounts
    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      {/* Your component JSX here */}
    </div>
  );
};

function testJSON(input) {
  try {
      JSON.parse(input);
      return true;
  } catch (error) {
      return false;
  }
}

export default Receive;