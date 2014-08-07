//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugjar.BugJar')

//@Require('Class')
//@Require('Obj')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // Common Modules
    //-------------------------------------------------------------------------------

    var path    = require('path');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class   = bugpack.require('Class');
    var Obj     = bugpack.require('Obj');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var BugJar = Class.extend(Obj, {

        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {BugJarContext} bugJarContext
         * @param {string} name
         * @param {string} version
         * @param {Array.<string>} dependencies
         * @param {Object} meta
         */
        _constructor: function(bugJarContext, name, version, dependencies, meta) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {BugJarContext}
             */
            this.bugJarContext  = bugJarContext;

            /**
             * @private
             * @type {Array.<string>}
             */
            this.dependencies   = dependencies;

            /**
             * @private
             * @type {Object}
             */
            this.meta           = meta;

            /**
             * @private
             * @type {string}
             */
            this.name           = name;

            /**
             * @private
             * @type {string}
             */
            this.version        = version;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {BugJarContext}
         */
        getBugJarContext: function() {
            return this.bugJarContext;
        },

        /**
         * @return {Array.<string>}
         */
        getDependencies: function() {
            return this.dependencies;
        },

        /**
         * @return {Object}
         */
        getMeta: function() {
            return this.meta;
        },

        /**
         * @return {string}
         */
        getName: function() {
            return this.name;
        },

        /**
         * @return {string}
         */
        getVersion: function() {
            return this.version;
        },


        //-------------------------------------------------------------------------------
        // Obj Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {*} value
         * @return {boolean}
         */
        equals: function(value) {
            if (Class.doesExtend(value, BugJar)) {
                return (Obj.equals(value.getName(), this.getName()) && Obj.equals(value.getVersion(), this.getVersion()));
            }
            return false;
        },

        /**
         * @return {number}
         */
        hashCode: function() {
            if (!this._hashCode) {
                this._hashCode = Obj.hashCode("[BugJar]" + Obj.hashCode(this.name) + "_" + Obj.hashCode(this.version));
            }
            return this._hashCode;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @return {string}
         */
        generateBugJarJson: function()  {
            var jsonObject = {
                name: this.name,
                version: this.version,
                dependencies: Obj.clone(this.dependencies)
            };
            return JSON.stringify(jsonObject);
        },

        /**
         * @return {string}
         */
        relativePath: function() {
            return this.name + path.sep + this.version;
        }
    });


    //-------------------------------------------------------------------------------
    // Export
    //-------------------------------------------------------------------------------

    bugpack.export('bugjar.BugJar', BugJar);
});
