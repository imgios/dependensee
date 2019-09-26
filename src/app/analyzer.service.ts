import { Injectable } from '@angular/core';
import { Rfd } from './rfd';

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
            let rfdSet: Array<Rfd> = new Array<Rfd>();
            for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
              if (lines[lineIndex].indexOf("@") > -1) { // check if the line is a RFD
                let rfd: Rfd = new Rfd(new Array<[string, number]>(), undefined);
                let lineItem = lines[lineIndex].split(",");
                for (let item of lineItem) {
                  if (item.indexOf("->") > -1) {
                    let splitted = item.split('->');
                    let lhs = splitted[0].split("@");
                    let rhs = splitted[1].split("@");
                    rfd.pushAttribute([lhs[0], parseFloat(lhs[1])]);
                    rfd.setRHS([rhs[0], parseFloat(rhs[1])]);
                  } else if (item.indexOf("@") > -1) {
                    let lhs = item.split("@");
                    rfd.pushAttribute([lhs[0], parseFloat(lhs[1])]);
                  }
                }
                rfdSet.push(rfd); 
              }
            }
            resolve(rfdSet);
          } else {
            reject("Unable to read the file submitted!");
          }
        }
        reader.readAsText(file);
      }
    })
  }
}
