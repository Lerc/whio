importScripts("sugar-1.4.1.min.js");
var resourceManager = (function () {
  var trackedResources = {};
  
  var resourceManager = {  }

  resourceManager.trackResource = function (resource) {
    trackedResources[resource.resourceId]=resource;
  }
  
  resourceManager.handleResourceUpdate = function (event) {    
    var resource = trackedResources[event.resourceId];
    if (!resource) return;
    var keys=Object.keys(event.properties);
    for (i=0;i<keys.length;i++) {
      var key = keys[i];
      resource[key]=event.properties[key];
    }
  }
  
  eventManager.addEventListener('resourceupdate', function (e) {    
    resourceManager.handleResourceUpdate(e)
    } );

  return resourceManager;
})();


function log(text) {
	postMessage({"cmd":"log", "text":text});
}

function drawImageData(x,y,w,h, imageBytes) {
	var msg = {"cmd":"drawImageData", 
				"parameters" : {
					"x":x,
					"y":y,
					"w":w,
					"h":h,
					"imageBytes":imageBytes
				}
			}
			
	postMessage(msg);
}

function print(text,x,y) {
   if (Object.isObject(text)) text= JSON.stringify(text,null,"  ");       
   postFunctionCall("print",{"text":text,"x":x,"y":y});
}

function clear() {
   postFunctionCall("clear",{});
}

function setPixel(x,y,colour) {
   postFunctionCall("setPixel",{"x":x,"y":y,"colour":colour});
}

function makeBackground() {
   postFunctionCall("makeBackground",{});
}

function setColour(colour) {
   postFunctionCall("setColour",{"colour":colour});
}

function drawLine(x1,y1,x2,y2) {
   postFunctionCall("drawLine",{"x1":x1,"y1":y1,"x2":x2,"y2":y2});
}

function drawCircle(x,y,radius) {
   postFunctionCall("drawCircle",{"x":x,"y":y,"radius":radius});
}

function fillCircle(x,y,radius) {
   postFunctionCall("fillCircle",{"x":x,"y":y,"radius":radius});
}

function drawRectangle(x,y,width,height) {
   postFunctionCall("drawRectangle",{"x":x,"y":y,"width":width,"height":height});
}

function fillRectangle(x,y,width,height,fillMethod) {
	if (fillMethod == undefined) {
		postFunctionCall("fillRectangle",{"x":x,"y":y,"width":width,"height":height});
	} else {
		if (typeof(fillMethod) === "function") {
			 for (var ty=0; ty<height; ty++) {
				 for (var tx=0; tx<width; tx++) {
					  setPixel(x+tx,y+ty,fillMethod(tx/width,ty/height));
				 }
			 }
		}
	}
}
  
function requestImage(name,callback) {
   //callback returns imageHandle. 
   postResponseRequest("requestImage",{"name":name},callback);
}

function loadImage(name,framesWide,framesHigh) {
  var result = {};
  if (!framesWide) {framesWide=1};
  if (!framesHigh) {framesHigh=1};
  result.framesWide=framesWide;
  result.framesHigh=framesHigh;
  
  requestImage(name,function(msg){
         result.resourceId=msg.parameters.imageHandle;
         resourceManager.trackResource(result);
         result.imageHandle= msg.parameters.imageHandle         
         }
         
      );
  return result;
}

function drawImage(image,x,y,frame,angle) {
  if (image.complete != true) return;
  if (!frame) frame=0;
  if (!angle) angle=0;
  var handleX=0;
  var handleY=0;
  if (image.handleX) handleX=image.handleX;
  if (image.handleY) handleY=image.handleY;
  
  var ox=frame % image.framesWide;
  var oy=Math.floor(frame / image.framesWide) % image.framesHigh;
  var frameWidth = Math.floor(image.width / image.framesWide);
  var frameHeight = Math.floor(image.height / image.framesHigh);
  
  var parameters = {"imageHandle":image.imageHandle,
                    "x":x, "y":y,
                    "offsetX":-handleX, "offsetY":-handleY,
                    "sourceLeft":ox*frameWidth, "sourceTop":oy*frameHeight,
                    "sourceWidth": frameWidth, "sourceHeight":frameHeight,
                    "destWidth":frameWidth,"destHeight":frameHeight,
                    "angle":angle};
                    
   postFunctionCall("drawImage",parameters);
}

