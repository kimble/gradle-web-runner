window.pubsub = (function() {
    "use strict";

    var bus = new Bacon.Bus();

    // Create a stream of simple keyboard commands
    $(document).keydown(function(event) {
        var key = String.fromCharCode(event.keyCode);
        var eventType = "key-down-" + key;

        bus.push({
            type: eventType,
            event: {}
        });
    });

    // Dead simple pubsub event-bus with reactive
    // capabilities provided by Bacon.js
    return {
        broadcast: function() {
            if (arguments.length == 2) {
                bus.push({
                    type: arguments[0],
                    event: arguments[1]
                });
            }
            else {
                bus.push(arguments[0]);
            }
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


