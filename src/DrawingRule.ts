export default class DrawingRule {
    drawingMap: Map<string, Map<number, any>>;
    constructor () {
        this.drawingMap = new Map<string, Map<number, any>>()
    }

    get(str: string): any {
        if (!this.drawingMap.has(str)) {
            return void{};
        } else {
            var rule = this.drawingMap.get(str);
            var sumProb = 0.0;
            var xi = Math.random()
            var func: any;
            for (const [p, f] of rule.entries()) {
                if (xi > sumProb && xi <= sumProb + p) {
                    func = f;
                    break;
                }
                sumProb += p;
            }
            return func;
        }
    }

    set(str: string, func: any, prob: number) {
        if (this.drawingMap.has(str)) {
            this.drawingMap.get(str).set(prob, func);
        } else {
            this.drawingMap.set(str, new Map<number, any>().set(prob, func));
        }
    }

}

