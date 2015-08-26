
/*
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Mailjet
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

const FUNCTION = 0;
const ID = 1;
const ACTION = 2;

const SEND_RESOURCE = 'send';

import qs from 'querystring';
import request from 'request';
import _path from 'path';
import config from './config';
import util from 'util';

class MailjetResource {

	constructor (method, res, context) {
		this.base = res;
		this.res = res;
		this.lastAdded = FUNCTION;

		this.result = (params, callback) => {
			params = params || {};
			if (typeof params === 'function') {
				callback = params;
				params = {};
			}

			let path = context.path(this.res, method === 'get' ? params : {});
			this.res = this.base;
			this.lastAdded = FUNCTION;

			return context.httpRequest(method,
				'https://' + _path.join(config.url, path),
				params, callback);
		}
	}

	id (value) {
		if (isNaN(parseInt(value)))
			throw new Error('Invalid Id value');
		if (this.lastAdded === ID)
			util.debug('your request may be invalid due to bad id chaining');

		this.res = _path.join(this.res, value.toString());
		this.lastAdded = ID;
		return this;
	}

	action (name) {
		if (this.lastAdded === ACTION)
			util.debug('your request may be invalid dur to bad actions chaining');
		this.res = _path.join(this.res, name);
		this.lastAdded = ACTION;
		return this;
	}

	request (params, callback) {
		return this.result(params, callback);
	}
}

class MailjetClient {

	constructor (apiKey, apiSecret) {
		this.config = config;
		this.apiKey = apiKey;
		this.apiSecret = apiSecret;
	}

	path (method, params) {
		let base = this.config.version
					+ (method === SEND_RESOURCE ? '' : 'REST');

		return Object.keys(params).length === 0 ?
					`${base}/${method}` : `${base}/${method}/?${qs.stringify(params)}`;
	}

	httpRequest (method, url, data, callback) {

		let options = {
			url,
			json: true,
			auth: { user: this.apiKey, pass: this.apiSecret}
		}

		if ('post|put'.indexOf(method) != -1)
			options.body = data;

		if (callback) {
			return request[method](options, (error, response, body) => {
				if (error || response.statusCode > 210)
					return callback(error || body, response);
				return callback(null, response, body);
			});
		}
		
		return new Promise((resolve, reject) => {
			request[method](options, (error, response, body) => {
				if (error || [200, 201].indexOf(response.statusCode) === -1)
					return reject({body: error || body, statusCode: response.statusCode});
				return resolve({statusCode: response.statusCode, body: body});
			});
		});
	}

	post (res) {
		return new MailjetResource('post', res, this);
	}

	put (res) {
		return new MailjetResource('put', res, this);
	}

	get (res) {
		return new MailjetResource('get', res, this);
	}

	delete (res) {
		return new MailjetResource('del', res, this);
	}
	
}

MailjetClient.connect = (k, s) => new MailjetClient(k, s);

export default MailjetClient;
