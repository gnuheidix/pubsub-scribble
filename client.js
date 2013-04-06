/*
 * pubsub-scribble client
 *
 * @license MIT License
 * @author  Thomas Heidrich, Adrian Kummerländer
 * @copyright Copyright (c) 2012 Thomas Heidrich and other authors
 */

/**
 * Handles communication with NodeJS hub.
 * @param String url The URL of the hub to communicate with.
 */
var PubSubCommunication = function(url){
    
    if(typeof(io) != 'object'){
        throw "no socket.io";
    }
    
    /**
     * connection establishment during construction
     */
    var socket = io.connect(
        url
        ,{
            'connect timeout': 5000,
            'reconnect': true,
            'reconnection delay': 500,
            'max reconnection attempts': 8,
            'try multiple transports': true,
            'transports': [
                'xhr-polling',
                'websocket',
                'jsonp-polling',
            ]
        }
    );
    
    /**
     * Emit data to hub.
     * @param Map dto The data transfer object to emit.
     */
    this.emitMove = function(dto){
        socket.emit('move', dto);
    };
    
    /**
     * Adds an event handler to the communication system.
     * @param string event The event the handler shall wait for.
     * @param function handler The function which shall be executed in case
     *     the event gets fired.
     */
    this.addEventHandler = function(event, handler){
        socket.on(event, handler);
    };
};

/**
 * Handles exports of canvas content.
 * @param canvasID The ID of the canvas element to export.
 */
var CanvasExport = function(canvasID){
    var canvas = document.getElementById(canvasID);
    var exportNumber = 1;
    
    /**
     * opens a new window and imports the the content of the
     * canvas as a png image
     */
    this.doPNGExport = function(){
        var exportwindow = window.open('', 'export' + exportNumber);
        exportwindow.document.writeln(
            '<html><head>'
            +'<title>PNG Export '
            +exportNumber
            +' - Scribble - gnuheidix.de</title>'
            +'</head><body>'
            +'<img '
            +'src="'+canvas.toDataURL('image/png')+'"'
            +'alt="Kritzelexport"'
            +'/>'
            +'</body></html>'
        );
        exportwindow.document.close();
        ++exportNumber;
    };
};

/**
 * This class takes care of browser dependent pointer position calculation and
 * builds the DataTransferObject which will be sent to the hub for publishing.
 */
var InputController = function(colorPickerID, toolPickerID){
    var color  = document.getElementById(colorPickerID);
    var tool = document.getElementById(toolPickerID);
    var oldMouseX = 0;
    var oldMouseY = 0;
    
    /**
     * Calculates the current pointer position browser dependently.
     */
    var getMousePos = function(evt){
        if (evt.offsetX){
            // Webkit (!iOS)
            return {
                x: evt.offsetX
                , y: evt.offsetY
            };
        } 
        else if (evt.layerX){
            // Firefox
            return {
                x: evt.layerX
                , y: evt.layerY
            };
        } 
        else {
            // iOS
            return {
                x: evt.pageX - evt.target.offsetLeft
                , y: evt.pageY - evt.target.offsetTop
            };
        }
    };
    
    /**
     * This property determines whether the pointer is active or not.
     */
    this.mouse = false;
    
    /**
     * Returns a DTO which represents the current input state. This DTO might
     * be published through the hub.
     */
    this.getDTO = function(evt){
        var mousePos = getMousePos(evt);
        
        return {
            x: mousePos.x
            , y: mousePos.y
            , c: color.value
            , oldX: oldMouseX
            , oldY: oldMouseY
            , t: tool.value
        };
    };
    
    /**
     * Updates the previous mouse position in order to enable the controller
     * to make the DTO hold an information where the pointer was last time.
     */
    this.updateOldPos = function(evt){
        var mousePos = getMousePos(evt);
        oldMouseX = mousePos.x;
        oldMouseY = mousePos.y;
    };
};

/**
 * This class is a prototype for canvas elements in the UI.
 */
var Canvas = function(canvasID){
    var canvas = document.getElementById(canvasID);
    
    /**
     * Sets the size of the canvas.
     */
    this.initSize = function(width, height){
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
    };
    
    /**
     * Drops the content of the canvas.
     */
    this.clear = function(){
        if(canvas.getContext){
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        }
    };
    
    /**
     * Adds an event handler to the canvas.
     * @param string event The event the handler shall wait for.
     * @param function handler The function which shall be executed in case
     *     the event gets fired.
     */
    this.addEventHandler = function(event, handler){
        canvas.addEventListener(event, handler);
    };
};

/**
 * This class represents a helper layer for displaying misc stuff over
 * the actual drawing canvas.
 */
var OverlayCanvas = function(canvasID){
    var canvas = document.getElementById(canvasID);
    this.drawCrosshair = function(mouseX, mouseY){
        if(canvas.getContext){
            var ctx = canvas.getContext('2d');
            
            ctx.beginPath();
            
            this.clear();
            
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'silver';
            
            ctx.moveTo(mouseX, 0);
            ctx.lineTo(mouseX, canvas.height);
            
            ctx.moveTo(0, mouseY);
            ctx.lineTo(canvas.width, mouseY);
            
            ctx.stroke();
            
            ctx.closePath();
        }
    };
};

/**
 * This class represents the canvas used for drawing.
 */
