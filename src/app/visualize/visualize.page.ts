import { Component, OnInit } from '@angular/core';
import { AnalyzerService } from '../analyzer.service';
import { RelaxedFunctionalDependence } from '../RelaxedFunctionalDependence';
import { ToastController, LoadingController } from '@ionic/angular';
declare var d3: any;
declare var svgPanZoom: any;

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
  loader: any;

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

  constructor(public analyzer: AnalyzerService, public toastCtrl: ToastController, public loadingCtrl: LoadingController) {
    this.hideButton = false;
    this.hideLogs = true;
  }

  ngOnInit() {
  }

  async presentToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }

  async dismissLoading() {
    return await this.loader.dismiss();
  }

  async presentLoading(msg: string) {
    this.loader = await this.loadingCtrl.create({
      message: msg
    });
    return await this.loader.present();
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
        this.presentLoading("Processing data..").then(() => {
          this.drawMatrix();
          this.dismissLoading();
        })
      }, (reason) => {
        this.fileLogs += "[!] " + reason + "\n";
      }).catch((exception) => {
        this.fileLogs += "[!] Error while calling the function 'analyzeFile'!\n";
        this.presentToast("Error while analyzing the dataset. Please, try again.");
        console.log(exception);
      });
    } else {
      this.fileLogs += "[!] Invalid threshold value or file!\n";
      this.presentToast("Invalid threshold value or file! Please, try again.");
    }
  }

  plotCell(graph, data, i, j) {
    if (typeof data == 'string' && data.indexOf('Data not found') > -1) {
      // Build X scales and axis:
      var x = d3.scaleBand()
      .range([ 0, this.gWidth ])
      .domain(this.myGroups)
      .padding(0.5);
      if (i == this.attributes.length-1) {
        graph.append("g")
        .attr("transform", "translate(0," + this.gHeight + ")")
        .call(d3.axisBottom(x));
      }
      
      // Build Y scales and axis:
      var y = d3.scaleBand()
        .range([ this.gHeight, 0 ])
        .domain(this.myVars)
        .padding(0.5);
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
      .padding(0.1);
      if (i == this.attributes.length-1) {
        graph.append("g")
        .attr("transform", "translate(0," + this.gHeight + ")")
        .call(d3.axisBottom(x));
      }
      
      // Build Y scales and axis:
      var y = d3.scaleBand()
        .range([ this.gHeight, 0 ])
        .domain(this.myVars)
        .padding(0.1);
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
      .style("fill", function(d) {
        if (typeof d.lhsThreshold == "string" && d.lhsThreshold.indexOf("-Infinity") > -1) {
          return d3.rgb(149, 149, 149);
        } else {
          return fillColor(d.rhsThreshold);
        }
      })
      .style("stroke-width", "4px")
      .style("stroke", function(d) {
        if (typeof d.lhsThreshold == "string" && d.lhsThreshold.indexOf("-Infinity") > -1) {
          return d3.rgb(149, 149, 149);
        } else {
          return borderColor(d.lhsThreshold);
        }
      });
    }
  }

  drawMatrix() {
    // Append the svg object to the body of the page
    var svg = d3.select("#rfdHeatmap")
              .append("svg")
              .attr("width", this.matrixWidth + this.matrixMargin.left + this.matrixMargin.right)
              .attr("height", this.matrixHeight + this.matrixMargin.top + this.matrixMargin.bottom)
              .attr("id", "svgGenerated");

    // Append defs to the svg
    var defs = svg.append("defs");

    // Append legend gradients to defs
    var rhsGradient = defs.append("linearGradient")
                        .attr("id", "rhsGradient");
    var lhsGradient = defs.append("linearGradient")
                        .attr("id", "lhsGradient");
    // RHS Gradient
    rhsGradient.attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");
    rhsGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#b71c1c");
    rhsGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#ffcdd2");
    //LHS Gradient
    lhsGradient.attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");
    lhsGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#0d47a1");
    lhsGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#90caf9");

    // Create matrix labels
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

    // Legend RHS
    svg.append("text")
    .attr("x", this.matrixMargin.left)
    .attr("y", this.matrixHeight + (this.matrixMargin.top/3))
    .attr("font-size", "14px")
    .text("RHS Threshold 0");
    svg.append("rect")
    .attr("x", this.matrixMargin.left + 110)
    .attr("y", this.matrixHeight + (this.matrixMargin.top/3) - 15)
    .attr("width", 60)
    .attr("height", 20)
    .attr("fill", "url(#rhsGradient)")
    .attr("stroke", d3.rgb(0, 0, 0))
    .attr("stroke-width", 1);
    svg.append("text")
    .attr("x", this.matrixMargin.left + 175)
    .attr("y", this.matrixHeight + (this.matrixMargin.top/3))
    .attr("font-size", "14px")
    .text(this.threshold);
    // Legend LHS
    svg.append("text")
    .attr("x", this.matrixMargin.left)
    .attr("y", this.matrixHeight + this.matrixMargin.top)
    .attr("font-size", "14px")
    .text("LHS Threshold 0");
    svg.append("rect")
    .attr("x", this.matrixMargin.left + 110)
    .attr("y", this.matrixHeight + this.matrixMargin.top - 15)
    .attr("width", 60)
    .attr("height", 20)
    .attr("fill", "url(#lhsGradient)")
    .attr("stroke", d3.rgb(0, 0, 0))
    .attr("stroke-width", 1);
    svg.append("text")
    .attr("x", this.matrixMargin.left + 175)
    .attr("y", this.matrixHeight + this.matrixMargin.top)
    .attr("font-size", "14px")
    .text(this.threshold);

    // Matrix Container
    svg.append("rect")
    .attr("x", this.matrixMargin.left)
    .attr("y", this.matrixMargin.top)
    .attr("width", ((this.gWidth + this.matrixMargin.left) * this.attributes.length) + this.matrixMargin.left)
    .attr("height", ((this.gHeight + this.matrixMargin.bottom + 1.5) * this.attributes.length) + this.matrixMargin.bottom)
    .attr("fill", d3.rgb(235, 235, 235))
    .attr("stroke", d3.rgb(0, 0, 0))
    .attr("stroke-width", 1);

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
      .text(function(){
        if (attribute.length > 13) { // if the attribute is too long to display it gets truncated
          return attribute.substring(0, 11) + "..";
        } else {
          return attribute;
        }
      });
      if (this.attributes.indexOf(attribute) > 0) {
        xOffsetRotate -= this.gHeight + this.matrixMargin.top;
      }
      svg.append("text")
      .attr("x", xOffsetRotate)
      .attr("y", this.matrixMargin.top + (this.matrixMargin.top/2))
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .text(function(){
        if (attribute.length > 13) { // if the attribute is too long to display it gets truncated
          return attribute.substring(0, 11) + "..";
        } else {
          return attribute;
        }
      });
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
            .padding(0.1);
            graph.append("g")
            .attr("transform", "translate(0," + this.gHeight + ")")
            .call(d3.axisBottom(x));
          }
          if (j == 0) {
            // Build Y scales and axis
            var y = d3.scaleBand()
            .range([ this.gHeight, 0 ])
            .domain(this.myVars)
            .padding(0.1);
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
    // SVG Zoom
    svgPanZoom("#svgGenerated", {
      zoomEnabled: true,
      controlIconsEnabled: true,
      fit: true,
      center: true,
    });
    this.fileLogs += "[!] Plots generated!\n";
    this.presentToast("Plots generated, check it below.");
  }
}
