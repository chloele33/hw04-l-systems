import ExpansionRule from './ExpansionRule';
import DrawingRule from './DrawingRule';
import {Turtle, TurtleStack} from './Turtle'
import {vec3, mat4} from 'gl-matrix';

class LSystem {
    turtleStack : TurtleStack;
    expansionRules: ExpansionRule;
    drawingRules: DrawingRule;
    turtle: Turtle;

    axiom: string;
    angle: number;
    step: number;
    iterations: number;


    constructor(axiom: string, iterations: number, angle: number, step: number) {
        this.axiom = axiom;
        this.iterations = iterations;
        this.angle = angle;
        this.step = step;

        this.expansionRules = new ExpansionRule();
        this.drawingRules = new DrawingRule();

        this.turtleStack = new TurtleStack();
        this.turtle = new Turtle(vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0), 0);
    }

    expandString() : string {
        return "";
    }
}
