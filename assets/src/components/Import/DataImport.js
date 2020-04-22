const template = `
<section>
  <div class="message">
    Zendesk is currently importing inventory records from the .csv provided.
  </div>
  <div class="progressbar">
    <strong>{{completion}}% complete</strong>
    <div class="meter">
      <span id="myBar"></span>
    </div>
    <button class="c-btn c-btn--danger c-btn--sm" @click="abort()">Cancel</button>
  </div>
</section>`;

import ZDAPI from '../../libs/ZDAPI.js';

export default {
  template,
  props: ['type','headers','records'],
  data() {
    return {
      completion: 0,
      totalProcessed: 0,
      totalRecordsToProcess: [],
      toCreate: [],
      toUpdate: [],
      batchLastIndex: 0,
      bulkImportInterval: null
    }
  },
  methods: {
  /**
   * Convert records to JSON
   * and group by action
   */
    preImport() {
      this.records.forEach(function(row, index){
        let action = null;
        let record = {};
        record.attributes = {};
        record.type = this.type.key;
        this.headers.forEach(function(header, index){
          if(header !== 'action'){
            var value = null;
            Object.keys(this.objectTypeProperties).forEach(key => {
              if(header === key){
                if(this.objectTypeProperties[key].type === 'number' 
                  || this.objectTypeProperties[key].type === 'integer'){
                  value = parseInt(row[index]);
                } else if(this.objectTypeProperties[key].type === 'boolean'){
                  value = row[index] === 'true' ? true : false;
                } else if(this.objectTypeProperties[key].type === 'string'){
                  value = row[index];
                }
              }
            });
            record.attributes[header] = value;
            if(header === 'external_id'){
              record.external_id = value;
            }
          } else {
            action = row[index].toLowerCase();
          }
        }.bind(this));
        if(action === 'create'){
          this.toCreate.push({data: record, rowIndex: index});
        } else if(action === 'update') {
          this.toUpdate.push({data: record, rowIndex: index});
        } else {
          this.writeLog(index, 'Fail', 'No or unknown value assigned to action column');
        }
      }.bind(this));
      this.totalRecordsToProcess = this.toCreate.length + this.toUpdate.length;
      if(this.toCreate.length > 0){
        this.processBulk(this.toCreate, 0, 'post');
      } else if(this.toUpdate.length > 0){
        this.processBulk(this.toUpdate, 0, 'external_id_set');
      }
    },
    async processBulk(records, initialIndex, action) {
      let importBulk = [];
      let importBulkRowIndexList = [];
      records.forEach((record, index) => {
        if (index >= initialIndex && importBulk.length < 1000) {
          importBulk.push(record.data);
          importBulkRowIndexList.push(record.rowIndex);
          this.batchLastIndex = index;
        }
      });
      const job = await ZDAPI.createJob(importBulk, action);
      this.bulkImportInterval = setInterval( () => {
        console.log('Checking job status...');
        ZDAPI.getJobStatus(job.data.id).then(jobStatus => {
          if (jobStatus.data.job_status === 'completed' || jobStatus.data.job_status === 'failed') {
            clearInterval(this.bulkImportInterval);
            this.totalProcessed = this.totalProcessed + jobStatus.data.results.length;
            this.updateProgressBar();
            const isError = jobStatus.data.results.length > 0 ? false : true;
            this.importLogger(jobStatus.data.results, importBulkRowIndexList, isError, '');
            if (this.batchLastIndex < records.length - 1) {
              this.processBulk(records, this.batchLastIndex + 1, action);
            } else {
              if (this.totalProcessed < this.totalRecordsToProcess) {
                if (action === 'post') {
                  this.processBulk(this.toUpdate, 0, 'external_id_set');
                } else {
                  this.processBulk(this.toCreate, 0, 'post');
                }
              } else {
                setTimeout(function() {
                  this.$emit('set-mode', 'import-report');
                  this.$emit('set-field-records', this.records);
                }.bind(this), 2000);
              }
            }
          }
        }).catch(error => {
          console.error(error);
          clearInterval(this.bulkImportInterval);
          this.totalProcessed = this.totalProcessed + importBulk.length;
          this.updateProgressBar();
          this.importLogger(null, importBulkRowIndexList, true, error);
        });
      }, 5000);
    },
    importLogger(results, indexList, isError, errorMessage) {
      if (!isError) {
        results.forEach((result, index) => {
          this.writeLog(
            indexList[index],
            result.success ? 'Success' : 'Fail',
            result.success ? '' : result.errors[0].title + ' ' + result.errors[0].detail
          );
        });
      } else {
        indexList.forEach(value => {
          const message = errorMessage ? errorMessage.responseText : 'API ERROR';
          this.writeLog(value, 'Fail', message);
        });
      }
    },
    writeLog(index, status, message) {
      this.records[index].push(status);
      this.records[index].push(message);
    },
    updateProgressBar() {
      const elem = document.getElementById("myBar");
      this.completion = (this.totalProcessed / this.totalRecordsToProcess) * 100;
      this.completion = Math.floor(this.completion);
      elem.style.width = this.completion + '%';
    },
    abort() {
      clearInterval(this.bulkImportInterval);
      this.$emit('set-is-aborted', true);
      this.$emit('set-mode', 'import-report');
      this.$emit('set-field-records', this.records);
    }
  },
  computed: {
    objectTypeProperties() {
      return this.type.schema.properties;
    }
  },
  created() {
    this.preImport();
  }
}