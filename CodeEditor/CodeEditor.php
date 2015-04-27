<?php
# Credits	
$wgExtensionCredits['parserhook'][] = array(
    'name'=>'CodeEditor',
    'author'=>'Neil Graham',
    'url'=>'',
    'description'=>'An editor for code using <nowiki><edcode></nowiki>',
    'version'=>'0.1'
);

$wgExtensionFunctions[] = "wfCodeEditor";

// function adds the wiki extension
function wfCodeEditor() {
    global $wgParser;
    $wgParser->setHook( "edcode", "renderCodeEditor" );
    $wgparser->codeEditor_Count=0;
}

function renderCodeEditor( $paramstring, $params = array(), $parser){
	global $wgParser, $wgScriptPath, $wgOut;
	$wgParser->disableCache();
    $parser->codeEditor_Count+=1;
	$name="Code_Editor_".$parser->codeEditor_Count;
    $class="";
	if(isset($params['name'])) $name = $params['name'];
	if(isset($params['align'])) $align = $params['align'];
	if(isset($params['class'])) $class = " ".$params['class'];
    
	// clean update newlines and extra whitespace
	//$paramstring = preg_replace ('@\s+@', " ",$paramstring); 
	//$paramstring = "var g=0\nfunction (w){\n    print(w);\n}\n";

    if ($parser->codeEditor_Count==1) {
        //if this is the first editor add the support files
        $path = $wgScriptPath . '/extensions/CodeEditor/';
    
    	$wgOut->addStyle( $path . 'editor/codemirror.css', 'screen');
    	$wgOut->addStyle( $path . 'editor/default.css', 'screen');
    	$wgOut->addScriptFile( $path . 'editor/codemirror-compressed.js');
    	$wgOut->addScriptFile('//ajax.aspnetcdn.com/ajax/jshint/r07/jshint.js');
    	$wgOut->addScriptFile( $path . 'editor/workerhost.js');
    	$wgOut->addScriptFile( $path . 'editor/hostapi.js');
    	$wgOut->addScriptFile( $path . 'editor/editor.js');


    	$getElements = 'document.querySelectorAll(".codeview textarea")';
      //$perElement = "function setupEditor(element) {element.value=atob(element.dataset['code']);  var button=document.createElement('button');   button.innerHTML='Run';   element.parentNode.insertBefore(button,element);        var editor = CodeMirror.fromTextArea(element,{lineNumbers: true});        button.addEventListener('click',function (e) {RunCodeBox(640,480,editor.getValue());} );}";
    	$execScript = "<script type='text/javascript'>(function (){var elements=$getElements; for(var i=0;i<elements.length;i++) {var element=elements[i]; element.value=atob(element.dataset['code']); setupEditor(element)}     })();</script>";
    	$wgOut->addScript($execScript);
    }

    $encodedExample = base64_encode($paramstring);
    
	$editorHead = "\n<div class='codeview $class' ><input type='checkbox' id='checkbox_$name'><label for='checkbox_$name'></label><div>";
	$editorFoot = "</div></div>";	
	$html = $editorHead ."<textarea id='$name' data-code='$encodedExample'></textarea>". $editorFoot;
    return $html;
}
