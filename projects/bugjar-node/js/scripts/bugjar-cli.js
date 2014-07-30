//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require("bugpack").loadContext(module, function(error, bugpack) {
    if (!error) {
        bugpack.loadExports(["Flows", "bugjar.BugJarCli"], function(error) {
            if (!error) {

                //-------------------------------------------------------------------------------
                // BugPack
                //-------------------------------------------------------------------------------

                var Flows           = bugpack.require('Flows');
                var BugJarCli       = bugpack.require('bugjar.BugJarCli');


                //-------------------------------------------------------------------------------
                // Simplify References
                //-------------------------------------------------------------------------------

                var $series         = Flows.$series;
                var $task           = Flows.$task;


                //-------------------------------------------------------------------------------
                // Script
                //-------------------------------------------------------------------------------

                var startTime = (new Date()).getTime();
                var bugJarCli = new BugJarCli();
                $series([
                    $task(function(flow) {
                        bugJarCli.configure(function(error) {
                            flow.complete(error);
                        });
                    }),
                    $task(function(flow) {
                        bugJarCli.run(process.argv, function(error) {
                            flow.complete(error);
                        });
                    })
                ]).execute(function(throwable) {
                    if (!throwable) {
                        var endTime = (new Date()).getTime();
                        console.log("buildbug ran successfully in " + (endTime - startTime) + " ms");
                    } else {
                        console.log(throwable.message);
                        console.log(throwable.stack);
                        console.log("buildbug encountered an error");
                        process.exit(1);
                    }
                });

            } else {
                console.log(error.message);
                console.log(error.stack);
                process.exit(1);
            }
        });
    } else {
        console.log(error.message);
        console.log(error.stack);
        process.exit(1);
    }
});
