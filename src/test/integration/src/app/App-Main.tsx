import {startTickPointer, PointerEventStatus, flipPointerCoordsY} from "lib/Lib";

const domElement = document.getElementById("canvasTouch");

startTickPointer
  ({
    domElement,
    status: PointerEventStatus.START,
    autoFlipY: true
  })
  (({data: {x,y}}) => {
    const unflipped = flipPointerCoordsY (domElement) ({x,y});
    const flipped = flipPointerCoordsY (domElement) (unflipped);
    

    console.log(`original (flipped): ${x},${y}`);
    console.log(`unflipped: ${unflipped.x},${unflipped.y}`);
    console.log(`flipped again: ${flipped.x},${flipped.y}`);
    

    console.log(flipped.x === x && flipped.y === y);
  });

//document.getElementById("app").innerHTML = `<h1 style="text-align: center; width: 100%">${SomeModule()}</h1>`;