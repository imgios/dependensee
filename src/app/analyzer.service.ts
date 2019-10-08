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

  retrieveData(rfdSet: Array<RelaxedFunctionalDependence>, lhsAttribute: string, rhsAttribute: string, maxThreshold: number, maxCardinality: number): string {
    if (typeof rfdSet === "undefined"
    || typeof lhsAttribute === "undefined"
    || typeof rhsAttribute === "undefined"
    || lhsAttribute.length < 1
    || rhsAttribute.length < 1) {
      console.log ("=>", rfdSet, lhsAttribute, rhsAttribute, maxThreshold);
      return "Invalid arguments passed!";
    } else {
      console.log ("=>", rfdSet, lhsAttribute, rhsAttribute, maxThreshold);
      let data: string = '[';
      let empty: boolean = true;
      for (let i = 0; i <= maxThreshold; i++) { // x axis
        for (let j = 1; j <= maxCardinality; j++) { // y axis
          let tempLHS: [string, number] = [lhsAttribute, Number.NEGATIVE_INFINITY];
          for (let rfd of rfdSet) {
            let rfdLHS = rfd.contains("lhs", lhsAttribute);
            let rfdRHS = rfd.contains("rhs", rhsAttribute);
            if (rfdLHS !== undefined && rfdRHS !== undefined) {
              if (rfdLHS[1] > tempLHS[1] && rfdLHS[1] <= maxThreshold && rfdRHS[1] == i && rfd.getLHS().length == j) {
                tempLHS = rfdLHS;
              }
            }
          }
          if (tempLHS[1] > Number.NEGATIVE_INFINITY) {
            data = (empty) ? data : data + ',';
            data += '{"lhsThreshold":'+ tempLHS[1] + ',"rhsThreshold":' + i + ',"cardinality":' + j + "}";
            empty = false;
          }
        }
      }
      data += ']';
      return (data !== '[]') ? data : "Data not found!";
    }
  }

  retrieveNewData(rfdSet: Array<RelaxedFunctionalDependence>, lhsAttribute: string, rhsAttribute: string, maxThreshold: number, maxCardinality: number): string {
    if (typeof rfdSet === "undefined"
    || typeof lhsAttribute === "undefined"
    || typeof rhsAttribute === "undefined"
    || lhsAttribute.length < 1
    || rhsAttribute.length < 1) {
      //console.log ("=>", rfdSet, lhsAttribute, rhsAttribute, maxThreshold);
      return "Invalid arguments passed!";
    } else {
      //console.log ("=>", rfdSet, lhsAttribute, rhsAttribute, maxThreshold);
      let data: string = '[';
      let rfdArray: {lhsThreshold: number, rhsThreshold: number, cardinality: number}[][] = [];
      // initialize array
      for (let i = 0; i <= maxThreshold; i++) {
        rfdArray[i] = [];
        for (let j = 1; j <= maxCardinality; j++) {
          rfdArray[i][j] = {
            lhsThreshold: Number.NEGATIVE_INFINITY, 
            rhsThreshold: Number.NEGATIVE_INFINITY, 
            cardinality: Number.NEGATIVE_INFINITY};
        }
      }
      let empty: boolean = true;
      console.log(lhsAttribute, rhsAttribute);
      for (let i = 0; i <= maxThreshold; i++) { // x axis
        for (let j = 1; j <= maxCardinality; j++) { // y axis
          let tempRFD: [number, number] = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY]; // lhsThreshold, rhsThreshold
          let found: boolean = false;
          for (let rfd of rfdSet) {
            let rfdLHS = rfd.contains("lhs", lhsAttribute);
            let rfdRHS = rfd.contains("rhs", rhsAttribute);
            if (rfdLHS !== undefined && rfdRHS !== undefined) {
              if (rfdLHS[1] > tempRFD[0] && rfdLHS[1] <= maxThreshold && rfdRHS[1] == i && rfd.getLHS().length == j) {
                tempRFD[0] = rfdLHS[1];
                tempRFD[1] = rfdRHS[1];
                found = true;
              }
            }
          }
          if (!found) {
            if (i == 0 && j > 1) { // first column
              tempRFD[0] = rfdArray[i][j-1].lhsThreshold;
              tempRFD[1] = rfdArray[i][j-1].rhsThreshold;
            } else if (i > 0 && j == 1) { // first row
              tempRFD[0] = rfdArray[i-1][j].lhsThreshold;
              tempRFD[1] = rfdArray[i-1][j].rhsThreshold + 1;
            } else if (i > 0 && j > 1) { // middle
              if (rfdArray[i-1][j].lhsThreshold > rfdArray[i][j-1].lhsThreshold) {
                tempRFD[0] = rfdArray[i-1][j].lhsThreshold;
                tempRFD[1] = rfdArray[i-1][j].rhsThreshold + 1;
              } else {
                tempRFD[0] = rfdArray[i][j-1].lhsThreshold;
                tempRFD[1] = rfdArray[i][j-1].rhsThreshold;
              }
            }
          }
          rfdArray[i][j] = {
            lhsThreshold: tempRFD[0],
            rhsThreshold: tempRFD[1],
            cardinality: j
          };
        }
      }
      for (let i = 0; i <= maxThreshold; i++) {
        for (let j = 1; j <= maxCardinality; j++) {
          if (rfdArray[i][j].lhsThreshold != Number.NEGATIVE_INFINITY) {
            data = (empty) ? data : data + ',';
            data += '{"lhsThreshold":'+ rfdArray[i][j].lhsThreshold + ',"rhsThreshold":' + rfdArray[i][j].rhsThreshold + ',"cardinality":' + rfdArray[i][j].cardinality + "}";
            empty = false;
          }
        }
      }
      data += ']';
      console.log(data);
      return (data !== '[]') ? data : "Data not found!";
    }
  }

}
