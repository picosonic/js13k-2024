// JS 13k 2024 entry

// Global constants
const xmax=640;
const ymax=360;

const KEYNONE=0;
const KEYLEFT=1;
const KEYUP=2;
const KEYRIGHT=4;
const KEYDOWN=8;
const KEYACTION=16;

// Game state
var gs={
  // animation frame of reference
  step:(1/60), // target step time @ 60 fps
  acc:0, // accumulated time since last frame
  lasttime:0, // time of last frame
  fps:0, // current FPS
  frametimes:[], // array of frame times

  // Canvas
  canvas:null,
  gl:null,
  scale:1,

  ratio:(xmax/ymax),

  // Game world
  scene:{
    // Background color (rgb)
    b: { c: [.5, .5, .5] },
    
    // Camera position and rotation
    c: {p: [3, -5, -10], r: [20, 10, 0]},
    
    // Diffuse light position and color
    d: {p: [.5, -.3, -.7], c: [1, 1, 1]},
    
    // Ambient light color
    a: {c: [0.3, 0.3, 0.2]},

    // Objects to render (model, size, position, rotation, color)
    o: []
  },

  // Main character
  keystate:0,

  // Models
  models:[
    {m: "cube", s: [1, 1, 1], p: [0, 0, 0], r: [0, 0, 0], c: [1, 0.5, 0]},
    {m: "cube", s: [1, 1, 1], p: [-4, 0, 0], r: [0, 0, 0], c: [0, 0.5, 1]},
    {m: "cube", s: [1, 1, 1], p: [4, 0, 0], r: [0, 0, 0], c: [0.5, 1, 0]},
    {m: "checkerboard", s: [1, 1, 1], p: [0, -3, 0], r: [-90, 0, 0], c: [0.7, 0.7, 0.7]}
  ],

  debug:false
};

// Clear keyboard input state
function clearinputstate()
{
  gs.keystate=0;
}

// Check if an input is set in keyboard input state
function ispressed(keybit)
{
  return ((gs.keystate&keybit)!=0);
}

// Handle resize events
function playfieldsize()
{
  var height=window.innerHeight;
  var aspectratio=xmax/ymax;
  var ratio=xmax/ymax;
  var width=Math.floor(height*ratio);
  var top=0;
  var left=Math.floor((window.innerWidth/2)-(width/2));

  if (width>window.innerWidth)
  {
    width=window.innerWidth;
    ratio=ymax/xmax;
    height=Math.floor(width*ratio);

    left=0;
    top=Math.floor((window.innerHeight/2)-(height/2));
  }

  gs.scale=(height/ymax);

  gs.canvas.style.top=top+"px";
  gs.canvas.style.left=left+"px";
  gs.canvas.style.transformOrigin='0 0';
  gs.canvas.style.transform='scale('+gs.scale+')';
}

// Update the player key state
function updatekeystate(e, dir)
{
  switch (e.which)
  {
    case 37: // cursor left
    case 65: // A
    case 90: // Z
      if (dir==1)
        gs.keystate|=1;
      else
        gs.keystate&=~1;

      e.preventDefault();
      break;

    case 38: // cursor up
    case 87: // W
    case 59: // semicolon
      if (dir==1)
        gs.keystate|=2;
      else
        gs.keystate&=~2;

      e.preventDefault();
      break;

    case 39: // cursor right
    case 68: // D
    case 88: // X
      if (dir==1)
        gs.keystate|=4;
      else
        gs.keystate&=~4;

      e.preventDefault();
      break;

    case 40: // cursor down
    case 83: // S
    case 190: // dot
      if (dir==1)
        gs.keystate|=8;
      else
        gs.keystate&=~8;

      e.preventDefault();
      break;

    case 13: // enter
    case 32: // space
      if (dir==1)
        gs.keystate|=16;
      else
        gs.keystate&=~16;

      e.preventDefault();
      break;

    case 73: // I (for info/debug)
      if (dir==1)
        gs.debug=(!gs.debug);

      e.preventDefault();
      break;

    default:
      break;
  }
}

