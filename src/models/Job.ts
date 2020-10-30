class Job {
  dir: string;

    constructor(dir) {
      this.dir = dir;
      let name = this.basename(dir);
    }

    ingest() {

    }

    raw() {
      return name;
    }

    makeDerivatives() {

    }

    config() {

    }

    generatePdf() {

    }

    metadata() {
        
    }

    basename(path) {
      return path.split('/').reverse()[0];
   }
}

export default Job;