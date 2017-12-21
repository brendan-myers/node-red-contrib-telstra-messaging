//
//
// Copyright 2017 Telstra Corporation Limited (ABN 33 051 775 556)
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License.
//
// You may obtain a copy of the License at:
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//
//

const fetch = require('node-fetch');

const TOKEN_URL = "https://sapi.telstra.com/v1/oauth/token" +
  "?grant_type=client_credentials" +
  "&scope=NSMS";

const SMS_URL   = "https://tapi.telstra.com/v2/messages/sms";


module.exports = function(RED) {

  /**
   * 
   */
  RED.nodes.registerType("telstra-messaging-api", TelstraMessagingNode, {
    credentials: {
      consumerKey:    { type: "text" },
      consumerSecret: { type: "text" }
    }
  });


  /**
   * 
   */
  function TelstraMessagingNode(config) {
    RED.nodes.createNode(this, config);

    this.on('input', msg => {
			this.status({});
			
	  	let options = {
		  	message: msg,
		  	recipient: config.recipient,
		  	accessToken: this.accessToken,
		  	error: this.error
			};
			
			let ready = new Promise((resolve, reject) => {
		  	resolve();
	  	});

	  	if (!this.accessToken) {
				ready = fetchToken(this).then(accessToken => {
					this.accessToken = accessToken;
					options.accessToken = accessToken;
				});
	  	}

	  	ready.then(() => sendSMS(options)).then(res => {
				// 401/403 invalid/expired auth token
				if (res.status == 401 || res.status == 403) {
					this.warn('Auth token expired. Refreshing.');

					// refresh auth token
					return fetchToken(this).then(accessToken => {
						this.accessToken = accessToken;
						options.accessToken = accessToken;

						return sendSMS(options);
					});
					
        } else {
		    	return res;	
				}
				
			}).then(res => {
		  	if (res.status != 201) {
					this.error("SMS failed. " + res.status + " " + res.statusText);

					this.status({
			  		fill: "red",
			  		shape: "ring",
			  		text: "SMS failed. " + res.status + " " + res.statusText
		    	});
      	} else {
        	this.log("SMS sent. " + res.status);
      	}
    	}).catch(ex => {
				this.error(ex);

				this.status({
					fill: "red",
					shape: "ring",
					text: JSON.stringify(ex)
				});
			});
		});
  }


	/**
	 * Fetch an auth token from Telstra services.
	 */
	function fetchToken(node) {
		if (!node.credentials.consumerSecret || !node.credentials.consumerKey) {
			node.status({
				fill: "red",
				shape: "ring",
				text: "Missing authentication details"
			});
			
			return;
		}

		const url = TOKEN_URL + "&client_id=" + node.credentials.consumerKey +
			"&client_secret=" + node.credentials.consumerSecret;

		return fetch(url).then(res => {
			if (res.status == 200) {
				return res.json();
			}

			throw new Error(res);

		}).then(res => {
			node.log("Successfully authenticated");

			node.status({
				fill: "green",
				shape: "ring",
				text: "Authenticated"
			});

			return res.access_token;

		}).catch(ex => {
			node.error("Failed to authenticate: " + JSON.stringify(ex));

			node.status({
				fill: "red",
				shape: "ring",
				text: "Not authenticated"
			});
		});
	}
  
  
  /**
   * Send an SMS via the Telstra Messaging API
   */
	function sendSMS(options) {
		if (!options.message.payload) {
			throw	new Error("Failed to send SMS: message.payload not set.");
		}

		if (!options.recipient) {
			throw new Error("Failed to send SMS: recipient not set.");
		}

		if (!options.accessToken) {
			throw new Error("Failed to send SMS: auth token not set.");
		}

		const payload = typeof options.message.payload === 'string' ?
			options.message.payload : JSON.stringify(options.message.payload);

		return fetch(SMS_URL, {
			method: 'POST',
			headers: {
				Authorization: 'Bearer ' + options.accessToken,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				to: options.recipient,
				body: payload,
				validity: 1,
				scheduleDelivery: 1
			})
		});
  }
}