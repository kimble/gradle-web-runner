var streamBuildEvents = (function() {
    "use strict";

    return function(pubsub, buildNumber) {
        var ws = new WebSocket("ws://localhost:8080/ws/build");
        var messageCounter = 0;

        ws.onmessage = function(message) {
            var transfer = JSON.parse(message.data);
            pubsub.broadcast(transfer);
            messageCounter++;

            if (transfer.type === 'GradleBuildCompleted') {
                console.info("Got last event, closing the websocket after processing " + messageCounter + " messages");
                ws.close();
            }
        };

        ws.onopen = function() {
            console.info("Connected to backend, requesting build event stream");
            messageCounter = 0;
            ws.send(buildNumber);
        };

        ws.onclose = function() {
            console.info("Websocket closed");
        };
    }
})();