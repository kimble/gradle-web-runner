<#-- @ftlvariable name="" type="com.developerb.gviz.exec.ExecResource.BuildView" -->
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>G-Viz - Build - ${buildNumber}</title>

        <link href="/assets/bootstrap/css/bootstrap.min.css" rel="stylesheet">
        <script src="/assets/jquery/jquery-2.1.4.min.js"></script>
        <script src="/webjars/baconjs/0.7.18/Bacon.js"></script>
        <script src="/assets/d3/d3.min.js"></script>

        <script src="/assets/lib/gradle-settings.js"></script>
        <script src="/assets/lib/gradle-output.js"></script>

        <style type="text/css">
            body {
                overflow: hidden;
            }

            .container-full {
                margin: 0 auto;
                width: 95%;
            }



            #gradleOutput {
                position: absolute;
                bottom: 20px;
                right: 20px;

                width: 60%;
                height: 400px;

                border: 1px solid #eee;
                box-shadow: 0 0 60px rgba(0, 0, 0, 0.1);

                transition: bottom 0.7s;
            }

            #gradleOutput.shy {
                bottom: -340px;
            }

            #gradleOutput .page-header {
                cursor: pointer;
            }

            #gradleOutput .output-container>div {
                padding: 0 1em 0 1em;
            }

            #gradleOutput .output-container {
                font-family: "Ubuntu Mono", monospace;
                height: 300px;
                width: 99%;
                overflow: auto;
            }

            #gradleOutput .page-header {
                margin: 0 1em 1em 1em;
            }


        </style>
    </head>

    <body>

        <div class="container container-full">
            <div class="row">
                <div id="headerRow" class="col-md-12">
                    <div class="page-header">
                        <h1>#${buildNumber} <span id="projectName">Loading data...</span></h1>
                    </div>
                </div>
            </div>



        </div>



        <!-- Gradle output -->
        <div id="gradleOutput" class="shy">
            <div class="page-header">
                <h3>Gradle <u>o</u>utput <small class="last-line">....</small></h3>
            </div>

            <div class="output-container"></div>
        </div>


        <script type="text/javascript">
            function namedAttr(name) {
                return function(obj) {
                    return obj[name];
                };
            }

            function not(func) {
                return function() {
                    return !func();
                }
            }


            (function() {
                "use strict";

                var buildNumber = ${buildNumber};
                var ws = new WebSocket("ws://localhost:8080/ws/build");



                var pubsub = (function() {
                    var bus = new Bacon.Bus();

                    $(document).keydown(function(event) {
                        var key = String.fromCharCode(event.keyCode);
                        bus.push({type: "key-down-" + key, event: {}})
                    });

                    return {
                        broadcast: function(event) {
                            bus.push(event);
                        },
                        stream: function(type) {
                            return bus.filter(function (transfer) {
                                return transfer.type == type;
                            }).map(function(transfer) {
                                return transfer.event;
                            });
                        }
                    }
                })();


                createGradleOutputConsole(pubsub);
                createGradleSettings(pubsub);


                ws.onopen = function() {
                    ws.send(buildNumber);

                    ws.onmessage = function(message) {
                        var transfer = JSON.parse(message.data);
                        pubsub.broadcast(transfer);
                    }

                };

            })();
        </script>

    </body>
</html>
