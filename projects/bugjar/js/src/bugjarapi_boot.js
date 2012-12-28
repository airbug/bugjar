//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

var bugpack = require('bugpack');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BugJarApi = bugpack.require('BugJarApi');


//-------------------------------------------------------------------------------
// Bootstrap
//-------------------------------------------------------------------------------

BugJarApi.bootstrap();


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

// NOTE BRN: This file is the entry point for the node js module. So we also export this file as a node js module here
// so that users can simple require('bugjar') in their node modules.

module.exports = BugJarApi;
