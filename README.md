<p align="center">
  <!-- <i>DEPENDENSEE</i>
  <br/><span>&#9783;</span> <span>&#10141;</span> :bar_chart:-->
  <img src="https://raw.githubusercontent.com/imgios/imgios.github.io/master/images/logo_dependensee.png">
  <br/><sup>Minimal relaxed functional dependencies set visualization web app</sup>
</p>

## What is Dependensee?
Dependensee is the subject of my Computer Science thesis and the idea is to build a web app that visualize a minimal set of RFDs (ndr. *relaxed functional dependencies*) extracted from a dataset (plain text file) with a given threshold. This will be done with [Ionic](https://ionicframework.com/), [Angular](https://angular.io/) and [D3.js](https://d3js.org/) for manipulating data documents.

## Development
Development-related progress can be seen in the `develop` branch. Keep reading if you want to give it a try.

### Prerequisites
- latest Node.js and npm
- Ionic v4

### Run
```bash
$ git clone https://github.com/imgios/dependensee.git
$ cd dependensee && git checkout develop
$ npm install
$ ionic serve
```

## License
Dependensee is [MIT licensed](./LICENSE).
