import Xarrow from "react-xarrows";

/**
 * This module draws army movements between provinces
 */

export default function MovementGUI({pending, armies, session}) {
    const arrows = [];
    for (let i = 0; i < pending.length; i++) {
      if (pending[i].type == 'movement') {
        // Check which slot the army comes from
        let slot = 1;
        for (let j = 0; j < armies.length; j++) {
          if (armies[j][pending[i].provinceN] == pending[i].army_id) {
            slot = j+1;
          }
        }
  
        const startDestination = "province" + pending[i].provinceN + "_army" + slot;
        const endDestination = "province" + pending[i].province2N + "_army1";
        const endLabel = "Arrives in: " + (pending[i].end - session.time); 
  
        arrows.push(<Xarrow start={startDestination} end={endDestination} labels={{middle: endLabel}} />);
      }
    }
    
    return (
      <>
        {arrows}
      </>
    )
  }