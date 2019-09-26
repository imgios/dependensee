import { Output } from '@angular/core';

/**
 * RFD STRUCTURE:
 * A@number -> Y@number
 * 
 * LHS cardinality can be >= 1
 * RHS cardinality is 1
 * RHS thresholds is <= x, where x is gave as input by the user
 */

export class Rfd {
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
    
    toString = () : string => {
        return "!! RFD: " + this.lhs + this.rhs;
    }
}