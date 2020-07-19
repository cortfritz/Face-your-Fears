const normalOCSpeed = 3;
var isDragMode = false;
// for future "shift mode" for running
//const fastOCSpeed = 9;


var oc = document.getElementById("oc");
oc.style.left = '1200px';

function createAttribute(element, name, value){
  var a = document.createAttribute(name);
  a.value = value;
  element.setAttributeNode(a);
}
createAttribute(oc,"dx",0);
createAttribute(oc,"speed",normalOCSpeed);
createAttribute(oc,"pulling",false);




function ocFacesLeft(){
  return oc.classList.contains("turn-around");
}


function ocReach(targetX, targetY){

  // Drag grabbed objects, rather than pull them in, if the user holds the mouse down
  window.setTimeout( () => {
    if(isMouseDown){
      isDragMode = true;
      oc.classList.add('oc-stretch-drag');
    }
  }, 500);

  oc.classList.add("oc-stretch");
  
  let arms = document.createElement("DIV");
  arms.classList.add('arms');
  arms.classList.add("oc-arms-grow");

  //arms.classList.add("triangle-right");
  oc.appendChild(arms);

  function endTransition(){
    oc.classList.remove("oc-reverse-stretch");
    oc.removeChild(arms);
  }

  function reverseStretch(){
    if(!isDragMode)
    {
      oc.classList.remove("oc-stretch");
      oc.classList.add("oc-reverse-stretch");
      window.setTimeout(endTransition, 400);
    }
  }
  var armWidth = 5;
  const armPosition = getPosition(arms);
  armLeft = armPosition.left;
  armTop = armPosition.top;
  
  
  reachDx = targetX - armLeft;
  reachDy = targetY - armTop;
  adx = Math.abs(reachDx);
  ady = Math.abs(reachDy);
  maxArmLength = Math.sqrt(Math.pow(adx,2) + Math.pow(ady,2));

  
  const baseAngle = angle(armLeft,armTop, targetX, targetY);
  const armAngle = ocFacesLeft() ? safeDegree(180 - baseAngle) : baseAngle;


  const rotation = "rotate(" + armAngle + "deg)";
  arms.style.transform = rotation;
  arms.style.zIndex = 3000;

  var pickUp, putDown;
  holdables.map(e => {
    if(intersects(targetX,targetY,e)){
      pickUp = e;
    }
    else if(intersects(armLeft,armTop,e)){
      putDown = e;
    }
  })

  hardpoints.map(o => {
    if(intersects(targetX,targetY,o)){
      oc.pulling = true;
    }
  })

  
  const reachBackwards = Math.sign(baseAngle - 180);

  
  function dragObject(obj){
    // Qasim: Suspect that bodyscroll locking is causing this gap between obj.style.left's reported value, and the mouseEvent's clientX
    // Current workaround is to calculate the left and top offset and add it in. 
    // In the longer run, rendering on a <canvas> element would eliminate DOM element scrolling issues
    const leftOffset = Number( obj.style.left.slice(0, -2) ) - targetX,
           topOffset = Number( obj.style.top.slice(0, -2) ) - targetY;
    
    function movementEventHandler (event) {
      obj.style.left = event.pageX + leftOffset;
      obj.style.top = event.pageY + topOffset;

      const armPosition = getPosition(arms);
      armLeft = armPosition.left;
      armTop = armPosition.top;
      
      
      reachDx = event.clientX - armLeft;
      reachDy = event.clientY - armTop;
      adx = Math.abs(reachDx);
      ady = Math.abs(reachDy);
      maxArmLength = Math.sqrt(Math.pow(adx,2) + Math.pow(ady,2));

      
      const baseAngle = angle(armLeft,armTop, event.clientX, event.clientY);
      const armAngle = ocFacesLeft() ? safeDegree(180 - baseAngle) : baseAngle;


      const rotation = "rotate(" + armAngle + "deg)";
      arms.style.transform = rotation;
      arms.style.zIndex = 3000;
    }

    window.addEventListener('mousemove', movementEventHandler);
    window.addEventListener('mouseup', () => {
      window.removeEventListener('mousemove', movementEventHandler);
      isDragMode = false;
      reverseStretch();
    })
  }

  function shrink(){

    const dArmWidth = maxArmLength / 8;

    const pullDirection = reachBackwards * ocFacesLeft() ? Direction.right : Direction.left;
    moveElement(pickUp, armAngle, dArmWidth, pullDirection, Direction.up);

    

    armWidth = (armWidth - dArmWidth)
    arms.style.width = armWidth;
    if(armWidth > 5){
      window.setTimeout(shrink,50);
    }

  }

  function grow(){

    arms.style.width = armWidth;
    
    const dArmWidth = maxArmLength / 16;
    armWidth = armWidth + dArmWidth;


    const pushDirection = reachBackwards * ocFacesLeft() ? Direction.left : Direction.right;
    moveElement(putDown, armAngle, dArmWidth, pushDirection, Direction.down);

    if(armWidth <= maxArmLength){
      window.setTimeout(grow,50);
    }
    else {

      if(isDragMode){

        if(typeof pickUp !== undefined){
          dragObject(pickUp);

        }else if (typeof putDown !== undefined){
          dragObject(putDown)
        } 
        
      }else{
        window.setTimeout(shrink,200);
      }
    }

  }

  
  grow();
  window.setTimeout(reverseStretch, 800);

}


function ocMoveLeft(oc){
  // var left = parseInt(oc.style.left,10);

	oc.classList.add('walk-movement');
  oc.classList.add('turn-around');
  
  
  oc.setAttribute("dx", parseInt(oc.getAttribute("speed"),10) * -1);

}

function ocMoveRight(oc){
	oc.classList.add('walk-movement');
  oc.classList.remove('turn-around');
  oc.setAttribute("dx", parseInt(oc.getAttribute("speed"),10));
  // var left = parseInt(oc.style.left,10);
  
}



var timer = setInterval(function() {
	const dl = parseInt(oc.getAttribute("dx"),10);
  const l = parseInt(oc.style.left, 10);
  const newLeft = safeX( l + dl );
  oc.style.left = newLeft; //+ "px";
  
  // clear the timer at 400px to stop the animation
  // if ( oc.style.left > getWidth() ) {
  //   clearInterval( timer );
  // }
}, 20);


function ocSink(){
  
  
  oc.classList.remove("oc-above");
  oc.classList.add("oc-sink");
  

  function endTransition(){
    
    oc.classList.remove("oc-sink");
    oc.classList.add("oc-below");
    
  }
  window.setTimeout(endTransition, 800);
}

function ocRise(){
  
  
  oc.classList.remove("oc-sink");
  oc.classList.remove("oc-below");
  oc.classList.add("oc-rise");
  

  function endTransition(){
    
    oc.classList.remove("oc-rise");
    oc.classList.add("oc-above");
  }
  window.setTimeout(endTransition, 800);
}


function ocStretch(){
  oc.classList.add("oc-stretch");
  
  function endTransition(){
    oc.classList.remove("oc-reverse-stretch");
  }

  function reverseStretch(){
    oc.classList.remove("oc-stretch");
    oc.classList.add("oc-reverse-stretch");
    window.setTimeout(endTransition, 400);

  }
  window.setTimeout(reverseStretch, 800);
}