

let CLIENT;
let APP_SETTINGS = null;
var APP_NAME = null;

const ZDClient = {

  events: {
    ON_APP_REGISTERED(cb) {
      return CLIENT.on('app.registered', (data) => {
        APP_SETTINGS = data.metadata.settings;
        APP_NAME = data.metadata.name;
        return cb(data);
      });
    },
  },

  init() {
    CLIENT = ZAFClient.init();
  },

  /**
   * Set getters for privite objects
   */
  app: {
    get settings() { return APP_SETTINGS; }
  },

  /**
   * It returns true if the app is installed in the instance, false if
   * it's running locally
   */
  isProduction() {
    return !!this.app.settings['IS_PRODUCTION'];
  },

  /**
   * @returns {Promise}
   */
  async request(payload) {
    return await CLIENT.request(payload);
  },

  /**
   * It sets the frame height using on the passed value.
   * If no value has been passed, 80 will be set as default heigth.
   * @param {Int} newHeight
   */
  resizeFrame(appHeight) {
    CLIENT.invoke('resize', {width: '100%', height: `${appHeight}px`});
  },

  /**
   * Invokes ZAF notify to display notification message to agent
   * @param {String} type 
   * @param {String} message 
   */
  notify: function(type, message, options = {}) {
    CLIENT.invoke('notify', '<b>'+APP_NAME+':</b> ' + message, type, options);
  },
};

export default ZDClient;
