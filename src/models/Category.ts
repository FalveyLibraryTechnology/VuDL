class Category {
  jobs: Array<object> = [];
  job: string;
  glob = require("glob")

    constructor(dir) {
        let job = this.job;
        let name = this.basename(dir);
        this.jobs.forEach(element => this.glob("#{dir}/*"), new Job(job));  
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
      this.jobs.map(function (job) {return this.job.raw()});

    }

    targetCollectionId() {
        return this.ini['collection']['destination'];
    }

    basename(path) {
      return path.split('/').reverse()[0];
   }
}
