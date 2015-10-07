XMLHttpRequest = function (){};
XMLHttpRequest.prototype = {}; 

function postFunctionCall(functionName,parameters) {
	var msg = {"cmd":functionName, "parameters" : parameters};
  postMessage(msg);    
}

var responseManager = (function () {

  var idCounter = 1;
  
  var responseManager = {
    responsesPending:{}
  };
  
  responseManager.getNewId = function () {
    return idCounter++;
  }
  
  responseManager.handleResponse = function (msg) {
    var id=msg.parameters.responseId;
    if (responseManager.responsesPending.hasOwnProperty(id)) {
      var callback=responseManager.responsesPending[id];
      delete responseManager.responsesPending[id];
      callback(msg);
    } 
  }
  return responseManager;
})();

var eventManager = (function () {
  var eventManager = {
    eventListeners : {
      "mousedown":[], 
      "mouseup":[],
      "mousemove":[],
      "keydown":[],
      "keyup":[],
      "resourceupdate":[],
      "batchnotify":[]
    }
  };
  
  eventManager.addEventListener = function(eventKind,callback) {
    var listener = eventManager.eventListeners[eventKind];
    if (!listener) throw ( "eventKind " +eventKind +" unknown");
    listener.push(callback);
  };
  
  eventManager.handleEvent = function (e) {
    var listenerList = eventManager.eventListeners[e.type];
    if (!listenerList) return;
    for (var i=0; i<listenerList.length;i++) {
      var listener=listenerList[i];
      listener(e);
    }
  }
  
  return eventManager;
})();

function postResponseRequest(functionName, parameters, callback) {
  var id = responseManager.getNewId();
  parameters.responseId=id;  
  responseManager.responsesPending[id]=callback;  
  postFunctionCall(functionName,parameters);
}

function flush(batching) {
   if (!batching) batching=false;
   postFunctionCall("batch",{"value":batching});
}

importScripts("workerapi.js");

self.addEventListener('message', function(e) {
  var data = e.data;
  switch (data.cmd) {
    case 'stop':
      self.postMessage('WORKER STOPPED: ' + data.msg');
      self.close(); // Terminates the worker.
      break;
    case 'exec':
      try {throw new Error()}catch(e) {setInfo('evalLine',e.lineNumber);}
      eval(data.msg);
      break;
    case 'response':  
      responseManager.handleResponse(data);
      break;
    case 'event':
      eventManager.handleEvent(data.event);
      break;
    default:
      self.postMessage('Unknown command: ' + data.cmd);
  };
}, false);
