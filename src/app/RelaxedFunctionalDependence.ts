import { Output } from '@angular/core';

/**
 * RFD STRUCTURE:
 * A@number -> Y@number
 * 
 * LHS cardinality can be >= 1
 * RHS cardinality is 1
 * RHS thresholds is <= x, where x is gave as input by the user
 */

export class RelaxedFunctionalDependence {
    private lhs: Array<[string, number]>;
    private rhs: [string, number];

    constructor(userLHS: Array<[string, number]>, userRHS: [string, number]) {
        this.lhs = userLHS;
        this.rhs = userRHS;
    }

    getLHS(): Array<[string, number]> {
        return this.lhs;
    }

    setLHS(userLHS: Array<[string, number]>) {
        this.lhs = userLHS;
    }

    pushAttribute(attribute: [string, number]) {
        this.lhs.push(attribute);
    }

    removeAttribute(attribute: [string, number]): number {
        const index = this.lhs.indexOf(attribute, 0);
        if (index > -1) {
            this.lhs.splice(index, 1);
            return 1; 
        } else {
            return 0;
        }
    }

    getRHS(): [string, number] {
        return this.rhs;
    }

    setRHS(userRHS: [string, number]) {
        this.rhs = userRHS;
    }

    contains(hs: string, attribute: string): [string, number] {
        switch(hs) {
            case "lhs":
                for (let item of this.lhs) {
                    if (item[0].toLowerCase() === attribute.toLowerCase()) {
                        return item;
                    }
                }
                break;
            case "rhs":
                if (this.rhs[0].toLowerCase() === attribute.toLowerCase()) {
                    return this.rhs;
                }
                break;
            default:
                console.log("Error: hand side undefined!");
                return undefined;
        }
        console.log("RFD doesn't contains " + attribute + "!");
        return undefined;
    }
    
    toString = () : string => {
        return "!! RFD: " + this.lhs + this.rhs;
    }
}