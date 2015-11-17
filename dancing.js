
var gl;
var canvas;
var shaderProgram;
// store vertex position
var vertexPositionBuffer;
// Create a place to store vertex colors
var vertexColorBuffer;
//create model view matrix
var mvMatrix = mat4.create();

var lastTime = 0;
//count the frame
var framecount = 0;

//initial triangle vertices position
var triangleVertices_init= [    
          -0.4,  0.8,  0.0, 
           0.2,  0.8,  0.0,
           -0.4,  0.6,  0.0,
          -0.2,  0.6,  0.0, 
           0.0,  0.6,  0.0,  
           0.2,  0.6, 0.0,
           -0.4, 0.0, 0.0,
           -0.2, 0.0, 0.0,
           0.0,  0.0, 0.0,
           0.2,  0.0,  0.0,
           -0.4,-0.2,0.0,
           0.2,-0.2,0.0
];
//triangle vertices position
var triangleVertices= [
          -0.4,  0.8,  0.0, 
           0.2,  0.8,  0.0,
           -0.4,  0.6,  0.0,
          -0.2,  0.6,  0.0, 
           0.0,  0.6,  0.0,  
           0.2,0.6,0.0,
           -0.4, 0.0,0.0,
           -0.2,0.0,0.0,
           0.0,0.0,0.0,
           0.2,0.0,0.0,
           -0.4,-0.2,0.0,
           0.2,-0.2,0.0
];

// index for triangle strip duplicate for degenerate triangles
var indexData = [2,0,3,1,4,5,5,3,3,4,7,8,10,9,11,11,6,6,7,10];

// index for wireframes
 var wireindex = [
    2,0,
    0,3,
    2,3,
    3,1,
    1,0,
    1,4,
    3,4,
    1,5,
    4,5,
    4,7,
    3,7,
    4,8,
    7,8,
    7,10,
    8,10,
    8,9,
    10,9,
    9,11,
    10,11,
    6,10,
    6,7

    ];

//passes all uniforms in one fell swoop
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

//turns degree to radians
function degToRad(degrees) {
        return degrees * Math.PI / 180;
}

//sets up the GL context by finding the canvas
function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var i=0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}
//searches the document for shaders, compiles them, then assembles them into a program
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  // If we don't find an element with the specified id
  // we do an early exit 
  if (!shaderScript) {
    return null;
  }
  
  // Loop through the children for the found DOM element and
  // build up the shader source code as a string
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }
 
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader;
}
//find the fragment and vertex shaders, link them together, then link their uniform and attrib values to their JS counterparts
function setupShaders() {
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  
}

