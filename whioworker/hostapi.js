var info ={};

function whioAPI(worker,canvas) {
  var ctx=canvas.getContext("2d"); 
  var whioAPI = {};
  var lineSpacing = 22;
  var textX=0;
  var textY=lineSpacing;
  ctx.font="20px sans-serif";
  var resourceIDCounter = 1;
  var resources = {};
    
  function getNewRID() {
    return (resourceIDCounter++).toString(16);
  }
	whioAPI.log = function (msg) {
		//log.textContent+=(msg.text);
	}

	whioAPI.drawImageData = function (msg) {
		var p = msg.parameters;
		if (p.w<=0) return;
		if (p.h<=0) return;
		var size= p.w*p.h;
		if (p.imageBytes.byteLength !=size*4) return; 
		
		// when all canvasImageData use Uint8ClampedArray this bit won't be needed
		var transferBuffer = ctx.createImageData(p.w,p.h);
		for (var i = 0; i<size*4;i++)  {
			transferBuffer.data[i]=p.imageBytes[i];
		}
		ctx.putImageData(transferBuffer,p.x,p.y);
	}
  
  whioAPI.clear = function(msg) {
    ctx.clearRect(0,0,canvas.width,canvas.height);    
    textX=0;
    textY=lineSpacing;
  }
  
  whioAPI.print = function(msg) {
    var p = msg.parameters;
    p.x=(typeof(p.x) === "undefined") ? textX : p.x;
    p.y=(typeof(p.y) === "undefined") ? textY : p.y;
    ctx.fillText(p.text,p.x,p.y);
    textX=p.x;
    textY=p.y+lineSpacing;    
  }
  
  whioAPI.setColour = function(msg) {
    var p = msg.parameters;
    ctx.fillStyle=p.colour;
    ctx.strokeStyle=p.colour;    
  }

  whioAPI.drawLine = function(msg) {
    var p = msg.parameters;
    ctx.beginPath();
    ctx.moveTo(p.x1,p.y1);
    ctx.lineTo(p.x2,p.y2);
    ctx.stroke();
  }  

  whioAPI.drawRectangle = function(msg) {
    var p = msg.parameters;
    ctx.beginPath();
    ctx.rect(p.x,p.y,p.width,p.height);
    ctx.stroke();
  }  

  whioAPI.drawCircle = function(msg) {
    var p = msg.parameters;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.radius/2,0,Math.PI*2,true);
    ctx.stroke();
  }  

  whioAPI.fillRectangle = function(msg) {
    var p = msg.parameters;
    ctx.beginPath();
    ctx.rect(p.x,p.y,p.width,p.height);
    ctx.fill();
  }  

  whioAPI.fillCircle = function(msg) {
    var p = msg.parameters;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.radius/2,0,Math.PI*2,true);
    ctx.fill();
  }  

  whioAPI.drawPolygon = function (msg) {
       var p = msg.parameters;
       ctx.beginPath();
       for(var i=0; i< p.pointData.length;i+=2) {
         ctx.lineTo(p.pointData[i],p.pointData[i+1]);
       }
       ctx.closePath();
       ctx.stroke();
  }

  whioAPI.fillPolygon = function (msg) {
       var p = msg.parameters;
       var p = msg.parameters;
       ctx.beginPath();
       for(var i=0; i< p.pointData.length;i+=2) {
         ctx.lineTo(p.pointData[i],p.pointData[i+1]);
       }
       ctx.closePath();
       ctx.fill();       
  }
  
  whioAPI.setPixel = function (msg) {
    var p = msg.parameters;
    var hold= ctx.fillStyle;
    ctx.fillStyle=p.colour;
    ctx.beginPath();
    ctx.rect(p.x,p.y,1,1);
    ctx.fill();		
    ctx.fillStyle=hold;
  } 
  whioAPI.makeBackground = function(msg) {
    canvas.style.backgroundImage="url("+canvas.toDataURL("image/png")+")";
    
    //these bits should move to a style sheet
    canvas.style.backgroundRepeat="no-repeat";
    canvas.style.backgroundPosition="center"
  }  

  whioAPI.requestImage = function(msg) {
    var result = getNewRID();
    var image = new Image();
    resources[result]= image;
    var imageName=msg.parameters.name;
    if (imageName.indexOf('/') < 0) {
      imageName="/code/index.php/Special:Filepath/"+imageName; 
    }
    image.onload=function() {
      var workerEvent = {"type":"resourceupdate"};
      workerEvent.resourceId=result;
      workerEvent.properties = {};
      workerEvent.properties.width=image.width;
      workerEvent.properties.height=image.height;      
      workerEvent.properties.complete=image.complete;      
      worker.postMessage({"cmd":"event", "event": workerEvent });            
    }
    image.src=imageName;
    worker.postMessage(
      {"cmd":"response", "parameters": 
          {"responseId":msg.parameters.responseId, "imageHandle":result}
      });
  }
  
  whioAPI.drawImage = function(msg) {
     var p = msg.parameters;
     var image = resources[p.imageHandle];
     if (image) {
        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate(p.angle/360*Math.PI*2);
        ctx.drawImage(image,p.sourceLeft,p.sourceTop,p.sourceWidth,p.sourceHeight,p.offsetX,p.offsetY,p.destWidth,p.destHeight);
        ctx.restore();
     }
  }  
  
  whioAPI.canvasSave = function (msg) {
      ctx.save();
  }

  whioAPI.canvasRestore = function (msg) {
      ctx.restore();
  }

  whioAPI.canvasTransform = function (msg) {
     var p = msg.parameters;
     ctx.transform(p.a,p.b,p.c,  p.d,p.e,p.f );
  }

  whioAPI.canvasTranslate = function (msg) {
     var p = msg.parameters;
     ctx.translate(p.x,p.y);
  }

  whioAPI.canvasRotate = function (msg) {
     var p = msg.parameters;
     ctx.rotate(p.angle);
  }

  whioAPI.canvasScale = function (msg) {
     var p = msg.parameters;
     ctx.scale(p.scaleX,p.scaleY);
  }

  whioAPI.setInfo = function (msg) {
     var p = msg.parameters;
     info["test"]=p;
     info[p.name]=p.value;
  }
  
  return whioAPI;
}

