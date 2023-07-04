import React, { useEffect } from 'react';

/**
 * A component for receiving push events from the backend
 */

function Receive({setSession, setArmies, setProvinceOwners }) {
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
          // TODO: And update the province view
        } else if (document.purpose == 'army_moved') {
          // TODO: Update the provinces on the map
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