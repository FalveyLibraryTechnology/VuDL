import JobMetadata from './JobMetadata';

class Job {
  dir: string;
  name: string;

    constructor(dir) {
      this.dir = dir;
      this.name = this.basename(dir);
      //this.name = dir;
    }

    ingest() {
      var metadata = new JobMetadata(this);
      var lockfile = metadata.ingestLockfile(this);
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

    metadata(raw) {
      return new JobMetadata(this);
        
    }

    basename(path) {
      return path.replace(/\/$/, "").split('/').reverse()[0];
   }
}

export default Job;