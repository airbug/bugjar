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
var parallel = buildbug.parallel;
var series = buildbug.series;
var targetTask = buildbug.targetTask;


//-------------------------------------------------------------------------------
// Enable Modules
//-------------------------------------------------------------------------------

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
    ]
});

buildProperties({
    bugjarJson: {
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
        parallel([
            series([
                targetTask("createNodePackage", {
                    properties: {
                        packageJson: buildProject.getProperties().packageJson,
                        sourcePaths: buildProject.getProperties().sourcePaths
                    }
                }),
                targetTask("generateBugPackRegistry", {
                    init: function(task, buildProject, properties) {
                        var nodePackage = nodejs.findNodePackage(buildProject.getProperties().name);
                        task.updateProperties({
                            sourceRoot: nodePackage.getBuildPath()
                        });
                    }
                }),
                targetTask("packNodePackage", {
                    properties: {
                        packageName: buildProject.getProperties().name
                    }
                })
            ])/*,
            series([
                targetTask("create")
            ])*/
        ])
    ])
).makeDefault();
