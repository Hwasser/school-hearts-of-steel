import Xarrow from "react-xarrows";
import React, {useState} from 'react';

/**
 * This module draws army movements between provinces
 */

export default function MovementGUI({movements, armies}) {
    const arrows = [];

    for (let m in movements) {
        // Check which slot the army comes from
        let slot = 1;
        for (let j = 0; j < armies.length; j++) {
          if (armies[j][movements[m].from] == m) {
            slot = j+1;
          }
        }

        
        const startDestination = "province" + movements[m].from + "_army" + slot;
        const endDestination = "province" + movements[m].to + "_army1";
        const endLabel = "Arrives at: " + (movements[m].end); 
        
        arrows.push(<Xarrow key={m.toString()} start={startDestination} end={endDestination} labels={{start: endLabel}} />);
      }
    
    return (
      <>
        {arrows}
      </>
    )
  }