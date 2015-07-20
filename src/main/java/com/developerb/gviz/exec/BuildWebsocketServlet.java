package com.developerb.gviz.exec;

import com.developerb.gviz.events.Event;
import com.developerb.gviz.events.GradleBuildCompleted;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.eclipse.jetty.websocket.api.RemoteEndpoint;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;
import org.eclipse.jetty.websocket.servlet.WebSocketServlet;
import org.eclipse.jetty.websocket.servlet.WebSocketServletFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.annotation.WebServlet;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * @author Kim A. Betti
 */
@WebServlet(name = "Build progress servlet", urlPatterns = { "/ws/build" })
public class BuildWebsocketServlet extends WebSocketServlet {

    private final static Logger log = LoggerFactory.getLogger(BuildWebsocketServlet.class);


    private final BuildRepository buildRepository;
    private final ObjectMapper jackson;

    public BuildWebsocketServlet(BuildRepository buildRepository, ObjectMapper jackson) {
        this.buildRepository = buildRepository;
        this.jackson = jackson;
    }

    @Override
    public void configure(WebSocketServletFactory factory) {
        factory.getPolicy().setIdleTimeout(30_000);
        factory.setCreator((req, resp) -> new BuildSocket());
    }

    @WebSocket
    public class BuildSocket {

        @OnWebSocketMessage
        public void onWebSocketText(Session session, String message) {
            try {
                RemoteEndpoint remote = session.getRemote();
                Integer buildNumber = Integer.parseInt(message);
                Optional<Build> optionalBuild = buildRepository.get(buildNumber);
                Build build = optionalBuild.get();
                EventStore eventStore = build.getEventStore();

                int clientPosition = 0;
                int head;

                boolean done = false;

                while (!done) {
                    head = eventStore.head();

                    if ((head - 1) > clientPosition) {
                        final List<Event> newEvents = eventStore.read(clientPosition, head - 1);

                        for (Event newEvent : newEvents) {
                            serializeAndSend(remote, newEvent);
                            remote.flush();
                            ++clientPosition;

                            if (newEvent instanceof GradleBuildCompleted) {
                                log.info("Detected last event, closing down websocket");
                                done = true;

                                // Hum.. if we close the session here some events will be
                                // lost even if we flush remote first.. Strange..
                            }
                        }
                    }
                    else {
                        Thread.sleep(100);
                    }
                }
            }
            catch (Exception ex) {
                log.error("Unexpected exception", ex);
                session.close();
            }
        }

        private void serializeAndSend(RemoteEndpoint remote, Event newEvent) throws IOException {
            String simpleEventName = newEvent.getClass().getSimpleName();
            EventTransport transport = new EventTransport(simpleEventName, newEvent);
            String serialized = jackson.writeValueAsString(transport);
            remote.sendString(serialized);
        }

    }


    private static class EventTransport {

        private final String type;
        private final Event event;

        private EventTransport(String type, Event event) {
            this.event = event;
            this.type = type;
        }

        public String getType() {
            return type;
        }

        public Event getEvent() {
            return event;
        }

    }

}