// Run an update step to the game state
function update()
{
  // spin first cube
  gs.models[0].r[0]+=0.2;
  gs.models[0].r[1]+=0.2;

  // camera controls
  if (ispressed(KEYLEFT))
    gs.scene.c.p[0]+=0.1;

  if (ispressed(KEYRIGHT))
    gs.scene.c.p[0]-=0.1;

  if (ispressed(KEYUP))
    gs.scene.c.p[1]-=0.1;

  if (ispressed(KEYDOWN))
    gs.scene.c.p[1]+=0.1;
}

// Redraw the game world
function redraw()
{
  gs.scene.o=[];
  for(const i of gs.models)
    gs.scene.o.push(i);

  W.render(gs.scene, gs.gl, gs.ratio);

  if (gs.debug)
    document.title=""+gs.fps+" fps";
}

function rafcallback(timestamp)
{
  if (gs.debug)
  {
    // Calculate FPS
    while ((gs.frametimes.length>0) && (gs.frametimes[0]<=(timestamp-1000)))
      gs.frametimes.shift(); // Remove all entries older than a second

    gs.frametimes.push(timestamp); // Add current time
    gs.fps=gs.frametimes.length; // FPS = length of times in array
  }

  // First time round, just save epoch
  if (gs.lasttime>0)
  {
    // Determine accumulated time since last call
    gs.acc+=((timestamp-gs.lasttime) / 1000);

    // If it's more than 15 seconds since last call, reset
    if ((gs.acc>gs.step) && ((gs.acc/gs.step)>(60*15)))
      gs.acc=gs.step*2;

    // Process "steps" since last call
    while (gs.acc>gs.step)
    {
      update();
      gs.acc-=gs.step;
    }

    redraw();
  }
  
  // Remember when we were last called
  gs.lasttime=timestamp;

  window.requestAnimationFrame(rafcallback);
}

// Load and generate 3D models
function createobjects()
{
}

function checkerboard()
{
  var vertices = [];
  var uvs = [];

  for (var y=0; y<8; y++)
  {
    for (var x=0; x<8; x++)
    {
      // vertices (x, y, z)
      vertices.push(x*1); vertices.push(y*1); vertices.push(1);
      vertices.push(x*-1); vertices.push(y*1); vertices.push(1);
      vertices.push(x*-1); vertices.push(y*-1); vertices.push(1);

      vertices.push(x*1); vertices.push(y*1); vertices.push(1);
      vertices.push(x*-1); vertices.push(y*-1); vertices.push(1);
      vertices.push(x*1); vertices.push(y*-1); vertices.push(1);

      // uvs (u, v)
      uvs.push(1); uvs.push(1);
      uvs.push(0); uvs.push(1);
      uvs.push(0); uvs.push(0);

      uvs.push(1); uvs.push(1);
      uvs.push(0); uvs.push(0);
      uvs.push(1); uvs.push(0);
    }
  }

  return ([vertices, uvs]);
}

// Entry point
function init()
{
  // Initialise stuff
  document.onkeydown=function(e)
  {
    e = e || window.event;
    updatekeystate(e, 1);
  };

  document.onkeyup=function(e)
  {
    e = e || window.event;
    updatekeystate(e, 0);
  };

  // Stop things from being dragged around
  window.ondragstart=function(e)
  {
    e = e || window.event;
    e.preventDefault();
  };

  // Set up canvas
  gs.canvas=document.getElementById("canvas");
  gs.gl=gs.canvas.getContext("webgl2");

  window.addEventListener("resize", function() { playfieldsize(); });

  playfieldsize();

  // Import and generate 3D models
  createobjects();

  // Start frame callbacks
  window.requestAnimationFrame(rafcallback);
}

// Run the init() once page has loaded
window.onload=function() { init(); };
