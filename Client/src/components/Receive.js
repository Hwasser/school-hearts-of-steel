import React, { useEffect } from 'react';

/**
 * A component for receiving push events from the backend
 */

const Receive = () => {
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:5001/rec');

    // Event handler for receiving SSE messages
    eventSource.onmessage = (event) => {
      const message = event.data;
      console.log('Received message:', message);
      // Handle the received message as needed
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

export default Receive;