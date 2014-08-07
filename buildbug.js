//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

var buildbug            = require("buildbug");


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var buildProject        = buildbug.buildProject;
var buildProperties     = buildbug.buildProperties;
var buildTarget         = buildbug.buildTarget;
var enableModule        = buildbug.enableModule;
var parallel            = buildbug.parallel;
var series              = buildbug.series;
var targetTask          = buildbug.targetTask;


//-------------------------------------------------------------------------------
// Enable Modules
//-------------------------------------------------------------------------------

var aws                 = enableModule("aws");
var bugpack             = enableModule("bugpack");
var bugunit             = enableModule('bugunit');
var core                = enableModule("core");
var nodejs              = enableModule("nodejs");


//-------------------------------------------------------------------------------
// Values
//-------------------------------------------------------------------------------

var name                = "bugjar";
var version             = "0.0.1";
var dependencies        = {
    bugpack: "0.1.14"
};


//-------------------------------------------------------------------------------
// Declare Properties
//-------------------------------------------------------------------------------

buildProperties({
    name: name,
    version: version
});

buildProperties({
    node: {
        packageJson: {
            name: "{{name}}",
            version: "{{version}}",
            description: "bugjar is a JavaScript library that provides a jarring system for reusable JS libraries (think Java jars)",
            main: "./scripts/bugjar-node.js",
            bin: "bin/bugjar",
            dependencies: dependencies,
            author: "Brian Neisler <brian@airbug.com>",
            repository: {
                type: "git",
                url: "https://github.com/airbug/bugjar.git"
            },
            bugs: {
                url: "https://github.com/airbug/bugjar/issues"
            },
            licenses: [
                {
                    type : "MIT",
                    url : "https://raw.githubusercontent.com/airbug/bugjar/master/LICENSE"
                }
            ]
        },
        binPaths: [
            "./projects/bugjar-node/bin"
        ],
        sourcePaths: [
            "../bugaws/libraries/bugaws/js/src",
            "../bugcli/libraries/bugcli/js/src",
            "../bugcore/libraries/bugcore/js/src",
            "../bugfs/libraries/bugfs/js/src",
            "../bugmeta/libraries/bugmeta/js/src",
            "./libraries/bugjar/js/src",
            "./projects/bugjar-node/js/src"
        ],
        scriptPaths: [
            "./projects/bugjar-node/js/scripts"
        ],
        readmePath: "./README.md",
        unitTest: {
            packageJson: {
                name: "{{name}}-test",
                version: "{{version}}",
                main: "./scripts/bugjar-node.js",
                dependencies: dependencies,
                scripts: {
                    test: "node ./test/scripts/bugunit-run.js"
                }
            },
            sourcePaths: [
                "../buganno/libraries/buganno/js/src",
                "../bugdouble/libraries/bugdouble/js/src",
                "../bugunit/libraries/bugunit/js/src"
            ],
            scriptPaths: [
                "../buganno/libraries/buganno/js/scripts",
                "../bugunit/libraries/bugunit/js/scripts"
            ],
            testPaths: [
                "../bugcli/libraries/bugcli/js/test",
                "../bugcore/libraries/bugcore/js/test",
                "../bugfs/libraries/bugfs/js/test",
                "../bugmeta/libraries/bugmeta/js/test",
                "./libraries/bugjar/js/test"
            ]
        }
    }
});


//-------------------------------------------------------------------------------
// Declare Tasks
//-------------------------------------------------------------------------------


//-------------------------------------------------------------------------------
// Declare Flows
//-------------------------------------------------------------------------------

// Clean BuildTarget
//-------------------------------------------------------------------------------

buildTarget("clean").buildFlow(
    targetTask("clean")
);


// Local BuildTarget
//-------------------------------------------------------------------------------

buildTarget("local").buildFlow(
    series([
        targetTask("clean"),
        targetTask('createNodePackage', {
            properties: {
                packageJson: buildProject.getProperty("node.packageJson"),
                packagePaths: {
                    "./": [buildProject.getProperty("node.readmePath")],
                    "./bin": buildProject.getProperty("node.binPaths"),
                    "./lib": buildProject.getProperty("node.sourcePaths"),
                    "./scripts": buildProject.getProperty("node.scriptPaths"),
                    "./test": buildProject.getProperty("node.unitTest.testPaths"),
                    "./test/lib": buildProject.getProperty("node.unitTest.sourcePaths"),
                    "./test/scripts": buildProject.getProperty("node.unitTest.scriptPaths")
                }
            }
        }),
        targetTask('generateBugPackRegistry', {
            init: function(task, buildProject, properties) {
                var nodePackage = nodejs.findNodePackage(
                    buildProject.getProperty("node.packageJson.name"),
                    buildProject.getProperty("node.packageJson.version")
                );
                task.updateProperties({
                    sourceRoot: nodePackage.getBuildPath()
                });
            }
        }),
        targetTask('packNodePackage', {
            properties: {
                packageName: "{{node.packageJson.name}}",
                packageVersion: "{{node.packageJson.version}}"
            }
        }),
        targetTask('startNodeModuleTests', {
            init: function(task, buildProject, properties) {
                var packedNodePackage = nodejs.findPackedNodePackage(
                    buildProject.getProperty("node.packageJson.name"),
                    buildProject.getProperty("node.packageJson.version")
                );
                task.updateProperties({
                    modulePath: packedNodePackage.getFilePath()
                    //checkCoverage: true
                });
            }
        }),
        targetTask("s3PutFile", {
            init: function(task, buildProject, properties) {
                var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperty("node.packageJson.name"),
                    buildProject.getProperty("node.packageJson.version"));
                task.updateProperties({
                    file: packedNodePackage.getFilePath(),
                    options: {
                        acl: 'public-read',
                        encrypt: true
                    }
                });
            },
            properties: {
                bucket: "{{local-bucket}}"
            }
        })
    ])
).makeDefault();


