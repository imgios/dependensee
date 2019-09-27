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
          var lines = (reader.result as String).split('\n');
          if (lines.length > 0) { // check if the file is empty
            let rfdSet: Array<RelaxedFunctionalDependence> = new Array<RelaxedFunctionalDependence>();
            let attributes: Array<String> = new Array<String>();
            let checkAttribute = (attribute: String) => {
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
}
