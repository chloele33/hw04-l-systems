class ExpansionRule {

    expMap: Map<string, Set<Map<string, number>>>; // string mapping to a set of string and probability pairs

    constructor() {
        this.expMap = new Map<string, Set<Map<string, number>>>();
    }

    expand(str: string) : string {
        if (!this.expMap.has(str)) {
            return "";
        } else {
            var xi: number = Math.random();
            var result : string;
            var ruleSet = this.expMap.get(str);
            var sumProb = 0.0;
            // iterate through the set
            for (var it = ruleSet.values(), currPair= null; currPair=it.next().value; ) {
                var stringKey = currPair.keys().next().value;
                var p = currPair.get(stringKey);
                if (xi > sumProb && xi <= sumProb + p) {
                    result = stringKey;
                }
                sumProb += p;
            }
            return result;

        }
    }

    // adds to the expansion rule, mapping from the original to the new string with a probability
    set(oriStr: string, newStr: string, prob: number) {
        if(this.expMap.has(oriStr)){
            this.expMap.get(oriStr).add(new Map<string, number>().set(newStr, prob)); // override previous rule
        }
        else{
            var newRule = new Map<string, number>().set(newStr, prob);
            var newSet = new Set<Map<string, number>>();
            newSet.add(newRule);
            this.expMap.set(oriStr, newSet);
        }

    }
}

export default ExpansionRule;