//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugjar.BugJarApi')

//@Require('Class')
//@Require('Exception')
//@Require('Map')
//@Require('Obj')
//@Require('Proxy')
//@Require('Flows')
//@Require('bugfs.BugFs')
//@Require('bugfs.Path')
//@Require('bugjar.BugJarContext')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class           = bugpack.require('Class');
    var Exception       = bugpack.require('Exception');
    var Map             = bugpack.require('Map');
    var Obj             = bugpack.require('Obj');
    var Proxy           = bugpack.require('Proxy');
    var Flows         = bugpack.require('Flows');
    var BugFs           = bugpack.require('bugfs.BugFs');
    var Path            = bugpack.require('bugfs.Path');
    var BugJarContext   = bugpack.require('bugjar.BugJarContext');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $forEachSeries  = Flows.$forEachSeries;
    var $if             = Flows.$if;
    var $series         = Flows.$series;
    var $task           = Flows.$task;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var BugJarApi = Class.extend(Obj, {

        _name: "bugjar.BugJarApi",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         */
        _constructor: function() {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {Map.<string, BugJarContext>}
             */
            this.contextMap         = new Map();

            /**
             * @Private
             * @type {boolean}
             */
            this.bootstrapped       = false;

            /**
             * @private
             * @type {BugJarContext}
             */
            this.currentContext     = null;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {string=} homePath
         */
        bootstrap: function(homePath) {
            homePath        = homePath ? homePath : process.env.HOME;
            var bootPath    = homePath + "/.bugjar";
            this.bootstrapped = true;
            this.changeContext(bootPath);
        },
    
        /**
         * @param {string} contextPath
         */
        changeContext: function(contextPath) {
            var bugJarContext = this.contextMap.get(contextPath);
            if (!bugJarContext) {
                bugJarContext = new BugJarContext(contextPath);
                this.contextMap.put(contextPath, bugJarContext);
            }
            this.currentContext = bugJarContext;
        },
    
    
        // BugJar Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {{
         *      name: string,
         *      version: string,
         *      dependencies: Array.<string>,
         *      meta: Object,
         *      sources: Array.<(string | Path)>
         * }} params
         * @param {function(Throwable, BugJar=)} callback
         */
        createBugJar: function(params, callback) {
            var _this               = this;
            this.ensureBootstrap();
            //TODO BRN: Generate a temp bugjar
            //TODO BRN: Build a tarball of the temp bugjar
        },

        /**
         * @param {{
         *      name: string,
         *      version: string,
         *      dependencies: Array.<string>,
         *      meta: Object,
         *      sources: Array.<(string | Path)>
         * }} params
         * @return {BugJar}
         */
        createBugJarSync: function(params) {
            this.ensureBootstrap();
            //TODO BRN: Generate a temp bugjar
            //TODO BRN: Build a tarball of the temp bugjar
        },
    
        /**
         * @param {string} name
         * @param {string} version
         * @param {function(Throwable, BugJar=)} callback
         */
        getBugJar: function(name, version, callback) {
            this.ensureBootstrap();
            this.currentContext.getBugJar(name, version, callback);
        },

        /**
         * @param {string} name
         * @param {string} version
         * @return {BugJar}
         */
        getBugJarSync: function(name, version) {
            this.ensureBootstrap();
            return this.currentContext.getBugJarSync(name, version);
        },

        /**
         * @param {string} name
         * @param {string} version
         * @param {function(Throwable, boolean=)} callback
         */
        hasBugJar: function(name, version, callback) {
            this.currentContext.hasBugJar(name, version, callback);
        },

        /**
         * @param {string} name
         * @param {string} version
         * @return {boolean}
         */
        hasBugJarSync: function(name, version) {
            return this.currentContext.hasBugJarSync(name, version);
        },

        /**
         * @param {{
         *      jarPath: string,
         *      options: {
         *      }
         * }} params
         * @param {function(Throwable=)} callback
         */
        putBugJar: function(params, callback) {
            this.ensureBootstrap();

            //TODO BRN:
        },

        /**
         * @param {{
         *      jarPath: string,
         *      options: {
         *      }
         * }} params
         */
        putBugJarSync: function(params) {
            this.ensureBootstrap();
            //TODO BRN:
        },

        /**
         * @param {{
         *      name: string,
         *      version: string
         * }} params
         * @param {function(Throwable=)} callback
         */
        removeBugJar: function(params, callback) {
            this.ensureBootstrap();
            this.currentContext.removeBugJar(params.name, params.version, callback);
        },

        /**
         * @param {{
         *      name: string,
         *      version: string
         * }} params
         */
        removeBugJarSync: function(params) {
            this.ensureBootstrap();
            return this.currentContext.removeBugJarSync(params.name, params.version);
        },

    
        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------
    
        /**
         * @private
         */
        ensureBootstrap: function() {
            if (!this.bootstrapped) {
                this.bootstrap();
            }
        }
    });


    //-------------------------------------------------------------------------------
    // Private Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @private
     * @type {BugJarApi}
     */
    BugJarApi.instance = null;


    //-------------------------------------------------------------------------------
    // Static Methods
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @return {BugJarApi}
     */
    BugJarApi.getInstance = function() {
        if (BugJarApi.instance === null) {
            BugJarApi.instance = new BugJarApi();
        }
        return BugJarApi.instance;
    };


    //-------------------------------------------------------------------------------
    // Static Proxy
    //-------------------------------------------------------------------------------

    Proxy.proxy(BugJarApi, Proxy.method(BugJarApi.getInstance), [
        "bootstrap",
        "changeContext",
        "createJar",
        "createJarSync"
    ]);


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export("bugjar.BugJarApi", BugJarApi);
});
