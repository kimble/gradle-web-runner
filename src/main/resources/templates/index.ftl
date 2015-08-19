<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Gradle Web Runner</title>


        <link rel="stylesheet" href="/assets/bootstrap/css/bootstrap.min.css">
        <link rel="stylesheet" href="/assets/mdl/material.min.css">
        <link rel="stylesheet" href="//fonts.googleapis.com/icon?family=Material+Icons">

        <script src="/assets/jquery/jquery-2.1.4.min.js"></script>
        <script src="/assets/mdl/material.min.js"></script>
	<script src="/assets/bacon/bacon.js"></script>

        <style type="text/css">
            #go {
                margin-top: 2em;
            }

            body {
                background-color: #FAFAFA;
            }

            .container {
                background-color: white;
                border: 1px solid #fefefe;
                box-shadow: 0 0 50px rgba(100, 100, 100, 0.05);
                border-radius: 2px;
                margin-top: 10%;
            }

            .container h1 {
                margin-top: 5px;
                font-size: 3em;
            }

            .container h2 {
                font-family: 'Oswald', sans-serif;
                font-size: 2.5em;
                margin: 0.3em 0 0.5em 0;
            }

            .footer {
                margin-top: 2em;
                padding: 0.5em 1em;
                color: #888;
                text-align: right;
                border-top: 1px solid #f6f6f6;
                background-color: #f9f9f9;
            }
        </style>
    </head>

    <body>

        <div class="container">
            <div class="row">
                <div class="col-md-12">
                </div>
            </div>

            <div class="row">
                <div class="col-md-8">
                    <h2>Build</h2>

                    <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 700px">
                        <input class="mdl-textfield__input" type="text" id="path" tabindex="1" autofocus />
                        <label class="mdl-textfield__label" for="sample3">/path/to/project</label>
                    </div>

                    <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" style="width: 400px">
                        <input class="mdl-textfield__input" type="text" id="tasks" tabindex="2" />
                        <label class="mdl-textfield__label" for="sample3">:tasks</label>
                    </div>

                    <div>
                        <button id="go" tabindex="10" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">
                            Execute!
                        </button>
                    </div>
                </div>
                <div class="col-md-4">
                    <h2>Configuration</h2>

                    <div>
                        <label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="configureOnDemand">
                            <input type="checkbox" id="configureOnDemand" class="mdl-checkbox__input" tabindex="3" />
                            <span class="mdl-checkbox__label">Configure on demand</span>
                        </label>
                    </div>

                    <div>
                        <label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="useDaemon">
                            <input type="checkbox" id="useDaemon" class="mdl-checkbox__input" tabindex="4" />
                            <span class="mdl-checkbox__label">Enable daemon</span>
                        </label>
                    </div>

                    <div>
                        <label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="parallelBuild">
                            <input type="checkbox" id="parallelBuild" class="mdl-checkbox__input" tabindex="5" />
                            <span class="mdl-checkbox__label">Build in parallel <span id="maxWorkerCountLabel"></span></span>
                        </label>

                        <label class="hidden" for="maxWorkers" id="maxWorkersLabel">
                            <p style="width: 300px; text-align: center; font-style: italic; margin-top: 1em;">
                                <input class="mdl-slider mdl-js-slider" type="range" id="maxWorkers" min="0" max="30" value="4" step="1" tabindex="6" />

                                Using a maximum of <span id="maximumNumberOfWorkers" style="font-weight: bold"></span> workers.
                            </p>
                        </label>
                    </div>
                </div>
            </div>




            <div class="row">
                <div class="col-md-12 footer">
                    - Gradle web runner
                </div>
            </div>
        </div>



        <script type="text/javascript">
            jQuery.extend({
                postJSON: function(url, data, callback) {
                    return jQuery.ajax({
                        type: "POST",
                        url: url,
                        data: JSON.stringify(data),
                        success: callback,
                        dataType: "json",
                        contentType: "application/json",
                        processData: false
                    });
                }
            });


            (function() {
                "use strict";

                function createCheckboxStream(selector) {
                    var $el = $(selector);
                    return $el.asEventStream("change").map(".target.checked").toProperty($el.is(":checked"));
                }

                function createInputStream(selector) {
                    var $el = $(selector);
                    return $el.asEventStream("change").map(".target.value").toProperty($el.val());
                }


                // Build
                var path = createInputStream("#path");
                var tasks = createInputStream("#tasks");



                // Options

                var toggleConfigureOnDemand = createCheckboxStream("#configureOnDemand");
                var toggleDaemon = createCheckboxStream("#useDaemon");
                var toggleParallelBuild = createCheckboxStream("#parallelBuild");


                toggleParallelBuild.not().assign($("#maxWorkersLabel"), "toggleClass", "hidden");

                var maxWorkerCount = createInputStream("#maxWorkers");
                maxWorkerCount.assign($("#maximumNumberOfWorkers"), "html");



                // All together now

                var requestTemplate = Bacon.combineTemplate({
                    path: path,
                    tasks: tasks,

                    configureOnDemand: toggleConfigureOnDemand,
                    buildInParallel: toggleParallelBuild,
                    maximumWorkers: maxWorkerCount,
                    allowDaemon: toggleDaemon
                });


                // Send request

                var requestStream = $("#go").asEventStream("click");
                requestTemplate.sampledBy(requestStream).onValue(function(requestPayload) {
                    $.postJSON('/api/exec', requestPayload, function(response) {
                        window.location = "/api/build/" + response.number
                    });
                });

            })();
        </script>


    </body>
</html>