function RunCodeBox(width,height,code) {
    var overlay = document.createElement("div");
    overlay.setAttribute("style","position: fixed; z-index:100; left:0px; top:0px; right:0px; bottom:0px; background-color: rgba(0,0,0,0.5)");
    document.body.appendChild(overlay);
    
    var canvas = document.createElement("canvas");
    canvas.width=width;
    canvas.height=height;
    
    //canvas.setAttribute("style","position: absolute; left: 0px;right:0px; margin-left:auto; margin-right:auto;  top:4em; width:auto; height:auto; background-color: white; padding:8px; border: 2px solid black; border-radius: 16px");
    canvas.setAttribute("style","position: absolute; left: 0px;right:0px; margin-left:auto; margin-right:auto;  top:0px; width:auto; height:auto; background-color: white; padding:8px; border: 2px solid black;");
    if (window.innerHeight > height) {
      canvas.style.top = ""+(window.innerHeight-height)/4+"px";
    }
    overlay.appendChild(canvas);
    var logOutput = document.createElement("div");
    logOutput.setAttribute("style","color:#fff; position:absolute; left:3em; right:3em; bottom: 0px; height:6em;border: 4px solid red;background-color: #224");
    logOutput.style.visibility="hidden";
    overlay.appendChild(logOutput);
    
    
    //cheapass close button
    var closeButton=document.createElement("button");
    closeButton.setAttribute("style","position: absolute; font:22px bold, sans-serif; right:1em; top:1em;  background-color: white; border: 2px solid black; border-radius: 16px");
    closeButton.innerHTML="X";
    overlay.appendChild(closeButton);
    
    
    addEventListener("keydown",handleKeyDown,true);
    addEventListener("keyup",handleKeyUp,true);
    addEventListener("keypress",handleKeyPress,true);
    overlay.addEventListener("mousemove",handleMouseEvent,true);
    overlay.addEventListener("mouseup",handleMouseEvent,true);
    overlay.addEventListener("mousedown",handleMouseEvent,true);
    
    closeButton.addEventListener("click",closeBox,true);
    
    
    var worker = CreateWorker();
    worker.addEventListener("error",handleError,true);
    
    var api = whioAPI(worker,canvas);
    var batching = false;
    var messageBatch = [];
    
    function processBatch() {
      for (var i=0; i<messageBatch.length;i++) {
        var msg=messageBatch[i];
        var handlerCommand=api[msg.cmd];
        handlerCommand(msg);
      }
      worker.postMessage({"cmd":"event", "event": 
          {"type":"batchnotify"}
      });

      messageBatch=[];
    }
    function handleMessage(e) {
      if (api.hasOwnProperty(e.data.cmd)) {
        if (batching) {
          messageBatch.push(e.data);
        } else { 
         var handlerCommand=api[e.data.cmd];
          handlerCommand(e.data);
        }
      } else {    
          if ((e.data.cmd)=="batch") {
            batching=(e.data.parameters.value===true);
            processBatch();
          }
            //invalid command ignore or complain
      }
    }   
    
    //worker =  WorkerHost.executeCode(whioAPI(canvas),code);
    worker.addEventListener('message', handleMessage, false);    
    worker.postMessage({'cmd': 'exec', 'msg': code});
    
    function closeBox() {
        if (worker!=null) {
          worker.terminate();
          worker=null;       
        }
        document.body.removeChild(overlay);
        removeEventListener("keydown",handleKeyDown,true);      
        removeEventListener("keyup",handleKeyUp,true);
        removeEventListener("keypress",handleKeyPress,true);
        overlay.removeEventListener("mousemove",handleMouseEvent,true);
        overlay.removeEventListener("mousedown",handleMouseEvent,true);
        overlay.removeEventListener("mouseup",handleMouseEvent,true);
    }
    
    function handleKeyDown(e) {
      if (e.keyCode==27) {
        closeBox();
      }
      var workerEvent = {"type":"keydown"};
      workerEvent.keyCode=e.keyCode;
      workerEvent.metaKey=e.metaKey;
      workerEvent.shiftKey=e.shiftKey;
      workerEvent.ctrlKey=e.ctrlKey;
      worker.postMessage({"cmd":"event", "event": workerEvent });      
      e.preventDefault();
    }

    function handleKeyUp(e) {
      var workerEvent = {"type":"keyup"};
      workerEvent.keyCode=e.keyCode;
      workerEvent.metaKey=e.metaKey;
      workerEvent.shiftKey=e.shiftKey;
      workerEvent.ctrlKey=e.ctrlKey;
      worker.postMessage({"cmd":"event", "event": workerEvent });      
      e.preventDefault();
    }

    function handleKeyPress(e) {
      var workerEvent = {"type":"keyup"};
      e.preventDefault();
    }
    
    function handleMouseEvent(e) {
      var workerEvent = {"type":e.type};
      workerEvent.screenX=e.screenX;
      workerEvent.screenY=e.screenY;
      workerEvent.clientX=e.clientX-(canvas.offsetLeft+2+8); //2 border + 8 padding (yuck)
      workerEvent.clientY=e.clientY-(canvas.offsetTop+2+8);
      workerEvent.metaKey=e.metaKey;
      workerEvent.shiftKey=e.shiftKey;
      workerEvent.ctrlKey=e.ctrlKey;
      workerEvent.button=e.button;         
      worker.postMessage({"cmd":"event", "event": workerEvent });            
    }
    
    function handleError(e) {
      var errorLine=e.lineno-info.evalLine;      
      logOutput.innerHTML+="Error on line "+errorLine+":  "+e.message+"  <br>";
      logOutput.style.visibility="visible";
      //alert(e.message+"::::"+errorLine);
    }
    
}
