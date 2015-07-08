<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>G-Viz</title>

        <link href="/assets/bootstrap/css/bootstrap.min.css" rel="stylesheet">
        <script src="/assets/jquery/jquery-2.1.4.min.js"></script>

        <style type="text/css">
            .input-dashed {
                padding: 5px 10px;
                font-size: 1.6em;
                border: none;
                border-bottom: 3px dotted #777;
                font-family: Ubuntu, monospace;
                margin-top: 1em;
                width: 100%;
            }

            #go {
                margin-top: 2em;
            }

            #headerRow {
                margin-top: 4em;
            }
        </style>
    </head>

    <body>

        <div class="container">
            <div class="row">
                <div id="headerRow" class="col-md-12">
                    <div class="page-header">
                        <h1>G-VIZ <small> - Gradle web executor</small></h1>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-12">
                    <input type="text" class="input-dashed" id="path" placeholder="/path/to/project" value="/home/kim/development/mine-pasientreiser/pro-ng" autofocus />
                </div>
            </div>
            <div class="row">
                <div class="col-md-8">
                    <input type="text" class="input-dashed" id="tasks" placeholder=":tasks" value="test" />
                </div>
            </div>

            <div class="row">
                <div class="col-md-12">
                    <input type="button" id="go" value="GO!" class="btn btn-success btn-lg" />
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

                $("#go").on("click", function() {
                    var path = $("#path").val();
                    var tasks = $("#tasks").val();


                    console.log("Posting..");
                    $.postJSON('/api/exec', { path: path, tasks: tasks }, function(response) {
                        window.location = "/api/build/" + response.number
                    });

                });
            })();
        </script>

    </body>
</html>
