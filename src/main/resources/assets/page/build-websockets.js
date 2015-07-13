var streamBuildEvents = (function() {
    "use strict";

    return function(pubsub, buildNumber) {
        var ws = new WebSocket("ws://localhost:8080/ws/build");

        ws.onmessage = function(message) {
            var transfer = JSON.parse(message.data);
            pubsub.broadcast(transfer);

            if (transfer.type === 'GradleBuildCompleted') {
                console.info("Got last event, closing the websocket");
                ws.close();
            }
        };

        ws.onopen = function() {
            ws.send(buildNumber);
        };

        ws.onclose = function() {
            console.info("Websocket closed");
        };
    }
})();