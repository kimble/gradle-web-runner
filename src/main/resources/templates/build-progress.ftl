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
        <script src="/assets/d3/d3.min.js"></script>

        <script src="/assets/lib/task-donut.js"></script>
        <script src="/assets/lib/test-list.js"></script>

        <style type="text/css">
            .container-full {
                margin: 0 auto;
                width: 95%;
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

                ws.onopen = function() {
                    ws.send(buildNumber);

                    ws.onmessage = function(message) {
                        console.log (" << " + message.data);
                    }
                };

            })();
        </script>

    </body>
</html>
