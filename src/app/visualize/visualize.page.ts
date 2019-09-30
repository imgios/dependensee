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
  threshold: number;

  constructor(public analyzer: AnalyzerService) { 
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
        this.fileLogs += "[!] Dataset stored into the structure!\n";
        console.log("\n:: RFDS ::\n", this.rfdSet);
        console.log("\n:: ATTR ::\n", this.attributes);
        this.analyzer.calculateData(this.rfdSet, "ID", "TITLE", this.threshold, this.attributes.length - 1).then((data) => {
          this.fileLogs += "[!] Data:\n" + data;
        }, (reason) => {
          this.fileLogs += "[!]" + reason + "\n";
        }).catch((exception) => {
          this.fileLogs += "[!] Error while calling the function 'calculateData'!\n";
          console.log(exception);
        });
      }, (reason) => {
        this.fileLogs += "[!] " + reason + "\n";
      }).catch((exception) => {
        this.fileLogs += "[!] Error while calling the function 'analyzeFile'!\n";
        console.log(exception);
      });
    } else {
      this.fileLogs += "[!] Invalid threshold value or file!\n";
    }
    this.fileLogs += "\n\n\n\n";
  }

}
