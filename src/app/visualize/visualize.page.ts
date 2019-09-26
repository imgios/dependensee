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

  constructor(public analyzer: AnalyzerService) { }

  ngOnInit() {
  }

  analyzeFile($event) {
    let fileUploaded = $event.target.files[0];
    console.log(fileUploaded);
    this.fileLogs += "[!] File upload event fired\n";
    let isFile = (fileUploaded instanceof File) ? 'Yes' : 'No';
    this.fileLogs += "[!] Is a file? " + isFile + "\n";
    this.fileLogs += "[!] File uploaded: " + fileUploaded + "\n";
    this.fileLogs += "[!] File extension: " + fileUploaded.name.split('.').pop() + "\n";
    this.analyzer.analyzeFile(fileUploaded).then((data) => {
      this.rfdSet = data;
      this.fileLogs += "[!] Dataset stored into the structure!";
      console.log("\n:: RFDS ::\n", this.rfdSet);
    }, (reason) => {
      this.fileLogs += "[!] " + reason + "\n";
    }).catch((exception) => {
      this.fileLogs += "[!] Error while calling the function 'analyzeFile'!\n";
      console.log(exception);
    });
  }

}
