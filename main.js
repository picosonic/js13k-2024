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
    // Background color [r, g, b, a]
    b: { c: [.5, .5, .5, 1] },
    
    // Camera position and rotation
    c:
    {
      p: [3, -5, -10], // [x, y, z]
      r: [20, 10, 0]   // [pitch, yaw, roll]
    },
    
    // Diffuse light [x, y, z] position and [r, g, b] color
    d: {p: [.5, -.3, -.7], c: [1, 1, 1]},
    
    // Ambient light [r, g, b] color
    a: {c: [0.3, 0.3, 0.2]},

    // Objects to render
    o: []
  },
  program:null, // Shader program

  // Input
  keystate:KEYNONE,

  // In motion
  moving:KEYNONE, // Current moving direction
  tp:[0, 0, 0], // Target [x, y, z] position
  tr:[0, 0, 0], // Target [pitch, yaw, roll] rotation

  // Models (model, size [x, y, z], position [x, y, z], rotation [pitch, yaw, roll], color [r, g, b])
  models:[
    {m: cube(), s: [1, 1, 1], p: [0, 0, 0], r: [0, 0, 0], c: [1, 0.5, 0]},
    {m: loadmodel("coriolis"), s: [1, 1, 1], p: [-4, 0, 0], r: [0, 0, 0], c: [0, 0.5, 1]},
    {m: cube(), s: [1, 1, 1], p: [4, 0, 0], r: [0, 0, 0], c: [0.5, 1, 0]},
    {m: checkerboard(), s: [1, 1, 1], p: [0, -3, 0], r: [-90, 0, 0], c: [0.7, 0.7, 0.7]},
    {m: loadmodel("stealth"), s: [0.005, 0.005, 0.005], p: [0, 4, -5], r: [0, 0, 0], c: [1, 0, 0.5]},
  ],

  // Timeline for general animation
  timeline:new timelineobj(),

  // Debug flag
  debug:false
};

// Handle resize events
function playfieldsize()
{
  var height=window.innerHeight;
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

// Advance object animations onwards
function tween(obj, percent)
{
  // spin model
  obj.r[0]+=0.2;
  obj.r[1]+=0.2;
}

// When moving, step forwards until at target
function movestep()
{
  var done=0;

  // Do nothing if we're not moving
  if (gs.moving==KEYNONE) return;

  // Iterate through x, y, z for position and rotation
  for (var i=0; i<3; i++)
  {
    // Position check
    if (gs.models[1].p[i]<gs.tp[i])
    {
      gs.models[1].p[i]+=0.0444;

      if (gs.models[1].p[i]>gs.tp[i])
        gs.models[1].p[i]=gs.tp[i];
    }
    else
    if (gs.models[1].p[i]>gs.tp[i])
    {
      gs.models[1].p[i]-=0.0444;

      if (gs.models[1].p[i]<gs.tp[i])
        gs.models[1].p[i]=gs.tp[i];
    }
    else
      done++;

    // Rotation check
    if (gs.models[1].r[i]<gs.tr[i])
    {
      gs.models[1].r[i]+=2;

      if (gs.models[1].r[i]>gs.tr[i])
        gs.models[1].r[i]=gs.tr[i];
    }
    else
    if (gs.models[1].r[i]>gs.tr[i])
    {
      gs.models[1].r[i]-=2;

      if (gs.models[1].r[i]<gs.tr[i])
        gs.models[1].r[i]=gs.tr[i];
    }
    else
      done++;
  }

  // Detect end of movement (object at target)
  if (done==6)
  {
    // Reset rotation
    gs.models[1].r=[0, 0, 0];

    gs.moving=KEYNONE;
  }
}

// Run an update step to the game state
function update()
{
  if (!gs.debug)
  {
    // Check for a keypress when not already moving
    if (gs.moving==KEYNONE)
    {
      if (ispressed(KEYLEFT))
      {
        gs.moving=KEYLEFT;

        gs.tp=[].concat(gs.models[1].p);
        gs.tp[0]-=2;

        gs.tr=[].concat(gs.models[1].r);
        gs.tr[2]+=90;
      }
      else
      if (ispressed(KEYRIGHT))
      {
        gs.moving=KEYRIGHT;

        gs.tp=[].concat(gs.models[1].p);
        gs.tp[0]+=2;

        gs.tr=[].concat(gs.models[1].r);
        gs.tr[2]-=90;
      }
      else
      if (ispressed(KEYUP))
      {
        gs.moving=KEYUP;

        gs.tp=[].concat(gs.models[1].p);
        gs.tp[2]-=2;

        gs.tr=[].concat(gs.models[1].r);
        gs.tr[0]-=90;
      }
      else
      if (ispressed(KEYDOWN))
      {
        gs.moving=KEYDOWN;

        gs.tp=[].concat(gs.models[1].p);
        gs.tp[2]+=2;

        gs.tr=[].concat(gs.models[1].r);
        gs.tr[0]+=90;
      }
    }

    movestep();
  }
  else
  {
    // camera controls
    if (ispressed(KEYLEFT))
      gs.scene.c.p[0]+=0.1;

    if (ispressed(KEYRIGHT))
      gs.scene.c.p[0]-=0.1;

    if (ispressed(KEYUP))
      gs.scene.c.p[2]+=0.1;

    if (ispressed(KEYDOWN))
      gs.scene.c.p[2]-=0.1;
  }
}

// Redraw the game world
function redraw()
{
  gs.scene.o=[];
  for(const i of gs.models)
    gs.scene.o.push(i);

  W.render(gs.scene, gs.gl, gs.ratio, gs.program);

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

// Convert a model from JSON format
function loadmodel(name)
{
  for (var i of models)
  {
    if (i.t==name)
    {
      var faces=JSON.parse(JSON.stringify(i.f));

      for (var j in faces)
      {
        faces[j][0]--;
        faces[j][1]--;
        faces[j][2]--;
      }

      return ([i.v, faces, i.c]);
    }
  }

  return cube();
}

// Load and generate 3D models
function createobjects()
{
  gs.models[0].anim=new timelineobj();
  gs.models[0].anim.reset().add(10*1000, undefined).assoc(gs.models[4]).addcallback(tween).begin(0);
}

function checkerboard()
{
  var vertices = [];
  var faces = [];
  var colours = [];
  var alt = 0;
  var v = 0; // Current vertex

  for (var y=0; y<8; y++)
  {
    for (var x=0; x<8; x++)
    {
      // vertices (x, y, z)
      vertices.push([ x*1,  y*1, 1]); v++;
      vertices.push([x*-1,  y*1, 1]); v++;
      vertices.push([x*-1, y*-1, 1]); v++;
      vertices.push([ x*1, y*-1, 1]); v++;

      // faces
      faces.push([v-4, v-3, v-2]);
      faces.push([v-4, v-2, v-1]);

      // colours
      colours.push(7+((alt++)&1)); // alternating black and white
    }
  }

  return ([vertices, faces, colours]);
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

  // Set up handler for browser being resized (or re-oriented)
  window.addEventListener("resize", function() { playfieldsize(); });

  // Initialise playfield size based on current browser attributes
  playfieldsize();

  // Import and generate 3D models
  createobjects();

  // Initialise WebGL
  gs.program=W.init(gs.scene, gs.gl);

  // Start frame callbacks
  window.requestAnimationFrame(rafcallback);
}

// Run the init() once page has loaded
window.onload=function() { init(); };