// Prod BuildTarget
//-------------------------------------------------------------------------------

buildTarget("prod").buildFlow(
    series([

        // TODO BRN: This "clean" task is temporary until we're not modifying the build so much. This also ensures that
        // old source files are removed. We should figure out a better way of doing that.

        targetTask("clean"),
        parallel([
            series([
                targetTask("createNodePackage", {
                    properties: {
                        packageJson: buildProject.getProperty("node.packageJson"),
                        packagePaths: {
                            "./": [buildProject.getProperty("node.readmePath")],
                            "./bin": buildProject.getProperty("node.binPaths"),
                            "./lib": buildProject.getProperty("node.sourcePaths"),
                            "./scripts": buildProject.getProperty("node.scriptPaths"),
                            "./test": buildProject.getProperty("node.unitTest.testPaths"),
                            "./test/lib": buildProject.getProperty("node.unitTest.sourcePaths"),
                            "./test/scripts": buildProject.getProperty("node.unitTest.scriptPaths")
                        }
                    }
                }),
                targetTask("generateBugPackRegistry", {
                    init: function(task, buildProject, properties) {
                        var nodePackage = nodejs.findNodePackage(
                            buildProject.getProperty("node.packageJson.name"),
                            buildProject.getProperty("node.packageJson.version")
                        );
                        task.updateProperties({
                            sourceRoot: nodePackage.getBuildPath()
                        });
                    }
                }),
                targetTask("packNodePackage", {
                    properties: {
                        packageName: buildProject.getProperty("node.packageJson.name"),
                        packageVersion: buildProject.getProperty("node.packageJson.version")
                    }
                }),
                targetTask("startNodeModuleTests", {
                    init: function(task, buildProject, properties) {
                        var packedNodePackage = nodejs.findPackedNodePackage(
                            buildProject.getProperty("node.packageJson.name"),
                            buildProject.getProperty("node.packageJson.version")
                        );
                        task.updateProperties({
                            modulePath: packedNodePackage.getFilePath(),
                            checkCoverage: true
                        });
                    }
                })
            ]),

            // Create production package

            series([
                targetTask("createNodePackage", {
                    properties: {
                        packageJson: buildProject.getProperty("node.packageJson"),
                        packagePaths: {
                            "./": [buildProject.getProperty("node.readmePath")],
                            "./bin": buildProject.getProperty("node.binPaths"),
                            "./lib": buildProject.getProperty("node.sourcePaths"),
                            "./scripts": buildProject.getProperty("node.scriptPaths")
                        }
                    }
                }),
                targetTask("generateBugPackRegistry", {
                    init: function(task, buildProject) {
                        var nodePackage = nodejs.findNodePackage(
                            buildProject.getProperty("node.packageJson.name"),
                            buildProject.getProperty("node.packageJson.version")
                        );
                        task.updateProperties({
                            sourceRoot: nodePackage.getBuildPath()
                        });
                    }
                }),
                targetTask('packNodePackage', {
                    properties: {
                        packageName: "{{node.packageJson.name}}",
                        packageVersion: "{{node.packageJson.version}}"
                    }
                }),
                targetTask("s3PutFile", {
                    init: function(task, buildProject, properties) {
                        var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperty("node.packageJson.name"),
                            buildProject.getProperty("node.packageJson.version"));
                        task.updateProperties({
                            file: packedNodePackage.getFilePath(),
                            options: {

                                //TODO BRN: In order to protect this file we need to limit the access to this artifact and provide some sort of http auth access so that the artifacts are retrievable via npm install. This would need to be done in a server wrapper.

                                acl: "public-read",
                                encrypt: true
                            }
                        });
                    },
                    properties: {
                        bucket: "{{public-bucket}}"
                    }
                }),
                targetTask('npmConfigSet', {
                    properties: {
                        config: buildProject.getProperty("npmConfig")
                    }
                }),
                targetTask('npmAddUser'),
                targetTask('publishNodePackage', {
                    properties: {
                        packageName: "{{node.packageJson.name}}",
                        packageVersion: "{{node.packageJson.version}}"
                    }
                })
            ])
        ])
    ])
);
