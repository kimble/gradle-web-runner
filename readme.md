Gradle Web Task Runner
======================
Interactive, web based Gradle task runner. #gradle #websockets #dropwizard #d3js #baconjs.



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
