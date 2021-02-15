class Job {
  dir: string;
  name: string;

    constructor(dir) {
      this.dir = dir;
      this.name = this.basename(dir);
      //this.name = dir;
    }

    ingest() {

    }

    raw() {
      return this.name;
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
      return path.replace(/\/$/, "").split('/').reverse()[0];
   }
}

export default Job;