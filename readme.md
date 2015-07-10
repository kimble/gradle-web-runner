Gradle Web Task Runner
======================
Interactive, web based Gradle task runner.

[#Gradle](http://gradle.org/)
[#Dropwizard](http://dropwizard.io/)
[#Websockets](https://developer.mozilla.org/en/docs/WebSockets)
[#d3js](http://d3js.org)
[#Bacon.js](https://baconjs.github.io/)


Introduction
------------
With my in-laws entertaining the kids I finally have a bit of time to play with pet projects.
This is a project that I've been thinking about for a while. My original idea was to create a super
simple ci-server solely executing specific tasks using a Gradle wrapper.

So far it's able to fork a Gradle process with a custom init script. This init script will in turn
open a server socket, wait for the backend to connect and then use the connection to stream
various events to the backend which in turn is able to process and stream these events to the
web interface over web sockets.

Screenshot
----------
![Screenshot](https://raw.githubusercontent.com/kimble/gradle-web-runner/master/screenshots/v1.png)


Give it a spin
--------------
Check out the source code then run the following command that'll download Gradle, build the project and start it up (gotta love Gradle wrapper!).

    ./gradlew run

Then navigate to [http://localhost:8080/](http://localhost:8080/]) in your web browser
(I use Chrome during development so no guaranties regarding other browsers).