function drawImageRect(image,sourceLeft,sourceTop,sourceWidth,sourceHeight,destLeft,destTop,destWidth,destHeight) {
  if (image.complete != true) return;
  var parameters = {"imageHandle":image.imageHandle,
                    "x":destLeft, "y":destTop,
                    "offsetX":0, "offsetY":0,
                    "sourceLeft":sourceLeft, "sourceTop":sourceTop,
                    "sourceWidth": sourceWidth, "sourceHeight":sourceHeight,
                    "destWidth":destWidth,"destHeight":destHeight,
                    "angle":0};
                    
   postFunctionCall("drawImage",parameters);
  
}

function canvasSave() {
   postFunctionCall("canvasSave",{});
}

function canvasRestore() {
   postFunctionCall("canvasRestore",{});
}

function canvasTransform(a,b,c,d,e,f) {
   postFunctionCall("canvas",{"a":a, "b":b, "c":c, "d":d, "e":e, "f":f});
}

function canvasTranslate(x,y) {
   postFunctionCall("canvasTranslate",{"x":x,"y":y});
}

function canvasRotate(angle) {
   postFunctionCall("canvasRotate",{"angle":angle});
}

function canvasScale(scaleX,scaleY) {
   postFunctionCall("canvasScale",{"scaleX":scaleX,"scaleY":scaleY});
}

function drawPolygon() {
  var pointData;
  if (arguments.length == 1) {
    pointData=arguments[0];
  } else {
    pointData = Array.prototype.slice.call(arguments);
  }
  postFunctionCall("drawPolygon",{"pointData":pointData});
}

function rgb(red,green,blue) {
	return ("rgb("+Math.floor(red)+","+Math.floor(green)+","+Math.floor(blue)+")");
}

function grey(shade) {
	shade = Math.floor(shade);
	return ("rgb("+shade+","+shade+","+shade+")");
}

function setRgb(red,green,blue) {
	 setColour(rgb(red,green,blue));
}

function setGrey(shade) {
	 setColour(grey(shade));
}

function distance(a,b) {
  var dx=a.x-b.x;
  var dy=a.y-b.y;
  
  return Math.sqrt(dx*dx+dy*dy);
}
function fillPolygon(pointData) {
  var pointData;
  if (arguments.length == 1) {
    pointData=arguments[0];
  } else {
    pointData = Array.prototype.slice.call(arguments);
  }
  postFunctionCall("fillPolygon",{"pointData":pointData});
}

var inputManager = (function () {
  var inputManager = {};
  var keyDownMap = [];
  var keyWentDownMap = [];
  var keyDownAccumulation = [];
  var mouseX = 0;
  var mouseY = 0;
  
  inputManager.cycle = function cycle() {
    keyWentDownMap = keyDownAccumulation;
    keyDownAccumulation = [];
  }
  
  function handleKeyDown(e) {
    keyDownMap[e.keyCode]=true;
    keyDownAccumulation[e.keyCode]=true;
  }

  function handleKeyUp(e) {
    keyDownMap[e.keyCode]=false;
  }
  
  function handleMouseMove(e) {
    mouseX=e.clientX;
    mouseY=e.clientY;
  }
  
  function handleMouseDown(e) {
    var keyCode=133+e.button
    keyDownMap[keyCode]=true;
    keyDownAccumulation[keyCode]=true;
  }
  
  function handleMouseUp(e) {
    var keyCode=133+e.button
    keyDownMap[keyCode]=false;
  }
  
  inputManager.keyIsDown = function(keyCode) { return keyDownMap[keyCode] } 
  inputManager.keyWentDown = function(keyCode) { return keyWentDownMap[keyCode] } 
  inputManager.getMousePosition = function() { return {"x":mouseX,"y":mouseY } }
  inputManager.getMouseInfo = function() {return {x:mouseX,y:mouseY,left:this.keyIsDown(133)?true:false,middle:this.keyIsDown(134)?true:false,right:this.keyIsDown(135)?true:false} }

  eventManager.addEventListener('keydown',handleKeyDown);
  eventManager.addEventListener('keyup',handleKeyUp);
  eventManager.addEventListener('mouseup',handleMouseUp);
  eventManager.addEventListener('mousedown',handleMouseDown);
  eventManager.addEventListener('mousemove',handleMouseMove);
  
  return inputManager;
})(); 

function keyIsDown(keyCode) { return inputManager.keyIsDown(keyCode) }
function keyWentDown(keyCode) { return inputManager.keyWentDown(keyCode) }
function getMousePosition() { return (inputManager.getMousePosition()) }
function getMouseInfo() { return (inputManager.getMouseInfo()) }