var DrawCanvas = function(canvasID){
    var canvas = document.getElementById(canvasID);
    
    /**
     * Converts a hex color into its rgba representation.
     * @param string color The color to convert as string. e.g. 11aa33
     * @param double alpha The transparency value the rgba sould have.
     * @return string The rgba representation. e.g. rgba(1,23,22,0.1)
     */
    var hexToRGBA = function(color, alpha){
        r = parseInt(color.substring(0,2), 16);
        g = parseInt(color.substring(2,4), 16);
        b = parseInt(color.substring(4,6), 16);
        
        return ('rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')');
    };
    
    this.drawLine = function(pos, local){
        if(canvas.getContext){
            var ctx = canvas.getContext('2d');
            ctx.beginPath();
            
            if(local){
                ctx.strokeStyle = hexToRGBA(pos.c, 0.1);
            }else{
                ctx.strokeStyle = '#' + pos.c;
            }
            switch(pos.t){
                case '0':
                    ctx.lineWidth = 1;
                    break;
                default:
                case '1':
                    ctx.lineWidth = 6;
                    break;
                case '2':
                    ctx.lineWidth = 12;
                    break;
            }
            
            ctx.lineCap = 'round';
            ctx.moveTo(pos.oldX, pos.oldY);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            ctx.closePath();
        }
    };
};

/**
 * This function wires up the HTML UI with all necessary event handlers.
 */
var pubSubUI = function(canvasID){
    /**
     * The canvas we are going to scribble on it.
     */
    DrawCanvas.prototype = new Canvas(canvasID);
    var drawCanvas = new DrawCanvas(canvasID);
    
    /**
     * Setup export button
     */
    var exportController = new CanvasExport(canvasID);
    var exportButton = document.getElementById('pngexport');
    exportButton.addEventListener('click', exportController.doPNGExport);
    
    /**
     * Setup communication
     */
    var commController;
    try{
        commController = new PubSubCommunication('http://scribble.gnuheidix.de:8080');
    }catch(e){
        alert('Serververbindung fehlgeschlagen');
        return;
    }
    var connStatus = document.getElementById('status');
    commController.addEventHandler('connect', function(){
        connStatus.innerHTML = '<span style="color:#00FF00;">verbunden</span>';
    });
    commController.addEventHandler('disconnect', function(){
        connStatus.innerHTML = '<span style="color:#FF0000;">getrennt</span>';
    });
    commController.addEventHandler('reconnecting', function(){
        connStatus.innerHTML = '<span style="color:#FFFF00;">verbinde...</span>';
    });
    commController.addEventHandler('reconnect_failed', function(){
        connStatus.innerHTML = '<span style="color:#FF0000;">wiederverbinden fehlgeschlagen</span>';
    });
    commController.addEventHandler('moved', function(pos){
        drawCanvas.drawLine(pos, false);
    });
    
    /**
     * Setup overlay and crosshair checkbox
     */
    OverlayCanvas.prototype = new Canvas('helperlayer');
    var overlay = new OverlayCanvas('helperlayer');
    var crosshair = document.getElementById('fadenkreuz');
    crosshair.addEventListener('click', overlay.clear);
    
    /**
     * Setup input controller
     */
    var inputController = new InputController('farbe', 'werkzeug');
    
    // interactive UI elements
    var picker  = document.getElementById('picker');
    
    // convenience functions
    var initUI = function(headerID, footerID){
        var header  = document.getElementById(headerID);
        var footer  = document.getElementById(footerID);
        var windowW = window.innerWidth;
        var windowH = window.innerHeight;
        var headerH = header.offsetHeight;
        var footerH = footer.offsetHeight;
        var calcWidth = windowW - 10;
        var calcHeight = windowH - footerH - headerH - 50;
        overlay.initSize(calcWidth, calcHeight);
        drawCanvas.initSize(calcWidth, calcHeight);
    };
    
    // UI event handler
    var handleMouseMove = function(evt){
        var curPos = inputController.getDTO(evt);
        if(crosshair.checked){
            overlay.drawCrosshair(curPos.x, curPos.y);
        }
        if(inputController.mouse){
            drawCanvas.drawLine(curPos, true);
            commController.emitMove(curPos);
            inputController.updateOldPos(evt);
        }
    };
    
    var handleTouchMove = function(evt){
        evt.preventDefault();
        
        if(evt.changedTouches.length == 1){ // disable multitouch
            handleMouseMove(evt.changedTouches[0]);
        }
    };
    
    var handleMouseDown = function(evt){
        // prevent webkit from showing the cursor I
        evt.preventDefault();
        // make color picker disappear
        picker.blur();
        
        inputController.mouse = true;
        inputController.updateOldPos(evt);
        
        var curPos = inputController.getDTO(evt);
        drawCanvas.drawLine(curPos, true);
        commController.emitMove(curPos);
    };
    
    var handleTouchStart = function(evt){
        // make color picker disappear
        picker.blur();
        if(evt.changedTouches.length == 1){ // disable multitouch
            inputController.mouse = true;
            inputController.updateOldPos(evt.changedTouches[0]);
            
            var curPos = inputController.getDTO(evt.changedTouches[0]);
            drawCanvas.drawLine(curPos, true);
            commController.emitMove(curPos);
        }
    };
    
    var handleMouseUp = function(){
        inputController.mouse = false;
    };
    
    // setup of UI events
    if(window.Touch){
        overlay.addEventHandler('touchstart', handleTouchStart);
        overlay.addEventHandler('touchend', handleMouseUp);
        overlay.addEventHandler('touchmove', handleTouchMove);
    }else{
        overlay.addEventHandler('mousedown', handleMouseDown);
        overlay.addEventHandler('mouseup', handleMouseUp);
        overlay.addEventHandler('mousemove', handleMouseMove);
    }
    window.onresize = function(){
        initUI('oben', 'unten');
    };
    
    // trigger initialization
    window.onresize();
};

// fire up UI
pubSubUI('zeichenbrett');

