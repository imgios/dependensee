import { Component, OnInit } from '@angular/core';
import { AnalyzerService } from '../analyzer.service';
import { RelaxedFunctionalDependence } from '../RelaxedFunctionalDependence';

@Component({
  selector: 'app-visualize',
  templateUrl: './visualize.page.html',
  styleUrls: ['./visualize.page.scss'],
})
export class VisualizePage implements OnInit {
  fileLogs: String = "";
  rfdSet: Array<RelaxedFunctionalDependence>;
  attributes: Array<String>;
  fileUploaded: File;
  threshold: Number;

  constructor(public analyzer: AnalyzerService) { 
    this.threshold = 0;
  }

  ngOnInit() {
  }

  setFile($event) {
    this.fileUploaded = $event.target.files[0];
    console.log(this.fileUploaded);
    this.fileLogs += "[!] File upload event fired\n";
    let isFile = (this.fileUploaded instanceof File) ? 'Yes' : 'No';
    this.fileLogs += "[!] Is a file? " + isFile + "\n";
    this.fileLogs += "[!] File uploaded: " + this.fileUploaded + "\n";
    this.fileLogs += "[!] File extension: ." + this.fileUploaded.name.split('.').pop() + "\n";
  }

  analyzeFile() {
    if (this.threshold >= 0 && this.fileUploaded) {
      this.fileLogs += "[!] Threshold: " + this.threshold + "\n";
      this.analyzer.analyzeFile(this.fileUploaded).then((data) => {
        this.rfdSet = data[0];
        this.attributes = data[1];
        this.fileLogs += "[!] Dataset stored into the structure!";
        console.log("\n:: RFDS ::\n", this.rfdSet);
        console.log("\n:: ATTR ::\n", this.attributes);
      }, (reason) => {
        this.fileLogs += "[!] " + reason + "\n";
      }).catch((exception) => {
        this.fileLogs += "[!] Error while calling the function 'analyzeFile'!\n";
        console.log(exception);
      });
    } else {
      this.fileLogs += "[!] Invalid thresholds value or file!\n";
    }
  }

}
