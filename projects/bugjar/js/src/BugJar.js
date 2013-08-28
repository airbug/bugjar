//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('BugJar')

//@Require('Class')
//@Require('Obj')

var bugpack = require('bugpack');
var path = require('path');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class = bugpack.require('Class');
var JsonUtil = bugpack.require('JsonUtil');
var Obj = bugpack.require('Obj');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BugJar = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(name, version) {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {string}
         */
        this.name = name;

        /**
         * @private
         * @type {string}
         */
        this.version = version;

        /**
         * @private
         * @type {Array}
         */
        this.dependencies = [];
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

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
    // Object Implementation
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
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    generateBugJarJson: function()  {
        var jsonObject = {
            name: this.name,
            version: this.version,
            dependencies: JsonUtil.clone(this.dependencies)
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

bugpack.export(BugJar);
