const template = `
<section>
  <input class="c-txt__input u-2/12 u-mv-xs" 
    v-model="filterBy" 
    placeholder="Filter" 
    v-if="records.length > 0"/>
  <i class="d-block">{{filteredRecords.length}} records found.</i>
  <table class="c-table">
    <thead>
      <tr class="c-table__row c-table__row--header">
        <th class="c-table__row__cell"
          v-for="field in attributes">{{field}}</th>
      </tr>
    </thead>
    <tr class="c-table__row" v-for="record in filteredRecords">
      <td class="c-table__row__cell" v-for="field in attributes">
        {{record.attributes[field]}}
      </td>
    </tr>
  </table>
</section>
`;

export default {
  template,
  props: ['records'],
  data(){
    return {
      filterBy: ''
    }
  },
  computed: {
    attributes(){
      return this.records.length > 0 ? Object.keys(this.records[0].attributes) : []
    },
    filteredRecords(){
      if(this.filterBy && this.filterBy.length > 2){
        var matched = [];
        this.records.forEach(record => {
          this.attributes.forEach(attr => { 
            if(record.attributes[attr].toLowerCase().indexOf(this.filterBy.toLowerCase()) > -1){
              matched.push(record);
            }
          });
        });
        return matched;
      } else {
        return this.records;
      }
    }
  }
}