# Rpi-automated-fan
A Raspberry Pi project featuring an automatic mini-fan based on environment temperature,
as well as a web application (using the Flask microframework served with uWSGI and Nginx) which dynamically displays temperature in a graph and remotely controls the fan automation and temperature threshold.

MQTT over websockets is used to retrieve temperature data published from the raspberry pi every second, and this data is represented dynamically on a graph.
