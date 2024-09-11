// JS 13k 2024 entry

// Global constants
const xmax=640;
const ymax=360;
const PIOVER180=(Math.PI/180);

const STATEATTRACT=0;
const STATEMENU=1;
const STATEINPLAY=2;
const STATEENDLEVEL=3;
const STATEENGGAME=4;

const KEYNONE=0;
const KEYLEFT=1;
const KEYUP=2;
const KEYRIGHT=4;
const KEYDOWN=8;
const KEYACTION=16;

const TILEEMPTY=0;
const TILENORMAL=1;
const TILEEND=2;
const TILESTART=3;
const TILEBLOCK=4;
const TILEBUTTON=5;
const TILECOUNT=6;

const moveamount=2;

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
  osd:null,
  ctx:null,
  scale:1,

  ratio:(xmax/ymax),

  // Game world
  scene:{
    // Background color [r, g, b, a]
    b: { c: [.3, .3, .7, 1] },
    
    // Camera position and rotation
    c:
    {
      p: [0, -5, -20], // [x, y, z]
      r: [20, 10, 0]   // [pitch, yaw, roll]
    },
    
    // Diffuse light [x, y, z] position and [r, g, b] color
    d: {p: [.5, -.3, -.7], c: [1, 1, 1]},
    
    // Ambient light [r, g, b] color
    a: {c: [0.5, 0.5, 0.5]},

    // Objects to render
    o: []
  },
  program:null, // Shader program

  // Input
  keystate:KEYNONE,
  cursorx:0,
  cursory:0,
  touch:false,
  deadzoneX:0,
  deadzoneY:0,

  // In motion
  moving:KEYNONE, // Current moving direction
  tp:[0, 0, 0], // Target [x, y, z] position
  tr:[0, 0, 0], // Target [pitch, yaw, roll] rotation

  // Current level data
  state:STATEINPLAY,
  levelnum:0,
  level:null,
  blocks:[],
  buttons:[],
  floorscale:6,
  timeout:-1,
  timeoutfired:false,
  offsx:0, // Offsets in 3D space to make level centered around 0,0
  offsy:0,
  offsz:0,

  // Models (model, size [x, y, z], position [x, y, z], rotation [pitch, yaw, roll], color [r, g, b])
  models:[
    //{m: loadmodel("chipcube"), s: 0.1, p: [0, 0, 0], r: [0, 0, 0], c: [1, 0.5, 0]},
    //{m: loadmodel("coriolis"), s: 1, p: [-4, 0, 0], r: [0, 0, 0], c: [0, 0.5, 1]},
    //{m: loadmodel("tree"), s: 0.3, p: [4, 0, 0], r: [0, 0, 0]},
    //{m: checkerboard(16), s: 2, p: [0, -4, 0], r: [-90, 0, 0]},
    //{m: loadmodel("stealth"), s: 0.005, p: [0, 4, -5], r: [0, 0, 0]},
    //{m: cube(), s: 1, p: [-7, 0, 0], r: [0, 0, 0]},
  ],

  // Player
  player:0, // which model is the player

  // Particles
  particles:[], // an array of particles

  // True when music has been started (by user interaction)
  music:false,

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

  gs.deadzoneX=window.innerWidth/20;
  gs.deadzoneY=window.innerHeight/20;

  gs.scale=(height/ymax);

  gs.canvas.style.top=top+"px";
  gs.canvas.style.left=left+"px";
  gs.canvas.style.transformOrigin='0 0';
  gs.canvas.style.transform='scale('+gs.scale+')';

  gs.osd.style.top=top+"px";
  gs.osd.style.left=left+"px";
  gs.osd.style.transformOrigin='0 0';
  gs.osd.style.transform='scale('+gs.scale+')';
}

// Advance object animations onwards
function tween(obj, percent)
{
  // spin model
  obj.r[0]+=0.4;
  obj.r[1]+=0.4;
}

// Random number generator
function rng()
{
  return Math.random();
}

// Determine distance (Hypotenuse) between two lengths in 2D space (using Pythagoras)
function calcHypotenuse(a, b)
{
  return(Math.sqrt((a * a) + (b * b)));
}

