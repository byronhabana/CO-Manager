const template = `
<div class="u-mv-lg u-1/3">
  <FileUpload 
    :type="type"
    @set-field-headers="setFileHeaders"
    @set-field-records="setFileRecords"
    @set-mode="setMode"
    v-if="mode === 'file-upload'">
  </FileUpload>
  
  <DataImport 
    :type="type"
    :headers="fileHeaders"
    :records="fileRecords"
    @set-field-records="setFileRecords"
    @set-is-aborted="setIsAborted"
    @set-mode="setMode"
    v-if="mode === 'data-import'">
  </DataImport>
  <Reporting 
    v-if="mode === 'import-report'"
    :headers="fileHeaders"
    :records="fileRecords"
    :isAborted="isAborted"
    @set-is-aborted="setIsAborted"
    @set-mode="setMode">
  </Reporting>
</div>`;

import FileUpload from './FileUpload.js';
import DataImport from './DataImport.js';
import Reporting from './Reporting.js';

export default {
  template,
  props: ['type'],
  components: {
    FileUpload,
    DataImport,
    Reporting
  },
  data() {
    return {
      fileHeaders: [],
      fileRecords: [],
      mode: 'file-upload',
      isAborted: false
    }
  },
  methods: {
    setMode(mode){
      this.mode = mode;
    },
    setFileHeaders(headers){
      this.fileHeaders = [...headers];
    },
    setFileRecords(records){
      this.fileRecords = [...records];
    },
    setIsAborted(isAborted){
      this.isAborted = isAborted;
    }
  }
}