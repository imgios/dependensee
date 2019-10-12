import { Injectable } from '@angular/core';
import { RelaxedFunctionalDependence } from './RelaxedFunctionalDependence';

@Injectable({
  providedIn: 'root'
})
export class AnalyzerService {

  constructor() { }

  analyzeFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      if (file.type !== 'text/plain') {
        reject("Format not supported!")
      } else {
        let reader = new FileReader();
        reader.onload = () => {
          var lines = (reader.result as string).split('\n');
          if (lines.length > 0) { // check if the file is empty
            let rfdSet: Array<RelaxedFunctionalDependence> = new Array<RelaxedFunctionalDependence>();
            let attributes: Array<string> = new Array<string>();
            let checkAttribute = (attribute: string) => {
              if (attributes.indexOf(attribute) < 0) {
                attributes.push(attribute);
              }
            }
            for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
              if (lines[lineIndex].indexOf("@") > -1) { // check if the line is a RFD
                let rfd: RelaxedFunctionalDependence = new RelaxedFunctionalDependence(new Array<[string, number]>(), undefined);
                let lineItem = lines[lineIndex].split(",");
                for (let item of lineItem) {
                  if (item.indexOf("->") > -1) {
                    let splitted = item.split('->');
                    let lhs = splitted[0].split("@");
                    let rhs = splitted[1].split("@");
                    rfd.pushAttribute([lhs[0], parseFloat(lhs[1])]);
                    rfd.setRHS([rhs[0], parseFloat(rhs[1])]);
                    checkAttribute(lhs[0]);
                    checkAttribute(rhs[0]);
                  } else if (item.indexOf("@") > -1) {
                    let lhs = item.split("@");
                    rfd.pushAttribute([lhs[0], parseFloat(lhs[1])]);
                    checkAttribute(lhs[0]);
                  }
                }
                rfdSet.push(rfd); 
              }
            }
            resolve([rfdSet, attributes.sort()]);
          } else {
            reject("Unable to read the file submitted!");
          }
        }
        reader.readAsText(file);
      }
    })
  }

  // METHOD THAT DOESN'T PROPAGATE DATA
  // retrieveData(rfdSet: Array<RelaxedFunctionalDependence>, lhsAttribute: string, rhsAttribute: string, maxThreshold: number, maxCardinality: number): string {
  //   if (typeof rfdSet === "undefined"
  //   || typeof lhsAttribute === "undefined"
  //   || typeof rhsAttribute === "undefined"
  //   || lhsAttribute.length < 1
  //   || rhsAttribute.length < 1) {
  //     console.log ("=>", rfdSet, lhsAttribute, rhsAttribute, maxThreshold);
  //     return "Invalid arguments passed!";
  //   } else {
  //     console.log ("=>", rfdSet, lhsAttribute, rhsAttribute, maxThreshold);
  //     let data: string = '[';
  //     let empty: boolean = true;
  //     for (let i = 0; i <= maxThreshold; i++) { // x axis
  //       for (let j = 1; j <= maxCardinality; j++) { // y axis
  //         let tempLHS: [string, number] = [lhsAttribute, Number.NEGATIVE_INFINITY];
  //         for (let rfd of rfdSet) {
  //           let rfdLHS = rfd.contains("lhs", lhsAttribute);
  //           let rfdRHS = rfd.contains("rhs", rhsAttribute);
  //           if (rfdLHS !== undefined && rfdRHS !== undefined) {
  //             if (rfdLHS[1] > tempLHS[1] && rfdLHS[1] <= maxThreshold && rfdRHS[1] == i && rfd.getLHS().length == j) {
  //               tempLHS = rfdLHS;
  //             }
  //           }
  //         }
  //         if (tempLHS[1] > Number.NEGATIVE_INFINITY) {
  //           data = (empty) ? data : data + ',';
  //           data += '{"lhsThreshold":'+ tempLHS[1] + ',"rhsThreshold":' + i + ',"cardinality":' + j + "}";
  //           empty = false;
  //         }
  //       }
  //     }
  //     data += ']';
  //     return (data !== '[]') ? data : "Data not found!";
  //   }
  // }

  retrieveData(rfdSet: Array<RelaxedFunctionalDependence>, lhsAttribute: string, rhsAttribute: string, maxThreshold: number, maxCardinality: number): string {
    if (typeof rfdSet === "undefined"
    || typeof lhsAttribute === "undefined"
    || typeof rhsAttribute === "undefined"
    || lhsAttribute.length < 1
    || rhsAttribute.length < 1) {
      //console.log ("=>", rfdSet, lhsAttribute, rhsAttribute, maxThreshold);
      return "Invalid arguments passed!";
    } else { // args ok
      let data: string = '[';
      let rfdMatrix: {lhsThreshold: number}[][] = [];
      // initialize matrix
      for (let i = 0; i <= maxThreshold; i++) {
        rfdMatrix[i] = [];
        for (let j = 1; j <= maxCardinality; j++) {
          rfdMatrix[i][j] = {lhsThreshold: Number.NEGATIVE_INFINITY};
        }
      }
      // once we have initialized the matrix, we start analyzing the set
      for (let i = 0; i <= maxThreshold; i++) { // x axis
        for (let j = 1; j <= maxCardinality; j++) { // y axis
          let tempLHS: number = Number.NEGATIVE_INFINITY;
          for (let item of rfdSet) {
            let rfdLHS = item.contains("lhs", lhsAttribute); // check if the dependence contains the lhsAttribute on the left-hand-side
            let rfdRHS = item.contains("rhs", rhsAttribute); // check if the dependence contains the rhsAttribute on the right-hand-side
            if (rfdLHS !== undefined && rfdRHS !== undefined) { // dependence contains (lhs/rhs)Attributes
              if (rfdLHS[1] > tempLHS && rfdLHS[1] <= maxThreshold && rfdRHS[1] == i && item.getLHS().length == j) {
                tempLHS = rfdLHS[1];
              }
            }
          }
          if (tempLHS == Number.NEGATIVE_INFINITY) { // rfd not found
            if (i == 0 && j > 1) { // Threshold = 0 & Cardinality > 1
              tempLHS = (rfdMatrix[i][j-1].lhsThreshold != Number.NEGATIVE_INFINITY) ? rfdMatrix[i][j-1].lhsThreshold : tempLHS; // copying the value from the cell below
            } else if (i > 0 && j == 1) { // Threshold > 0 & Cardinality = 1
              tempLHS = (rfdMatrix[i-1][j].lhsThreshold != Number.NEGATIVE_INFINITY) ? rfdMatrix[i-1][j].lhsThreshold : tempLHS; // copying the value from the cell on the left side
            } else if (i > 0 && j > 1) {
              tempLHS = (rfdMatrix[i-1][j].lhsThreshold > rfdMatrix[i][j-1].lhsThreshold) ? rfdMatrix[i-1][j].lhsThreshold : rfdMatrix[i][j-1].lhsThreshold;
            }
          }
          rfdMatrix[i][j].lhsThreshold = tempLHS;
        }
      }
      // printing data
      let empty: boolean = true;
      for (let i = 0; i <= maxThreshold; i++) {
        for (let j = 1; j <= maxCardinality; j++) {
          let lhsInfinity = (rfdMatrix[i][j].lhsThreshold != Number.NEGATIVE_INFINITY) ? rfdMatrix[i][j].lhsThreshold : '"-Infinity"';
          data = (empty) ? data : data + ',';
          data += '{"lhsThreshold":'+ lhsInfinity + ',"rhsThreshold":' + i + ',"cardinality":' + j + "}";
          empty = false;
        }
      }
      data += ']';
      console.log(data);
      return (data !== '[]') ? data : "Data not found!";
    } // end if-else
  }
}