function run(move,draw,frameRate) {
  if (!frameRate) frameRate=60;
  if(!draw) {
    draw=move;
    move=null;
  }
  var framePeriod=Math.floor(1000/frameRate);
  
  var timerTriggered = false;
  var flushCompleted = false;

  function handleTimeout() {
    timerTriggered=true;
    if (flushCompleted===true) {
      cycle();
    }
  }

  function handleBatch(e) {
    flushCompleted=true;
    if (timerTriggered===true) {
      cycle();
    }
  }
  
  function flip() {
    timerTriggered = false;
    flushCompleted = false;
    for(var i=0;i<10;i++) canvasRestore(); //this is possibly the dumbest thing ever but there's no canvas.reset()
    flush(true);
    setTimeout(handleTimeout,framePeriod);
  }
  
  function cycle() {
    inputManager.cycle();
    if (move) move();
    canvasSave();
    draw();
    canvasRestore();
    flip();
  }
  
  eventManager.addEventListener("batchnotify",handleBatch);
  flip(); 
}

function setInfo(name,value) {
  postFunctionCall("setInfo",{"name":name,"value":value});
}


////
// This bit ported from Stefan Gustavson's java implementation
// http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
// Read Stefan's excellent paper for details on how this code works.
//
// Sean McCullough banksean@gmail.com
var SimplexNoise = function(r) {
	if (r == undefined) r = Math;
  this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0], 
                                 [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1], 
                                 [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]]; 
  this.p = [];
  for (var i=0; i<256; i++) {
	  this.p[i] = Math.floor(r.random()*256);
  }
  // To remove the need for index wrapping, double the permutation table length 
  this.perm = []; 
  for(var i=0; i<512; i++) {
		this.perm[i]=this.p[i & 255];
	} 

  // A lookup table to traverse the simplex around a given point in 4D. 
  // Details can be found where this table is used, in the 4D noise method. 
  this.simplex = [ 
    [0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0], 
    [0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0], 
    [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], 
    [1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0], 
    [1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0], 
    [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], 
    [2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0], 
    [2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]; 
};

SimplexNoise.prototype.dot = function(g, x, y) { 
	return g[0]*x + g[1]*y;
};

SimplexNoise.prototype.noise = function(xin, yin) { 
  var n0, n1, n2; // Noise contributions from the three corners 
  // Skew the input space to determine which simplex cell we're in 
  var F2 = 0.5*(Math.sqrt(3.0)-1.0); 
  var s = (xin+yin)*F2; // Hairy factor for 2D 
  var i = Math.floor(xin+s); 
  var j = Math.floor(yin+s); 
  var G2 = (3.0-Math.sqrt(3.0))/6.0; 
  var t = (i+j)*G2; 
  var X0 = i-t; // Unskew the cell origin back to (x,y) space 
  var Y0 = j-t; 
  var x0 = xin-X0; // The x,y distances from the cell origin 
  var y0 = yin-Y0; 
  // For the 2D case, the simplex shape is an equilateral triangle. 
  // Determine which simplex we are in. 
  var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords 
  if(x0>y0) {i1=1; j1=0;} // lower triangle, XY order: (0,0)->(1,0)->(1,1) 
  else {i1=0; j1=1;}      // upper triangle, YX order: (0,0)->(0,1)->(1,1) 
  // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and 
  // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where 
  // c = (3-sqrt(3))/6 
  var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords 
  var y1 = y0 - j1 + G2; 
  var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords 
  var y2 = y0 - 1.0 + 2.0 * G2; 
  // Work out the hashed gradient indices of the three simplex corners 
  var ii = i & 255; 
  var jj = j & 255; 
  var gi0 = this.perm[ii+this.perm[jj]] % 12; 
  var gi1 = this.perm[ii+i1+this.perm[jj+j1]] % 12; 
  var gi2 = this.perm[ii+1+this.perm[jj+1]] % 12; 
  // Calculate the contribution from the three corners 
  var t0 = 0.5 - x0*x0-y0*y0; 
  if(t0<0) n0 = 0.0; 
  else { 
    t0 *= t0; 
    n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);  // (x,y) of grad3 used for 2D gradient 
  } 
  var t1 = 0.5 - x1*x1-y1*y1; 
  if(t1<0) n1 = 0.0; 
  else { 
    t1 *= t1; 
    n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1); 
  }
  var t2 = 0.5 - x2*x2-y2*y2; 
  if(t2<0) n2 = 0.0; 
  else { 
    t2 *= t2; 
    n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2); 
  } 
  // Add contributions from each corner to get the final noise value. 
  // The result is scaled to return values in the interval [-1,1]. 
  return 70.0 * (n0 + n1 + n2); 
};

