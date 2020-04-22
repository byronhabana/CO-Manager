const template = `
<div class="u-mh-lg">
  <PulseLoader
    class="fill-center u-m-lg"
    color="#1f73b7"
    v-if="isAppLoading">
  </PulseLoader>
  <div v-else>
    <div class="d-flex flex-align-center">
      <ObjectTypeSelector
        :label="'Object Types'"
        :options="objectTypes" 
        :selectedOption="selectedObjectType"
        @select-type="setSelectedObjectType">
      </ObjectTypeSelector>

      <section class="u-m" v-if="selectedObjectType">
        <label class="u-f u-bold">Actions</label>
        <div class="d-flex u-mt-xs action-buttons u-fg-blue-600">
          <div class="c-tab__list__item u-mr-sm"
            @click="isImport = false" :class="{'is-selected': !isImport}">
            View Records
          </div>
          <div class="c-tab__list__item u-fg-blue-600 u-mr-sm"
            @click="isImport = true" :class="{'is-selected': isImport}">
            Bulk Import
          </div>
          <button class="c-btn c-btn--primary c-btn--danger"
            @click="showDeleteConfirm = true">
            Delete all records
          </button>
        </div>
      </section>
    </div>
    
    <div class="u-mv-lg" v-if="!isImport">
      <Viewer :records="records"></Viewer>
    </div>
    <div v-else>
      <Import :type="selectedObjectType"></Import>
    </div>

    <div class="c-callout c-callout--dialog c-callout--warning u-3/12 u-position-absolute" 
      v-show="showDeleteConfirm">
      <button class="c-callout__close" @click="showDeleteConfirm = false"></button>
      <strong class="c-callout__title"><span dir="ltr">This will delete all records.</span></strong>
      <p class="c-callout__paragraph">Are you sure you want to delete all records?</p>
      <div class="action-buttons d-flex flex-end u-mt-lg">
        <button class="c-btn u-ml-xs" @click="showDeleteConfirm = false">Cancel</button>
        <button class="c-btn c-btn--primary c-btn--danger u-ml-xs" @click="deleteAll">Delete All</button>
      </div>
    </div>

  </div>
</div>`;

import ZDClient from '../libs/ZDClient.js';
import ZDAPI from '../libs/ZDAPI.js';
import ObjectTypeSelector from './ObjectTypeSelector.js';
import Import from './Import/Import.js';
import Viewer from './Viewer.js';

const App = {
  template,
  components: {
    ObjectTypeSelector,
    Import,
    PulseLoader: VueSpinner.PulseLoader,
    Viewer
  },
  data() {
    return {
      objectTypes: [],
      selectedObjectType: null,
      records: [],
      isAppLoading: true,
      isImport: false,
      showDeleteConfirm: false
    }
  },
  methods: {
    async getObjectTypes() {
      const getObjectTypes = await ZDClient.request('/api/sunshine/objects/types');
      console.log(getObjectTypes);
      this.objectTypes = getObjectTypes.data;
      if(this.objectTypes.length > 0) this.selectedObjectType = this.objectTypes[0];
      this.loadRecordsByType();
    },
    setSelectedObjectType(type) {
      this.selectedObjectType = type;
      this.loadRecordsByType();
    },
    deleteAll() {
      this.isAppLoading = true;
      if(this.records.length){
        this.createDeleteJob();
      } else {
        this.isAppLoading = false;
        this.showDeleteConfirm = false;
      }
    },
    async createDeleteJob(batchIndex, batches) {
      let currentBatchIndex = batchIndex || 0;
      let batchOfBatches = batches || [];
      if(currentBatchIndex < 1){
        let new_batch = [];
        const batchSize= this.records.length > 1000 ? 1000 : this.records.length;
        for(let i=0; i <= this.records.length; i++){
          if(new_batch.length < batchSize){
            new_batch.push(this.records[i].id);
          } else {
            batchOfBatches.push([...new_batch]);
            new_batch = [];
          }
        }
        console.log(batchOfBatches);
      }
      if(batchOfBatches.length > 0){
        const createJob = await ZDAPI.createJob(batchOfBatches[currentBatchIndex], 'delete'); 
        console.log(createJob);
        let jobCheckInterval = setInterval( async () => {
          console.log('Checking job status...');
          const getJobStatus = await ZDAPI.getJobStatus(createJob.data.id);
          console.log(getJobStatus);
          if(getJobStatus.data.job_status === 'completed' || getJobStatus.data.job_status === 'failed') {
            clearInterval(jobCheckInterval);
            if(batchOfBatches.length > currentBatchIndex + 1){
              this.createDeleteJob(currentBatchIndex + 1, batchOfBatches);
            } else {
              this.isAppLoading = false;
              this.showDeleteConfirm = false;
              this.loadRecordsByType();
            }
          }
        },1000);
      } else {
        this.isAppLoading = false;
        this.showDeleteConfirm = false;
      }
    },
    async loadRecordsByType(page, prevRecords) {
      this.isAppLoading = true;
      let records = prevRecords || [];
      const url = page ? page : `/api/sunshine/objects/records?type=${this.selectedObjectType.key}&per_page=1000`;
      const getRecordsByType = await ZDClient.request(url);

      if(getRecordsByType.data.length > 0){
        records = records.concat(getRecordsByType.data);
      } 

      if(getRecordsByType.links.next){
        this.loadRecordsByType(getRecordsByType.links.next, records);
      } else {
        this.isAppLoading = false;
        this.records = records;
      }
    },
    setImport(isImport){
      this.isImport = isImport;
    }
  },
  created() {
    this.getObjectTypes();
  }
};

export default App;
