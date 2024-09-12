// Thanks to xem
//   https://xem.github.io/microW/

// OpenGL default palette
const palette = [
  [0.4, 0.4, 0.4], // 0 "darkgrey"
  [  1,   0,   0], // 1 "red"
  [  0,   1,   0], // 2 "green"
  [  0,   0,   1], // 3 "blue"
  [  0,   1,   1], // 4 "cyan"
  [  1,   0,   1], // 5 "magenta"
  [  1,   1,   0], // 6 "yellow"
  [  1,   1,   1], // 7 "white"
  [  0,   0,   0], // 8 "black"
  [0.5,   0,   0], // 9 "darkred"
  [  0, 0.5,   0], // 10 "darkgreen"
  [  0,   0, 0.5], // 11 "darkblue"
  [  0, 0.5, 0.5], // 12 "darkcyan"
  [0.5,   0, 0.5], // 13 "darkmagenta"
  [0.5, 0.5,   0], // 14 "darkyellow"
  [0.8, 0.8, 0.8]  // 15 "lightgrey"
];

var W = {
  init: (scene, gl) => {
    var vs, fs;

    // Set the clear color in RGBA
    gl.clearColor(...scene.b.c);

    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Enable the depth test
    gl.enable(gl.DEPTH_TEST);

    // Vertex shader
    gl.shaderSource(vs = gl.createShader(gl.VERTEX_SHADER),
    `#version 300 es
      precision lowp float;
      in vec4 fc,p;
      uniform mat4 M,m;
      out vec4 C,P;

      void main()
      {
        gl_Position=M*p;
        P=m*p;
        C=fc;
      }`);
    gl.compileShader(vs);
    //console.log('vertex shader:', gl.getShaderInfoLog(vs) || 'OK');

    // Fragment shader
    gl.shaderSource(fs = gl.createShader(gl.FRAGMENT_SHADER),
    `#version 300 es
      precision lowp float;
      uniform vec3 c,d,a;
      in vec4 C,P;
      out vec4 o;

      void main()
      {
        float n=max(dot(d,-normalize(cross(dFdx(P.xyz),dFdy(P.xyz)))),0.);
        o=vec4(c*C.rgb*n+a*C.rgb,1.);
      }`);
    gl.compileShader(fs);
    //console.log('fragment shader:', gl.getShaderInfoLog(fs) || 'OK');

    // Program
    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Set the diffuse light color and direction
    gl.uniform3f(gl.getUniformLocation(program, 'c'), ...scene.d.c);
    gl.uniform3f(gl.getUniformLocation(program, 'd'), ...scene.d.p);

    // Set the ambient light color
    gl.uniform3f(gl.getUniformLocation(program, 'a'), ...scene.a.c);

    // Default blending method for transparent objects
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    // Enable texture 0
    gl.activeTexture(gl.TEXTURE0);

    return program;
  },

  render: (scene, gl, aspectratio, program) => {
    const black=[0, 0, 0, 0]; // [r, g, b, a]
    var i, j, fi, vertices, faces, fc, colours, modelMatrix, a, b;
    var allvertices=[];
    var facecolours=[];
    var scale=[1, 1, 1]; // [x, y, z]

    // Clear before drawing
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Render each object
    for(i of scene.o)
    {
      // Initialize the model (cube by default)
      [vertices, faces, colours] = (i.m || cube());

      // Clear for current model
      allvertices=[];
      facecolours=[];
      fi=0;

      // Translate faces
      for (j of faces)
      {
        // Add face colour for each of the 3 vertices
        if (i.c)
          fc=i.c;
        else
          fc=palette[colours[fi]];

        facecolours.push(...fc.concat(1));
        facecolours.push(...fc.concat(1));
        facecolours.push(...fc.concat(1));
        fi++;

        // Add vertex for each of the 3 points referenced by the face
        allvertices.push(...vertices[j[0]]);
        allvertices.push(...vertices[j[1]]);
        allvertices.push(...vertices[j[2]]);
      }

      // Set position buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allvertices), gl.STATIC_DRAW);
      gl.vertexAttribPointer(a=gl.getAttribLocation(program, 'p'), 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a);

      // Set the model matrix
      if (i.s!=undefined)
      {
        if (typeof i.s == "number")
          scale=[i.s, i.s, i.s];
        else
          scale=i.s;
      }
      modelMatrix = new DOMMatrix().translate(...(i.p||[0,0,0])).rotate(...(i.r||[0,0,0])).scale(...scale);
      gl.uniformMatrix4fv(gl.getUniformLocation(program, 'm'), false, modelMatrix.toFloat32Array());

      // Set the model's colors
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(facecolours), gl.STATIC_DRAW);
      gl.vertexAttribPointer(b=gl.getAttribLocation(program, 'fc'), 4, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(b);

      // Set the cube's mvp matrix (camera x model)
      // Camera matrix (fov: 30deg, near: 0.1, far: 100)
      gl.uniformMatrix4fv(gl.getUniformLocation(program, 'M'), false, (new DOMMatrix([
        1.8 / aspectratio,   0,      0,  0, // m11 .. m14
                        0, 1.8,      0,  0, // m21 .. m24
                        0,   0, -1.001, -1, // m31 .. m34
                        0,   0,    -.2,  0  // m41 .. m44
      ]).rotate(...scene.c.r)).translate(...scene.c.p).multiply(modelMatrix).toFloat32Array());

      // Render
      // (Special case for plane: render the front face of a cube)
      gl.drawArrays(gl.TRIANGLES, 0, allvertices.length / 3);
    }
  }
}

// Declare a cube (2x2x2)
// Returns [vertices, faces, colours)]
//
//    v6----- v5
//   /|      /|
//  v1------v0|
//  | |   x | |
//  | |v7---|-|v4
//  |/      |/
//  v2------v3

function cube()
{
  return [
  // vertices
  [
    [ 1,  1,  1], // v0 t/r front
    [-1,  1,  1], // v1 t/l front
    [-1, -1,  1], // v2 b/l front
    [ 1, -1,  1], // v3 b/r front
    [ 1, -1, -1], // v4 b/r back
    [ 1,  1, -1], // v5 t/r back
    [-1,  1, -1], // v6 t/l back
    [-1, -1, -1]  // v7 b/l back
  ],

  // faces
  [
    [0, 1, 2], // front
    [0, 2, 3],

    [5, 0, 3], // right
    [5, 3, 4],

    [5, 6, 1], // up
    [5, 1, 0],

    [1, 6, 7], // left
    [1, 7, 2],

    [6, 5, 4], // back
    [6, 4, 7],

    [3, 2, 7], // down
    [3, 7, 4]
  ],

  // colours (index to palette)
  [
    7, // white
    7,
    1, // red
    1,
    2, // green
    2,
    3, // blue
    3,
    6, // yellow
    6,
    5, // magenta
    5
  ]
];
}
