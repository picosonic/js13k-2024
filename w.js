// Thanks to xem
//   https://xem.github.io/microW/

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
      in vec4 c,p,u;
      uniform mat4 M,m;
      out vec4 C,P,U;

      void main()
      {
        gl_Position=M*p;
        P=m*p;
        C=c;
        U=u;
      }`);
    gl.compileShader(vs);
    //console.log('vertex shader:', gl.getShaderInfoLog(vs) || 'OK');

    // Fragment shader
    gl.shaderSource(fs = gl.createShader(gl.FRAGMENT_SHADER),
    `#version 300 es
      precision lowp float;
      uniform vec3 c,d,a;
      in vec4 C,P,U;
      out vec4 o;
      uniform sampler2D s;
      
      void main()
      {
        float n=max(dot(d,-normalize(cross(dFdx(P.xyz),dFdy(P.xyz)))),0.);
        o=mix(texture(s,U.xy),vec4(c*C.rgb*n+a*C.rgb,1.),C.a);
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

    return program;
  },

  render: (scene, gl, aspectratio, program) => {
    const black=[0, 0, 0, 0]; // [r, g, b, a]
    var i, vertices, uv, modelMatrix, texture, a;

    // Clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Render each object
    for(i of scene.o)
    {  
      // Default blending method for transparent objects
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      
      // Enable texture 0
      gl.activeTexture(gl.TEXTURE0);
      
      // Initialize the model (cube by default)
      [vertices, uv] = (window[i.m] || cube)();

      // Alpha-blending
      gl.enable(gl.BLEND);

      // Set position buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
      gl.vertexAttribPointer(a=gl.getAttribLocation(program, 'p'), 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a);
      
      // Set uv buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
      gl.vertexAttribPointer(a=gl.getAttribLocation(program, 'u'), 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a);
      
      // Set the model matrix
      modelMatrix = new DOMMatrix().translate(...(i.p||[0,0,0])).rotate(...(i.r||[0,0,0])).scale(...(i.s||[1,1,1]));
      gl.uniformMatrix4fv(gl.getUniformLocation(program, 'm'), false, modelMatrix.toFloat32Array());
      
      // Set the model's color
      if (i.c)
      {
        gl.vertexAttrib3f(gl.getAttribLocation(program, 'c'), ...i.c);
      }
      // or texture
      else
      {
        // Set a default base colour to black in RGBA
        gl.vertexAttrib4f(gl.getAttribLocation(program, 'c'), ...black);

        if(i.t)
        {
          texture = gl.createTexture();

          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE , i.t);
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.uniform1i(gl.getUniformLocation(program, 's'), 0);
        }
      }

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
      gl.drawArrays(gl.TRIANGLES, 0, i.m == "plane" ? 6 : vertices.length / 3);
    }
  }
}

// Declare a cube (2x2x2)
// Returns [vertices, uvs)] 
//
//    v6----- v5
//   /|      /|
//  v1------v0|
//  | |   x | |
//  | |v7---|-|v4
//  |/      |/
//  v2------v3

var cube = () => [

  [
    1, 1, 1,  -1, 1, 1,  -1,-1, 1, // front
    1, 1, 1,  -1,-1, 1,   1,-1, 1,
    1, 1,-1,   1, 1, 1,   1,-1, 1, // right
    1, 1,-1,   1,-1, 1,   1,-1,-1,
    1, 1,-1,  -1, 1,-1,  -1, 1, 1, // up
    1, 1,-1,  -1, 1, 1,   1, 1, 1,
   -1, 1, 1,  -1, 1,-1,  -1,-1,-1, // left
   -1, 1, 1,  -1,-1,-1,  -1,-1, 1,
   -1, 1,-1,   1, 1,-1,   1,-1,-1, // back
   -1, 1,-1,   1,-1,-1,  -1,-1,-1,
    1,-1, 1,  -1,-1, 1,  -1,-1,-1, // down
    1,-1, 1,  -1,-1,-1,   1,-1,-1
  ],
  
  [
    1, 1,   0, 1,   0, 0, // front
    1, 1,   0, 0,   1, 0,            
    1, 1,   0, 1,   0, 0, // right
    1, 1,   0, 0,   1, 0, 
    1, 1,   0, 1,   0, 0, // up
    1, 1,   0, 0,   1, 0,
    1, 1,   0, 1,   0, 0, // left
    1, 1,   0, 0,   1, 0,
    1, 1,   0, 1,   0, 0, // back
    1, 1,   0, 0,   1, 0,
    1, 1,   0, 1,   0, 0, // down
    1, 1,   0, 0,   1, 0
  ]
];
