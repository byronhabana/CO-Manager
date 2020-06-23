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
        @select-type="updateSelectedObjectType">
      </ObjectTypeSelector>

      <section class="u-m" v-if="selectedObjectType">
        <div class="d-flex u-mt-xs action-buttons u-fg-blue-600">
          <div class="c-tab__list__item u-mr-sm"
            @click="isImport = false" :class="{'is-selected': !isImport}">
            View Records
          </div>
          <div class="c-tab__list__item u-fg-blue-600 u-mr-sm"
            @click="isImport = true" :class="{'is-selected': isImport}">
            Bulk Import
          </div>
        </div>
      </section>
    </div>
    
    <div class="u-mv-lg" v-if="!isImport">
      <Viewer :records="records" v-if="records.length"></Viewer>
      <div v-else>No records found</div>
    </div>
    <div v-else>
      <Import :type="selectedObjectType"></Import>
    </div>

  </div>
</div>`;

import ZDClient from '../libs/ZDClient.js';
import ObjectTypeSelector from './ObjectTypeSelector.js';
import Import from './Import/Import.js';
import Viewer from './Viewer.js';
import { mutations, getters, actions } from '../store/store.js';

const App = {
  template,
  components: {
    ObjectTypeSelector,
    Import,
    PulseLoader: VueSpinner.PulseLoader,
    Viewer
  },  
  computed: {
    ...getters
  },
  data() {
    return {
      isImport: false,
    }
  },
  methods: {
    ...mutations,
    ...actions,
    async getObjectTypes() {
      const getObjectTypes = await ZDClient.request('/api/sunshine/objects/types');
      console.log(getObjectTypes);
      this.setObjectTypes(getObjectTypes.data);
      if(this.objectTypes.length > 0) this.setSelectedObjectType(this.objectTypes[0]);
      this.loadRecordsByType();
    },
    updateSelectedObjectType(type){
      this.setSelectedObjectType(type);
      this.loadRecordsByType();
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
