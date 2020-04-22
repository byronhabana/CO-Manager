const template = `
<section>
  <div class="message">
    Upload a .csv file to import into Zendesk.
  </div>
  <div class="upload-control c-txt__input u-mv">
    <div class="file_input" v-if="!hasFileSelected">
    <input type="file" id="file" ref="fileInput" @change="fileSelect">
    <div class="instructions d-flex flex-center">
      <svg viewBox="0 0 12 12" id="zd-svg-icon-12-paperclip">
        <path fill="none" stroke="currentColor" stroke-linecap="round" d="M2.5 4v4.5c0 1.7 1.3 3 3 3s3-1.3 3-3v-6c0-1.1-.9-2-2-2s-2 .9-2 2v6c0 .6.4 1 1 1s1-.4 1-1V4"></path>
      </svg>
      <i class="selectFile"><span class="u-fg-blue-600">Select file</span> or drop a file here</i> 
    </div>
    </div>
    <div class="selected_file d-flex flex-center" v-else>
      <i class="u-fg-blue-600">{{fileName}}</i>
      <svg viewBox="0 0 12 12" id="zd-svg-icon-12-x-fill" @click.stop="removeFile()">
        <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M3.5 8.5l5-5m0 5l-5-5"></path>
      </svg>
    </div>
  </div>
  <div class="action_buttons" v-show="hasFileSelected">
    <button class="c-btn c-btn--primary" @click="importFile()" :disabled="!isFileValid">Import</button>
  </div>
</section>`;

export default {
  template,
  props: ['type'],
  data() {
    return {
      file: null,
      fileName: '',
      fileFormatValid: true,
      validColumnHeaders: true,
      rows: []
    }
  },
    methods: {
      /**
       * Parse local CSV file 
       * to JSON object
       */
      parseFile() {
        Papa.parse(this.file, {
          worker: true,
          complete: function(results) {
            if(results.data){
              this.rows = results.data;
              this.validateColumnHeaders(results.data[0], results.data);
            } else {
              zdClient.notify('Selected file is empty.', 'error');
            }
          }.bind(this)  
        });
      },
      /**
       * Validate CSV column headers
       * @param {object} headers
       */
      validateColumnHeaders(headers, data) {
        let missingRequiredProperties = [];
        this.requiredProperties.forEach(requiredProperty => {
          if(headers.indexOf(requiredProperty) === -1){
            this.validColumnHeaders = false;
            missingRequiredProperties.push(requiredProperty);
          }
        });
        if(headers.indexOf('action') === -1){
          this.validColumnHeaders = false;
          missingRequiredProperties.push('action');
        }
        if(this.validColumnHeaders){
          data.shift();
          this.$emit('set-field-headers', headers);
          data.forEach(function(row){
            if(row.length < headers.length){
              for(let i = row.length; i < headers.length; i++ ){
                row.push(null);
              }
            }
          });
          this.$emit('set-field-records', data);
        } else {
          console.error(missingRequiredProperties);
          zdClient.notify(`Invalid file. Missing required field(s): ${missingRequiredProperties.join(',')}`, 'error');
        }
      },
      /**
       * Browser file upload handler
       */
      fileSelect() {
        if(this.$refs.fileInput.files.length > 0){
          this.file = this.$refs.fileInput.files[0];
          this.fileName = this.$refs.fileInput.files[0].name;
          const filenamesplit = this.file.name.split('.');
          const fileformat = filenamesplit[filenamesplit.length - 1];
          if(this.file.type == 'text/csv' || fileformat == 'csv'){
            this.parseFile();
          } else {
            zdClient.notify('Invalid file format', 'error');
          }
        } else {
          this.file = null;
          this.fileName = '';
        }
      },
      /**
       * Remove selected file
       */
      removeFile() {
        this.file = null;
        this.fileName = '';
      },
      /**
       * Start import process
       */
      importFile() {
        if(this.isFileValid){
          // this.$store.commit('setSelectedComponent','zd-data-import');
          this.$emit('set-mode', 'data-import');
        } else {
          zdClient.notify('No file or file is invalid', 'error');
        }
      }
    },
    computed: {
      hasFileSelected() {
        if(this.file){
          return true;
        }
        return false;
      },
      isFileValid() {
        return this.fileFormatValid && this.validColumnHeaders 
          && (this.rows.length > 0 && this.rows.length <= 5000 ) && this.file;
      },
      requiredProperties() {
        return Object.keys(this.type.schema).indexOf('required') > -1 ? this.type.schema.required : [];
      }
  }
}