# dino-bbq

The system is designed to operate in one of three modes

1. WiFi only: requests will go to a NodeJs webserver and are forwarded to nodes over WAN. All nodes must be connected to over WiFi
2. Relay Server + LoRa: requests will go to a NodeJs server which will forward a master ESP Node which will forward to all other nodes over LoRa. Only the master and server need to be connected over Wifi
3. ESP Access Point: The master ESP node creates a local WiFi network and runs a webserver for clients to connect to. All requests are forwarded over LoRa. No external network needed.

## NodeJs Server

The `server` directory contains an ExpressJs webserver

# UI

The `dashboard` directory contains a React UI which interacts with the API server to display tiles for each active node. When you click on the tile, an API request is sent to the node.

## Sketches

The `sketch` directory contains the ESP node sketches:

- `DinoApLoRa`: access point node used for mode-3
- `DinoServerLoRa`: master HTTP server node used in mode-2
- `DinoNodeLoRa`: vanilla LoRa receiver node used mode-2 and mode-3
- `DinoNodeMqtt`: MQTT connected node used in mode-1
