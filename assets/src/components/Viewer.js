const template = `
<section>
  <div class="d-flex flex-space-between u-mb-sm">
    <input class="c-txt__input u-2/12 u-mr-sm" 
    v-model="filterBy" 
    placeholder="Filter" 
    v-if="records.length > 0"/>
    
    <div class="record-actions">
      <button class="c-btn">
        Create record
      </button>
      <button class="c-btn c-btn--danger"
        @click="toggleDeleteConfirmation('selected')">
        Delete selected
      </button>
      <button class="c-btn c-btn--primary c-btn--danger"
        @click="toggleDeleteConfirmation('all')">
        Delete all records
      </button>
      </div>
    </div>

  <i class="d-block">{{filteredRecords.length}} records found.</i>
  
  <table class="c-table u-mt">
    <thead>
      <tr class="c-table__row c-table__row--header">
        <th class="c-table__row__cell select-all">
          <div class="c-chk">
            <input class="c-chk__input" 
              id="select-all" 
              type="checkbox" 
              @input="selectAll">
            <label class="c-chk__label" 
              for="select-all">
            </label>
          </div>
        </th>
        <th class="c-table__row__cell c-table__row__cell__sortable"
          :class="{'is-ascending': sortBy.field === 'created_at' && sortBy.isAscending,
          'is-descending': sortBy.field === 'created_at' && !sortBy.isAscending}"
          @click="setSortBy('created_at')">
           Created At
        </th>
        <th class="c-table__row__cell c-table__row__cell__sortable"
          :class="{'is-ascending': sortBy.field === 'updated_at' && sortBy.isAscending,
          'is-descending': sortBy.field === 'updated_at' && !sortBy.isAscending}"
          @click="setSortBy('updated_at')">
            Updated At
        </th>
        <th class="c-table__row__cell c-table__row__cell__sortable"
          :class="{'is-ascending': sortBy.field === field && sortBy.isAscending,
          'is-descending': sortBy.field === field && !sortBy.isAscending}"
          @click="setSortBy(field)" 
          v-for="field in attributes">
            {{field}}
        </th>
      </tr>
    </thead>
    <tr class="c-table__row" v-for="(record, index) in filteredRecords">
      <td class="c-table__row__cell">
        <span class="anchor u-fg-red-600">
          <input class="c-chk__input" 
            :id="'chk'+index" 
            type="checkbox" 
            :checked="record.selected" 
            @input="selectRecord(index, !record.selected)">
          <label class="c-chk__label" 
            :for="'chk'+index">
          </label>
        </span>
      </td>
      <td class="c-table__row__cell">
        {{removeTimeStamp(record.created_at)}}
      </td>
      <td class="c-table__row__cell">
        {{removeTimeStamp(record.updated_at)}}
      </td>
      <td class="c-table__row__cell" v-for="field in attributes">
        {{record.attributes[field]}}
      </td>
    </tr>
  </table>

  <div class="c-callout c-callout--dialog c-callout--warning u-3/12 u-position-absolute" 
    v-show="showDeleteConfirm">
    <button class="c-callout__close" @click="showDeleteConfirm = false"></button>
    <strong class="c-callout__title">
      <span v-if="deleteType === 'all'" dir="ltr">This will delete all records.</span>
      <span v-else-if="deleteType === 'selected'" dir="ltr">This will delete the selected records.</span>
    </strong>
    <p class="c-callout__paragraph">Are you sure you want to delete these records?</p>
    <div class="action-buttons d-flex flex-end u-mt-lg">
      <button class="c-btn u-ml-xs" @click="showDeleteConfirm = false">Cancel</button>
      <button class="c-btn c-btn--primary c-btn--danger u-ml-xs" @click="deleteAll">Delete</button>
    </div>
  </div>

</section>
`;

import ZDAPI from '../libs/ZDAPI.js';
import { mutations, getters, actions } from '../store/store.js';

