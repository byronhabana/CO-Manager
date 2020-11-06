import i18n from '../i18n/index.js';
import ZDClient from '../libs/ZDClient.js';

export const state = Vue.observable({
  i18n,
  isAppLoading: false,
  objectRecords: [],
  objectTypes: [],
  selectedObjectType: null,
  relationshipTypes: [],
  selectedRelationshipType: null,
  relationshipRecords: []
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
  setObjectRecords: value => {
    state.objectRecords = value;
  },
  setObjectTypes: value => {
    state.objectTypes = value;
  },
  setSelectedObjectType: value => {
    state.selectedObjectType = value;
  },
  setRelationshipTypes: value => {
    state.relationshipTypes = value;
  },
  setSelectedRelationshipType: value => {
    state.selectedRelationshipType = value;
  },
  setRelationshipRecords: value => {
    state.relationshipRecords = value;
  },
};

export const getters = {
  i18n: () => state.i18n,
  isAppLoading: () => state.isAppLoading,
  objectRecords: () => state.objectRecords,
  objectTypes: () => state.objectTypes,
  selectedObjectType: () => state.selectedObjectType,
  relationshipTypes: () => state.relationshipTypes,
  selectedRelationshipType: () => state.selectedRelationshipType,
  relationshipRecords: () => state.relationshipRecords
}

export const actions = {
  async loadObjectRecordsByType(page, prevRecords) {
    mutations.setIsAppLoading(true);
    let records = prevRecords || [];
    const url = page ? page : `/api/sunshine/objects/records?type=${state.selectedObjectType.key}&per_page=1000`;
    const getRecordsByType = await ZDClient.request(url);

    if(getRecordsByType.data.length > 0){
      records = records.concat(getRecordsByType.data);
    } 

    if(getRecordsByType.links.next){
      this.loadObjectRecordsByType(getRecordsByType.links.next, records);
    } else {
      mutations.setIsAppLoading(false);
      records.forEach(record => {
        record.selected = false;
      });
      mutations.setObjectRecords(records);
      console.log(state.objectRecords, state.relationshipRecords);
    }
  },

  async loadRelationshipRecordsByType(page, prevRecords) {
    mutations.setIsAppLoading(true);
    let records = prevRecords || [];
    const url = page ? page : `/api/sunshine/relationships/records?type=${state.selectedRelationshipType.key}&per_page=1000`;
    const getRecordsByType = await ZDClient.request(url);
    console.log(getRecordsByType);
    
    if(getRecordsByType.data.length > 0){
      records = records.concat(getRecordsByType.data);
    } 

    if(getRecordsByType.links.next){
      this.loadRelationshipRecordsByType(getRecordsByType.links.next, records);
    } else {
      mutations.setIsAppLoading(false);
      records.forEach(record => {
        record.selected = false;
      });
      mutations.setRelationshipRecords(records);
      console.log(state.records, state.relationshipRecords);
    }
  },
}