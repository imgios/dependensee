import { Component, OnInit } from '@angular/core';
import { AnalyzerService } from '../analyzer.service';
import { RelaxedFunctionalDependence } from '../RelaxedFunctionalDependence';
declare var d3: any;

@Component({
  selector: 'app-visualize',
  templateUrl: './visualize.page.html',
  styleUrls: ['./visualize.page.scss'],
})

export class VisualizePage implements OnInit {
  fileLogs: String = "";
  rfdSet: Array<RelaxedFunctionalDependence>;
  attributes: Array<string>;
  fileUploaded: File;
  threshold: number;

  constructor(public analyzer: AnalyzerService) { 
  }

  ngOnInit() {
  }

  setFile($event) {
    this.fileUploaded = $event.target.files[0];
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
        this.getPlots();
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

  getPlots() {
    for (let lhs of this.attributes) {
      for (let rhs of this.attributes) {
        if (lhs !== rhs) {
         let data = this.analyzer.retrieveData(this.rfdSet, lhs, rhs, this.threshold, this.attributes.length - 1);
         if (data.indexOf("[") > -1) {
           console.log("[if]", data);
           this.drawPlot(lhs, rhs, JSON.parse(data));
         }
        }
      }
    }
  }

  drawPlot(lhs, rhs, data) {
    // set the dimensions and margins of the graph
    var margin = {top: 30, right: 30, bottom: 30, left: 30},
      width = 250 - margin.left - margin.right,
      height = 250 - margin.top - margin.bottom;
    
    // append the svg object to the body of the page
    var svg = d3.select("#"+"myHeatmap")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    
    // Labels of row and columns
    var myGroups = ["0", "1", "2", "3"];
    var myVars = ["1", "2", "3"];
    
    // Build X scales and axis:
    var x = d3.scaleBand()
      .range([ 0, width ])
      .domain(myGroups)
      .padding(0.01);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
    
    // Build X scales and axis:
    var y = d3.scaleBand()
      .range([ height, 0 ])
      .domain(myVars)
      .padding(0.01);
    svg.append("g")
      .call(d3.axisLeft(y));
    
    // Build color scale
    var myColor = d3.scaleLinear()
      .range(["#e53935", "white"])
      .domain([0, this.threshold]);
    
    var borderColors = d3.scaleLinear()
        .range(["#1976d2", "white"])
        .domain([0, this.threshold]);
    
    //Read the data
    svg.selectAll()
        .data(data, function(d){return d.rhsThreshold+":"+d.cardinality})
        .enter()
        .append("rect")
        .attr("x", function(d){return x(d.rhsThreshold)})
        .attr("y", function(d){return y(d.cardinality)})
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", function(d) {return myColor(d.rhsThreshold)})
        .style("stroke-width", "5px")
        .style("stroke", function(d) {return borderColors(d.lhsThreshold)});
    // Add title to graph
    svg.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("text-anchor", "left")
            .style("font-size", "14px")
            .text(lhs + " → " + rhs);
  }
}
