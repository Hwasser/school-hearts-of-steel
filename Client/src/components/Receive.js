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
        const document = JSON.parse(message)
        if (document.max_slots != null) {
          setSession(document);
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