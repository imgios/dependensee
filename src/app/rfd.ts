/**
 * RFD STRUCTURE:
 * A@int, B@int* -> Y@int
 * 
 * LHS cardinality can be >= 1
 * RHS cardinality is 1
 * RHS thresholds is <= x, where x is gave as input by the user
 */

export class rfd {
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

    getRHS(): [string, number] {
        return this.rhs;
    }

    setRHS(userRHS: [string, number]) {
        this.rhs = userRHS;
    }
}