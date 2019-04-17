import { Component } from '@angular/core';
import { FileAnalyzerService } from '../file-analyzer.service';

@Component({
  selector: 'app-visualize',
  templateUrl: './visualize.page.html',
  styleUrls: ['./visualize.page.scss'],
})
export class VisualizePage {
  fileDebug: string = "Nothing to analyze."

  constructor(public fileAnalyzer: FileAnalyzerService) {
    //empty
  }

  analyzeFile($event) {
    let fileUploaded = $event.target.files[0];
    console.log('FILE UPLOAD EVENT: ', $event);
    console.log('FILE UPLOADED: ', fileUploaded);
    console.log ('FILE TYPE: ', fileUploaded instanceof File);
    this.fileAnalyzer.data2JSON(fileUploaded).then((data) => {
      this.fileDebug = JSON.stringify(data);
    }, (reason) => {
      this.fileDebug = reason;
    }).catch((exception) => {
      this.fileDebug = "Error while calling the function 'data2JSON'!";
    });
  }
}
