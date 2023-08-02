import Xarrow from "react-xarrows";
import React, {useState} from 'react';

/**
 * This module draws army movements between provinces
 */

/**
 * 
 * @param {[{JSON}]} movements
 * @param {[[String]]} armies 
 */
export default function MovementGUI({movements, armies}) {
    const [arrows, setArrows] = useState([]);
    let arrowsCopy = [... arrows];
    let hasChanged = false;

    for (let m in movements) {
      const mid = m.toString();
      if (arrows.findIndex(e => e['key'] == mid) >= 0) {
        continue;
      }
      
      hasChanged = true;

      // Check which slot the army comes from
      let slot = 1;
      for (let j = 0; j < armies.length; j++) {
        if (armies[j][movements[m].from] == m) {
          slot = j+1;
        }
      }

      // Set start and end of arrows
      const startDestination = "province" + movements[m].from + "_army" + slot;
      const endDestination = "province" + movements[m].to + "_army1";
      // Set arrive time
      const days = movements[m].end / 24 | 0;
      const hours = movements[m].end % 24;
      const endLabel = "Arrives at: (" + days + ":" + hours + ")"; 
      
      const arrow = (<Xarrow key={mid} start={startDestination} end={endDestination} labels={{middle: endLabel}} />);
      arrowsCopy.push(arrow);
      console.log("PUSH!");
    }

    for (let i = 0; i < arrows.length; i++) {
      const oldArrow = arrows[i].key;
      if (!movements[oldArrow]) {
        arrowsCopy = arrowsCopy.filter(e => e.key != oldArrow);
        hasChanged = true;
        console.log("REMOVE!");
      }
    }

    if (hasChanged) {
      setArrows(arrowsCopy);
    }


    
    return (
      <div>
        {arrows}
      </div> 
    )
  }