export default class ExpansionRule {

    expMap: Map<string, Array<[string, number]>>; // string mapping to a set of string and probability pairs

    constructor() {
        this.expMap = new Map<string, Array<[string, number]>>();
    }

    expand(str: string) : string {
        if (!this.expMap.has(str)) {
            return "";
        } else {
            var xi: number = Math.random();
            var result : string;
            var ruleArray = this.expMap.get(str);
            var sumProb = 0.0;
            // iterate through the set
            for (const [s, p] of ruleArray) {
                if (xi > sumProb && xi <= sumProb + p) {
                    result = s;
                    break;
                }
                sumProb += p;
            }
            return result;
        }
    }

    // adds to the expansion rule, mapping from the original to the new string with a probability
    set(oriStr: string, newStr: string, prob: number) {
        if(this.expMap.has(oriStr)){
            this.expMap.get(oriStr).push([newStr, prob]); // override previous rule
        }
        else{
            var newRule : Array<[string, number]> = [[newStr, prob]];
            this.expMap.set(oriStr, newRule);
        }

    }
}
