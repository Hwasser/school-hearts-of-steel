import React, { useState, useEffect, useCallback } from 'react';

function ReceiverSession({ onNewSession }) {
  console.log("Setting up new EventSource!");

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:5001/rec');

    // Event handler for receiving SSE messages
    eventSource.onmessage = (event) => {
      const message = event.data;
    };

    // Event handler for SSE errors
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
    };

    // Event handler for SSE connection closure
    eventSource.onclose = () => {
      console.log('SSE connection closed');
    };

    onNewSession(eventSource);
    console.log("Starting new receiving session");

    // Clean up the event source when the component unmounts
    return () => {
      eventSource.close();
    };
  }, [onNewSession]);

  return <div></div>;
}

ReceiverSession = React.memo(ReceiverSession);

export default function Receiver({
  onUpdateResources,
  onUpdateProvince,
  onMoveArmy,
  onAttackArmy,
  onPlayerJoined,
  onPlayerWon,
  onMergeArmies
}) {
  const [eventSession, setEventSession] = useState(null);

  const handleNewSession = useCallback((newSession) => {
    setEventSession(newSession);
  }, []);

  useEffect(() => {
    // Event handler for receiving SSE messages
    if (eventSession != null) {
      eventSession.onmessage = (event) => {
        const message = event.data;
        try {
          const document = JSON.parse(message);
          switch (document.purpose) {
            case 'update_session':
              onUpdateResources(document.package);
              break;
            case 'update_province':
              console.log("Received: update_province");
              onUpdateProvince(document.package);
              break;
            case 'move_army':
              console.log("Received: move_army");
              onMoveArmy(document.package);
              break;
            case 'attack_army':
              console.log("Received: attack_army");
              onAttackArmy(document.package);
              break;
            case 'player_joined':
              console.log("Received: player_joined");
              onPlayerJoined(document.package);
              break;
            case 'player_won':
              console.log("Received: player_won");
              onPlayerWon(document.package);
              break;
              break;
            case 'merge_armies':
              console.log("Received: merge_armies");
              onMergeArmies(document.package);
              break;
            default:
              console.log("Receiver: Received message without purpose!");
              break;
          }
        } catch {
          console.log('Received message:', message);
        }
      };
    }
  }, [eventSession, onUpdateResources, onUpdateProvince, onMoveArmy, onAttackArmy, onPlayerJoined, onPlayerWon]);

  return (
    <div>
      <ReceiverSession onNewSession={handleNewSession} />
    </div>
  );
}
