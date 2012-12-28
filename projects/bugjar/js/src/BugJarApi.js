//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Export('BugJarApi')

//@Require('BugJar')

var bugpack = require('bugpack');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var ApiContext = bugpack.require('ApiContext');
var BugFlow = bugpack.require('BugFlow');
var BugFs = bugpack.require('BugFs');
var BugJar = bugpack.require('BugJar');
var Map = bugpack.require('Map');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $series = BugFlow.$series;
var $task = BugFlow.$task;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BugJarApi = {};


//-------------------------------------------------------------------------------
// Static Variables
//-------------------------------------------------------------------------------

/**
 * @private
 * @type {Map.<string, ApiContext>}
 */
BugJarApi.apiContextMap = new Map();

/**
 * @Private
 * @type {boolean}
 */
BugJarApi.bootstrapped = false;

/**
 * @private
 * @type {ApiContext}
 */
BugJarApi.currentContext = null;


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @param {?string=} bootPath
 */
BugJarApi.bootstrap = function(bootPath) {
    bootPath = bootPath ? bootPath : (process.cwd() + "/.bugjar");
    BugJarApi.bootstrapped = true;
    BugJarApi.changeContext(bootPath);
};

/**
 * @param {string} contextPath
 */
BugJarApi.changeContext = function(contextPath) {
    var apiContext = BugJarApi.apiContextMap.get(contextPath);
    if (!apiContext) {
        apiContext = new ApiContext(contextPath);
        BugJarApi.apiContextMap.put(contextPath, apiContext);
    }
    BugJarApi.currentContext = apiContext;
};


// BugJar Methods
//-------------------------------------------------------------------------------


/**
 * Creates a BugJar in the local .bugjar folder. If the jar already exists, it is not modified.
 * @param {Object} params
 * @param {?function(Error, BugJar)} callback
 */
BugJarApi.createJar = function(params, callback) {
    BugJarApi.ensureBootstrap();
    var bugJar = BugJarApi.resolveBugJarFromParams(params);
    var jarPath = BugJarApi.generateJarPath(bugJar);
    var bugJarJsonFilePath = jarPath.joinPaths('bugjar.json');

    $series([
        $task(function(flow) {
            jarPath.createDirectory(function(error) {
                flow.complete(error);
            });
        }),
        $task(function(flow) {
            bugJarJsonFilePath.createFile(function(error) {
                flow.complete(error);
            });
        }),
        $task(function(flow) {
            bugJarJsonFilePath.writeFile(bugJar.generateBugJarJson(), function(error) {
                flow.complete(error);
            });
        })
    ]).execute(function(error) {
        if (callback) {
            if (!error) {
                callback(undefined, bugJar);
            } else {
                callback(error);
            }
        }
    });
};

/**
 * Creates a BugJar in the local .bugjar folder. If the jar already exists, it is not modified.
 * @param {Object} params
 * @return {BugJar}
 */
BugJarApi.createJarSync = function(params) {
    BugJarApi.ensureBootstrap();
    var bugJar = BugJarApi.resolveBugJarFromParams(params);
    var jarPath = BugJarApi.generateJarPath(bugJar);
    var bugJarJsonFilePath = jarPath.joinPaths('bugjar.json');
    jarPath.createDirectorySync();
    bugJarJsonFilePath.createFileSync();
    bugJarJsonFilePath.writeFileSync(bugJar.generateBugJarJson());
    return bugJar;
};

/**
 * Deletes a BugJar from the local .bugjar cache
 * @param {Object} params
 * @param {?function(Error)} callback
 */
BugJarApi.deleteJar = function(params, callback) {
    BugJarApi.ensureBootstrap();
    var bugJar = BugJarApi.resolveBugJarFromParams(params);
    var jarPath = BugJarApi.generateJarPath(bugJar);
    jarPath.deleteDirectory(true, callback);
};

/**
 * Deletes a BugJar from the local .bugjar cache
 * @param {Object} params
 */
BugJarApi.deleteJarSync = function(params) {
    BugJarApi.ensureBootstrap();
    var bugJar = BugJarApi.resolveBugJarFromParams(params);
    var jarPath = BugJarApi.generateJarPath(bugJar);
    jarPath.deleteDirectorySync(true);
};

/**
 * Removes all files and folders from the specified jar (except the bugjar.json file)
 * @param params
 */
BugJarApi.emptyJarSync = function(params) {
    BugJarApi.ensureBootstrap();
    //TODO BRN: Implementation
};

/**
 * Fills a jar with the specified folders and files contained in the paths
 * @param params
 */
BugJarApi.fillJarSync = function(params) {
    BugJarApi.ensureBootstrap();
    //TODO BRN: Implementation
};

/**
 * @param {string} name
 * @param {string} version
 * @return {BugJar}
 */
BugJarApi.getJar = function(name, version) {
    BugJarApi.ensureBootstrap();
    return this.currentContext.getJar(name, version);
};

/**
 * Accepts a jar name and version and generates a BugJar instance.
 * @param {string} name
 * @param {string} version
 */
BugJarApi.generateJar = function(name, version) {
    BugJarApi.ensureBootstrap();
    //TODO BRN: Validate the name and version
    var bugJar = BugJarApi.getJar(name, version);
    if (!bugJar) {
        bugJar = new BugJar(name, version);
    }
    return bugJar;
};

BugJarApi.openJarSync = function(params) {
    BugJarApi.ensureBootstrap();
    //TODO BRN: Implementation
};


// Shelf Methods
//-------------------------------------------------------------------------------

/**
 * Creates a Shelf, the action is left up to the Shelf implementation
 * @param {Object} params
 * @return {Shelf}
 */
BugJarApi.createShelfSync = function(params) {
    BugJarApi.ensureBootstrap();
    //TODO BRN: Implementation
};

/**
 * Deletes a Shelf, the action is left up to the Shelf implementation
 * @param {Object} params
 */
BugJarApi.deleteShelfSync = function(params) {
    BugJarApi.ensureBootstrap();
    //TODO BRN: Implementation
};

/**
 * Get a BugJar from a Shelf repo
 */
BugJarApi.getJarFromShelfSync = function(params) {
    BugJarApi.ensureBootstrap();
    //TODO BRN: Implementation
};

/**
 * Puts a BugJar on a Shelf, if the jar already exists, it is replaced with the new one
 * @param {Object} params
 */
BugJarApi.putJarOnShelfSync = function(params) {
    BugJarApi.ensureBootstrap();
    //TODO BRN: Implementation
};

/**
 * Removes a BugJar from a Shelf
 * @param {Object} params
 */
BugJarApi.removeJarFromShelfSync = function(params) {
    BugJarApi.ensureBootstrap();
    //TODO BRN: Implementation
};


//-------------------------------------------------------------------------------
// Private Static Methods
//-------------------------------------------------------------------------------

/**
 * @private
 */
BugJarApi.ensureBootstrap = function() {
    if (!BugJarApi.bootstrapped) {
        BugJarApi.bootstrap();
    }
};

/**
 * @private
 * @param {BugJar} bugJar
 * @return {Path}
 */
BugJarApi.generateJarPath = function(bugJar) {
    return BugJarApi.currentContext.getPath().joinPaths(bugJar.relativePath());
};

/**
 * @private
 * @param {Object} params
 * @return {BugJar}
 */
BugJarApi.resolveBugJarFromParams = function(params) {
    if (Class.doesExtend(params.bugJar, BugJar)) {
        return params.bugJar;
    } else if (params.name && params.version) {
        return BugJarApi.generateJar(params.name, params.version);
    }
    throw new Error("Could not resolve BugJar with the params that were passed in");
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export(BugJarApi);