// 3D simplex noise 
SimplexNoise.prototype.noise3d = function(xin, yin, zin) { 
  var n0, n1, n2, n3; // Noise contributions from the four corners 
  // Skew the input space to determine which simplex cell we're in 
  var F3 = 1.0/3.0; 
  var s = (xin+yin+zin)*F3; // Very nice and simple skew factor for 3D 
  var i = Math.floor(xin+s); 
  var j = Math.floor(yin+s); 
  var k = Math.floor(zin+s); 
  var G3 = 1.0/6.0; // Very nice and simple unskew factor, too 
  var t = (i+j+k)*G3; 
  var X0 = i-t; // Unskew the cell origin back to (x,y,z) space 
  var Y0 = j-t; 
  var Z0 = k-t; 
  var x0 = xin-X0; // The x,y,z distances from the cell origin 
  var y0 = yin-Y0; 
  var z0 = zin-Z0; 
  // For the 3D case, the simplex shape is a slightly irregular tetrahedron. 
  // Determine which simplex we are in. 
  var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords 
  var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords 
  if(x0>=y0) { 
    if(y0>=z0) 
      { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; } // X Y Z order 
      else if(x0>=z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; } // X Z Y order 
      else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; } // Z X Y order 
    } 
  else { // x0<y0 
    if(y0<z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; } // Z Y X order 
    else if(x0<z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; } // Y Z X order 
    else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; } // Y X Z order 
  } 
  // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z), 
  // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and 
  // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where 
  // c = 1/6.
  var x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords 
  var y1 = y0 - j1 + G3; 
  var z1 = z0 - k1 + G3; 
  var x2 = x0 - i2 + 2.0*G3; // Offsets for third corner in (x,y,z) coords 
  var y2 = y0 - j2 + 2.0*G3; 
  var z2 = z0 - k2 + 2.0*G3; 
  var x3 = x0 - 1.0 + 3.0*G3; // Offsets for last corner in (x,y,z) coords 
  var y3 = y0 - 1.0 + 3.0*G3; 
  var z3 = z0 - 1.0 + 3.0*G3; 
  // Work out the hashed gradient indices of the four simplex corners 
  var ii = i & 255; 
  var jj = j & 255; 
  var kk = k & 255; 
  var gi0 = this.perm[ii+this.perm[jj+this.perm[kk]]] % 12; 
  var gi1 = this.perm[ii+i1+this.perm[jj+j1+this.perm[kk+k1]]] % 12; 
  var gi2 = this.perm[ii+i2+this.perm[jj+j2+this.perm[kk+k2]]] % 12; 
  var gi3 = this.perm[ii+1+this.perm[jj+1+this.perm[kk+1]]] % 12; 
  // Calculate the contribution from the four corners 
  var t0 = 0.6 - x0*x0 - y0*y0 - z0*z0; 
  if(t0<0) n0 = 0.0; 
  else { 
    t0 *= t0; 
    n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0, z0); 
  }
  var t1 = 0.6 - x1*x1 - y1*y1 - z1*z1; 
  if(t1<0) n1 = 0.0; 
  else { 
    t1 *= t1; 
    n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1, z1); 
  } 
  var t2 = 0.6 - x2*x2 - y2*y2 - z2*z2; 
  if(t2<0) n2 = 0.0; 
  else { 
    t2 *= t2; 
    n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2, z2); 
  } 
  var t3 = 0.6 - x3*x3 - y3*y3 - z3*z3; 
  if(t3<0) n3 = 0.0; 
  else { 
    t3 *= t3; 
    n3 = t3 * t3 * this.dot(this.grad3[gi3], x3, y3, z3); 
  } 
  // Add contributions from each corner to get the final noise value. 
  // The result is scaled to stay just inside [-1,1] 
  return 32.0*(n0 + n1 + n2 + n3); 
};

SimplexNoise.default = new SimplexNoise(Math);

function noise2d(x,y) {
  return SimplexNoise.default.noise(x,y);
}

function noise3d(x,y,z) {
  return SimplexNoise.default.noise3d(x,y,z);
}