// Generate some particles around an origin
function generateparticles(cx, cy, cz, count, rgb)
{
  const mv=0.1; // max travel velocity in any direction

  for (var i=0; i<count; i++)
  {
    gs.particles.push(
    {
      m:cube(),
      s:rng()*0.3,
      p:[cx, cy, cz],
      r:[0, 0, 0],
      c:[rgb.r||(rng()*1), rgb.g||(rng()*1), rgb.b||(rng()*1)],

      t:[(rng()*mv)-(mv/2), (rng()*mv)-(mv/2), (rng()*mv)-(mv/2)],
      a:2
    });
  }
}

// Do processing for particles
function particlestep()
{
  var i=0;

  // Process particles
  for (i=0; i<gs.particles.length; i++)
  {
    // Move particle
    gs.particles[i].p[0]+=gs.particles[i].t[0];
    gs.particles[i].p[1]+=gs.particles[i].t[1];
    gs.particles[i].p[2]+=gs.particles[i].t[2];

    // Rotate particle
    gs.particles[i].r[0]+=rng()*5;
    gs.particles[i].r[1]+=rng()*5;
    gs.particles[i].r[2]+=rng()*5;

    // Decay particle
    gs.particles[i].a-=0.007;
    gs.particles[i].s=Math.abs(gs.particles[i].s-0.001);
  }

  // Remove particles which have decayed
  i=gs.particles.length;
  while (i--)
  {
    if (gs.particles[i].a<=0)
      gs.particles.splice(i, 1);
  }
}

// When moving, step forwards until at target
function movestep()
{
  var done=0;
  const rotspeed=16; // degress per frame
  const transpeed=(rotspeed/45); // world coordinates translation per frame

  // Do nothing if we're not moving
  if (gs.moving==KEYNONE) return;

  // Iterate through x, y, z for position and rotation
  for (var i=0; i<3; i++)
  {
    // Position check
    if (gs.models[gs.player].p[i]<gs.tp[i])
    {
      gs.models[gs.player].p[i]+=transpeed;

      if (gs.models[gs.player].p[i]>gs.tp[i])
        gs.models[gs.player].p[i]=gs.tp[i];
    }
    else
    if (gs.models[gs.player].p[i]>gs.tp[i])
    {
      gs.models[gs.player].p[i]-=transpeed;

      if (gs.models[gs.player].p[i]<gs.tp[i])
        gs.models[gs.player].p[i]=gs.tp[i];
    }
    else
      done++;

    // Rotation check
    if (gs.models[gs.player].r[i]<gs.tr[i])
    {
      gs.models[gs.player].r[i]+=rotspeed;

      if (gs.models[gs.player].r[i]>gs.tr[i])
        gs.models[gs.player].r[i]=gs.tr[i];
    }
    else
    if (gs.models[gs.player].r[i]>gs.tr[i])
    {
      gs.models[gs.player].r[i]-=rotspeed;

      if (gs.models[gs.player].r[i]<gs.tr[i])
        gs.models[gs.player].r[i]=gs.tr[i];
    }
    else
      done++;
  }

  // Detect end of movement (object at target)
  if (done==6)
  {
    // Reset rotation
    gs.models[gs.player].r=[0, 0, 0];

    // Allow another movement input
    gs.moving=KEYNONE;
  }
}

// See if this blocker is still blocked
function checkblockers(x, y)
{
  for (const blocker of gs.blocks)
    if ((blocker.x==x) && (blocker.y==y))
      return blocker.blocked;

  return true;
}

// Unblock nearest blocker tile
function unblock(x, y)
{
  var nearid=null;
  var neardist=null;

  for (var blocker=0; blocker<gs.blocks.length; blocker++)
  {
    var mydist=calcHypotenuse(Math.abs(x-gs.blocks[blocker].x), Math.abs(y-gs.blocks[blocker].y));
    if ((nearid==null) || (mydist<neardist))
    {
      nearid=blocker;
      neardist=mydist;
    }
  }

  try
  {
    if (nearid!=null)
    {
      delete gs.models[gs.blocks[nearid].id].c; // Remove colouring
      gs.models[gs.blocks[nearid].id].p[1]=0; // Move tile up to level
      gs.blocks[nearid].blocked=false;
    }
  }
  catch(e){}
}

