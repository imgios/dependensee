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

  calculateData(rfdSet: Array<RelaxedFunctionalDependence>, lhsAttribute: string, rhsAttribute: string, threshold: number, maxCardinality: number): Promise<any>{
    return new Promise((resolve, reject) => {
      if (typeof rfdSet === "undefined"
        || typeof lhsAttribute === "undefined"
        || typeof rhsAttribute === "undefined"
        || lhsAttribute.length < 1
        || rhsAttribute.length < 1) {
          console.log ("=>", rfdSet, lhsAttribute, rhsAttribute, threshold);
          reject("Invalid arguments passed!");
        } else {
          console.log ("=>", rfdSet, lhsAttribute, rhsAttribute, threshold);
          let data: string = '{';
          for (let i = 0; i <= threshold; i++) { // x axis
            for (let j = 1; j <= maxCardinality; j++) { // y axis
              let tempLHS: [string, number] = [lhsAttribute, Number.NEGATIVE_INFINITY];
              for (let rfd of rfdSet) {
                let rfdLHS = rfd.contains("lhs", lhsAttribute);
                let rfdRHS = rfd.contains("rhs", rhsAttribute);
                if (rfdLHS !== undefined && rfdRHS !== undefined) {
                  if (rfdLHS[1] > tempLHS[1] && rfdRHS[1] == i && rfd.getLHS().length == j) {
                    tempLHS = rfdLHS;
                  }
                }
              }
              if (tempLHS[1] > Number.NEGATIVE_INFINITY) {
                data += '"lhsThreshold":'+ tempLHS[1] + ',"rhsThreshold":' + i + ',"cardinality":' + j + ',';
              }
            }
          }
          data += '}';
          console.log(data);   
          return (data !== '{}') ? resolve(data) : reject("Data not found!");
        }
    });
  }

}
