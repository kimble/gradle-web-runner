<#-- @ftlvariable name="" type="com.developerb.gviz.exec.ExecResource.TestReportView" -->
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Gradle Web Runner - Build - ${buildNumber} - Test report</title>


        <link rel="stylesheet" href="/assets/mdl/material.min.css">
        <link href="/assets/bootstrap/css/bootstrap.min.css" rel="stylesheet">

        <script src="/assets/jquery/jquery-2.1.4.min.js"></script>
        <script src="/assets/bacon/bacon.js"></script>
        <script src="/assets/d3/d3.min.js"></script>
        <script src="/assets/underscore/underscore-min.js"></script>
        <script src="/assets/mdl/material.min.js"></script>

        <script src="/assets/page/pubsub.js"></script>
        <script src="/assets/page/build-websockets.js"></script>

        <script src="/assets/page/test-report/test-report.js"></script>

        <link href='/assets/page/test-report/test-report.css' rel='stylesheet' type='text/css'>

        <link href='http://fonts.googleapis.com/css?family=Roboto:400,500,700' rel='stylesheet' type='text/css'>
        <link href='http://fonts.googleapis.com/css?family=Oswald:400,700,300' rel='stylesheet' type='text/css'>
    </head>
    <body>



        <div class="container container-full">
            <div class="row">
                <div id="headerRow" class="col-md-12">
                    <h1>#${buildNumber} - Test report - <span class="project-name">Waiting for project name...</span> <br/> <small>./gradlew ${commandLine}</small></h1>
                </div>
            </div>
        </div>

        <div id="filterPanel">
            <div>
                <label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="showSuccess">
                    <input type="checkbox" id="showSuccess" class="mdl-checkbox__input" tabindex="3" />
                    <span class="mdl-checkbox__label">Show successful tests</span>
                </label>
            </div>
        </div>


        <div id="testPanel">
            <h2 class="header">Test panel</h2>
            <hr/>
            
            <div class="test-container hide-success"></div>
        </div>

        <div id="outputPanel">
            <div class="output-header"></div>
            <div class="output-container"></div>
        </div>




        <script type="text/template" id="packageTemplate" class="template">
            <div class="entity package">
                <h3 class="header">
                    <%- root.name %>
                </h3>

                <p class="summary">
                    <%- root.classCount + " classes with a total of " + root.testCount + " tests" %>
                </p>
            </div>
        </script>


        <script type="text/template" id="testInstanceTemplate">
            <div class="test">
                <h3 class="header">
                    <small><%- root.className %></small>
                    <br/>
                    <%- root.name %>
                </h3>

                <p class="summary">
                    <%- root.summary %>
                </p>
            </div>
        </script>


        <script type="text/template" id="outputTemplate">
            <div>
                <% if (root.output != null) { %>
                <h3>System output</h3>
                <pre class="output"><%- root.output %></pre>
                <% } %>

                <% if (root.exceptionStacktrace != "") { %>
                <h3>Stacktrace</h3>
                <pre class="stacktrace"><%- root.exceptionStacktrace %></pre>
                <% } %>

                <% if (root.exceptionStacktrace == "" && root.output == null) { %>
                    <% if (root.success) { %>
                        <span class="glyphicon glyphicon-thumbs-up big-thumbs-up"></span>
                    <% } %>
                <% } %>
            </div>
        </script>

        <script type="text/template" id="testOutputHeaderTemplate">
            <div>
                <h3 class="header">
                    <small class="class-name"><%- root.className %></small>
                    <br/>
                    <%- root.name %>
                </h3>

                <p class="summary">
                    <%- root.summary %>
                </p>
            </div>
        </script>


        <script type="text/javascript">
            (function() {
                "use strict";

                var buildNumber = ${buildNumber};

                // Interface
                createTestReport(pubsub);

                // Connect to websocket
                streamBuildEvents(pubsub, buildNumber);


            })();
        </script>

    </body>
</html>
