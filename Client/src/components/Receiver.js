import React, { useState, useEffect, useCallback } from 'react';
import {adress} from '../backend_adress';

function ReceiverSession({ onNewSession }) {
  console.log("Setting up new EventSource!");

  useEffect(() => {
    const eventSource = new EventSource('http://' + adress + ':5001/rec');

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
  onUpdateArmies,
  onAttackBattle,
  onPlayerJoined,
  onPlayerWon,
  onMergeArmies,
  onPlayerConnect,
  onSessionInfo
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
          } else if (
            document.toSession == onSessionInfo().session &&
            document.toPlayer == onSessionInfo().player ) {
            switch (document.purpose) {
              case 'update_session':
                onUpdateResources(document.package);
                break;
              case 'update_province':
                console.log("Received: update_province");
                onUpdateProvince(document.package);
                break;
              case 'update_armies':
                console.log("Received: update_armies");
                onUpdateArmies(document.package);
                break;
              case 'attack_battle':
                console.log("Received: attack_battle");
                onAttackBattle(document.package);
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
  }, [eventSession, onUpdateResources, onUpdateProvince, onUpdateArmies, onAttackBattle, onPlayerJoined, onPlayerWon, onPlayerConnect]);

  return (
    <div>
      <ReceiverSession onNewSession={handleNewSession} />
    </div>
  );
}
