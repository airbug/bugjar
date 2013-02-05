//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

var buildbug = require("buildbug");


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var buildProject = buildbug.buildProject;
var buildProperties = buildbug.buildProperties;
var buildTarget = buildbug.buildTarget;
var enableModule = buildbug.enableModule;
var series = buildbug.series;
var targetTask = buildbug.targetTask;


//-------------------------------------------------------------------------------
// Enable Modules
//-------------------------------------------------------------------------------

//var bugjar = enableModule("bugjar");
var bugpack = enableModule("bugpack");
var core = enableModule("core");
var nodejs = enableModule("nodejs");


//-------------------------------------------------------------------------------
// Declare Properties
//-------------------------------------------------------------------------------

buildProperties({
    name: "bugjar",
    version: "0.0.1",
    sourcePaths: [
        "./projects/bugjar/js/src",
        "../bugjs/projects/bugjs/js/src"
    ],
    testPaths: [
        "./projects/bugjar/js/test",
        "../bugjs/projects/bugjs/js/test"
    ]
});

buildProperties({
    bugJarJson: {
        name: buildProject.getProperties().name,
        version: buildProject.getProperties().version,
        dependencies: [
            {
                name: "bugjs",
                version: "0.0.1",
                type: "bugjar"
            },
            {
                name: "aws-sdk",
                version: "0.9.x",
                type: "nodejs"
            }
        ]
    },
    packageJson: {
        name: buildProject.getProperties().name,
        version: buildProject.getProperties().version,
        main: "./lib/bugjarapi_boot.js",
        dependencies: {
            "aws-sdk": "0.9.x",
            bugpack: "git+ssh://git@github.com:airbug/bugpack.git#master"
        }
    }
});


//-------------------------------------------------------------------------------
// Declare Tasks
//-------------------------------------------------------------------------------


//-------------------------------------------------------------------------------
// Declare Flows
//-------------------------------------------------------------------------------

buildTarget("clean").buildFlow(
    targetTask("clean")
);

buildTarget("local").buildFlow(
    series([

        // TODO BRN: This "clean" task is temporary until we"re not modifying the build so much. This also ensures that
        // old source files are removed. We should figure out a better way of doing that.

        targetTask("clean"),

        //TODO BRN: We have to get this library working before we can begin depending upon it for building bugjars
        /* targetTask("createBugJar", {
            properties: {
                bugJarJson: buildProject.getProperties().bugJarJson
            }
        }),
        targetTask("fillBugJar", {
            properties: {
                name: buildProject.getProperties().name,
                version: buildProject.getProperties().version,
                sourcePaths: buildProject.getProperties().sourcePaths
            }
        }),
        targetTask("resolveBugJarDependencies", {
            properties: {
                name: buildProject.getProperties().name,
                version: buildProject.getProperties().version
            }
        })*/

        targetTask("createNodePackage", {
            /*init: function(task, buildProject, properties) {
                var bugJar = nodejs.findNodePackage(buildProject.getProperties().name);
                task.updateProperties({
                    sourceRoot: nodePackage.getBuildPath()
                });
            },*/
            properties: {
                packageJson: buildProject.getProperties().packageJson,
                sourcePaths: buildProject.getProperties().sourcePaths,
                testPaths: buildProject.getProperties().testPaths
            }
        }),
        targetTask("generateBugPackRegistry", {
            init: function(task, buildProject, properties) {
                var nodePackage = nodejs.findNodePackage(buildProject.getProperties().name,
                    buildProject.getProperties().version);
                task.updateProperties({
                    sourceRoot: nodePackage.getBuildPath()
                });
            }
        }),
        targetTask("runBugUnitTests", {
            //TODO BRN: Use 'npm test' to run tests. Need to embed
        }),
        targetTask("packNodePackage", {
            properties: {
                packageName: buildProject.getProperties().name
            }
        }),
        targetTask("s3EnsureBucket", {
            properties: {
                bucket: "node_modules"
            }
        }),
        targetTask("s3PutObject", {
            init: function(task, buildProject, properties) {
                var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperties().name,
                    buildProject.getProperties().version);
                task.updateProperties({
                    file: packedNodePackage.getFilePath()
                });
            },
            properties: {
                bucket: "node_modules"
            }
        })
    ])
).makeDefault();
