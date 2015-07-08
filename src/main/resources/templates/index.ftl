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
                font-size: 2em;
                border: none;
                border-bottom: 2px dashed #999;
                margin-top: 1em;
                width: 100%;
            }

        </style>
    </head>

    <body>

        <div class="container">
            <div class="row">
                <div class="col-md-12">
                    <input type="text" class="input-dashed" id="path" placeholder="/path/to/project" value="/home/kim/development/mine-pasientreiser/pro-ng" autofocus />
                </div>
            </div>
            <div class="row">
                <div class="col-md-10">
                    <input type="text" class="input-dashed" id="tasks" placeholder=":tasks" value="clean" />
                </div>
                <div class="col-md-2">
                    <input type="button" id="go" value="GO!" class="btn btn-default btn-lg" />
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
                    $.postJSON('/exec', { path: path, tasks: tasks }, function(callback) {
                        console.log("Response: " + callback);
                    })
                });
            })();
        </script>

    </body>
</html>
