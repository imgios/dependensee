import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-visualize',
  templateUrl: './visualize.page.html',
  styleUrls: ['./visualize.page.scss'],
})
export class VisualizePage implements OnInit {
  fileLogs: String = "";

  constructor() { }

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
  }

}
