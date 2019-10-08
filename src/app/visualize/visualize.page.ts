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
  hideButton: boolean;
  hideLogs: boolean;

  // set main svg dimensions and margins
  matrixMargin = {top: 30, right: 30, bottom: 30, left: 30};
  matrixWidth = 1000 + 2 * this.matrixMargin.left + 2 * this.matrixMargin.right;
  matrixHeight = 900 + 2 * this.matrixMargin.top + 2 * this.matrixMargin.bottom;

  // g plots dimensions and margins
  gMargin = {top: 15, right: 15, bottom: 15, left: 15};
  gWidth = - this.gMargin.left - this.gMargin.right;
  gHeight = - this.gMargin.top - this.gMargin.bottom;


  // graph groups and vars
  myGroups: Array<string>;
  myVars: Array<string>;

  constructor(public analyzer: AnalyzerService) {
    this.hideButton = false;
    this.hideLogs = true;
  }

  ngOnInit() {
  }

  toggleLogs(event) {
    this.hideLogs = (this.hideLogs) ? false : true;
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
        this.gWidth += (this.matrixWidth - 2*this.matrixMargin.left - 2*this.matrixMargin.right) / this.attributes.length;
        this.gHeight += (this.matrixHeight - 2*this.matrixMargin.top - 2*this.matrixMargin.bottom) / this.attributes.length;
        this.drawMatrix();
      }, (reason) => {
        this.fileLogs += "[!] " + reason + "\n";
      }).catch((exception) => {
        this.fileLogs += "[!] Error while calling the function 'analyzeFile'!\n";
        console.log(exception);
      });
    } else {
      this.fileLogs += "[!] Invalid threshold value or file!\n";
    }
  }

  plotCell(graph, data, i, j) {
    if (typeof data == 'string' && data.indexOf('Data not found') > -1) {
      // Build X scales and axis:
      var x = d3.scaleBand()
      .range([ 0, this.gWidth ])
      .domain(this.myGroups)
      .padding(0.01);
      if (i == this.attributes.length-1) {
        graph.append("g")
        .attr("transform", "translate(0," + this.gHeight + ")")
        .call(d3.axisBottom(x));
      }
      
      // Build Y scales and axis:
      var y = d3.scaleBand()
        .range([ this.gHeight, 0 ])
        .domain(this.myVars)
        .padding(0.01);
      if (j == 0) {
        graph.append("g")
        .call(d3.axisLeft(y));
      }
    } else {
      data = JSON.parse(data);
      // Color scales
      var fillColor = d3.scaleLinear()
        //.range(["#e53935", "white"])
        .range(["#b71c1c", "#ffcdd2"])
        .domain([0, this.threshold]);
      
      var borderColor = d3.scaleLinear()
          //.range(["#1976d2", "white"])
          .range(["#0d47a1", "#90caf9"])
          .domain([0, this.threshold]);

      // Build X scales and axis:
      var x = d3.scaleBand()
      .range([ 0, this.gWidth ])
      .domain(this.myGroups)
      .padding(0.01);
      if (i == this.attributes.length-1) {
        graph.append("g")
        .attr("transform", "translate(0," + this.gHeight + ")")
        .call(d3.axisBottom(x));
      }
      
      // Build Y scales and axis:
      var y = d3.scaleBand()
        .range([ this.gHeight, 0 ])
        .domain(this.myVars)
        .padding(0.01);
      if (j == 0) {
        graph.append("g")
        .call(d3.axisLeft(y));
      }

      // Attach data
      graph.selectAll()
      .data(data, function(d){return d.rhsThreshold+":"+d.cardinality})
      .enter()
      .append("rect")
      .attr("x", function(d){return x(d.rhsThreshold)})
      .attr("y", function(d){return y(d.cardinality)})
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", function(d) {console.log("\n\n::FILL COLOR::", typeof fillColor(d.rhsThreshold), fillColor(d.rhsThreshold)); return fillColor(d.rhsThreshold)})
      .style("stroke-width", "3px")
      .style("stroke", function(d) {return borderColor(d.lhsThreshold)});
    }
  }

  drawMatrix() {
    // append the svg object to the body of the page
    var svg = d3.select("#rfdHeatmap")
              .append("svg")
              .attr("width", this.matrixWidth + this.matrixMargin.left + this.matrixMargin.right)
              .attr("height", this.matrixHeight + this.matrixMargin.top + this.matrixMargin.bottom);
    
    // create matrix labels
    // RHS
    svg.append("text")
    .attr("x", this.matrixWidth/2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "800")
    .text("RHS");

    // RHS Threshold
    svg.append("text")
    .attr("x", this.matrixWidth/2)
    .attr("y", this.matrixHeight - (this.matrixMargin.bottom / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "800")
    .text("RHS Threshold");

    // LHS
    svg.append("text")
    .attr("x", -(this.matrixHeight/2))
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .style("font-size", "14px")
    .style("font-weight", "800")
    .text("LHS");

    // LHS Cardinality
    svg.append("text")
    .attr("x", (this.matrixHeight/2))
    .attr("y", -(this.matrixWidth-30))
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(90)")
    .style("font-size", "14px")
    .style("font-weight", "800")
    .text("LHS Cardinality");

    // Attributes Labels
    var xOffset = this.matrixMargin.left + this.gWidth;
    var xOffsetRotate = -(this.matrixMargin.top + this.gHeight);
    //console.log(xOffset, xOffsetRotate);
    for (let attribute of this.attributes) {
      if (this.attributes.indexOf(attribute) > 0) {
        xOffset += this.gWidth + this.matrixMargin.left;
      }
      svg.append("text")
      .attr("x", xOffset)
      .attr("y", this.matrixMargin.top + ((this.matrixMargin.top * 2)/3))
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .text(attribute);
      if (this.attributes.indexOf(attribute) > 0) {
        xOffsetRotate -= this.gHeight + this.matrixMargin.top;
      }
      svg.append("text")
      .attr("x", xOffsetRotate)
      .attr("y", this.matrixMargin.top + (this.matrixMargin.top/2))
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .text(attribute);
    }

    // Labels of row and columns
    this.myGroups = new Array<string>();
    this.myVars = new Array<string>();
    for (let i = 0; i <= this.threshold; i++) {
      this.myGroups[i] = ""+i;
    }
    for (let i = 0; i < this.attributes.length - 1; i++) {
      this.myVars[i] = ""+(i+1);
    }

    // Draw Matrix Cells
    let rowOffset = 0, columnOffset = 0;
    for (let i = 0; i < this.attributes.length; i++) {
      rowOffset = (i == 0) ? 0 : rowOffset + (this.gHeight + this.gMargin.top + this.gMargin.bottom);
      for (let j = 0; j < this.attributes.length; j++) {
        columnOffset = (j == 0) ? 0 : columnOffset + (this.gWidth + this.gMargin.left + this.gMargin.right);
        // Append the g graph (A->B graph)
        var graph = svg.append("g")
        .attr("transform","translate(" + (this.gMargin.left+columnOffset+2*this.matrixMargin.left) + "," + (this.gMargin.top+rowOffset+2*this.matrixMargin.bottom) + ")");
        if (i != j) {
          //console.log(this.attributes[i], this.attributes[j]);
          let rfdData = this.analyzer.retrieveData(this.rfdSet, this.attributes[i], this.attributes[j], this.threshold, this.attributes.length - 1);
          this.plotCell(graph, rfdData, i, j);
        } else {
          if (i == this.attributes.length - 1) {
            // Build X scales and axis
            var x = d3.scaleBand()
            .range([ 0, this.gWidth ])
            .domain(this.myGroups)
            .padding(0.01);
            graph.append("g")
            .attr("transform", "translate(0," + this.gHeight + ")")
            .call(d3.axisBottom(x));
          }
          if (j == 0) {
            // Build Y scales and axis
            var y = d3.scaleBand()
            .range([ this.gHeight, 0 ])
            .domain(this.myVars)
            .padding(0.01);
            graph.append("g")
            .call(d3.axisLeft(y));
          }
          graph.append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", this.gWidth)
                .attr("y2", this.gHeight)
                .attr("stroke-width", 2)
                .attr("stroke", "black");
        }
      }
    }
    this.hideButton = true;
    this.fileLogs += "[!] Plots generated!\n";
  }
}
