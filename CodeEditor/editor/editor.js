function setupEditor(element) {
	element.value=atob(element.dataset['code']);  
	var whioGlobals = {
		log : true,
		drawImageData : true,
		print : true,
		clear : true,
		setPixel : true,
		makeBackground : true,
		setColour : true,
		drawLine : true,
		drawCircle : true,
		fillCircle : true,
		drawRectangle : true,
		fillRectangle : true,
		loadImage : true,
		drawImage : true,
		drawImageRect : true,
		canvasSave : true,
		canvasRestore : true,
		canvasTransform : true,
		canvasTranslate : true,
		canvasRotate : true,
		canvasScale : true,
		drawPolygon : true,
		fillPolygon : true,
		distance : true,
		rgb : true,
		grey : true,
		setRgb : true,
		setGrey : true,
		random : true,
		stringify : true,
		setColor : true,
		keyIsDown : true,
		keyWentDown : true,
		getMousePosition : true,
		getMouseInfo : true,
		run : true,
		setInfo : true,
		noise2d : true,
		noise3d : true
	}
	
	var editor = CodeMirror.fromTextArea(element,{
		lineNumbers: true,
		matchBrackets: true, 
		foldGutter: true,
		lint: { options: {undef:true,worker:true,funcscope:true, globals: whioGlobals } },
		gutters: ["CodeMirror-lint-markers","CodeMirror-linenumbers", "CodeMirror-foldgutter"],
		extraKeys: {
      "F11": function(cm) {
        cm.setOption("fullScreen", !cm.getOption("fullScreen"));
			},
			"Esc": function(cm) {
				if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
			},
			"Ctrl-Space": "autocomplete"
		 }
		});


	function makePanel() {
		var node = document.createElement("div");
		var widget, close, label;

		node.className = "panel ";
		close = node.appendChild(document.createElement("a"));
		close.setAttribute("title", "Toggle FullScreen!");
		close.setAttribute("class", "fullscreentoggle button");
		close.textContent = "□";
		CodeMirror.on(close, "click", function() {
      editor.setOption("fullScreen", !editor.getOption("fullScreen"));
		});
		
		
		label = node.appendChild(document.createElement("span"));
		label.textContent = "|";
		
		var run=node.appendChild(document.createElement("a"));
		run.setAttribute("title", "Run the code");
		run.setAttribute("class", "button");
	  run.textContent="►";	
		CodeMirror.on(run, "click", function() {
			RunCodeBox(640,480,editor.getValue());
		});
		
		var cmWrapper=editor.getWrapperElement();
  	cmWrapper.insertBefore(node,cmWrapper.firstChild);
		return node;
	}
	var topPanel = makePanel();
}
