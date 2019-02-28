// A Turtle class to represent the current drawing state of your L-System.
// It should at least keep track of its current position, current orientation,
// and recursion depth (how many [ characters have been found while drawing before ]s)
import { vec3, mat4, vec4, quat } from "gl-matrix";
import {readTextFile} from './globals';

const deg2Rad = 0.017453292519943295769236907684886;


class Turtle {
    pos: vec3;
    orient: vec3;
    depth: number;

    // up: vec3;
    // forward: vec3;
    // left: vec3;

    constructor(pos: vec3, ori: vec3, depth: number) {
        this.pos = pos;
        this.orient = ori;
        this.depth = depth;
    }

    moveForward(d: number) {
        let dist = vec3.create();
        vec3.multiply(dist, [d, d, d], this.orient);
        vec3.add(this.pos, this.pos, dist);
    }

    rotate(axis: vec3, deg: number) {
        let rotMat = mat4.fromValues(0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0);

        let rad = deg2Rad * deg;
        mat4.fromRotation(rotMat, rad, axis);
        var ori = vec4.fromValues(this.orient[0], this.orient[1], this.orient[2], 0.0);
        ori = vec4.transformMat4(ori, ori, rotMat);
        this.orient = vec3.fromValues(ori[0], ori[1], ori[2]);
    }

}

class TurtleStack {
    list = new Array<Turtle>();

    public push(turtle: Turtle) {
        this.list.push(turtle);
    }

    public pop(): Turtle {
        return this.list.pop();
    }
}

export {Turtle, TurtleStack};
