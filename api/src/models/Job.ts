import { fstat, openSync, closeSync, existsSync as fileExists } from 'fs';
import JobMetadata from './JobMetadata';
import ImageFile from './ImageFile';
import { Queue } from 'bullmq';

class Job {
  dir: string;
  name: string;
  _metadata: JobMetadata = null;

    constructor(dir) {
      this.dir = dir;
      this.name = this.basename(dir);
    }

    ingest() {
      const metadata = new JobMetadata(this);
      const lockfile = metadata.ingestLockfile(this);
    }

    raw() {
      return this.name;
    }

    getImage(fileName: string) {
      return new ImageFile(this.dir + "/" + fileName);
    }

    makeDerivatives() {
      const status = this.metadata.derivativeStatus;
      const lockfile = this.metadata.derivativeLockfile;

      if (status.expected > status.processed && !fileExists(lockfile)){
        closeSync(openSync(lockfile, 'w'));
        const q = new Queue("vudl");
        q.add('derivatives', {dir: this.dir});
      }
    }

    config() {
      const con = require('./Config');
      const config = con.getInstance(); 
      console.log(config.message);   // Prints out: 'I am an instance'
      config.message = 'Foo Bar';    // Overwrite message property
      const instance = config.getInstance();
      console.log(instance.message); // Prints out: 'Foo Bar' 
    }

    generatePdf() {

    }

    get metadata(){
      if (this._metadata === null) {
        this._metadata = new JobMetadata(this);
      }
      return this._metadata;
    }

    basename(path) {
      return path.replace(/\/$/, "").split('/').reverse()[0];
   }
}

export default Job;