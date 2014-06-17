Whio
====
![](https://raw.github.com/Lerc/whio/master/whio_logo.png)
A library to provide a gentle introduction to programming.

The idea behind Whio is to provide an evironment where people learning to program can write short
programs that they can easily understand.   

To do this, much of the architecture of DOM based Javascript is hidden.  Programs using whio can just have a single line of
```javascript
  print("hello");
```

Whio provides a great deal of globally scoped functions to enable people to write working programs before they have encountered
the concepts of Objects and Methods.

A program to continually update the mouse position on the screen can be done with
```javascript
  function update() {
      clear();
      print(getMousePosition());
  }
  
  run(update);
```

There is a wiki page showing the functions Whio provides at http://fingswotidun.com/code/index.php/API


Whio includes the [sugarjs](http://sugarjs.com/) library, to make things nicer when the programmer starts to use the methods 
of implicitly created objects. 

Web Worker Whio
====
This is a second implementation of the same library.  The web worker version is for running a given program inside a web worker.  
To handle I/O the worker communicates via messages to the host javascript.    This enables a page to run a whio program without 
the risk of the program interferring with the host page.   A significant problem with JavaScript is that people learning to program 
can inadvertantly generate an infinite loop locking out other javascript code.  A web worker mitigates this problem somewhat.
It is a little more flexible than using an iframe since the target canvas is controlled by the host and could be placed/transformed/composited as it sees fit.

The downside of the Web Worker interface is there are inherent difficulties with transferring I/O though messages.  
Whio tries to minimise these as much as possible.

MediaWiki Plugin
====
There is a plugin for mediawiki which enables code to be included in a wiki page, and edited on the spot.  Running the code launches the Web Worker version of Whio

This plugin is used on the Wiki at http://fingswotidun.com/code which has the beginnings to a guide to programming  for beginners.


Is this code untidy?
=====
Oh yes indeedie it is.  It evolved though a bunch of odd paths, working on tidyups now.

