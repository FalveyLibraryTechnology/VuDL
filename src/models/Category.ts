import Job from './Job';

class Category {
  jobs: Array<Job> = [];
  name: string;
  glob = require("glob");

    constructor(dir) {
        this.name = this.basename(dir);
        this.jobs = this.glob.sync(dir + "/*/").map(function(dir: string){ return new Job(dir)});  
    }

    ini() {
        let fs = require('fs'), ini = require('ini');
        let config = ini.parse(fs.readFileSync("#{dir}\batch-params.ini", 'utf-8'))
        return config;
    }

    supportsOcr() {
      return this.ini['ocr']['ocr'] && this.ini['ocr']['ocr'].tr(" '\"", "") != "false";
    }

    supportsPdfGeneration() {
      return this.ini['pdf']['generate'] && this.ini['pdf']['generate'].tr(" '\"", "") != "false";
    }

    raw() {
      return { category: this.name, jobs: this.jobs.map(function (job: Job) {return job.raw()}) };
    }

    targetCollectionId() {
        return this.ini['collection']['destination'];
    }

    basename(path) {
      return path.split('/').reverse()[0];
   }
}

export default Category;