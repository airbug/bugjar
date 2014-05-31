//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugjar.BugJarCli')

//@Require('Class')
//@Require('Exception')
//@Require('bugcli.BugCli')
//@Require('bugflow.BugFlow')
//@Require('bugjar.BugJarApi')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // Common Modules
    //-------------------------------------------------------------------------------

    var path                = require('path');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class               = bugpack.require('Class');
    var Exception           = bugpack.require('Exception');
    var BugCli              = bugpack.require('bugcli.BugCli');
    var BugFlow             = bugpack.require('bugflow.BugFlow');
    var BugJarApi           = bugpack.require('bugjar.BugJarApi');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $series             = BugFlow.$series;
    var $task               = BugFlow.$task;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {BugCli}
     */
    var BugJarCli = Class.extend(BugCli, {

        //-------------------------------------------------------------------------------
        // BugCli Methods
        //-------------------------------------------------------------------------------

        /**
         *
         */
        configure: function(callback) {
            var _this = this;
            $series([
                $task(function(flow) {
                    _this._super(function(error) {
                        flow.complete(error);
                    });
                }),
                $task(function(flow) {
                    _this.registerCliAction({
                        name: 'createjar',
                        flags: [
                            'createjar'
                        ],
                        executeMethod: function(cliBuild, cliAction, callback) {
                            /** @type {CliOptionInstance} */
                            var dependenciesOption      = cliBuild.getOption("dependencies");
                            /** @type {CliOptionInstance} */
                            var metaOption              = cliBuild.getOption("meta");
                            /** @type {CliOptionInstance} */
                            var nameOption              = cliBuild.getOption("name");
                            /** @type {CliOptionInstance} */
                            var sourcesOption           = cliBuild.getOption("sources");
                            /** @type {CliOptionInstance} */
                            var versionOption           = cliBuild.getOption("version");

                            /** @type {Array.<string>} */
                            var jarDependencies         = [];
                            /** @type {Object} */
                            var jarMeta                 = {};
                            /** @type {string} */
                            var jarName                 = "";
                            /** @type {Array.<string>} */
                            var jarSources              = [];
                            /** @type {string} */
                            var jarVersion              = "";

                            if (dependenciesOption) {
                                jarDependencies = dependenciesOption.getParameter("jarDependencies");
                            }
                            if (metaOption) {
                                jarMeta = metaOption.getParameter("jarMeta");
                            }
                            if (nameOption) {
                                jarName = nameOption.getParameter("jarName");
                            }
                            if (sourcesOption) {
                                jarSources = sourcesOption.getParameter("jarSources");
                            }
                            if (versionOption) {
                                jarVersion = versionOption.getParameter("jarVersion");
                            }
                            var bugJarApi  = new BugJarApi();

                            $series([
                                $task(function(flow) {
                                    bugJarApi.createBugJar({
                                        dependencies: jarDependencies,
                                        meta: jarMeta,
                                        name: jarName,
                                        sources: jarSources,
                                        version: jarVersion
                                    }, function(throwable) {
                                        flow.complete(throwable);
                                    });
                                })
                            ]).execute(callback);
                        },
                        validateMethod: function(cliBuild, cliAction, callback) {
                            if (!cliAction.containsParameter('jarName')) {
                                callback(new Exception("CliException", {}, "'createjar' action requires the 'name' parameter"));
                            }
                            if (!cliAction.containsParameter('jarVersion')) {
                                callback(new Exception("CliException", {}, "'createjar' action requires the 'version' parameter"));
                            }
                            if (!cliAction.containsParameter('jarSources')) {
                                callback(new Exception("CliException", {}, "'createjar' action requires the 'sources' parameter"));
                            }
                            callback();
                        }
                    });

                    _this.registerCliAction({
                        name: 'deletejar',
                        flags: [
                            'deletejar'
                        ],
                        executeMethod: function(cliBuild, cliAction, callback) {
                            /** @type {CliOptionInstance} */
                            var nameOption      = cliBuild.getOption("name");
                            /** @type {CliOptionInstance} */
                            var versionOption   = cliBuild.getOption("version");
                            /** @type {string} */
                            var jarName         = "";
                            /** @type {string} */
                            var jarVersion      = "";

                            if (nameOption) {
                                jarName = versionOption.getParameter("jarName");
                            }
                            if (versionOption) {
                                jarVersion = versionOption.getParameter("jarVersion");
                            }
                            var bugJarApi  = new BugJarApi();
                            $series([
                                $task(function(flow) {
                                    bugJarApi.deleteBugJar({
                                        name: jarName,
                                        version: jarVersion
                                    }, function(throwable) {
                                        flow.complete(throwable);
                                    });
                                })
                            ]).execute(callback);
                        },
                        validateMethod: function(cliBuild, cliAction, callback) {
                            if (!cliAction.containsParameter('jarName')) {
                                return callback(new Exception("CliException", {}, "'deletejar' action requires the 'name' parameter"));
                            }
                            if (!cliAction.containsParameter('jarVersion')) {
                                return callback(new Exception("CliException", {}, "'deletejar' action requires the 'version' parameter"));
                            }
                            callback();
                        }
                    });

                    _this.registerCliOption({
                        name: 'meta',
                        flags: [
                            '-m',
                            '--meta'
                        ],
                        parameters: [
                            {
                                name: "jarMeta"
                            }
                        ]
                    });

                    _this.registerCliOption({
                        name: 'meta',
                        flags: [
                            '-m',
                            '--meta'
                        ],
                        parameters: [
                            {
                                name: "jarMeta"
                            }
                        ]
                    });

                    _this.registerCliOption({
                        name: 'name',
                        flags: [
                            '-n',
                            '--name'
                        ],
                        parameters: [
                            {
                                name: "jarName"
                            }
                        ]
                    });

                    _this.registerCliOption({
                        name: 'sources',
                        flags: [
                            '-s',
                            '--sources'
                        ],
                        parameters: [
                            {
                                name: "jarSources"
                            }
                        ]
                    });

                    _this.registerCliOption({
                        name: 'version',
                        flags: [
                            '-v',
                            '--version'
                        ],
                        parameters: [
                            {
                                name: "jarVersion"
                            }
                        ]
                    });

                    flow.complete();
                })
            ]).execute(callback);
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugjar.BugJarCli', BugJarCli);
});
