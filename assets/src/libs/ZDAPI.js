import ZDClient from './ZDClient.js';

const ZDAPI = {
  createJob(records, action) {
    const requestData = {
        type: "resources",
        action: action,
        data: records
    }
    console.log(requestData);
    const requestPayload = {
      url: '/api/sunshine/jobs',
      type: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      data: JSON.stringify(requestData)
    }      
    console.log(requestPayload);
    return ZDClient.request(requestPayload)
  },
  getJobStatus(id) {
    const payload = {
      url: '/api/sunshine/jobs/'+id,
      type: 'GET'
    }
    return ZDClient.request(payload)
  },
  createJob(records, type, action) {
    const requestData = {
      type: type,
      action: action,
      data: records
    }
    console.log(requestData);
    const requestPayload = {
        url: '/api/sunshine/jobs',
        type: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(requestData)
    }      
    console.log(requestPayload);
    return ZDClient.request(requestPayload)
  },
  getJobStatus(id) {
    const payload = {
      url: '/api/sunshine/jobs/'+id,
      type: 'GET'
    }
    return ZDClient.request(payload)
  },
  deleteRecord(id){
    const payload = {
      url: '/api/sunshine/objects/records/'+id,
      type: 'DELETE'
    }
    return ZDClient.request(payload)
  }
}

export default ZDAPI;

// export const createJob = (records, action) => {
//   const requestData = {
//     type: "resources",
//     action: action,
//     data: records
//   }
//   console.log(requestData);
//   const requestPayload = {
//       url: '/api/sunshine/jobs',
//       type: 'POST',
//       headers: {
//           'Content-Type': 'application/json'
//       },
//       data: JSON.stringify(requestData)
//   }      
//   console.log(requestPayload);
//   return ZDClient.request(requestPayload)
// };

// export const getJobStatus = (id) => {
//   var payload = {
//     url: '/api/sunshine/jobs/'+id,
//     type: 'GET'
// }
// return ZDClient.request(payload)
// };
