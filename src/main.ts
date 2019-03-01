import {vec2, vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {readTextFile, setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

import LSystem from './Lsystem';
import TreeScene from './geometry/TreeScene';
import CustomMesh from './geometry/CustomMesh';


import Mesh from './geometry/Mesh';



// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  iteration: 2,
  angle: 22.5,
  step: 6
};

let square: Square;
let screenQuad: ScreenQuad;
let time: number = 0.0;
let ls: LSystem;
let testMesh: Mesh;
let leafScene: TreeScene;
let treeScene: TreeScene;

var mud: any;
var mudScene: TreeScene;


function loadScene() {
  //square = new Square();
  //square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  treeScene = new TreeScene();
  leafScene = new TreeScene();

  ls = new LSystem("BF", controls.iteration, controls.angle, controls.step);
  ls.drawTree(treeScene, leafScene);
  treeScene.create();
  leafScene.create();

  // load mud
  mudScene = new TreeScene();
  let OBJ = require('webgl-obj-loader');
  let mudDada = readTextFile("https://raw.githubusercontent.com/chloele33/lsystem-tree/master/src/obj/mud.obj");
  let mesh = new OBJ.Mesh(mudDada);
  let mudMesh = new CustomMesh(mesh);
  mudMesh.translate(vec4.fromValues(0, -14, -20, 0));
  mudMesh.scale(10, 5, 10);
  mudScene.addMesh(mudMesh);
  mudScene.create();



  let meshData :string = readTextFile("./src/obj/leaf.obj");
  testMesh = new Mesh(meshData, vec3.fromValues(0,0,0));
  testMesh.create();

    // Set up instanced rendering data arrays here.
    // This example creates a set of positional
    // offsets and gradiated colors for a 100x100 grid
    // of squares, even though the VBO data for just
    // one square is actually passed to the GPU
    let offsetsArray = [];
    let colorsArray = [];

    let n: number = 100.0;
    for(let i = 0; i < n; i++) {
      for(let j = 0; j < n; j++) {
        offsetsArray.push(i);
        offsetsArray.push(j);
        offsetsArray.push(0);

        colorsArray.push(i / n);
        colorsArray.push(j / n);
        colorsArray.push(1.0);
        colorsArray.push(1.0); // Alpha channel
      }
    }
    let offsets: Float32Array = new Float32Array(offsetsArray);
    let colors: Float32Array = new Float32Array(colorsArray);
}



function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);



  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'step', 1.0, 8.0).step(1.0).onChange(updateScene);
  gui.add(controls, 'angle', 5.0, 60.0).step(1.0).onChange(updateScene);
  gui.add(controls, 'iteration', 1, 4).step(1).onChange(updateScene);

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  //const camera = new Camera(vec3.fromValues(50, 50, 10), vec3.fromValues(50, 50, 0));
  const camera = new Camera(vec3.fromValues(10, 10, 100), vec3.fromValues(0, 0, 0)); // looks at origin

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  renderer.renderCol = vec4.fromValues(1, 1, 1, 1);

  //gl.enable(gl.BLEND);
  //gl.blendFunc(gl.ONE, gl.ONE); // Additive blending
  // to ensure you can see a basic test OBJ file centered at the origin
  gl.enable(gl.DEPTH_TEST);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);



  // LSystem
  function updateScene() {
    ls.setDefaultAngle(controls.angle);
    ls.setDefaultIteration(controls.iteration);
    ls.setDefaultStep(controls.step);

    treeScene = new TreeScene();
    leafScene = new TreeScene();
    ls.drawTree(treeScene, leafScene);
    //ls.process();
    //treeScene = ls.getTreeScene();
    treeScene.create();
    leafScene.create();
  }

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    // renderer.render(camera, flat, [screenQuad]);
    // renderer.render(camera, instancedShader, [
    //   square,
    // ]);

    flat.setDimensions(canvas.width, canvas.height);
    flat.draw(screenQuad);
    renderer.shader = lambert;
    renderer.renderCol = vec4.fromValues(180 / 255, 140 / 255,100/255, 1);

    renderer.render(camera, lambert, [treeScene]);

    renderer.renderCol = vec4.fromValues(185 / 255, 205 / 255, 5 / 255, 1);
    renderer.render(camera, lambert, [leafScene]);

    renderer.renderCol = vec4.fromValues(220 / 255, 160 / 255,120/255, 1);

    renderer.render(camera, lambert, [mudScene]);



    stats.end();
    renderer.time++;
    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
