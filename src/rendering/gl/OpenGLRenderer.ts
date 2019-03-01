import {mat3, mat4, vec4} from 'gl-matrix';
import Drawable from './Drawable';
import Camera from '../../Camera';
import {gl} from '../../globals';
import ShaderProgram, { Shader } from './ShaderProgram';

// In this file, `gl` is accessible because it is imported above
class OpenGLRenderer {
  renderCol= vec4.fromValues(1, 0, 0, 1);
  time = 0.0;
  shader : ShaderProgram

  constructor(public canvas: HTMLCanvasElement) {
  }

  setClearColor(r: number, g: number, b: number, a: number) {
    gl.clearColor(r, g, b, a);
  }

  setSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  render(camera: Camera, prog: ShaderProgram, drawables: Array<Drawable>) {
    let model = mat4.create();
    let viewProj = mat4.create();
    //let color = vec4.fromValues(1, 0, 0, 1);



    mat4.identity(model);
    mat4.multiply(viewProj, camera.projectionMatrix, camera.viewMatrix);
    // this.shader.setModelMatrix(model);
    // this.shader.setViewProjMatrix(viewProj);
    this.shader.setGeometryColor(this.renderCol);
    // this.shader.setTime(this.time);
    //
    // for (let drawable of drawables) {
    //   this.shader.draw(drawable);
    // }
    prog.setEyeRefUp(camera.controls.eye, camera.controls.center, camera.controls.up);
    mat4.identity(model);
    mat4.multiply(viewProj, camera.projectionMatrix, camera.viewMatrix);
    prog.setModelMatrix(model);
    prog.setViewProjMatrix(viewProj);

    this.shader.setModelMatrix(model);
    this.shader.setViewProjMatrix(viewProj);
    this.shader.setGeometryColor(this.renderCol);
    this.shader.setTime(this.time);

    let axes = mat3.fromValues(camera.right[0], camera.right[1], camera.right[2],
        camera.up[0], camera.up[1], camera.up[2],
        camera.forward[0], camera.forward[1], camera.forward[2]);
    prog.setCameraAxes(axes);


    for (let drawable of drawables) {
      this.shader.draw(drawable);
    }
  }
};

export default OpenGLRenderer;
