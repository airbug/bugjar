//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('ApiContext')

//@Require('BugFs')
//@Require('Class')
//@Require('Map')
//@Require('Obj')
//@Require('Path')

var bugpack = require('bugpack');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BugFs = bugpack.require('BugFs');
var Class = bugpack.require('Class');
var Map = bugpack.require('Map');
var Obj = bugpack.require('Obj');
var Path = bugpack.require('Path');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var ApiContext = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(path) {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Path}
         */
        this.path = Class.doesExtend(path, Path) ? path : BugFs.path(path);

        /**
         * @private
         * @type {Map.<string, BugJar>}
         */
        this.jarCacheMap = new Map();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Path}
     */
    getPath: function() {
        return this.path;
    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     *
     * @param name
     * @param version
     */
    getJar: function(name, version) {
        var bugJar = this.generateJarKey(name, version);
        return this.jarCacheMap.get(bugJar);
    },

    /**
     * @param {BugJar} bugJar
     */
    addJar: function(bugJar) {
        var jarKey = this.generateJarKey(bugJar.getName(), bugJar.getVersion());
        this.jarCacheMap.put(jarKey, bugJar);
    },


    //-------------------------------------------------------------------------------
    // Private Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {string} name
     * @param {string} version
     * @return {string}
     */
    generateJarKey: function(name, version) {
        return name + "/" + version;
    }
});


//-------------------------------------------------------------------------------
// Export
//-------------------------------------------------------------------------------

bugpack.export(ApiContext);