// Determine if the player can move in a given direction
function canmove(direction)
{
  var dx=0;
  var dy=0;
  var tile;

  // Determine delta based on intended direction
  switch (direction)
  {
    case KEYLEFT:
      dx=-1;
      break;

    case KEYRIGHT:
      dx=1;
      break;

    case KEYUP:
      dy=-1;
      break;

    case KEYDOWN:
      dy=1;
      break;

    default:
      break;
  }

  // Look ahead to target position
  try
  {
    // Calculate target position
    var tx=Math.floor((gs.models[gs.player].p[0]-gs.offsx+moveamount+(dx*moveamount))/gs.floorscale); // From X position
    var ty=Math.floor((gs.models[gs.player].p[2]-gs.offsz+moveamount+(dy*moveamount))/gs.floorscale); // From Z position

    // Check for trying to go off map
    if ((tx<0) || (tx>=gs.level.width))
      return false;

    if ((ty<0) || (ty>=gs.level.height))
      return false;

    // See what tile is in the target position
    tile=gs.level.tiles[((ty*gs.level.width)+tx)]||TILEEMPTY;

    switch (tile)
    {
      case TILEEND:
        gs.state=STATEENDLEVEL;

        gs.levelnum++;
        if (gs.levelnum>levels.length)
          gs.levelnum=0;

        loadlevel();
        return false;
        break;

      case TILEBLOCK:
        return !checkblockers(tx, ty);
        break;

      case TILEBUTTON:
        unblock(tx, ty);
        break;

      default:
        break;
    }
  }
  catch(e){ tile=TILEEMPTY; }

  return (tile!=TILEEMPTY);
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
        if (canmove(KEYLEFT))
        {
          gs.moving=KEYLEFT;

          gs.tp=[].concat(gs.models[gs.player].p);
          gs.tp[0]-=moveamount;

          gs.tr=[].concat(gs.models[gs.player].r);
          gs.tr[2]+=90;
        }
      }
    }

    if (gs.moving==KEYNONE)
    {
      if (ispressed(KEYRIGHT))
      {
        if (canmove(KEYRIGHT))
        {
          gs.moving=KEYRIGHT;

          gs.tp=[].concat(gs.models[gs.player].p);
          gs.tp[0]+=moveamount;

          gs.tr=[].concat(gs.models[gs.player].r);
          gs.tr[2]-=90;
        }
      }
    }

    if (gs.moving==KEYNONE)
    {
      if (ispressed(KEYUP))
      {
        if (canmove(KEYUP))
        {
          gs.moving=KEYUP;

          gs.tp=[].concat(gs.models[gs.player].p);
          gs.tp[2]-=moveamount;

          gs.tr=[].concat(gs.models[gs.player].r);
          gs.tr[0]-=90;
        }
      }
    }

    if (gs.moving==KEYNONE)
    {
      if (ispressed(KEYDOWN))
      {
        if (canmove(KEYDOWN))
        {
          gs.moving=KEYDOWN;

          gs.tp=[].concat(gs.models[gs.player].p);
          gs.tp[2]+=moveamount;

          gs.tr=[].concat(gs.models[gs.player].r);
          gs.tr[0]+=90;
        }
      }
    }

    if (gs.moving!=KEYNONE)
    {
      movestep();

      // Rotate depending on position
      //gs.scene.c.r[2]=360-gs.models[gs.player].p[0]; // X - roll
      //gs.scene.c.r[0]=360-gs.models[gs.player].p[2]; // Z - pitch
    }

    // Move camera to get player in view
    if ((0-gs.models[gs.player].p[0])>gs.scene.c.p[0]) // look right
      gs.scene.c.p[0]+=0.2;

    if ((0-gs.models[gs.player].p[0])<gs.scene.c.p[0]) // look left
      gs.scene.c.p[0]-=0.2;

    if ((0-gs.models[gs.player].p[2]-15)>gs.scene.c.p[2]) // look forwards
      gs.scene.c.p[2]+=0.2;

    if ((0-gs.models[gs.player].p[2]-15)<gs.scene.c.p[2]) // look back
      gs.scene.c.p[2]-=0.2;
  }
  else
  {
    // camera controls
    if (ispressed(KEYLEFT))
      gs.scene.c.r[1]-=1;

    if (ispressed(KEYRIGHT))
      gs.scene.c.r[1]+=1;

    if (ispressed(KEYUP))
    {
      gs.scene.c.p[0]-=(0.2*Math.sin(gs.scene.c.r[1]*PIOVER180));
      gs.scene.c.p[2]+=(0.2*Math.cos(gs.scene.c.r[1]*PIOVER180));
    }

    if (ispressed(KEYDOWN))
    {
      gs.scene.c.p[0]+=(0.2*Math.sin(gs.scene.c.r[1]*PIOVER180));
      gs.scene.c.p[2]-=(0.2*Math.cos(gs.scene.c.r[1]*PIOVER180));
    }

    // prevent angle over/underflow
    for (var vector=0; vector<3; vector++)
    {
      if (gs.scene.c.r[vector]<0) gs.scene.c.r[vector]+=360;
      if (gs.scene.c.r[vector]>=360) gs.scene.c.r[vector]-=360;
    }
  }

  particlestep();
}

