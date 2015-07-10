Gradle Web Task Runner
======================
Interactive, web based Gradle task runner.

[#gradle](http://gradle.org/)
[#dropwizard](http://dropwizard.io/)
[#websockets](https://developer.mozilla.org/en/docs/WebSockets)
[#d3js](http://d3js.org)
[#bacon.js](https://baconjs.github.io/)


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
![Screenshot](https://raw.githubusercontent.com/kimble/gradle-web-runner/master/screenshots/v2.png)

![Screenshot](https://raw.githubusercontent.com/kimble/gradle-web-runner/master/screenshots/v2-output.png)


Give it a spin
--------------
Check out the source code then run the following command that'll download Gradle, build the project and start it up (gotta love Gradle wrapper!).

    git clone git@github.com:kimble/gradle-web-runner.git
    cd gradle-web-runner
    ./gradlew run

Then navigate to [http://localhost:8080/](http://localhost:8080/]) in your web browser.

Btw, I use Chrome during development so no guaranties regarding other browsers.


Known restrictions
------------------
No windows support (people using Windows does not deserve nice things anyway).

Things I might do
-----------------
As this is just a summer pet projects I'll probably never get around to do half of these things.

- **Bugfix:** Doesn't work with Gradle daemon (server socket lifecycle)
- **Bugfix:** Increase websocket idle timeout (java.util.concurrent.TimeoutException: Idle timeout expired: 10003/10000 ms)
- **Feature:** Visualize task dependencies
- **Feature:** Visualize how tasks run in parallel
- **Feature:** Visualize test results
- **Cleanup:** Move css out into separate .css files
- **Cleanup:** Replace js dependencies with webjars
- **Improvement:** Windows support (use ./gradlew.bat instead of ./gradlew and so on..)