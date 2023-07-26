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
  onAttackWin,
  onPlayerJoined,
  onPlayerWon,
  onMergeArmies,
  onPlayerConnect,
  getSessionId
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
          if (document.toSession == null) {
            if (document.purpose == 'connect') {
              console.log("Received: connect to token", document.package);
              onPlayerConnect(document.package);
            }
          } else if (document.toSession == getSessionId()) {
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
              case 'attack_win':
                console.log("Received: attack_win");
                onAttackWin(document.package);
                break;
              case 'player_won':
                console.log("Received: player_won");
                onPlayerWon(document.package);
                break;
              case 'merge_armies':
                console.log("Received: merge_armies");
                onMergeArmies(document.package);
                break;
              case 'player_joined':
                console.log("Received: player_joined");
                onPlayerJoined(document.package);
                break;
              default:
                console.log("Receiver: Received message without purpose!");
                break;
            } 
          } else {
            console.log("got another players message");
          }
        } catch {
          console.log('Received message:', message);
        }
      };
    }
  }, [eventSession, onUpdateResources, onUpdateProvince, onMoveArmy, onAttackWin, onPlayerJoined, onPlayerWon, onPlayerConnect]);

  return (
    <div>
      <ReceiverSession onNewSession={handleNewSession} />
    </div>
  );
}
