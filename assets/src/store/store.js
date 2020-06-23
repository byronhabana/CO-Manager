import i18n from '../i18n/index.js';
import ZDClient from '../libs/ZDClient.js';

export const state = Vue.observable({
  i18n,
  isAppLoading: false,
  records: [],
  objectTypes: [],
  selectedObjectType: null,
});

export const mutations = {
  /**
   * Set value to a state variable
   * @param {String} field 
   * @param {String} newValue 
   */
  setIsAppLoading: value => {
    state.isAppLoading = value;
  },
  setRecords: value => {
    state.records = value;
  },
  setObjectTypes: value => {
    state.objectTypes = value;
  },
  setSelectedObjectType: value => {
    state.selectedObjectType = value;
  }
};

export const getters = {
  i18n: () => state.i18n,
  isAppLoading: () => state.isAppLoading,
  records: () => state.records,
  objectTypes: () => state.objectTypes,
  selectedObjectType: () => state.selectedObjectType
}

export const actions = {
  async loadRecordsByType(page, prevRecords) {
    mutations.setIsAppLoading(true);
    let records = prevRecords || [];
    const url = page ? page : `/api/sunshine/objects/records?type=${state.selectedObjectType.key}&per_page=1000`;
    const getRecordsByType = await ZDClient.request(url);

    if(getRecordsByType.data.length > 0){
      records = records.concat(getRecordsByType.data);
    } 

    if(getRecordsByType.links.next){
      this.loadRecordsByType(getRecordsByType.links.next, records);
    } else {
      mutations.setIsAppLoading(false);
      records.forEach(record => {
        record.selected = false;
      });
      mutations.setRecords(records);
    }
  },
}