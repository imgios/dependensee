import { Injectable } from '@angular/core';

interface Dependence {
  constraints: Array<String>;
  rfd: String;
}

@Injectable({
  providedIn: 'root'
})

export class FileAnalyzerService {
  /**
   * YEAR@0.0,ID@2.0,SUBJECT@3.0->TITLE@0.0
   * (=>)
   * {
   *   {
   *     "constraints" : {
   *       "YEAR@0.0",
   *       "ID@2.0"
   *     },
   *     "dependence" : "SUBJECT@3.0->TITLE@0.0"
   *   }
   * }
   */
  data2JSON(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      if (file.type !== 'text/plain') {
        reject("File isn't text/plain!");
      } else {
        let reader = new FileReader();
        reader.onload = () => {
          var lines = (reader.result as String).split('\n');
          if (lines.length > 0) {
            var dependencies: Array<Dependence> = new Array<Dependence>();
            for(var lineIndex = 0; lineIndex < lines.length; lineIndex++){
              console.log(lineIndex, lines[lineIndex]);
              var lineItems = lines[lineIndex].split(",");
              let dependence: Dependence = { constraints: new Array<String>(), rfd: "" };
              for (let lineItem of lineItems) {
                if(lineItem.indexOf("->") > -1) {
                  dependence.rfd = (lineItem.indexOf("\t") > -1) ? lineItem.split("\t")[0] : lineItem;
                } else if(lineItem.indexOf("* DISCOVERED RFDs *") > -1) {
                  //do nothing, skip this item
                } else {
                  dependence.constraints.push(lineItem);
                }
              }
              dependencies.push(dependence);
            }
            console.log("DEPENDENCIES :: ", JSON.stringify(dependencies));
            resolve(JSON.stringify(dependencies));
          } else {
            reject("Unable to read the file submitted");
          }
        }
        reader.readAsText(file);
      }
    });
  }
}
