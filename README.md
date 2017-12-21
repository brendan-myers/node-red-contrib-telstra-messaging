# node-red-contrib-telstra

A [Node-RED](http://www.nodered.org) node to send SMS messages via the Telstra Messaging API.

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]


## Installation

From your NodeRED directory;

```bash
npm install node-red-contrib-telstra
```


## Prerequisites

A [Telstra developer](https://dev.telstra.com) account with an active [messaging api](https://dev.telstra.com/content/messaging-api) application.


## Usage

The node will use `msg.payload` as the body of the message. Three parameters are needed to configure the node;

| Parameter | Description|
|-|-|
| `consumer key` | the consumer key for your Telstra Messaging API app. |
| `consumer secret` | the consumer secret for your Telstra Messaging API app. |
| `recipient` | phone number (in E.164 format) to send the SMS to. This number can be in international format if preceeded by a '+', or in national format. |


### License
  [Apache-2.0](LICENSE)


[npm-image]: https://img.shields.io/npm/v/node-red-contrib-telstra.svg
[npm-url]: https://npmjs.org/package/node-red-contrib-telstra
[downloads-image]: https://img.shields.io/npm/dm/node-red-contrib-telstra.svg
[downloads-url]: https://npmjs.org/package/node-red-contrib-telstra
[coveralls-url]: https://coveralls.io/github/brendan-myers/node-red-contrib-telstra