const template = `
<section>
    <div class="message">
        <span v-if="!isAborted">All records were imported successfully.</span>
        <span v-else>Import has been aborted.</span>
    </div>
    <div class="action_buttons u-pv">
        <button class="c-btn c-btn--primary u-mr-xs" @click="downloadReport()">Download report</button>
        <button class="c-btn" @click="newImport()">New import</button>
    </div>
</section>
`;

export default {
  template,
  props: ['headers', 'records', 'isAborted'],
  methods: {
    downloadReport(){
      let headers = [...this.headers];
      headers.push(...['status','message']);
      const csvReport = {
        fields: headers,
        data: this.records
      }
      const csv = Papa.unparse(csvReport);
      let link = document.createElement("a");
      const blob = new Blob(["\ufeff", csv]);
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = 'Report.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    newImport(){
      this.$emit('set-mode','file-upload');
      this.$emit('set-is-aborted', false);
    }
  },
}