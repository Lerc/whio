var cx = 320;
var cy = 240;

function update() {
  //37 is the key code of the left arrow key
  if ( keyIsDown(37) ) {
    cx-=1;
  }  

  //39 is the key code of the right arrow key
  if ( keyIsDown(39) ) {
    cx+=1;
  }
  
  //37 is the key code of the left arrow key
  if ( keyIsDown(38) ) {
    cy-=1;
  }  

  //39 is the key code of the right arrow key
  if ( keyIsDown(40) ) {
    cy+=1;
  }  

   fillCircle(cx,cy,4);

}



run(update);