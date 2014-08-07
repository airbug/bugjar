//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugjar.BugJarContext')

//@Require('Class')
//@Require('Exception')
//@Require('Map')
//@Require('Obj')
//@Require('Flows')
//@Require('bugfs.BugFs')
//@Require('bugjar.BugJar')


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
    var Flows         = bugpack.require('Flows');
    var BugFs           = bugpack.require('bugfs.BugFs');
    var BugJar          = bugpack.require('bugjar.BugJar');


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
    var BugJarContext = Class.extend(Obj, {

        _name: "bugjar.BugJarContext",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {Path} contextPath
         */
        _constructor: function(contextPath) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {Path}
             */
            this.contextPath    = BugFs.path(contextPath);

            /**
             * @private
             * @type {Map.<string, BugJar>}
             */
            this.jarCacheMap    = new Map();

            /**
             * @private
             * @type {Map.<string, boolean>}
             */
            this.jarLoadedMap   = new Map();
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {Path}
         */
        getContextPath: function() {
            return this.contextPath;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {Path} bugJarPath
         * @param {function(Throwable, BugJar=)} callback
         */
        putBugJar: function(bugJarPath, callback) {
            var _this               = this;
            this.ensureBootstrap();
            var bugJar              = null;
            var bugJarJsonFilePath  = null;
            var jarPath             = null;
            var contentsPath        = null;

            $if(function(flow) {
                    if (name && version) {
                        _this.hasBugJar(name, version, function(throwable, exists) {
                            if (!throwable) {
                                flow.assert(!exists);
                            } else {
                                flow.error(throwable);
                            }
                        });
                    } else {
                        flow.error(new Exception("BugJarCouldNotBeGenerated", {}, "Could not generate BugJar with the params that were passed in"));
                    }
                },
                $series([
                    $task(function(flow) {
                        bugJar          = _this.generateBugJar(params);
                        jarPath         = _this.generateBugJarPath(bugJar);
                        contentsPath
                        jarPath.createDirectory(function(throwable) {
                            flow.complete(throwable);
                        });
                    }),
                    $task(function(flow) {
                        bugJarJsonFilePath  = jarPath.joinPaths("bugjar.json");
                        bugJarJsonFilePath.createFile(function(throwable) {
                            flow.complete(throwable);
                        });
                    }),
                    $task(function(flow) {
                        bugJarJsonFilePath.writeFile(bugJar.generateBugJarJson(), function(throwable) {
                            flow.complete(throwable);
                        });
                    }),
                    $task(function(flow) {
                        $forEachSeries(sources, function(flow, sourcePath) {
                            BugFs.copyDirectoryContents(sourcePath, jarPath, true, Path.SyncMode.MERGE_REPLACE, function(error) {
                                flow.complete(error);
                            });
                        }).execute(function(throwable) {
                            flow.complete(throwable);
                        });
                    })
                ])
            ).$else(
                $task(function(flow) {
                    flow.error(new Exception("BugJarExists", {}, "BugJar with the name '" + name + "' and version '" + version + "' already exists"));
                })
            ).execute(function(throwable) {
                    if (!throwable) {
                        callback(null, bugJar);
                    } else {
                        callback(throwable);
                    }
                });
        },

        /**
         * @param {string} name
         * @param {string} version
         * @param {Array.<string>} dependencies
         * @param {Object} meta
         * @param {Array.<(string | Path)>} sources
         * @return {BugJar}
         */
        createBugJarSync: function(name, version, dependencies, meta, sources) {
            this.ensureBootstrap();
            var bugJar = this.generateBugJarFromParams(params);
            var jarPath = this.generateBugJarPath(bugJar);
            var bugJarJsonFilePath = jarPath.joinPaths("bugjar.json");
            jarPath.createDirectorySync();
            bugJarJsonFilePath.createFileSync();
            bugJarJsonFilePath.writeFileSync(bugJar.generateBugJarJson());
            return bugJar;
        },

        /**
         * @param {string} name
         * @param {string} version
         * @param {function(Throwable=)} callback
         */
        deleteBugJar: function(name, version, callback) {
            this.ensureBootstrap();
            var bugJar      = this.generateBugJarFromParams(params);
            var jarPath     = this.generateBugJarPath(bugJar);
            jarPath.deleteDirectory(true, callback);
        },

        /**
         * @param {string} name
         * @param {string} version
         */
        deleteBugJarSync: function(name, version) {
            this.ensureBootstrap();
            var bugJar = this.generateBugJarFromParams(params);
            var jarPath = this.generateBugJarPath(bugJar);
            jarPath.deleteDirectorySync(true);
        },

        /**
         * @param {string} name
         * @param {string} version
         * @param {function(Throwable, BugJar=)} callback
         */
        getBugJar: function(name, version, callback) {
            var bugJar = this.getCacheEntry(name, version);
            if (!bugJar) {

            } else {
                callback(null, bugJar);
            }
        },

        /**
         * @param {string} name
         * @param {string} version
         * @param {function(Throwable, boolean=)} callback
         */
        hasBugJar: function(name, version, callback) {
            var exists = this.hasCacheEntry(name, version);
            if (!exists) {
                this.loadBugJar(name, version, function(throwable) {

                });
            } else {
                callback(null, exists);
            }
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {{
         *      name: string,
         *      version: string,
         *      dependencies: Array.<string>,
         *      meta: Object,
         *      sources: Array.<(string | Path)>
         * }} params
         * @return {BugJar}
         */
        generateBugJar: function(params) {
            return new BugJar(params.name, params.version, params.dependencies, params.meta);
        },

        /**
         * @private
         * @param {BugJar} bugJar
         * @return {Path}
         */
        generateBugJarPath: function(bugJar) {
            return this.currentContext.getPath().joinPaths(bugJar.relativePath());
        },

        /**
         * @private
         * @param {string} name
         * @param {string} version
         * @return {string}
         */
        generateJarKey: function(name, version) {
            return name + "/" + version;
        },

        /**
         * @private
         * @param {string} name
         * @param {string} version
         * @return {BugJar}
         */
        getCachedJar: function(name, version) {
            var jarKey = this.generateJarKey(name, version);
            return this.jarCacheMap.get(jarKey);
        },

        /**
         * @private
         * @param {string} name
         * @param {string} version
         * @return {boolean}
         */
        hasCachedJar: function(name, version) {
            var jarKey = this.generateJarKey(name, version);
            return this.jarCacheMap.containsKey(jarKey);
        },

        hasJarLoaded: function(name, version) {

        },

        /**
         * @private
         * @param {string} name
         * @param {string} version
         * @param {function(Throwable, BugJar=)} callback
         */
        loadBugJar: function(name, version, callback) {

        },

        /**
         * @private
         * @param {BugJar} bugJar
         */
        putCachedJar: function(bugJar) {
            var jarKey = this.generateJarKey(bugJar.getName(), bugJar.getVersion());
            this.jarCacheMap.put(jarKey, bugJar);
        }
    });


    //-------------------------------------------------------------------------------
    // Export
    //-------------------------------------------------------------------------------

    bugpack.export("bugjar.BugJarContext", BugJarContext);
});