// change the vertices in triangleVertices to change the position of the vertices over time
function updateBuffers() {
  for(var i = 0; i < triangleVertices.length; i=i+3) {
    if (triangleVertices_init[i] <0){
      triangleVertices[i] = triangleVertices_init[i] + 0.06 * Math.cos(2*Math.PI* (framecount / 120.0) );
      triangleVertices[i+1] = triangleVertices_init[i+1] + 0.05 * Math.cos(2*Math.PI* (framecount / 120.0) );
   
    }
    else
    {
    triangleVertices[i+1] = triangleVertices_init[i+1] + 0.06 * Math.cos(2*Math.PI* (framecount / 120.0) );
   
    triangleVertices[i] = triangleVertices_init[i] + 0.05 * Math.sin(2*Math.PI* (framecount / 120.0) );
    }

     if ((triangleVertices_init[i+1]== 0.8) && (triangleVertices_init[i]== 0.2) )
    {
      var theta = Math.random() * 2 * Math.PI;
      triangleVertices[i] = triangleVertices_init[i] + 0.05 * Math.cos(2*Math.PI* (framecount / 100.0) );
      triangleVertices[i+1] = triangleVertices_init[i+1] + 0.04 * Math.cos(2*Math.PI* (framecount / 200.0) );

    }

    if ((triangleVertices_init[i+1]== 0.8) && (triangleVertices_init[i]== -0.4) )
    {
      var beta = Math.random() * 2 * Math.PI;
      triangleVertices[i] = triangleVertices_init[i] - 0.03 * Math.cos(2*Math.PI* (framecount / 100.0) );
      triangleVertices[i+1] = triangleVertices_init[i+1] - 0.04 * Math.cos(2*Math.PI* (framecount / 200.0) );

    }

    if ((triangleVertices_init[i+1]== 0.6) && (triangleVertices_init[i]== -0.2) )
    {
      triangleVertices[i] = triangleVertices_init[i]  ;
      triangleVertices[i+1] = triangleVertices_init[i+1] ;

    }

    if ((triangleVertices_init[i+1]== 0.6) && (triangleVertices_init[i]== 0.0) )
    {
      triangleVertices[i] = triangleVertices_init[i]  ;
      triangleVertices[i+1] = triangleVertices_init[i+1] ;

    }


  }
  


  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.DYNAMIC_DRAW);
  vertexPositionBuffer.itemSize = 3;
  vertexPositionBuffer.numberOfItems = 12;
}
//initialize the buffer and bind buffer to certain type set up the number of items and item size
function setupBuffers() {
	//var rotAngle = 0
  vertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  //DYNAMIC_DRAW so we can change it
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.DYNAMIC_DRAW); // turn the matrix into bufferdata
  vertexPositionBuffer.itemSize = 3;  // 3 coordinates to present vertex
  vertexPositionBuffer.numItems = 12; // 30 lines
    
  vertexColorBuffer = gl.createBuffer(); // create buffer for color
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  var colors = [
          1.0, 0.0, 0.9,  1.0,
          0.9, 0.9, 1.0,  1.0, 
          0.0, 0.1, 0.7,  1.0,
          0.0, 0.15, 0.7, 1.0, 
          0.9, 0.9, 1.0,  1.0, //5 
          1, 1, 0.7,   1.0, 
          0.0, 0.4, 0.9,  1.0,
          0.0, 0.3, 1.0,  1.0,
          1, 1, 0.7,   1.0,  
          0, 0.9, 0.95,  1.0, //10
          1, 1, 0.7,   1.0, 
          0, 0, 1.0,  1.0
    ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 4;  // rgba 4 values to represent a color
  vertexColorBuffer.numItems = 12;  // 12 lines

  indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(indexData), gl.STATIC_DRAW); // turn the matrix into bufferdata
  indexBuffer.itemSize = 1;  // 3 coordinates to present vertex
  indexBuffer.numItems = 20; // 20 items including 4 duplicate vertices

  wireBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wireBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(wireindex), gl.STATIC_DRAW); // turn the matrix into bufferdata
  wireBuffer.itemSize = 1;  // 3 coordinates to present vertex
  wireBuffer.numItems = 42; // 42 lines
}

// give gl the info about the canvas set up the model view matrix and call draw function according to checkbox
function draw() { 
  // pass info about the size of the canvas
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  //clear the canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 
  // set up model view matrix at the origin 
  mat4.identity(mvMatrix);
   
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                            vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  

  // check the checkbox to draw different things
  if(document.getElementById("Wireframe").checked) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wireBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.LINES, wireBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  
    
  } 
  else{
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLE_STRIP, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    
  }
}

//start the animation call function to update buffers
function animate() {
    var timeNow = new Date().getTime();
    var elapsed = timeNow - lastTime;
    lastTime = timeNow;    
    updateBuffers();  
}

//find the canvas, set up the GL context,all the shaders and buffers we need, then starts the main loop
function startup() {
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders(); 
  setupBuffers();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  if(document.getElementById("Culling").checked) {
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK); }
  tick();
}

// a loop that counts frame and call other function to make change to the vertices
function tick() {
    framecount++
    requestAnimFrame(tick);
    draw();
    animate();
}