export default {
  template,
  props: ['records'],
  data(){
    return {
      filterBy: '',
      showDeleteConfirm: false,
      selectedAll: false,
      sortBy: {
        field: 'created_at',
        isAscending: true
      },
      deleteType: ''
    }
  },
  methods: {
    ...mutations,
    ...actions,
    /**
     * Delete record by record_id
     * @param {Object} record 
     */
    async deleteRecord(record) {
      try {
        await ZDAPI.deleteRecord(record.id);
      } catch(error){ 
        console.log(error);
      }
    },
    /**
     * Removes timestamp from ZD dateTime format
     * @param {DateTime} dateTime 
     */
    removeTimeStamp(dateTime) {
      return dateTime ? dateTime.split('T')[0] : null;
    },
    /**
     * Delete all records under an object type
     */
    deleteAll() {
      this.setIsAppLoading(true);
      if(this.records.length){
        this.createDeleteJob();
      } else {
        this.isAppLoading = false;
        this.showDeleteConfirm = false;
      }
    },
    /**
     * Call sunshine api batch API to delete records in bulk
     * @param {Int} batchIndex 
     * @param {Array} batches 
     */
    async createDeleteJob(batchIndex, batches) {
      let currentBatchIndex = batchIndex || 0;
      let batchOfBatches = batches || [];
      let records = [];
      if(this.deleteType === 'all'){
        records = this.records;
      } else if(this.deleteType === 'selected'){
        records = this.filteredRecords.filter(record => record.selected);
      }
      if(currentBatchIndex < 1){
        let new_batch = [];
        const batchSize = records.length > 1000 ? 1000 : records.length;
        for(let i=0; i <= records.length; i++){
          if(new_batch.length < batchSize){
            new_batch.push(records[i].id);
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
              this.setIsAppLoading(false);
              this.showDeleteConfirm = false;
              this.loadRecordsByType();
            }
          }
        },1000);
      } else {
        this.setIsAppLoading(false);
        this.showDeleteConfirm = false;
      }
    },
    /**
     * Display delete confirmation pop-up window
     */
    toggleDeleteConfirmation(type){
      this.showDeleteConfirm = true;
      this.deleteType = type;
    },
    /**
     * Toggle selected attribute of a record
     * @param {Int} index 
     * @param {Boolean} isSelected 
     */
    selectRecord(index, isSelected) {
      this.$set(this.filteredRecords[index], 'selected', isSelected);
    },
    /**
     * Select all records
     */
    selectAll() {
      this.selectedAll = !this.selectedAll;
      this.filteredRecords.forEach((record, index) => {
        this.$set(this.filteredRecords[index], 'selected', this.selectedAll);
      });
    },
    /**
     * Sort records by field selected
     * @param {Array} records 
     */
    sortRecords(records) {
      let sortedRecords = [...records];
      sortedRecords.sort((recordA, recordB) => {
        if(recordA[this.sortBy.field] > recordB[this.sortBy.field]){
          return -1;
        }
        if(recordB[this.sortBy.field] > recordA[this.sortBy.field]){
          return 1;
        }
        return 0;
      });
      if(this.sortBy.isAscending){
        return sortedRecords.reverse();
      }
      return sortedRecords;
    },
     /**
     * Set the field and order the table will be sorted by
     * @param {String} field
     */
    setSortBy(field){
      if(field === this.sortBy.field){
        this.sortBy.isAscending = !this.sortBy.isAscending;
      } else {
        this.sortBy.field = field;
        this.sortBy.isAscending = true;
      }
    },
  },
  computed: {
    ...getters,
    attributes(){
      return this.records.length > 0 ? Object.keys(this.records[0].attributes) : []
    },
    filteredRecords(){
      if(this.filterBy && this.filterBy.length > 2){
        var matched = [];
        this.records.forEach(record => {
          let matchFound = false;
          if(record.created_at.toLowerCase().indexOf(this.filterBy.toLowerCase()) > -1){
            matched.push(record);
            matchFound = true;
          }
          if(record.updated_at.toLowerCase().indexOf(this.filterBy.toLowerCase()) > -1 && !matchFound){
            matched.push(record);
            matchFound = true;
          }
          this.attributes.forEach(attr => { 
            if(record.attributes[attr].toString().toLowerCase().indexOf(this.filterBy.toLowerCase()) > -1 && !matchFound){
              matched.push(record);
              matchFound = true;
            }
          });
        });
        return this.sortRecords(matched);;
      } else {
        return this.sortRecords(this.records);
      }
    }
  }
}