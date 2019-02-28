import ExpansionRule from './ExpansionRule';
import DrawingRule from './DrawingRule';
import {readTextFile} from './globals';
import {Turtle, TurtleStack} from './Turtle'
import {vec3, mat4, vec4} from 'gl-matrix';
import CustomMesh from './geometry/CustomMesh';
import TreeScene from './geometry/TreeScene';



const Deg2Rad = 0.017453292519943295769236907684886;


export default class LSystem {
    turtleStack : TurtleStack;
    expansionRules: ExpansionRule;
    drawingRules: DrawingRule;
    turtle: Turtle;

    axiom: string;
    angle: number;
    step: number;
    iterations: number;

    expandedString: string;

    OBJ: any;
    branch: any;
    leaf: any;
    treeScene: TreeScene;


    constructor(axiom: string, iterations: number, angle: number, step: number, mesh: TreeScene) {
        // initialize varialbes
        this.axiom = axiom;
        this.iterations = iterations;
        this.angle = angle;
        this.step = step;
        this.treeScene = mesh;

        this.expansionRules = new ExpansionRule();
        this.drawingRules = new DrawingRule();

        // set up expansion rules
        this.setupExpansionRules();

        // set up drawing rules
        this.setupDrawingRules();

        // set up expanded string
        this.expandedString = this.expandString();

        // set up turtle
        this.turtleStack = new TurtleStack();
        this.turtle = new Turtle(vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0), 0);

        // load custom files
        this.OBJ = require('webgl-obj-loader');

        var meshData = readTextFile("/src/obj/cylinder.obj");
        this.branch = new this.OBJ.Mesh(meshData);

        meshData = readTextFile("/src/obj/leaf.obj");
        this.leaf = new this.OBJ.Mesh(meshData);

        // draw tree
        this.drawTree()
    }

    // returns expanded string using axiom, number of iterations, and expansionRules
    expandString() : string {
        var result = this.axiom;
        for (var i = 0; i < this.iterations; i++) {
            var exp = "";
            for (let j = 0; j < result.length; j++) {
                let c = result.charAt(j);
                exp += this.expansionRules.expand(c);
            }
            result = exp;
        }
        return result;
    }

    setupExpansionRules() {
        let rules: Array<[string, string, number]> = [
            ['B', 'BB', 1.0],
            ['F', 'FF[YFXFXF][ZFYFYF][XFZFZF]', 0.65],
            ['F', 'FF[YFXFXF][XFZFZF][ZFYFYF]', 0.25],
            ['F', 'F[YFXFXF]F[XFZFZF][ZFYFYF]', 0.1]
        ];

        for (var i = 0; i < rules.length; i++) {
            var currRule = rules[i];
            this.expansionRules.set(currRule[0], currRule[1], currRule[2]);
        }
    }

    rotZ() {
        this.turtle.rotate(vec3.fromValues(0, 0, 1), 45);
    }

    rotZNeg() {
        this.turtle.rotate(vec3.fromValues(0, 0, 1), -45);
    }

    rotX() {
        this.turtle.rotate(vec3.fromValues(1, 0, 0), 45);
    }

    rotXNeg() {
        this.turtle.rotate(vec3.fromValues(1, 0, 0), -45);
    }

    rotY() {
        this.turtle.rotate(vec3.fromValues(0, 1, 0), 45);
    }

    rotYNeg() {
        this.turtle.rotate(vec3.fromValues(0, 1, 0), -45);
    }

    drawTrunk() {
        let cylinder = new CustomMesh(this.branch);
        cylinder.scale(2, 20, 2);
        cylinder.translate(vec3.fromValues(-0.5, 0, -0.5));
        this.drawBranch(cylinder);

        // move turtle forward
        let branchLen = cylinder.height;
        this.turtle.moveForward(branchLen);
    }

    drawBranch(cyl: CustomMesh) {
        // rotate model
        let modelOri = vec3.fromValues(0, 1, 0);
        if (!vec3.equals(this.turtle.orient, modelOri)) {
            let normOri = vec3.fromValues(0, 0, 0);
            vec3.cross(normOri, modelOri, this.turtle.orient);
            let rad = Math.acos(vec3.dot(this.turtle.orient, modelOri));
            cyl.rotate(rad / Deg2Rad, normOri);
        }

        cyl.translate(this.turtle.pos);
        this.treeScene.addMesh(cyl);
    }

    drawForward() {
        let cylinder = new CustomMesh(this.branch);
        cylinder.scale(1 / Math.pow(2, this.turtle.depth),
            1 / Math.pow(2, this.turtle.depth) * 5,
            1 / Math.pow(2, this.turtle.depth));
        this.drawBranch(cylinder);

        // move turtle forward
        let branchLen = cylinder.height;
        this.turtle.moveForward(branchLen);

    }

    drawBranchLeaf() {
        let upDir = vec3.fromValues(0, 1, 0);
        let theta = Math.acos(vec3.dot(this.turtle.orient, upDir));
        if (Math.abs(theta - 3.14/2) < 3.14/15*(0.5) + 3) {
            let leaf = new CustomMesh(this.leaf);
            // leaf.translate(vec3.fromValues(0, -130, 0));
            // scale model down
            leaf.scale(0.015, 0.015, 0.015);
            // randomly orients
            let oriRand = Math.random();
            leaf.rotate(360 * oriRand, vec3.fromValues(1, 0, 0));
            leaf.rotate(360 * oriRand, vec3.fromValues(0, 1, 0));
            leaf.rotate(360 * oriRand, vec3.fromValues(0, 0, 1));
            // translate leaf to turtle's position
            leaf.translate(this.turtle.pos);
            this.treeScene.addMesh(leaf);
        }
        this.drawForward();
    }

    setupDrawingRules() {
        let rules: Array<[string, any, number]> = [
            ['B', this.drawTrunk, 1],
            ['F', this.drawForward, 0.5],
            ['F', this.drawBranchLeaf, 0.5,],
            ['X', this.rotX, 0.50],
            ['X', this.rotXNeg, 0.50],
            ['Z', this.rotZ, 0.50],
            ['Z', this.rotZNeg, 0.50],
            ['Y', this.rotY, 0.50],
            ['Y', this.rotYNeg, 0.50]
        ];

        for(var i = 0; i< rules.length; i++) {
            this.drawingRules.set(rules[i][0], rules[i][1], rules[i][2]);
        }

    }

    drawTree() {
        var str = this.expandedString;
        var depth = 0;
        for (var i = 0; i < str.length; i++) {
            var c = str.charAt(i);
            if (c === '[') {
                this.turtleStack.push(new Turtle(this.turtle.pos, this.turtle.orient, depth));
                this.turtle.depth++;
            } else if (c === ']') {
                this.turtle = this.turtleStack.pop();
            }
            var drawFunc = this.drawingRules.get(c);
            drawFunc();
        }
    }

}