// Redraw the game world
function redraw()
{
  gs.scene.o=[];
  for(const i of gs.models)
    gs.scene.o.push(i);

  for(const p of gs.particles)
    gs.scene.o.push(p);

  W.render(gs.scene, gs.gl, gs.ratio, gs.program);

  if (gs.debug)
    document.title=""+gs.fps+" fps";
}

// Redraw the OSD
function redrawosd()
{
  gs.ctx.clearRect(0, 0, gs.osd.width, gs.osd.height);

  // Put up the remaining time
  var delta=Math.round((gs.timeout-Date.now())/1000);

  if ((delta<=0) && (!gs.timeoutfired))
  {
    // TODO : do something when timer runs out
    gs.timeoutfired=true;
  }

  if (delta<0) delta=0;

  write(gs.ctx, 10, 10, ""+delta+"s", 8, "rgba(255,0,255,0.5)");
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

  // Redraw OSD
  redrawosd();

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

// Load current level
function loadlevel()
{
  // Copy level data so it can be changed
  gs.level=JSON.parse(JSON.stringify(levels[gs.levelnum]));
  gs.blocks=[];
  gs.buttons=[];
  gs.particles=[];

  gs.offsx=0-(((gs.level.width-1)*gs.floorscale)/2);
  gs.offsy=0;
  gs.offsz=0-(((gs.level.height-1)*gs.floorscale)/2);

  generateparticles(0, 0, 0, 30, {});

  // Clear old 3D models
  gs.models=[
    {m: loadmodel("chipcube"), s: 0.1, p: [0, 0, 0], r: [0, 0, 0], c: [0.5, 0.5, 0.5]}
  ];

  // Convert to 3D models
  for (var y=0; y<gs.level.height; y++)
  {
    for (var x=0; x<gs.level.width; x++)
    {
      var piece={
        s: 1,
        p: [gs.offsx+(x*gs.floorscale), gs.offsy+0, gs.offsz+(y*gs.floorscale)],
        r: [90, 0, 0]
      };

      switch (gs.level.tiles[((y*gs.level.width)+x)]||0)
      {
        case 0: // empty
          continue;
          break;

        case 1: // normal
          piece.m=checkerboard(gs.floorscale);
          break;

        case 2: // end
          piece.c=[1, 0, 0];
          piece.m=checkerboard(gs.floorscale);
          break;

        case 3: // start
          gs.player=gs.models.length;
          gs.models.push({m: loadmodel("coriolis"), s: 1, p: [gs.offsx+(x*gs.floorscale), gs.offsy+0, gs.offsz+(y*gs.floorscale)], r: [0, 0, 0], c: [1, 0.5, 0]});

          piece.c=[0, 1, 0];
          piece.m=checkerboard(gs.floorscale);
          break;

        case 4: // block
          {
            var blocker={x:x, y:y, id:gs.models.length, blocked:true};
            gs.blocks.push(blocker);
          }
          piece.p[1]-=0.5;
          piece.c=[0.2, 0.2, 0.2];
          piece.m=checkerboard(gs.floorscale);
          break;

        case 5: // button
          {
            var button={x:x, y:y, id:gs.models.length};
            gs.buttons.push(button);
          }
          piece.c=[1, 0, 1];
          piece.m=checkerboard(gs.floorscale);
          break;

        case 6: // count
          piece.m=checkerboard(gs.floorscale);
          break;

        default: // undefined
          continue;
          break;
      }

      gs.models.push(piece);
    }
  }

  // Place camera at start position
  gs.scene.c.p[0]=0-gs.models[gs.player].p[0];
  gs.scene.c.p[2]=0-gs.models[gs.player].p[2]-15;

  gs.state=STATEINPLAY;
  starttimer(13);
}

// Load and generate 3D models
function createobjects()
{
  //gs.models[0].anim=new timelineobj();
  //gs.models[0].anim.reset().add(10*1000, undefined).assoc(gs.models[5]).assoc(gs.models[4]).assoc(gs.models[0]).addcallback(tween).begin(0);

  loadlevel();
}

function checkerboard(gridsize)
{
  var vertices = [];
  var faces = [];
  var colours = [];
  var v = 0; // Current vertex
  const originx=-(gridsize/2);
  const originy=-(gridsize/2)

  for (var y=0; y<gridsize; y++)
  {
    for (var x=0; x<gridsize; x++)
    {
      // vertices (x, y, z)
      vertices.push([originx+x+0, originy+y+0, 1]); v++;
      vertices.push([originx+x+0, originy+y+1, 1]); v++;
      vertices.push([originx+x+1, originy+y+1, 1]); v++;
      vertices.push([originx+x+1, originy+y+0, 1]); v++;

      // faces
      faces.push([v-4, v-3, v-2]);
      faces.push([v-4, v-2, v-1]);

      // colours
      colours.push(7+((x+y)&1)); // alternating black and white
      colours.push(7+((x+y)&1));

      // front edge
      if ((y+1)==gridsize)
      {
        // vertices (x, y, z)
        vertices.push([originx+x+0, originy+y+1, 1]); v++;
        vertices.push([originx+x+1, originy+y+1, 1]); v++;
        vertices.push([originx+x+1, originy+y+1, 1.5]); v++;
        vertices.push([originx+x+0, originy+y+1, 1.5]); v++;

        // faces
        faces.push([v-4, v-3, v-2]);
        faces.push([v-4, v-2, v-1]);

        // colours
        colours.push(7+((x+y)&1)); // alternating black and white
        colours.push(7+((x+y)&1));
      }

      // left edge
      if (x==0)
      {
        // vertices (x, y, z)
        vertices.push([originx+x+0, originy+y+0, 1]); v++;
        vertices.push([originx+x+0, originy+y+1, 1]); v++;
        vertices.push([originx+x+0, originy+y+1, 1.5]); v++;
        vertices.push([originx+x+0, originy+y+0, 1.5]); v++;

        // faces
        faces.push([v-4, v-3, v-2]);
        faces.push([v-4, v-2, v-1]);

        // colours
        colours.push(7+((x+y)&1)); // alternating black and white
        colours.push(7+((x+y)&1));
      }

      // right edge
      if ((x+1)==gridsize)
      {
        // vertices (x, y, z)
        vertices.push([originx+x+1, originy+y+0, 1]); v++;
        vertices.push([originx+x+1, originy+y+1, 1]); v++;
        vertices.push([originx+x+1, originy+y+1, 1.5]); v++;
        vertices.push([originx+x+1, originy+y+0, 1.5]); v++;

        // faces
        faces.push([v-4, v-2, v-3]);
        faces.push([v-4, v-1, v-2]);

        // colours
        colours.push(7+((x+y)&1)); // alternating black and white
        colours.push(7+((x+y)&1));
      }
    }
  }

  return ([vertices, faces, colours]);
}

// Set the timeout value to start the countdown timer
function starttimer(seconds)
{
  gs.timeout=Date.now()+(seconds*1000);
}

// Entry point
function init()
{
  // Initialise stuff
  document.onkeydown=function(e)
  {
    e = e || window.event;
    updatekeystate(e, 1);

    if (!gs.music)
    {
      gs.music=true;
      music_play();
    }
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

  // Set up 3D canvas
  gs.canvas=document.getElementById("canvas");
  gs.gl=gs.canvas.getContext("webgl2");

  // Set up 2D OSD canvas
  gs.osd=document.getElementById("osd");
  gs.ctx=gs.osd.getContext("2d");

  // Mouse events
  gs.osd.onmousedown=function(e)
  {
    e = e || window.event;
    pointerpos(e, 1);

    if (!gs.music)
    {
      gs.music=true;
      music_play();
    }
  };

  gs.osd.onmousemove=function(e)
  {
    e = e || window.event;
    if (gs.touch)
      pointerpos(e, 1);
  };

  gs.osd.onmouseup=function(e)
  {
    e = e || window.event;
    pointerpos(e, 0);
  };

  gs.osd.addEventListener("touchstart", function(e)
  {
    e = e || window.event;
    touchpos(e, 1);

    if (!gs.music)
    {
      gs.music=true;
      music_play();
    }
  });

  gs.osd.addEventListener("touchmove", function(e)
  {
    e = e || window.event;
    if (gs.touch)
      touchpos(e, 1);
  });

  gs.osd.addEventListener("touchend", function(e)
  {
    e = e || window.event;
    touchpos(e, 0);
  });

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
