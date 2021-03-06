/**
 * saltyrtc-client-js v0.14.4
 * SaltyRTC JavaScript implementation
 * https://github.com/saltyrtc/saltyrtc-client-js
 *
 * Copyright (C) 2016-2018 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license:
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

var saltyrtcClient = (function (exports,nacl,msgpack) {
    'use strict';

    (function (CloseCode) {
        CloseCode[CloseCode["ClosingNormal"] = 1000] = "ClosingNormal";
        CloseCode[CloseCode["GoingAway"] = 1001] = "GoingAway";
        CloseCode[CloseCode["NoSharedSubprotocol"] = 1002] = "NoSharedSubprotocol";
        CloseCode[CloseCode["PathFull"] = 3000] = "PathFull";
        CloseCode[CloseCode["ProtocolError"] = 3001] = "ProtocolError";
        CloseCode[CloseCode["InternalError"] = 3002] = "InternalError";
        CloseCode[CloseCode["Handover"] = 3003] = "Handover";
        CloseCode[CloseCode["DroppedByInitiator"] = 3004] = "DroppedByInitiator";
        CloseCode[CloseCode["InitiatorCouldNotDecrypt"] = 3005] = "InitiatorCouldNotDecrypt";
        CloseCode[CloseCode["NoSharedTask"] = 3006] = "NoSharedTask";
        CloseCode[CloseCode["InvalidKey"] = 3007] = "InvalidKey";
        CloseCode[CloseCode["Timeout"] = 3008] = "Timeout";
    })(exports.CloseCode || (exports.CloseCode = {}));
    function explainCloseCode(code) {
        switch (code) {
            case exports.CloseCode.ClosingNormal:
                return 'Normal closing';
            case exports.CloseCode.GoingAway:
                return 'The endpoint is going away';
            case exports.CloseCode.NoSharedSubprotocol:
                return 'No shared subprotocol could be found';
            case exports.CloseCode.PathFull:
                return 'No free responder byte';
            case exports.CloseCode.ProtocolError:
                return 'Protocol error';
            case exports.CloseCode.InternalError:
                return 'Internal error';
            case exports.CloseCode.Handover:
                return 'Handover finished';
            case exports.CloseCode.DroppedByInitiator:
                return 'Dropped by initiator';
            case exports.CloseCode.InitiatorCouldNotDecrypt:
                return 'Initiator could not decrypt a message';
            case exports.CloseCode.NoSharedTask:
                return 'No shared task was found';
            case exports.CloseCode.InvalidKey:
                return 'Invalid key';
            case exports.CloseCode.Timeout:
                return 'Timeout';
            default:
                return 'Unknown';
        }
    }

    var classCallCheck = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };

    var createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();

    var get = function get(object, property, receiver) {
      if (object === null) object = Function.prototype;
      var desc = Object.getOwnPropertyDescriptor(object, property);

      if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);

        if (parent === null) {
          return undefined;
        } else {
          return get(parent, property, receiver);
        }
      } else if ("value" in desc) {
        return desc.value;
      } else {
        var getter = desc.get;

        if (getter === undefined) {
          return undefined;
        }

        return getter.call(receiver);
      }
    };

    var inherits = function (subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    };

    var possibleConstructorReturn = function (self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    };

    var SignalingError = function (_Error) {
        inherits(SignalingError, _Error);

        function SignalingError(closeCode, message) {
            classCallCheck(this, SignalingError);

            var _this = possibleConstructorReturn(this, (SignalingError.__proto__ || Object.getPrototypeOf(SignalingError)).call(this, message));

            _this.message = message;
            _this.closeCode = closeCode;
            _this.name = 'SignalingError';
            return _this;
        }

        return SignalingError;
    }(Error);

    var ProtocolError = function (_SignalingError) {
        inherits(ProtocolError, _SignalingError);

        function ProtocolError(message) {
            classCallCheck(this, ProtocolError);
            return possibleConstructorReturn(this, (ProtocolError.__proto__ || Object.getPrototypeOf(ProtocolError)).call(this, exports.CloseCode.ProtocolError, message));
        }

        return ProtocolError;
    }(SignalingError);

    var ConnectionError = function (_Error2) {
        inherits(ConnectionError, _Error2);

        function ConnectionError(message) {
            classCallCheck(this, ConnectionError);

            var _this3 = possibleConstructorReturn(this, (ConnectionError.__proto__ || Object.getPrototypeOf(ConnectionError)).call(this, message));

            _this3.message = message;
            _this3.name = 'ConnectionError';
            return _this3;
        }

        return ConnectionError;
    }(Error);

    var ValidationError = function (_Error3) {
        inherits(ValidationError, _Error3);

        function ValidationError(message) {
            var critical = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
            classCallCheck(this, ValidationError);

            var _this4 = possibleConstructorReturn(this, (ValidationError.__proto__ || Object.getPrototypeOf(ValidationError)).call(this, message));

            _this4.message = message;
            _this4.name = 'ValidationError';
            _this4.critical = critical;
            return _this4;
        }

        return ValidationError;
    }(Error);

    var CryptoError = function (_Error4) {
        inherits(CryptoError, _Error4);

        function CryptoError(code, message) {
            classCallCheck(this, CryptoError);

            var _this5 = possibleConstructorReturn(this, (CryptoError.__proto__ || Object.getPrototypeOf(CryptoError)).call(this, message));

            _this5.name = 'CryptoError';
            _this5.message = message;
            _this5.code = code;
            return _this5;
        }

        return CryptoError;
    }(Error);

    var exceptions = /*#__PURE__*/Object.freeze({
        SignalingError: SignalingError,
        ProtocolError: ProtocolError,
        ConnectionError: ConnectionError,
        ValidationError: ValidationError,
        CryptoError: CryptoError
    });

    var EventRegistry = function () {
        function EventRegistry() {
            classCallCheck(this, EventRegistry);

            this.map = new Map();
        }

        createClass(EventRegistry, [{
            key: 'register',
            value: function register(eventType, handler) {
                if (typeof eventType === 'string') {
                    this.set(eventType, handler);
                } else {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = eventType[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var et = _step.value;

                            this.set(et, handler);
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                }
            }
        }, {
            key: 'unregister',
            value: function unregister(eventType, handler) {
                if (typeof eventType === 'string') {
                    if (!this.map.has(eventType)) {
                        return;
                    }
                    if (typeof handler === 'undefined') {
                        this.map.delete(eventType);
                    } else {
                        var list = this.map.get(eventType);
                        var index = list.indexOf(handler);
                        if (index !== -1) {
                            list.splice(index, 1);
                        }
                    }
                } else {
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = eventType[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var et = _step2.value;

                            this.unregister(et, handler);
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                _iterator2.return();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }
                }
            }
        }, {
            key: 'unregisterAll',
            value: function unregisterAll() {
                this.map.clear();
            }
        }, {
            key: 'set',
            value: function set$$1(key, value) {
                if (this.map.has(key)) {
                    var list = this.map.get(key);
                    if (list.indexOf(value) === -1) {
                        list.push(value);
                    }
                } else {
                    this.map.set(key, [value]);
                }
            }
        }, {
            key: 'get',
            value: function get$$1(eventType) {
                var handlers = [];
                if (typeof eventType === 'string') {
                    if (this.map.has(eventType)) {
                        handlers.push.apply(handlers, this.map.get(eventType));
                    }
                } else {
                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = eventType[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var et = _step3.value;
                            var _iteratorNormalCompletion4 = true;
                            var _didIteratorError4 = false;
                            var _iteratorError4 = undefined;

                            try {
                                for (var _iterator4 = this.get(et)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                    var handler = _step4.value;

                                    if (handlers.indexOf(handler) === -1) {
                                        handlers.push(handler);
                                    }
                                }
                            } catch (err) {
                                _didIteratorError4 = true;
                                _iteratorError4 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                        _iterator4.return();
                                    }
                                } finally {
                                    if (_didIteratorError4) {
                                        throw _iteratorError4;
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        _didIteratorError3 = true;
                        _iteratorError3 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                _iterator3.return();
                            }
                        } finally {
                            if (_didIteratorError3) {
                                throw _iteratorError3;
                            }
                        }
                    }
                }
                return handlers;
            }
        }]);
        return EventRegistry;
    }();

    var Log = function () {
        function Log(level) {
            classCallCheck(this, Log);

            this.level = level;
        }

        createClass(Log, [{
            key: 'noop',
            value: function noop() {}
        }, {
            key: 'level',
            set: function set$$1(level) {
                this._level = level;
                this.debug = this.noop;
                this.trace = this.noop;
                this.info = this.noop;
                this.warn = this.noop;
                this.error = this.noop;
                this.assert = this.noop;
                switch (level) {
                    case 'debug':
                        this.debug = console.debug;
                        this.trace = console.trace;
                    case 'info':
                        this.info = console.info;
                    case 'warn':
                        this.warn = console.warn;
                    case 'error':
                        this.error = console.error;
                        this.assert = console.assert;
                    default:
                        break;
                }
            },
            get: function get$$1() {
                return this._level;
            }
        }]);
        return Log;
    }();

    function u8aToHex(array) {
        var results = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = array[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var arrayByte = _step.value;

                results.push(arrayByte.toString(16).replace(/^([\da-f])$/, '0$1'));
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return results.join('');
    }
    function hexToU8a(hexstring) {
        var array = void 0;
        var i = void 0;
        var j = 0;
        var k = void 0;
        var ref = void 0;
        if (hexstring.length % 2 === 1) {
            hexstring = '0' + hexstring;
        }
        array = new Uint8Array(hexstring.length / 2);
        for (i = k = 0, ref = hexstring.length; k <= ref; i = k += 2) {
            array[j++] = parseInt(hexstring.substr(i, 2), 16);
        }
        return array;
    }
    function byteToHex(value) {
        return '0x' + ('00' + value.toString(16)).substr(-2);
    }
    function randomUint32() {
        var crypto = window.crypto || window.msCrypto;
        return crypto.getRandomValues(new Uint32Array(1))[0];
    }
    function concat() {
        var totalLength = 0;

        for (var _len = arguments.length, arrays = Array(_len), _key = 0; _key < _len; _key++) {
            arrays[_key] = arguments[_key];
        }

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = arrays[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var arr = _step2.value;

                totalLength += arr.length;
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        var result = new Uint8Array(totalLength);
        var offset = 0;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = arrays[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var _arr = _step3.value;

                result.set(_arr, offset);
                offset += _arr.length;
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }

        return result;
    }
    function isString(value) {
        return typeof value === 'string' || value instanceof String;
    }
    function validateKey(key) {
        var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Key';

        var out = void 0;
        if (isString(key)) {
            out = hexToU8a(key);
        } else if (key instanceof Uint8Array) {
            out = key;
        } else {
            throw new ValidationError(name + ' must be an Uint8Array or a hex string');
        }
        if (out.byteLength !== 32) {
            throw new ValidationError(name + ' must be 32 bytes long');
        }
        return out;
    }
    function arraysAreEqual(a1, a2) {
        if (a1.length !== a2.length) {
            return false;
        }
        for (var i = 0; i < a1.length; i++) {
            if (a1[i] !== a2[i]) {
                return false;
            }
        }
        return true;
    }
    function arrayToBuffer(array) {
        if (array.byteOffset === 0 && array.byteLength === array.buffer.byteLength) {
            return array.buffer;
        }
        return array.buffer.slice(array.byteOffset, array.byteOffset + array.byteLength);
    }

    var Box = function () {
        function Box(nonce, data, nonceLength) {
            classCallCheck(this, Box);

            this._nonce = nonce;
            this._nonceLength = nonceLength;
            this._data = data;
        }

        createClass(Box, [{
            key: 'toUint8Array',
            value: function toUint8Array() {
                var box = new Uint8Array(this.length);
                box.set(this._nonce);
                box.set(this._data, this._nonceLength);
                return box;
            }
        }, {
            key: 'length',
            get: function get$$1() {
                return this._nonce.length + this._data.length;
            }
        }, {
            key: 'data',
            get: function get$$1() {
                return this._data;
            }
        }, {
            key: 'nonce',
            get: function get$$1() {
                return this._nonce;
            }
        }], [{
            key: 'fromUint8Array',
            value: function fromUint8Array(array, nonceLength) {
                if (nonceLength === undefined) {
                    throw new Error('nonceLength parameter not specified');
                }
                if (array.byteLength <= nonceLength) {
                    throw new CryptoError('bad-message-length', 'Message is shorter than nonce');
                }
                var nonce = array.slice(0, nonceLength);
                var data = array.slice(nonceLength);
                return new Box(nonce, data, nonceLength);
            }
        }]);
        return Box;
    }();

    var KeyStore = function () {
        function KeyStore(secretKey, log) {
            classCallCheck(this, KeyStore);

            this.logTag = '[SaltyRTC.KeyStore]';
            if (log === undefined) {
                log = new Log('none');
            }
            if (arguments.length > 2) {
                throw new Error('Too many arguments in KeyStore constructor');
            }
            if (secretKey === undefined) {
                this._keyPair = nacl.box.keyPair();
                log.debug(this.logTag, 'New public key:', u8aToHex(this._keyPair.publicKey));
            } else {
                this._keyPair = nacl.box.keyPair.fromSecretKey(validateKey(secretKey, 'Private key'));
                log.debug(this.logTag, 'Restored public key:', u8aToHex(this._keyPair.publicKey));
            }
        }

        createClass(KeyStore, [{
            key: 'getSharedKeyStore',
            value: function getSharedKeyStore(publicKey) {
                return new SharedKeyStore(this.secretKeyBytes, publicKey);
            }
        }, {
            key: 'encryptRaw',
            value: function encryptRaw(bytes, nonce, otherKey) {
                return nacl.box(bytes, nonce, otherKey, this._keyPair.secretKey);
            }
        }, {
            key: 'encrypt',
            value: function encrypt(bytes, nonce, otherKey) {
                var encrypted = this.encryptRaw(bytes, nonce, otherKey);
                return new Box(nonce, encrypted, nacl.box.nonceLength);
            }
        }, {
            key: 'decryptRaw',
            value: function decryptRaw(bytes, nonce, otherKey) {
                var data = nacl.box.open(bytes, nonce, otherKey, this._keyPair.secretKey);
                if (!data) {
                    throw new CryptoError('decryption-failed', 'Data could not be decrypted');
                }
                return data;
            }
        }, {
            key: 'decrypt',
            value: function decrypt(box, otherKey) {
                return this.decryptRaw(box.data, box.nonce, otherKey);
            }
        }, {
            key: 'publicKeyHex',
            get: function get$$1() {
                return u8aToHex(this._keyPair.publicKey);
            }
        }, {
            key: 'publicKeyBytes',
            get: function get$$1() {
                return this._keyPair.publicKey;
            }
        }, {
            key: 'secretKeyHex',
            get: function get$$1() {
                return u8aToHex(this._keyPair.secretKey);
            }
        }, {
            key: 'secretKeyBytes',
            get: function get$$1() {
                return this._keyPair.secretKey;
            }
        }, {
            key: 'keypair',
            get: function get$$1() {
                return this._keyPair;
            }
        }]);
        return KeyStore;
    }();

    var SharedKeyStore = function () {
        function SharedKeyStore(localSecretKey, remotePublicKey) {
            classCallCheck(this, SharedKeyStore);

            this._localSecretKey = validateKey(localSecretKey, 'Local private key');
            this._remotePublicKey = validateKey(remotePublicKey, 'Remote public key');
            this._sharedKey = nacl.box.before(this._remotePublicKey, this._localSecretKey);
        }

        createClass(SharedKeyStore, [{
            key: 'encryptRaw',
            value: function encryptRaw(bytes, nonce) {
                return nacl.box.after(bytes, nonce, this._sharedKey);
            }
        }, {
            key: 'encrypt',
            value: function encrypt(bytes, nonce) {
                var encrypted = this.encryptRaw(bytes, nonce);
                return new Box(nonce, encrypted, nacl.box.nonceLength);
            }
        }, {
            key: 'decryptRaw',
            value: function decryptRaw(bytes, nonce) {
                var data = nacl.box.open.after(bytes, nonce, this._sharedKey);
                if (!data) {
                    throw new CryptoError('decryption-failed', 'Data could not be decrypted');
                }
                return data;
            }
        }, {
            key: 'decrypt',
            value: function decrypt(box) {
                return this.decryptRaw(box.data, box.nonce);
            }
        }, {
            key: 'localSecretKeyHex',
            get: function get$$1() {
                return u8aToHex(this._localSecretKey);
            }
        }, {
            key: 'localSecretKeyBytes',
            get: function get$$1() {
                return this._localSecretKey;
            }
        }, {
            key: 'remotePublicKeyHex',
            get: function get$$1() {
                return u8aToHex(this._remotePublicKey);
            }
        }, {
            key: 'remotePublicKeyBytes',
            get: function get$$1() {
                return this._remotePublicKey;
            }
        }]);
        return SharedKeyStore;
    }();

    var AuthToken = function () {
        function AuthToken(bytes, log) {
            classCallCheck(this, AuthToken);

            this._authToken = null;
            this.logTag = '[SaltyRTC.AuthToken]';
            if (log === undefined) {
                log = new Log('none');
            }
            if (typeof bytes === 'undefined') {
                this._authToken = nacl.randomBytes(nacl.secretbox.keyLength);
                log.debug(this.logTag, 'Generated auth token');
            } else {
                if (bytes.byteLength !== nacl.secretbox.keyLength) {
                    var msg = 'Auth token must be ' + nacl.secretbox.keyLength + ' bytes long.';
                    log.error(this.logTag, msg);
                    throw new CryptoError('bad-token-length', msg);
                }
                this._authToken = bytes;
                log.debug(this.logTag, 'Initialized auth token');
            }
        }

        createClass(AuthToken, [{
            key: 'encrypt',
            value: function encrypt(bytes, nonce) {
                var encrypted = nacl.secretbox(bytes, nonce, this._authToken);
                return new Box(nonce, encrypted, nacl.secretbox.nonceLength);
            }
        }, {
            key: 'decrypt',
            value: function decrypt(box) {
                var data = nacl.secretbox.open(box.data, box.nonce, this._authToken);
                if (!data) {
                    throw new CryptoError('decryption-failed', 'Data could not be decrypted');
                }
                return data;
            }
        }, {
            key: 'keyBytes',
            get: function get$$1() {
                return this._authToken;
            }
        }, {
            key: 'keyHex',
            get: function get$$1() {
                return u8aToHex(this._authToken);
            }
        }]);
        return AuthToken;
    }();

    var Cookie = function () {
        function Cookie(bytes) {
            classCallCheck(this, Cookie);

            if (bytes !== undefined) {
                if (bytes.length !== 16) {
                    throw new ValidationError('Bad cookie length');
                }
                this.bytes = bytes;
            } else {
                this.bytes = nacl.randomBytes(Cookie.COOKIE_LENGTH);
            }
        }

        createClass(Cookie, [{
            key: 'equals',
            value: function equals(otherCookie) {
                if (otherCookie.bytes === this.bytes) {
                    return true;
                }
                if (otherCookie.bytes.byteLength !== Cookie.COOKIE_LENGTH) {
                    return false;
                }
                for (var i = 0; i < this.bytes.byteLength; i++) {
                    if (otherCookie.bytes[i] !== this.bytes[i]) {
                        return false;
                    }
                }
                return true;
            }
        }]);
        return Cookie;
    }();

    Cookie.COOKIE_LENGTH = 16;

    var CookiePair = function () {
        function CookiePair(ours, theirs) {
            classCallCheck(this, CookiePair);

            this._ours = null;
            this._theirs = null;
            if (typeof ours !== 'undefined' && typeof theirs !== 'undefined') {
                if (theirs.equals(ours)) {
                    throw new ProtocolError('Their cookie matches our cookie');
                }
                this._ours = ours;
                this._theirs = theirs;
            } else if (typeof ours === 'undefined' && typeof theirs === 'undefined') {
                this._ours = new Cookie();
            } else {
                throw new Error('Either both or no cookies must be specified');
            }
        }

        createClass(CookiePair, [{
            key: 'ours',
            get: function get$$1() {
                return this._ours;
            }
        }, {
            key: 'theirs',
            get: function get$$1() {
                return this._theirs;
            },
            set: function set$$1(cookie) {
                if (cookie.equals(this._ours)) {
                    throw new ProtocolError('Their cookie matches our cookie');
                }
                this._theirs = cookie;
            }
        }], [{
            key: 'fromTheirs',
            value: function fromTheirs(theirs) {
                var ours = void 0;
                do {
                    ours = new Cookie();
                } while (ours.equals(theirs));
                return new CookiePair(ours, theirs);
            }
        }]);
        return CookiePair;
    }();

    var Nonce = function () {
        function Nonce(cookie, overflow, sequenceNumber, source, destination) {
            classCallCheck(this, Nonce);

            this._cookie = cookie;
            this._overflow = overflow;
            this._sequenceNumber = sequenceNumber;
            this._source = source;
            this._destination = destination;
        }

        createClass(Nonce, [{
            key: 'toUint8Array',
            value: function toUint8Array() {
                var buffer = new ArrayBuffer(Nonce.TOTAL_LENGTH);
                var array = new Uint8Array(buffer);
                array.set(this._cookie.bytes);
                var view = new DataView(buffer, Cookie.COOKIE_LENGTH, 8);
                view.setUint8(0, this._source);
                view.setUint8(1, this._destination);
                view.setUint16(2, this._overflow);
                view.setUint32(4, this._sequenceNumber);
                return array;
            }
        }, {
            key: 'cookie',
            get: function get$$1() {
                return this._cookie;
            }
        }, {
            key: 'overflow',
            get: function get$$1() {
                return this._overflow;
            }
        }, {
            key: 'sequenceNumber',
            get: function get$$1() {
                return this._sequenceNumber;
            }
        }, {
            key: 'combinedSequenceNumber',
            get: function get$$1() {
                return this._overflow * Math.pow(2, 32) + this._sequenceNumber;
            }
        }, {
            key: 'source',
            get: function get$$1() {
                return this._source;
            }
        }, {
            key: 'destination',
            get: function get$$1() {
                return this._destination;
            }
        }], [{
            key: 'fromUint8Array',
            value: function fromUint8Array(packet) {
                if (packet.byteLength !== this.TOTAL_LENGTH) {
                    throw new ValidationError('bad-packet-length');
                }
                var view = new DataView(packet.buffer, packet.byteOffset + Cookie.COOKIE_LENGTH, 8);
                var cookie = new Cookie(packet.slice(0, Cookie.COOKIE_LENGTH));
                var source = view.getUint8(0);
                var destination = view.getUint8(1);
                var overflow = view.getUint16(2);
                var sequenceNumber = view.getUint32(4);
                return new Nonce(cookie, overflow, sequenceNumber, source, destination);
            }
        }]);
        return Nonce;
    }();

    Nonce.TOTAL_LENGTH = 24;

    var CombinedSequence = function () {
        function CombinedSequence() {
            classCallCheck(this, CombinedSequence);

            this.sequenceNumber = randomUint32();
            this.overflow = 0;
        }

        createClass(CombinedSequence, [{
            key: 'next',
            value: function next() {
                if (this.sequenceNumber >= CombinedSequence.SEQUENCE_NUMBER_MAX) {
                    this.sequenceNumber = 0;
                    this.overflow += 1;
                    if (this.overflow >= CombinedSequence.OVERFLOW_MAX) {
                        throw new Error('overflow-overflow');
                    }
                } else {
                    this.sequenceNumber += 1;
                }
                return {
                    sequenceNumber: this.sequenceNumber,
                    overflow: this.overflow
                };
            }
        }, {
            key: 'asNumber',
            value: function asNumber() {
                return this.overflow * Math.pow(2, 32) + this.sequenceNumber;
            }
        }]);
        return CombinedSequence;
    }();

    CombinedSequence.SEQUENCE_NUMBER_MAX = 0xFFFFFFFF;
    CombinedSequence.OVERFLOW_MAX = 0xFFFFF;

    var CombinedSequencePair = function CombinedSequencePair(ours, theirs) {
        classCallCheck(this, CombinedSequencePair);

        this.ours = null;
        this.theirs = null;
        if (typeof ours !== 'undefined' && typeof theirs !== 'undefined') {
            this.ours = ours;
            this.theirs = theirs;
        } else if (typeof ours === 'undefined' && typeof theirs === 'undefined') {
            this.ours = new CombinedSequence();
        } else {
            throw new Error('Either both or no combined sequences must be specified');
        }
    };

    var Peer = function () {
        function Peer(id, cookiePair) {
            classCallCheck(this, Peer);

            this._csnPair = new CombinedSequencePair();
            this._permanentSharedKey = null;
            this._sessionSharedKey = null;
            this._id = id;
            if (cookiePair === undefined) {
                this._cookiePair = new CookiePair();
            } else {
                this._cookiePair = cookiePair;
            }
        }

        createClass(Peer, [{
            key: 'setPermanentSharedKey',
            value: function setPermanentSharedKey(remotePermanentKey, localPermanentKey) {
                this._permanentSharedKey = localPermanentKey.getSharedKeyStore(remotePermanentKey);
            }
        }, {
            key: 'setSessionSharedKey',
            value: function setSessionSharedKey(remoteSessionKey, localSessionKey) {
                this._sessionSharedKey = localSessionKey.getSharedKeyStore(remoteSessionKey);
            }
        }, {
            key: 'id',
            get: function get$$1() {
                return this._id;
            }
        }, {
            key: 'hexId',
            get: function get$$1() {
                return byteToHex(this._id);
            }
        }, {
            key: 'csnPair',
            get: function get$$1() {
                return this._csnPair;
            }
        }, {
            key: 'cookiePair',
            get: function get$$1() {
                return this._cookiePair;
            }
        }, {
            key: 'permanentSharedKey',
            get: function get$$1() {
                return this._permanentSharedKey;
            }
        }, {
            key: 'sessionSharedKey',
            get: function get$$1() {
                return this._sessionSharedKey;
            }
        }]);
        return Peer;
    }();

    var Client = function (_Peer) {
        inherits(Client, _Peer);

        function Client() {
            classCallCheck(this, Client);

            var _this = possibleConstructorReturn(this, (Client.__proto__ || Object.getPrototypeOf(Client)).apply(this, arguments));

            _this._localSessionKey = null;
            return _this;
        }

        createClass(Client, [{
            key: 'setLocalSessionKey',
            value: function setLocalSessionKey(localSessionKey) {
                this._localSessionKey = localSessionKey;
            }
        }, {
            key: 'setSessionSharedKey',
            value: function setSessionSharedKey(remoteSessionKey, localSessionKey) {
                if (!localSessionKey) {
                    localSessionKey = this._localSessionKey;
                } else {
                    this._localSessionKey = localSessionKey;
                }
                get(Client.prototype.__proto__ || Object.getPrototypeOf(Client.prototype), 'setSessionSharedKey', this).call(this, remoteSessionKey, localSessionKey);
            }
        }, {
            key: 'localSessionKey',
            get: function get$$1() {
                return this._localSessionKey;
            }
        }]);
        return Client;
    }(Peer);

    var Initiator = function (_Client) {
        inherits(Initiator, _Client);

        function Initiator(remotePermanentKey, localPermanentKey) {
            classCallCheck(this, Initiator);

            var _this2 = possibleConstructorReturn(this, (Initiator.__proto__ || Object.getPrototypeOf(Initiator)).call(this, Initiator.ID));

            _this2.connected = false;
            _this2.handshakeState = 'new';
            _this2.setPermanentSharedKey(remotePermanentKey, localPermanentKey);
            return _this2;
        }

        createClass(Initiator, [{
            key: 'name',
            get: function get$$1() {
                return 'Initiator';
            }
        }]);
        return Initiator;
    }(Client);

    Initiator.ID = 0x01;

    var Responder = function (_Client2) {
        inherits(Responder, _Client2);

        function Responder(id, counter) {
            classCallCheck(this, Responder);

            var _this3 = possibleConstructorReturn(this, (Responder.__proto__ || Object.getPrototypeOf(Responder)).call(this, id));

            _this3.handshakeState = 'new';
            _this3._counter = counter;
            return _this3;
        }

        createClass(Responder, [{
            key: 'name',
            get: function get$$1() {
                return 'Responder ' + this.id;
            }
        }, {
            key: 'counter',
            get: function get$$1() {
                return this._counter;
            }
        }]);
        return Responder;
    }(Client);

    var Server = function (_Peer2) {
        inherits(Server, _Peer2);

        function Server() {
            classCallCheck(this, Server);

            var _this4 = possibleConstructorReturn(this, (Server.__proto__ || Object.getPrototypeOf(Server)).call(this, Server.ID));

            _this4.handshakeState = 'new';
            return _this4;
        }

        createClass(Server, [{
            key: 'name',
            get: function get$$1() {
                return 'Server';
            }
        }]);
        return Server;
    }(Peer);

    Server.ID = 0x00;

    var HandoverState = function () {
        function HandoverState() {
            classCallCheck(this, HandoverState);

            this.reset();
        }

        createClass(HandoverState, [{
            key: 'reset',
            value: function reset() {
                this._local = false;
                this._peer = false;
            }
        }, {
            key: 'local',
            get: function get$$1() {
                return this._local;
            },
            set: function set$$1(state) {
                var wasBoth = this.both;
                this._local = state;
                if (!wasBoth && this.both && this.onBoth !== undefined) {
                    this.onBoth();
                }
            }
        }, {
            key: 'peer',
            get: function get$$1() {
                return this._peer;
            },
            set: function set$$1(state) {
                var wasBoth = this.both;
                this._peer = state;
                if (!wasBoth && this.both && this.onBoth !== undefined) {
                    this.onBoth();
                }
            }
        }, {
            key: 'both',
            get: function get$$1() {
                return this._local === true && this._peer === true;
            }
        }, {
            key: 'any',
            get: function get$$1() {
                return this._local === true || this._peer === true;
            }
        }]);
        return HandoverState;
    }();

    function isResponderId(id) {
        return id >= 0x02 && id <= 0xff;
    }

    var Signaling = function () {
        function Signaling(client, host, port, serverKey, tasks, pingInterval, permanentKey, peerTrustedKey) {
            var _this = this;

            classCallCheck(this, Signaling);

            this.protocol = 'wss';
            this.ws = null;
            this.msgpackEncodeOptions = {
                codec: msgpack.createCodec({ binarraybuffer: true })
            };
            this.msgpackDecodeOptions = {
                codec: msgpack.createCodec({ binarraybuffer: true })
            };
            this.state = 'new';
            this.handoverState = new HandoverState();
            this.task = null;
            this.server = new Server();
            this.peerTrustedKey = null;
            this.authToken = null;
            this.serverPublicKey = null;
            this.role = null;
            this.logTag = '[SaltyRTC.Signaling]';
            this.address = Signaling.SALTYRTC_ADDR_UNKNOWN;
            this.log = client.log;
            this.client = client;
            this.permanentKey = permanentKey;
            this.host = host;
            this.port = port;
            this.tasks = tasks;
            this.pingInterval = pingInterval;
            if (peerTrustedKey !== undefined) {
                this.peerTrustedKey = peerTrustedKey;
            }
            if (serverKey !== undefined) {
                this.serverPublicKey = serverKey;
            }
            this.handoverState.onBoth = function () {
                _this.client.emit({ type: 'handover' });
                _this.closeWebsocket(exports.CloseCode.Handover);
            };
        }

        createClass(Signaling, [{
            key: 'setState',
            value: function setState(newState) {
                this.state = newState;
                this.client.emit({ type: 'state-change', data: newState });
                this.client.emit({ type: 'state-change:' + newState });
            }
        }, {
            key: 'getState',
            value: function getState() {
                return this.state;
            }
        }, {
            key: 'msgpackEncode',
            value: function msgpackEncode(data) {
                return msgpack.encode(data, this.msgpackEncodeOptions);
            }
        }, {
            key: 'msgpackDecode',
            value: function msgpackDecode(data) {
                return msgpack.decode(data, this.msgpackDecodeOptions);
            }
        }, {
            key: 'connect',
            value: function connect() {
                this.resetConnection();
                this.initWebsocket();
            }
        }, {
            key: 'disconnect',
            value: function disconnect() {
                var unbind = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

                var reason = exports.CloseCode.ClosingNormal;
                this.setState('closing');
                if (this.state === 'task') {
                    this.sendClose(reason);
                }
                this.closeWebsocket(reason, undefined, unbind);
                if (this.task !== null) {
                    this.log.debug(this.logTag, 'Closing task connections');
                    this.task.close(reason);
                }
                this.setState('closed');
            }
        }, {
            key: 'closeWebsocket',
            value: function closeWebsocket(code, reason) {
                var unbind = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

                if (this.ws !== null) {
                    if (code === undefined || code <= 3000) {
                        code = exports.CloseCode.ClosingNormal;
                    }
                    this.log.debug(this.logTag, 'Disconnecting WebSocket, close code: ' + code);
                    this.ws.close(code, reason);
                    if (unbind) {
                        this.ws.removeEventListener('open', this.onOpen.bind(this));
                        this.ws.removeEventListener('error', this.onError.bind(this));
                        this.ws.removeEventListener('close', this.onClose.bind(this));
                        this.ws.removeEventListener('message', this.onMessage.bind(this));
                    }
                    this.ws = null;
                    if (unbind) {
                        this.setState('closed');
                    }
                }
            }
        }, {
            key: 'initWebsocket',
            value: function initWebsocket() {
                var url = this.protocol + '://' + this.host + ':' + this.port + '/';
                var path = this.getWebsocketPath();
                this.ws = new WebSocket(url + path, Signaling.SALTYRTC_SUBPROTOCOL);
                this.ws.binaryType = 'arraybuffer';
                this.ws.addEventListener('open', this.onOpen.bind(this));
                this.ws.addEventListener('error', this.onError.bind(this));
                this.ws.addEventListener('close', this.onClose.bind(this));
                this.ws.addEventListener('message', this.onMessage.bind(this));
                this.setState('ws-connecting');
                this.log.debug(this.logTag, 'Opening WebSocket connection to', url + path);
            }
        }, {
            key: 'onOpen',
            value: function onOpen() {
                this.log.info(this.logTag, 'Opened connection');
                this.setState('server-handshake');
            }
        }, {
            key: 'onError',
            value: function onError(ev) {
                this.log.error(this.logTag, 'General WebSocket error', ev);
                this.client.emit({ type: 'connection-error' });
            }
        }, {
            key: 'onClose',
            value: function onClose(ev) {
                if (ev.code === exports.CloseCode.Handover) {
                    this.log.info(this.logTag, 'Closed WebSocket connection due to handover');
                } else {
                    this.log.info(this.logTag, 'Closed WebSocket connection with close code ' + ev.code + ' (' + explainCloseCode(ev.code) + ')');
                    this.setState('closed');
                    this.client.emit({ type: 'connection-closed', data: ev.code });
                }
            }
        }, {
            key: 'onMessage',
            value: function onMessage(ev) {
                this.log.debug(this.logTag, 'New ws message (' + ev.data.byteLength + ' bytes)');
                if (this.handoverState.peer) {
                    this.log.error(this.logTag, 'Protocol error: Received WebSocket message from peer ' + 'even though it has already handed over to task.');
                    this.resetConnection(exports.CloseCode.ProtocolError);
                    return;
                }
                var nonce = void 0;
                try {
                    var box = Box.fromUint8Array(new Uint8Array(ev.data), Nonce.TOTAL_LENGTH);
                    nonce = Nonce.fromUint8Array(box.nonce);
                    var peer = this.getPeerWithId(nonce.source);
                    if (peer === null) {
                        this.log.debug(this.logTag, 'Ignoring message from unknown id: ' + nonce.source);
                        return;
                    }
                    try {
                        this.validateNonce(nonce);
                    } catch (e) {
                        if (e.name === 'ValidationError') {
                            if (e.critical === true) {
                                throw new ProtocolError('Invalid nonce: ' + e);
                            } else {
                                this.log.warn(this.logTag, 'Dropping message with invalid nonce: ' + e);
                                return;
                            }
                        } else {
                            throw e;
                        }
                    }
                    switch (this.getState()) {
                        case 'server-handshake':
                            this.onServerHandshakeMessage(box, nonce);
                            break;
                        case 'peer-handshake':
                            this.onPeerHandshakeMessage(box, nonce);
                            break;
                        case 'task':
                            this.onSignalingMessage(box, nonce);
                            break;
                        default:
                            this.log.warn(this.logTag, 'Received message in', this.getState(), 'signaling state. Ignoring.');
                    }
                } catch (e) {
                    if (e.name === 'SignalingError' || e.name === 'ProtocolError') {
                        var errmsg = 'Signaling error: ' + explainCloseCode(e.closeCode);
                        if (e.message) {
                            errmsg += ' (' + e.message + ')';
                        }
                        this.log.error(this.logTag, errmsg);
                        switch (this.state) {
                            case 'new':
                            case 'ws-connecting':
                            case 'server-handshake':
                                this.resetConnection(e.closeCode);
                                break;
                            case 'peer-handshake':
                                this.handlePeerHandshakeSignalingError(e, nonce === undefined ? null : nonce.source);
                                break;
                            case 'task':
                                this.sendClose(e.closeCode);
                                this.resetConnection(exports.CloseCode.ClosingNormal);
                                break;
                            case 'closing':
                            case 'closed':
                                break;
                        }
                    } else if (e.name === 'ConnectionError') {
                        this.log.warn(this.logTag, 'Connection error. Resetting connection.');
                        this.resetConnection(exports.CloseCode.InternalError);
                    } else {
                        if (e.hasOwnProperty('stack')) {
                            this.log.error(this.logTag, 'An unknown error occurred:');
                            this.log.error(e.stack);
                        }
                        throw e;
                    }
                }
            }
        }, {
            key: 'onServerHandshakeMessage',
            value: function onServerHandshakeMessage(box, nonce) {
                var payload = void 0;
                if (this.server.handshakeState === 'new') {
                    payload = box.data;
                } else {
                    payload = this.server.sessionSharedKey.decrypt(box);
                }
                var msg = this.decodeMessage(payload, 'server handshake');
                switch (this.server.handshakeState) {
                    case 'new':
                        if (msg.type !== 'server-hello') {
                            throw new ProtocolError('Expected server-hello message, but got ' + msg.type);
                        }
                        this.log.debug(this.logTag, 'Received server-hello');
                        this.handleServerHello(msg, nonce);
                        this.sendClientHello();
                        this.sendClientAuth();
                        break;
                    case 'hello-sent':
                        throw new ProtocolError('Received ' + msg.type + ' message before sending client-auth');
                    case 'auth-sent':
                        if (msg.type !== 'server-auth') {
                            throw new ProtocolError('Expected server-auth message, but got ' + msg.type);
                        }
                        this.log.debug(this.logTag, 'Received server-auth');
                        this.handleServerAuth(msg, nonce);
                        break;
                    case 'done':
                        throw new SignalingError(exports.CloseCode.InternalError, 'Received server handshake message even though server handshake state is set to \'done\'');
                    default:
                        throw new SignalingError(exports.CloseCode.InternalError, 'Unknown server handshake state: ' + this.server.handshakeState);
                }
                if (this.server.handshakeState === 'done') {
                    this.setState('peer-handshake');
                    this.log.debug(this.logTag, 'Server handshake done');
                    this.initPeerHandshake();
                }
            }
        }, {
            key: 'onSignalingMessage',
            value: function onSignalingMessage(box, nonce) {
                this.log.debug(this.logTag, 'Message received');
                if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
                    this.onSignalingServerMessage(box);
                } else {
                    var decrypted = this.getPeer().sessionSharedKey.decrypt(box);
                    this.onSignalingPeerMessage(decrypted);
                }
            }
        }, {
            key: 'onSignalingServerMessage',
            value: function onSignalingServerMessage(box) {
                var msg = this.decryptServerMessage(box);
                switch (msg.type) {
                    case 'send-error':
                        this.log.debug(this.logTag, 'Received send-error message');
                        this.handleSendError(msg);
                        break;
                    case 'disconnected':
                        this.log.debug(this.logTag, 'Received disconnected message');
                        this.handleDisconnected(msg);
                        break;
                    default:
                        this.onUnhandledSignalingServerMessage(msg);
                }
            }
        }, {
            key: 'onSignalingPeerMessage',
            value: function onSignalingPeerMessage(decrypted) {
                var msg = this.decodeMessage(decrypted);
                if (msg.type === 'close') {
                    this.log.debug(this.logTag, 'Received close');
                    this.handleClose(msg);
                } else if (msg.type === 'application') {
                    this.log.debug(this.logTag, 'Received application message');
                    this.handleApplication(msg);
                } else if (this.task !== null) {
                    var messageSupportedByTask = this.task.getSupportedMessageTypes().indexOf(msg.type) !== -1;
                    if (messageSupportedByTask) {
                        this.log.debug(this.logTag, 'Received', msg.type, '[' + this.task.getName() + ']');
                        this.task.onTaskMessage(msg);
                    } else {
                        this.log.error(this.logTag, 'Received', msg.type, 'message which is not supported by the', this.task.getName(), 'task');
                        this.resetConnection(exports.CloseCode.ProtocolError);
                    }
                } else {
                    this.log.warn(this.logTag, 'Received message with invalid type from peer:', msg.type);
                }
            }
        }, {
            key: 'handleServerHello',
            value: function handleServerHello(msg, nonce) {
                this.server.setSessionSharedKey(new Uint8Array(msg.key), this.permanentKey);
                this.server.cookiePair.theirs = nonce.cookie;
            }
        }, {
            key: 'sendClientAuth',
            value: function sendClientAuth() {
                var message = {
                    type: 'client-auth',
                    your_cookie: arrayToBuffer(this.server.cookiePair.theirs.bytes),
                    subprotocols: [Signaling.SALTYRTC_SUBPROTOCOL],
                    ping_interval: this.pingInterval
                };
                if (this.serverPublicKey !== null) {
                    message.your_key = arrayToBuffer(this.serverPublicKey);
                }
                var packet = this.buildPacket(message, this.server);
                this.log.debug(this.logTag, 'Sending client-auth');
                this.ws.send(packet);
                this.server.handshakeState = 'auth-sent';
            }
        }, {
            key: 'handleSendError',
            value: function handleSendError(msg) {
                var id = new DataView(msg.id);
                var idString = u8aToHex(new Uint8Array(msg.id));
                var source = id.getUint8(0);
                var destination = id.getUint8(1);
                if (source !== this.address) {
                    throw new ProtocolError('Received send-error message for a message not sent by us!');
                }
                this.log.warn(this.logTag, 'SendError: Could not send unknown message:', idString);
                this._handleSendError(destination);
            }
        }, {
            key: 'handleApplication',
            value: function handleApplication(msg) {
                this.client.emit({ type: 'application', data: msg.data });
            }
        }, {
            key: 'sendClose',
            value: function sendClose(reason) {
                var message = {
                    type: 'close',
                    reason: reason
                };
                this.log.debug(this.logTag, 'Sending close');
                if (this.handoverState.local === true) {
                    this.task.sendSignalingMessage(this.msgpackEncode(message));
                } else {
                    var packet = this.buildPacket(message, this.getPeer());
                    this.ws.send(packet);
                }
            }
        }, {
            key: 'handleClose',
            value: function handleClose(msg) {
                this.log.warn(this.logTag, 'Received close message. Reason:', msg.reason, '(' + explainCloseCode(msg.reason) + ')');
                this.task.close(msg.reason);
                this.resetConnection(exports.CloseCode.GoingAway);
            }
        }, {
            key: 'handleDisconnected',
            value: function handleDisconnected(msg) {
                this.client.emit({ type: 'peer-disconnected', data: msg.id });
            }
        }, {
            key: 'validateNonce',
            value: function validateNonce(nonce) {
                this.validateNonceSource(nonce);
                this.validateNonceDestination(nonce);
                this.validateNonceCsn(nonce);
                this.validateNonceCookie(nonce);
            }
        }, {
            key: 'validateNonceSource',
            value: function validateNonceSource(nonce) {
                switch (this.state) {
                    case 'server-handshake':
                        if (nonce.source !== Signaling.SALTYRTC_ADDR_SERVER) {
                            throw new ValidationError('Received message during server handshake ' + 'with invalid sender address (' + nonce.source + ' != ' + Signaling.SALTYRTC_ADDR_SERVER + ')', false);
                        }
                        break;
                    case 'peer-handshake':
                    case 'task':
                        if (nonce.source !== Signaling.SALTYRTC_ADDR_SERVER) {
                            if (this.role === 'initiator' && !isResponderId(nonce.source)) {
                                throw new ValidationError('Initiator peer message does not come from ' + 'a valid responder address: ' + nonce.source, false);
                            } else if (this.role === 'responder' && nonce.source !== Signaling.SALTYRTC_ADDR_INITIATOR) {
                                throw new ValidationError('Responder peer message does not come from ' + 'intitiator (' + Signaling.SALTYRTC_ADDR_INITIATOR + '), ' + 'but from ' + nonce.source, false);
                            }
                        }
                        break;
                    default:
                        throw new ProtocolError('Cannot validate message nonce in signaling state ' + this.state);
                }
            }
        }, {
            key: 'validateNonceDestination',
            value: function validateNonceDestination(nonce) {
                var expected = null;
                if (this.state === 'server-handshake') {
                    switch (this.server.handshakeState) {
                        case 'new':
                        case 'hello-sent':
                            expected = Signaling.SALTYRTC_ADDR_UNKNOWN;
                            break;
                        case 'auth-sent':
                            if (this.role === 'initiator') {
                                expected = Signaling.SALTYRTC_ADDR_INITIATOR;
                            } else {
                                if (!isResponderId(nonce.destination)) {
                                    throw new ValidationError('Received message during server handshake with invalid ' + 'receiver address (' + nonce.destination + ' is not a valid responder id)');
                                }
                            }
                            break;
                        case 'done':
                            expected = this.address;
                            break;
                    }
                } else if (this.state === 'peer-handshake' || this.state === 'task') {
                    expected = this.address;
                } else {
                    throw new ValidationError('Cannot validate message nonce in signaling state ' + this.state);
                }
                if (expected !== null && nonce.destination !== expected) {
                    throw new ValidationError('Received message with invalid destination (' + nonce.destination + ' != ' + expected + ')');
                }
            }
        }, {
            key: 'validateNonceCsn',
            value: function validateNonceCsn(nonce) {
                var peer = this.getPeerWithId(nonce.source);
                if (peer === null) {
                    throw new ProtocolError('Could not find peer ' + nonce.source);
                }
                if (peer.csnPair.theirs === null) {
                    if (nonce.overflow !== 0) {
                        throw new ValidationError('First message from ' + peer.name + ' must have set the overflow number to 0');
                    }
                    peer.csnPair.theirs = nonce.combinedSequenceNumber;
                } else {
                    var previous = peer.csnPair.theirs;
                    var current = nonce.combinedSequenceNumber;
                    if (current < previous) {
                        throw new ValidationError(peer.name + ' CSN is lower than last time');
                    } else if (current === previous) {
                        throw new ValidationError(peer.name + " CSN hasn't been incremented");
                    } else {
                        peer.csnPair.theirs = current;
                    }
                }
            }
        }, {
            key: 'validateNonceCookie',
            value: function validateNonceCookie(nonce) {
                var peer = this.getPeerWithId(nonce.source);
                if (peer !== null && peer.cookiePair.theirs !== null) {
                    if (!nonce.cookie.equals(peer.cookiePair.theirs)) {
                        throw new ValidationError(peer.name + ' cookie changed');
                    }
                }
            }
        }, {
            key: 'validateRepeatedCookie',
            value: function validateRepeatedCookie(peer, repeatedCookieBytes) {
                var repeatedCookie = new Cookie(repeatedCookieBytes);
                if (!repeatedCookie.equals(peer.cookiePair.ours)) {
                    this.log.debug(this.logTag, 'Their cookie:', repeatedCookie.bytes);
                    this.log.debug(this.logTag, 'Our cookie:', peer.cookiePair.ours.bytes);
                    throw new ProtocolError('Peer repeated cookie does not match our cookie');
                }
            }
        }, {
            key: 'validateSignedKeys',
            value: function validateSignedKeys(signedKeys, nonce, serverPublicKey) {
                if (signedKeys === null || signedKeys === undefined) {
                    throw new ValidationError('Server did not send signed_keys in server-auth message');
                }
                var box = new Box(nonce.toUint8Array(), new Uint8Array(signedKeys), nacl.box.nonceLength);
                this.log.debug(this.logTag, 'Expected server public permanent key is', u8aToHex(serverPublicKey));
                var decrypted = void 0;
                try {
                    decrypted = this.permanentKey.decrypt(box, serverPublicKey);
                } catch (e) {
                    if (e.name === 'CryptoError' && e.code === 'decryption-failed') {
                        throw new ValidationError('Could not decrypt signed_keys in server_auth message');
                    }
                    throw e;
                }
                var expected = concat(this.server.sessionSharedKey.remotePublicKeyBytes, this.permanentKey.publicKeyBytes);
                if (!arraysAreEqual(decrypted, expected)) {
                    throw new ValidationError('Decrypted signed_keys in server-auth message is invalid');
                }
            }
        }, {
            key: 'decodeMessage',
            value: function decodeMessage(data, expectedType) {
                var enforce = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

                var msg = this.msgpackDecode(data);
                if (msg.type === undefined) {
                    throw new ProtocolError('Malformed ' + expectedType + ' message: Failed to decode msgpack data.');
                }
                if (enforce && expectedType !== undefined && msg.type !== expectedType) {
                    throw new ProtocolError('Invalid ' + expectedType + ' message, bad type: ' + msg);
                }
                return msg;
            }
        }, {
            key: 'buildPacket',
            value: function buildPacket(message, receiver) {
                var encrypt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

                var csn = void 0;
                try {
                    csn = receiver.csnPair.ours.next();
                } catch (e) {
                    throw new ProtocolError('CSN overflow: ' + e.message);
                }
                var nonce = new Nonce(receiver.cookiePair.ours, csn.overflow, csn.sequenceNumber, this.address, receiver.id);
                var nonceBytes = nonce.toUint8Array();
                var data = this.msgpackEncode(message);
                if (encrypt === false) {
                    return concat(nonceBytes, data);
                }
                var box = void 0;
                if (receiver.id === Signaling.SALTYRTC_ADDR_SERVER) {
                    box = this.encryptHandshakeDataForServer(data, nonceBytes);
                } else if (receiver.id === Signaling.SALTYRTC_ADDR_INITIATOR || isResponderId(receiver.id)) {
                    box = this.encryptHandshakeDataForPeer(receiver.id, message.type, data, nonceBytes);
                } else {
                    throw new ProtocolError('Bad receiver byte: ' + receiver);
                }
                return box.toUint8Array();
            }
        }, {
            key: 'encryptHandshakeDataForServer',
            value: function encryptHandshakeDataForServer(payload, nonceBytes) {
                return this.server.sessionSharedKey.encrypt(payload, nonceBytes);
            }
        }, {
            key: 'getCurrentPeerCsn',
            value: function getCurrentPeerCsn() {
                if (this.getState() !== 'task') {
                    return null;
                }
                return {
                    incoming: this.getPeer().csnPair.theirs,
                    outgoing: this.getPeer().csnPair.ours.asNumber()
                };
            }
        }, {
            key: 'decryptData',
            value: function decryptData(box) {
                return this.getPeer().sessionSharedKey.decrypt(box);
            }
        }, {
            key: 'resetConnection',
            value: function resetConnection(reason) {
                this.closeWebsocket(reason, undefined, true);
                this.server = new Server();
                this.handoverState.reset();
                this.setState('new');
                if (reason !== undefined) {
                    this.log.debug(this.logTag, 'Connection reset');
                }
            }
        }, {
            key: 'initTask',
            value: function initTask(task, data) {
                try {
                    task.init(this, data);
                } catch (e) {
                    if (e.name === 'ValidationError') {
                        throw new ProtocolError('Peer sent invalid task data');
                    }
                    throw e;
                }
                this.task = task;
            }
        }, {
            key: 'decryptPeerMessage',
            value: function decryptPeerMessage(box) {
                var convertErrors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

                try {
                    var decrypted = this.getPeer().sessionSharedKey.decrypt(box);
                    return this.decodeMessage(decrypted, 'peer');
                } catch (e) {
                    if (convertErrors === true && e.name === 'CryptoError' && e.code === 'decryption-failed') {
                        var nonce = Nonce.fromUint8Array(box.nonce);
                        throw new ProtocolError('Could not decrypt peer message from ' + byteToHex(nonce.source));
                    } else {
                        throw e;
                    }
                }
            }
        }, {
            key: 'decryptServerMessage',
            value: function decryptServerMessage(box) {
                try {
                    var decrypted = this.server.sessionSharedKey.decrypt(box);
                    return this.decodeMessage(decrypted, 'server');
                } catch (e) {
                    if (e.name === 'CryptoError' && e.code === 'decryption-failed') {
                        throw new ProtocolError('Could not decrypt server message');
                    } else {
                        throw e;
                    }
                }
            }
        }, {
            key: 'sendApplication',
            value: function sendApplication(msg) {
                this.sendPostClientHandshakeMessage(msg, 'application');
            }
        }, {
            key: 'sendTaskMessage',
            value: function sendTaskMessage(msg) {
                this.sendPostClientHandshakeMessage(msg, 'task');
            }
        }, {
            key: 'sendPostClientHandshakeMessage',
            value: function sendPostClientHandshakeMessage(msg, name) {
                if (this.state !== 'task') {
                    throw new SignalingError(exports.CloseCode.ProtocolError, 'Cannot send ' + name + ' message in "' + this.state + '" state');
                }
                var receiver = this.getPeer();
                if (receiver === null) {
                    throw new SignalingError(exports.CloseCode.InternalError, 'No peer address could be found');
                }
                if (this.handoverState.local === true) {
                    this.log.debug(this.logTag, 'Sending', name, 'message through dc');
                    this.task.sendSignalingMessage(this.msgpackEncode(msg));
                } else {
                    this.log.debug(this.logTag, 'Sending', name, 'message through ws');
                    var packet = this.buildPacket(msg, receiver);
                    this.ws.send(packet);
                }
            }
        }, {
            key: 'encryptForPeer',
            value: function encryptForPeer(data, nonce) {
                var peer = this.getPeer();
                if (!peer) {
                    throw new Error('Remote peer has not yet been established');
                }
                var sessionSharedKey = peer.sessionSharedKey;
                if (!sessionSharedKey) {
                    throw new Error('Session key not yet established');
                }
                return sessionSharedKey.encrypt(data, nonce);
            }
        }, {
            key: 'decryptFromPeer',
            value: function decryptFromPeer(box) {
                var peer = this.getPeer();
                if (!peer) {
                    throw new Error('Remote peer has not yet been established');
                }
                var sessionSharedKey = peer.sessionSharedKey;
                if (!sessionSharedKey) {
                    throw new Error('Session key not yet established');
                }
                try {
                    return sessionSharedKey.decrypt(box);
                } catch (e) {
                    if (e.name === 'CryptoError' && e.code === 'decryption-failed') {
                        if (this.state === 'task') {
                            this.sendClose(exports.CloseCode.InternalError);
                        }
                        this.resetConnection(exports.CloseCode.InternalError);
                        throw new SignalingError(exports.CloseCode.InternalError, 'Decryption of peer message failed. This should not happen.');
                    } else {
                        throw e;
                    }
                }
            }
        }, {
            key: 'permanentKeyBytes',
            get: function get$$1() {
                return this.permanentKey.publicKeyBytes;
            }
        }, {
            key: 'authTokenBytes',
            get: function get$$1() {
                if (this.authToken !== null) {
                    return this.authToken.keyBytes;
                }
                return null;
            }
        }, {
            key: 'peerPermanentKeyBytes',
            get: function get$$1() {
                return this.getPeer().permanentSharedKey.remotePublicKeyBytes;
            }
        }]);
        return Signaling;
    }();

    Signaling.SALTYRTC_SUBPROTOCOL = 'v1.saltyrtc.org';
    Signaling.SALTYRTC_ADDR_UNKNOWN = 0x00;
    Signaling.SALTYRTC_ADDR_SERVER = 0x00;
    Signaling.SALTYRTC_ADDR_INITIATOR = 0x01;

    var InitiatorSignaling = function (_Signaling) {
        inherits(InitiatorSignaling, _Signaling);

        function InitiatorSignaling(client, host, port, serverKey, tasks, pingInterval, permanentKey, responderTrustedKey) {
            classCallCheck(this, InitiatorSignaling);

            var _this = possibleConstructorReturn(this, (InitiatorSignaling.__proto__ || Object.getPrototypeOf(InitiatorSignaling)).call(this, client, host, port, serverKey, tasks, pingInterval, permanentKey, responderTrustedKey));

            _this.logTag = '[SaltyRTC.Initiator]';
            _this.responderCounter = 0;
            _this.responders = null;
            _this.responder = null;
            _this.role = 'initiator';
            if (responderTrustedKey === undefined) {
                _this.authToken = new AuthToken(undefined, _this.log);
            }
            return _this;
        }

        createClass(InitiatorSignaling, [{
            key: 'getWebsocketPath',
            value: function getWebsocketPath() {
                return this.permanentKey.publicKeyHex;
            }
        }, {
            key: 'encryptHandshakeDataForPeer',
            value: function encryptHandshakeDataForPeer(receiver, messageType, payload, nonceBytes) {
                if (receiver === Signaling.SALTYRTC_ADDR_INITIATOR) {
                    throw new ProtocolError('Initiator cannot encrypt messages for initiator');
                } else if (!isResponderId(receiver)) {
                    throw new ProtocolError('Bad receiver byte: ' + receiver);
                }
                var responder = void 0;
                if (this.getState() === 'task') {
                    responder = this.responder;
                } else if (this.responders.has(receiver)) {
                    responder = this.responders.get(receiver);
                } else {
                    throw new ProtocolError('Unknown responder: ' + receiver);
                }
                switch (messageType) {
                    case 'key':
                        return responder.permanentSharedKey.encrypt(payload, nonceBytes);
                    default:
                        return responder.sessionSharedKey.encrypt(payload, nonceBytes);
                }
            }
        }, {
            key: 'getPeer',
            value: function getPeer() {
                if (this.responder !== null) {
                    return this.responder;
                }
                return null;
            }
        }, {
            key: 'getPeerWithId',
            value: function getPeerWithId(id) {
                if (id === Signaling.SALTYRTC_ADDR_SERVER) {
                    return this.server;
                } else if (isResponderId(id)) {
                    if (this.state === 'task' && this.responder !== null && this.responder.id === id) {
                        return this.responder;
                    } else if (this.responders.has(id)) {
                        return this.responders.get(id);
                    }
                    return null;
                } else {
                    throw new ProtocolError('Invalid peer id: ' + id);
                }
            }
        }, {
            key: 'handlePeerHandshakeSignalingError',
            value: function handlePeerHandshakeSignalingError(e, source) {
                if (source !== null) {
                    this.dropResponder(source, e.closeCode);
                }
            }
        }, {
            key: 'processNewResponder',
            value: function processNewResponder(responderId) {
                if (this.responders.has(responderId)) {
                    this.log.warn(this.logTag, 'Previous responder discarded (server ' + ('should have sent \'disconnected\' message): ' + responderId));
                    this.responders.delete(responderId);
                }
                var responder = new Responder(responderId, this.responderCounter++);
                if (this.peerTrustedKey !== null) {
                    responder.handshakeState = 'token-received';
                    responder.setPermanentSharedKey(this.peerTrustedKey, this.permanentKey);
                }
                this.responders.set(responderId, responder);
                if (this.responders.size > 252) {
                    this.dropOldestInactiveResponder();
                }
                this.client.emit({ type: 'new-responder', data: responderId });
            }
        }, {
            key: 'dropOldestInactiveResponder',
            value: function dropOldestInactiveResponder() {
                this.log.warn(this.logTag, 'Dropping oldest inactive responder');
                var drop = null;
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.responders.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var r = _step.value;

                        if (r.handshakeState === 'new') {
                            if (drop === null) {
                                drop = r;
                            } else if (r.counter < drop.counter) {
                                drop = r;
                            }
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                if (drop !== null) {
                    this.dropResponder(drop.id, exports.CloseCode.DroppedByInitiator);
                }
            }
        }, {
            key: 'onPeerHandshakeMessage',
            value: function onPeerHandshakeMessage(box, nonce) {
                if (nonce.destination !== this.address) {
                    throw new ProtocolError('Message destination does not match our address');
                }
                var payload = void 0;
                if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
                    try {
                        payload = this.server.sessionSharedKey.decrypt(box);
                    } catch (e) {
                        if (e.name === 'CryptoError' && e.code === 'decryption-failed') {
                            throw new SignalingError(exports.CloseCode.ProtocolError, 'Could not decrypt server message.');
                        } else {
                            throw e;
                        }
                    }
                    var msg = this.decodeMessage(payload, 'server');
                    switch (msg.type) {
                        case 'new-responder':
                            this.log.debug(this.logTag, 'Received new-responder message', byteToHex(msg.id));
                            this.handleNewResponder(msg);
                            break;
                        case 'send-error':
                            this.log.debug(this.logTag, 'Received send-error message');
                            this.handleSendError(msg);
                            break;
                        case 'disconnected':
                            this.log.debug(this.logTag, 'Received disconnected message');
                            this.handleDisconnected(msg);
                            break;
                        default:
                            throw new ProtocolError('Received unexpected server message: ' + msg.type);
                    }
                } else if (isResponderId(nonce.source)) {
                    var responder = this.responders.get(nonce.source);
                    if (responder === null) {
                        throw new ProtocolError('Unknown message source: ' + nonce.source);
                    }
                    var _msg = void 0;
                    switch (responder.handshakeState) {
                        case 'new':
                            if (this.peerTrustedKey !== null) {
                                throw new SignalingError(exports.CloseCode.InternalError, 'Handshake state is "new" even though a trusted key is available');
                            }
                            try {
                                payload = this.authToken.decrypt(box);
                            } catch (e) {
                                this.log.warn(this.logTag, 'Could not decrypt token message: ', e);
                                this.dropResponder(responder.id, exports.CloseCode.InitiatorCouldNotDecrypt);
                                return;
                            }
                            _msg = this.decodeMessage(payload, 'token', true);
                            this.log.debug(this.logTag, 'Received token');
                            this.handleToken(_msg, responder);
                            break;
                        case 'token-received':
                            if (this.peerTrustedKey !== null) {
                                try {
                                    payload = this.permanentKey.decrypt(box, this.peerTrustedKey);
                                } catch (e) {
                                    this.log.warn(this.logTag, 'Could not decrypt key message');
                                    this.dropResponder(responder.id, exports.CloseCode.InitiatorCouldNotDecrypt);
                                    return;
                                }
                            } else {
                                payload = responder.permanentSharedKey.decrypt(box);
                            }
                            _msg = this.decodeMessage(payload, 'key', true);
                            this.log.debug(this.logTag, 'Received key');
                            this.handleKey(_msg, responder);
                            this.sendKey(responder);
                            break;
                        case 'key-sent':
                            try {
                                payload = responder.sessionSharedKey.decrypt(box);
                            } catch (e) {
                                if (e.name === 'CryptoError' && e.code === 'decryption-failed') {
                                    throw new SignalingError(exports.CloseCode.ProtocolError, 'Could not decrypt auth message.');
                                } else {
                                    throw e;
                                }
                            }
                            _msg = this.decodeMessage(payload, 'auth', true);
                            this.log.debug(this.logTag, 'Received auth');
                            this.handleAuth(_msg, responder, nonce);
                            this.sendAuth(responder, nonce);
                            this.responder = this.responders.get(responder.id);
                            this.responders.delete(responder.id);
                            this.dropResponders(exports.CloseCode.DroppedByInitiator);
                            this.setState('task');
                            this.log.info(this.logTag, 'Peer handshake done');
                            this.task.onPeerHandshakeDone();
                            break;
                        default:
                            throw new SignalingError(exports.CloseCode.InternalError, 'Unknown responder handshake state');
                    }
                } else {
                    throw new SignalingError(exports.CloseCode.InternalError, 'Message source is neither the server nor a responder');
                }
            }
        }, {
            key: 'onUnhandledSignalingServerMessage',
            value: function onUnhandledSignalingServerMessage(msg) {
                if (msg.type === 'new-responder') {
                    this.log.debug(this.logTag, 'Received new-responder message');
                    this.handleNewResponder(msg);
                } else {
                    this.log.warn(this.logTag, 'Unexpected server message type:', msg.type);
                }
            }
        }, {
            key: 'sendClientHello',
            value: function sendClientHello() {}
        }, {
            key: 'handleServerAuth',
            value: function handleServerAuth(msg, nonce) {
                this.address = Signaling.SALTYRTC_ADDR_INITIATOR;
                this.validateRepeatedCookie(this.server, new Uint8Array(msg.your_cookie));
                if (this.serverPublicKey != null) {
                    try {
                        this.validateSignedKeys(new Uint8Array(msg.signed_keys), nonce, this.serverPublicKey);
                    } catch (e) {
                        if (e.name === 'ValidationError') {
                            throw new ProtocolError('Verification of signed_keys failed: ' + e.message);
                        }
                        throw e;
                    }
                } else if (msg.signed_keys !== null && msg.signed_keys !== undefined) {
                    this.log.warn(this.logTag, "Server sent signed keys, but we're not verifying them.");
                }
                this.responders = new Map();
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = msg.responders[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var id = _step2.value;

                        if (!isResponderId(id)) {
                            throw new ProtocolError('Responder id ' + id + ' must be in the range 0x02-0xff');
                        }
                        this.processNewResponder(id);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                this.log.debug(this.logTag, this.responders.size, 'responders connected');
                this.server.handshakeState = 'done';
            }
        }, {
            key: 'initPeerHandshake',
            value: function initPeerHandshake() {}
        }, {
            key: 'handleNewResponder',
            value: function handleNewResponder(msg) {
                if (!isResponderId(msg.id)) {
                    throw new ProtocolError('Responder id ' + msg.id + ' must be in the range 0x02-0xff');
                }
                if (this.state === 'peer-handshake') {
                    this.processNewResponder(msg.id);
                } else {
                    this.log.debug(this.logTag, 'Dropping responder ' + msg.id + ' in \'' + this.state + '\' state');
                    this.dropResponder(msg.id, exports.CloseCode.DroppedByInitiator);
                }
            }
        }, {
            key: 'handleToken',
            value: function handleToken(msg, responder) {
                responder.setPermanentSharedKey(new Uint8Array(msg.key), this.permanentKey);
                responder.handshakeState = 'token-received';
            }
        }, {
            key: 'handleKey',
            value: function handleKey(msg, responder) {
                responder.setLocalSessionKey(new KeyStore(undefined, this.log));
                responder.setSessionSharedKey(new Uint8Array(msg.key));
                responder.handshakeState = 'key-received';
            }
        }, {
            key: 'sendKey',
            value: function sendKey(responder) {
                var message = {
                    type: 'key',
                    key: arrayToBuffer(responder.localSessionKey.publicKeyBytes)
                };
                var packet = this.buildPacket(message, responder);
                this.log.debug(this.logTag, 'Sending key');
                this.ws.send(packet);
                responder.handshakeState = 'key-sent';
            }
        }, {
            key: 'sendAuth',
            value: function sendAuth(responder, nonce) {
                if (nonce.cookie.equals(responder.cookiePair.ours)) {
                    throw new ProtocolError('Their cookie and our cookie are the same.');
                }
                var taskData = {};
                taskData[this.task.getName()] = this.task.getData();
                var message = {
                    type: 'auth',
                    your_cookie: arrayToBuffer(nonce.cookie.bytes),
                    task: this.task.getName(),
                    data: taskData
                };
                var packet = this.buildPacket(message, responder);
                this.log.debug(this.logTag, 'Sending auth');
                this.ws.send(packet);
                responder.handshakeState = 'auth-sent';
            }
        }, {
            key: 'handleAuth',
            value: function handleAuth(msg, responder, nonce) {
                this.validateRepeatedCookie(responder, new Uint8Array(msg.your_cookie));
                try {
                    InitiatorSignaling.validateTaskInfo(msg.tasks, msg.data);
                } catch (e) {
                    if (e.name === 'ValidationError') {
                        throw new ProtocolError('Peer sent invalid task info: ' + e.message);
                    }
                    throw e;
                }
                var task = InitiatorSignaling.chooseCommonTask(this.tasks, msg.tasks);
                if (task === null) {
                    var requested = this.tasks.map(function (t) {
                        return t.getName();
                    });
                    var offered = msg.tasks;
                    this.log.debug(this.logTag, 'We requested:', requested, 'Peer offered:', offered);
                    this.client.emit({ type: 'no-shared-task', data: { requested: requested, offered: offered } });
                    throw new SignalingError(exports.CloseCode.NoSharedTask, 'No shared task could be found');
                } else {
                    this.log.debug(this.logTag, 'Task', task.getName(), 'has been selected');
                }
                this.initTask(task, msg.data[task.getName()]);
                this.log.debug(this.logTag, 'Responder', responder.hexId, 'authenticated');
                responder.cookiePair.theirs = nonce.cookie;
                responder.handshakeState = 'auth-received';
            }
        }, {
            key: '_handleSendError',
            value: function _handleSendError(receiver) {
                if (!isResponderId(receiver)) {
                    throw new ProtocolError('Outgoing c2c messages must have been sent to a responder');
                }
                var notify = false;
                if (this.responder === null) {
                    var responder = this.responders.get(receiver);
                    if (responder === null || responder === undefined) {
                        this.log.warn(this.logTag, 'Got send-error message for unknown responder', receiver);
                    } else {
                        notify = true;
                        this.responders.delete(receiver);
                    }
                } else {
                    if (this.responder.id === receiver) {
                        notify = true;
                        this.resetConnection(exports.CloseCode.ProtocolError);
                    } else {
                        this.log.warn(this.logTag, 'Got send-error message for unknown responder', receiver);
                    }
                }
                if (notify === true) {
                    this.client.emit({ type: 'signaling-connection-lost', data: receiver });
                }
            }
        }, {
            key: 'dropResponders',
            value: function dropResponders(reason) {
                this.log.debug(this.logTag, 'Dropping', this.responders.size, 'other responders.');
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = this.responders.keys()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var id = _step3.value;

                        this.dropResponder(id, reason);
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }
            }
        }, {
            key: 'dropResponder',
            value: function dropResponder(responderId, reason) {
                var message = {
                    type: 'drop-responder',
                    id: responderId,
                    reason: reason
                };
                var packet = this.buildPacket(message, this.server);
                this.log.debug(this.logTag, 'Sending drop-responder', byteToHex(responderId));
                this.ws.send(packet);
                this.responders.delete(responderId);
            }
        }], [{
            key: 'validateTaskInfo',
            value: function validateTaskInfo(names, data) {
                if (names.length < 1) {
                    throw new ValidationError('Task names must not be empty');
                }
                if (Object.keys(data).length < 1) {
                    throw new ValidationError('Task data must not be empty');
                }
                if (names.length !== Object.keys(data).length) {
                    throw new ValidationError('Task data must contain an entry for every task');
                }
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = names[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var task = _step4.value;

                        if (!data.hasOwnProperty(task)) {
                            throw new ValidationError('Task data must contain an entry for every task');
                        }
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }
            }
        }, {
            key: 'chooseCommonTask',
            value: function chooseCommonTask(ourTasks, theirTasks) {
                var _iteratorNormalCompletion5 = true;
                var _didIteratorError5 = false;
                var _iteratorError5 = undefined;

                try {
                    for (var _iterator5 = ourTasks[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                        var task = _step5.value;

                        if (theirTasks.indexOf(task.getName()) !== -1) {
                            return task;
                        }
                    }
                } catch (err) {
                    _didIteratorError5 = true;
                    _iteratorError5 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion5 && _iterator5.return) {
                            _iterator5.return();
                        }
                    } finally {
                        if (_didIteratorError5) {
                            throw _iteratorError5;
                        }
                    }
                }

                return null;
            }
        }]);
        return InitiatorSignaling;
    }(Signaling);

    var ResponderSignaling = function (_Signaling) {
        inherits(ResponderSignaling, _Signaling);

        function ResponderSignaling(client, host, port, serverKey, tasks, pingInterval, permanentKey, initiatorPubKey, authToken) {
            classCallCheck(this, ResponderSignaling);

            var _this = possibleConstructorReturn(this, (ResponderSignaling.__proto__ || Object.getPrototypeOf(ResponderSignaling)).call(this, client, host, port, serverKey, tasks, pingInterval, permanentKey, authToken === undefined ? initiatorPubKey : undefined));

            _this.logTag = '[SaltyRTC.Responder]';
            _this.initiator = null;
            _this.role = 'responder';
            _this.initiator = new Initiator(initiatorPubKey, _this.permanentKey);
            if (authToken !== undefined) {
                _this.authToken = authToken;
            } else {
                _this.initiator.handshakeState = 'token-sent';
            }
            return _this;
        }

        createClass(ResponderSignaling, [{
            key: 'getWebsocketPath',
            value: function getWebsocketPath() {
                return this.initiator.permanentSharedKey.remotePublicKeyHex;
            }
        }, {
            key: 'encryptHandshakeDataForPeer',
            value: function encryptHandshakeDataForPeer(receiver, messageType, payload, nonceBytes) {
                if (isResponderId(receiver)) {
                    throw new ProtocolError('Responder may not encrypt messages for other responders: ' + receiver);
                } else if (receiver !== Signaling.SALTYRTC_ADDR_INITIATOR) {
                    throw new ProtocolError('Bad receiver byte: ' + receiver);
                }
                switch (messageType) {
                    case 'token':
                        return this.authToken.encrypt(payload, nonceBytes);
                    case 'key':
                        return this.initiator.permanentSharedKey.encrypt(payload, nonceBytes);
                    default:
                        var sessionSharedKey = this.getPeer().sessionSharedKey;
                        if (sessionSharedKey === null) {
                            throw new ProtocolError('Trying to encrypt for peer using session key, but session key is null');
                        }
                        return sessionSharedKey.encrypt(payload, nonceBytes);
                }
            }
        }, {
            key: 'getPeer',
            value: function getPeer() {
                if (this.initiator !== null) {
                    return this.initiator;
                }
                return null;
            }
        }, {
            key: 'getPeerWithId',
            value: function getPeerWithId(id) {
                if (id === Signaling.SALTYRTC_ADDR_SERVER) {
                    return this.server;
                } else if (id === Signaling.SALTYRTC_ADDR_INITIATOR) {
                    return this.initiator;
                } else {
                    throw new ProtocolError('Invalid peer id: ' + id);
                }
            }
        }, {
            key: 'handlePeerHandshakeSignalingError',
            value: function handlePeerHandshakeSignalingError(e, source) {
                this.resetConnection(e.closeCode);
            }
        }, {
            key: 'onPeerHandshakeMessage',
            value: function onPeerHandshakeMessage(box, nonce) {
                if (nonce.destination !== this.address) {
                    throw new ProtocolError('Message destination does not match our address');
                }
                var payload = void 0;
                if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
                    try {
                        payload = this.server.sessionSharedKey.decrypt(box);
                    } catch (e) {
                        if (e.name === 'CryptoError' && e.code === 'decryption-failed') {
                            throw new SignalingError(exports.CloseCode.ProtocolError, 'Could not decrypt server message.');
                        } else {
                            throw e;
                        }
                    }
                    var msg = this.decodeMessage(payload, 'server');
                    switch (msg.type) {
                        case 'new-initiator':
                            this.log.debug(this.logTag, 'Received new-initiator message');
                            this.handleNewInitiator();
                            break;
                        case 'send-error':
                            this.log.debug(this.logTag, 'Received send-error message');
                            this.handleSendError(msg);
                            break;
                        case 'disconnected':
                            this.log.debug(this.logTag, 'Received disconnected message');
                            this.handleDisconnected(msg);
                            break;
                        default:
                            throw new ProtocolError('Received unexpected server message: ' + msg.type);
                    }
                } else if (nonce.source === Signaling.SALTYRTC_ADDR_INITIATOR) {
                    payload = this.decryptInitiatorMessage(box);
                    var _msg = void 0;
                    switch (this.initiator.handshakeState) {
                        case 'new':
                            throw new ProtocolError('Unexpected peer handshake message');
                        case 'key-sent':
                            _msg = this.decodeMessage(payload, 'key', true);
                            this.log.debug(this.logTag, 'Received key');
                            this.handleKey(_msg);
                            this.sendAuth(nonce);
                            break;
                        case 'auth-sent':
                            _msg = this.decodeMessage(payload, 'auth', true);
                            this.log.debug(this.logTag, 'Received auth');
                            this.handleAuth(_msg, nonce);
                            this.setState('task');
                            this.log.info(this.logTag, 'Peer handshake done');
                            break;
                        default:
                            throw new SignalingError(exports.CloseCode.InternalError, 'Unknown initiator handshake state');
                    }
                } else {
                    throw new SignalingError(exports.CloseCode.InternalError, 'Message source is neither the server nor the initiator');
                }
            }
        }, {
            key: 'decryptInitiatorMessage',
            value: function decryptInitiatorMessage(box) {
                switch (this.initiator.handshakeState) {
                    case 'new':
                    case 'token-sent':
                    case 'key-received':
                        throw new ProtocolError('Received message in ' + this.initiator.handshakeState + ' state.');
                    case 'key-sent':
                        try {
                            return this.initiator.permanentSharedKey.decrypt(box);
                        } catch (e) {
                            if (e.name === 'CryptoError' && e.code === 'decryption-failed') {
                                throw new SignalingError(exports.CloseCode.ProtocolError, 'Could not decrypt key message.');
                            } else {
                                throw e;
                            }
                        }
                    case 'auth-sent':
                    case 'auth-received':
                        try {
                            return this.initiator.sessionSharedKey.decrypt(box);
                        } catch (e) {
                            if (e.name === 'CryptoError' && e.code === 'decryption-failed') {
                                throw new SignalingError(exports.CloseCode.ProtocolError, 'Could not decrypt initiator session message.');
                            } else {
                                throw e;
                            }
                        }
                    default:
                        throw new ProtocolError('Invalid handshake state: ' + this.initiator.handshakeState);
                }
            }
        }, {
            key: 'onUnhandledSignalingServerMessage',
            value: function onUnhandledSignalingServerMessage(msg) {
                if (msg.type === 'new-initiator') {
                    this.log.debug(this.logTag, 'Received new-initiator message after peer handshake completed, ' + 'closing');
                    this.resetConnection(exports.CloseCode.ClosingNormal);
                } else {
                    this.log.warn(this.logTag, 'Unexpected server message type:', msg.type);
                }
            }
        }, {
            key: 'sendClientHello',
            value: function sendClientHello() {
                var message = {
                    type: 'client-hello',
                    key: arrayToBuffer(this.permanentKey.publicKeyBytes)
                };
                var packet = this.buildPacket(message, this.server, false);
                this.log.debug(this.logTag, 'Sending client-hello');
                this.ws.send(packet);
                this.server.handshakeState = 'hello-sent';
            }
        }, {
            key: 'handleServerAuth',
            value: function handleServerAuth(msg, nonce) {
                if (nonce.destination > 0xff || nonce.destination < 0x02) {
                    this.log.error(this.logTag, 'Invalid nonce destination:', nonce.destination);
                    throw new ValidationError('Invalid nonce destination: ' + nonce.destination);
                }
                this.address = nonce.destination;
                this.log.debug(this.logTag, 'Server assigned address', byteToHex(this.address));
                this.logTag = '[SaltyRTC.Responder.' + byteToHex(this.address) + ']';
                this.validateRepeatedCookie(this.server, new Uint8Array(msg.your_cookie));
                if (this.serverPublicKey != null) {
                    try {
                        this.validateSignedKeys(new Uint8Array(msg.signed_keys), nonce, this.serverPublicKey);
                    } catch (e) {
                        if (e.name === 'ValidationError') {
                            throw new ProtocolError('Verification of signed_keys failed: ' + e.message);
                        }
                        throw e;
                    }
                } else if (msg.signed_keys !== null && msg.signed_keys !== undefined) {
                    this.log.warn(this.logTag, "Server sent signed keys, but we're not verifying them.");
                }
                this.initiator.connected = msg.initiator_connected;
                this.log.debug(this.logTag, 'Initiator', this.initiator.connected ? '' : 'not', 'connected');
                this.server.handshakeState = 'done';
            }
        }, {
            key: 'handleNewInitiator',
            value: function handleNewInitiator() {
                this.initiator = new Initiator(this.initiator.permanentSharedKey.remotePublicKeyBytes, this.permanentKey);
                this.initiator.connected = true;
                this.initPeerHandshake();
            }
        }, {
            key: 'initPeerHandshake',
            value: function initPeerHandshake() {
                if (this.initiator.connected) {
                    if (this.peerTrustedKey === null) {
                        this.sendToken();
                    }
                    this.sendKey();
                }
            }
        }, {
            key: 'sendToken',
            value: function sendToken() {
                var message = {
                    type: 'token',
                    key: arrayToBuffer(this.permanentKey.publicKeyBytes)
                };
                var packet = this.buildPacket(message, this.initiator);
                this.log.debug(this.logTag, 'Sending token');
                this.ws.send(packet);
                this.initiator.handshakeState = 'token-sent';
            }
        }, {
            key: 'sendKey',
            value: function sendKey() {
                this.initiator.setLocalSessionKey(new KeyStore(undefined, this.log));
                var replyMessage = {
                    type: 'key',
                    key: arrayToBuffer(this.initiator.localSessionKey.publicKeyBytes)
                };
                var packet = this.buildPacket(replyMessage, this.initiator);
                this.log.debug(this.logTag, 'Sending key');
                this.ws.send(packet);
                this.initiator.handshakeState = 'key-sent';
            }
        }, {
            key: 'handleKey',
            value: function handleKey(msg) {
                this.initiator.setSessionSharedKey(new Uint8Array(msg.key));
                this.initiator.handshakeState = 'key-received';
            }
        }, {
            key: 'sendAuth',
            value: function sendAuth(nonce) {
                if (nonce.cookie.equals(this.initiator.cookiePair.ours)) {
                    throw new ProtocolError('Their cookie and our cookie are the same.');
                }
                var taskData = {};
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.tasks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var task = _step.value;

                        taskData[task.getName()] = task.getData();
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                var taskNames = this.tasks.map(function (task) {
                    return task.getName();
                });
                var message = {
                    type: 'auth',
                    your_cookie: arrayToBuffer(nonce.cookie.bytes),
                    tasks: taskNames,
                    data: taskData
                };
                var packet = this.buildPacket(message, this.initiator);
                this.log.debug(this.logTag, 'Sending auth');
                this.ws.send(packet);
                this.initiator.handshakeState = 'auth-sent';
            }
        }, {
            key: 'handleAuth',
            value: function handleAuth(msg, nonce) {
                this.validateRepeatedCookie(this.initiator, new Uint8Array(msg.your_cookie));
                try {
                    ResponderSignaling.validateTaskInfo(msg.task, msg.data);
                } catch (e) {
                    if (e.name === 'ValidationError') {
                        throw new ProtocolError('Peer sent invalid task info: ' + e.message);
                    }
                    throw e;
                }
                var selectedTask = null;
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this.tasks[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var task = _step2.value;

                        if (task.getName() === msg.task) {
                            selectedTask = task;
                            this.log.info(this.logTag, 'Task', msg.task, 'has been selected');
                            break;
                        }
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                if (selectedTask === null) {
                    throw new SignalingError(exports.CloseCode.ProtocolError, 'Initiator selected unknown task');
                } else {
                    this.initTask(selectedTask, msg.data[selectedTask.getName()]);
                }
                this.log.debug(this.logTag, 'Initiator authenticated');
                this.initiator.cookiePair.theirs = nonce.cookie;
                this.initiator.handshakeState = 'auth-received';
            }
        }, {
            key: '_handleSendError',
            value: function _handleSendError(receiver) {
                if (receiver !== Signaling.SALTYRTC_ADDR_INITIATOR) {
                    throw new ProtocolError('Outgoing c2c messages must have been sent to the initiator');
                }
                this.client.emit({ type: 'signaling-connection-lost', data: receiver });
                this.resetConnection(exports.CloseCode.ProtocolError);
            }
        }], [{
            key: 'validateTaskInfo',
            value: function validateTaskInfo(name, data) {
                if (name.length === 0) {
                    throw new ValidationError('Task name must not be empty');
                }
                if (Object.keys(data).length < 1) {
                    throw new ValidationError('Task data must not be empty');
                }
                if (Object.keys(data).length > 1) {
                    throw new ValidationError('Task data must contain exactly 1 key');
                }
                if (!data.hasOwnProperty(name)) {
                    throw new ValidationError('Task data must contain an entry for the chosen task');
                }
            }
        }]);
        return ResponderSignaling;
    }(Signaling);

    var SaltyRTCBuilder = function () {
        function SaltyRTCBuilder() {
            classCallCheck(this, SaltyRTCBuilder);

            this.hasConnectionInfo = false;
            this.hasKeyStore = false;
            this.hasInitiatorInfo = false;
            this.hasTrustedPeerKey = false;
            this.hasTasks = false;
            this.serverInfoFactory = null;
            this.pingInterval = 0;
            this.logLevel = 'none';
        }

        createClass(SaltyRTCBuilder, [{
            key: 'requireKeyStore',
            value: function requireKeyStore() {
                if (!this.hasKeyStore) {
                    throw new Error('Keys not set yet. Please call .withKeyStore method first.');
                }
            }
        }, {
            key: 'requireConnectionInfo',
            value: function requireConnectionInfo() {
                if (!this.hasConnectionInfo) {
                    throw new Error('Connection info not set yet. Please call .connectTo method first.');
                }
            }
        }, {
            key: 'requireTasks',
            value: function requireTasks() {
                if (!this.hasTasks) {
                    throw new Error('Tasks not set yet. Please call .usingTasks method first.');
                }
            }
        }, {
            key: 'requireInitiatorInfo',
            value: function requireInitiatorInfo() {
                if (!this.hasInitiatorInfo) {
                    throw new Error('Initiator info not set yet. Please call .initiatorInfo method first.');
                }
            }
        }, {
            key: 'connectTo',
            value: function connectTo(host) {
                var port = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8765;

                SaltyRTCBuilder.validateHost(host);
                this.host = host;
                this.port = port;
                this.hasConnectionInfo = true;
                return this;
            }
        }, {
            key: 'connectWith',
            value: function connectWith(serverInfoFactory) {
                this.serverInfoFactory = serverInfoFactory;
                this.hasConnectionInfo = true;
                return this;
            }
        }, {
            key: 'withKeyStore',
            value: function withKeyStore(keyStore) {
                this.keyStore = keyStore;
                this.hasKeyStore = true;
                return this;
            }
        }, {
            key: 'withTrustedPeerKey',
            value: function withTrustedPeerKey(peerTrustedKey) {
                this.peerTrustedKey = validateKey(peerTrustedKey, 'Peer key');
                this.hasTrustedPeerKey = true;
                return this;
            }
        }, {
            key: 'usingTasks',
            value: function usingTasks(tasks) {
                if (tasks.length < 1) {
                    throw new Error('You must specify at least 1 task');
                }
                this.tasks = tasks;
                this.hasTasks = true;
                return this;
            }
        }, {
            key: 'withPingInterval',
            value: function withPingInterval(interval) {
                if (interval < 0) {
                    throw new Error('Ping interval may not be negative');
                }
                this.pingInterval = interval;
                return this;
            }
        }, {
            key: 'withServerKey',
            value: function withServerKey(serverKey) {
                this.serverPublicKey = validateKey(serverKey, 'Server public key');
                return this;
            }
        }, {
            key: 'withLoggingLevel',
            value: function withLoggingLevel(level) {
                this.logLevel = level;
                return this;
            }
        }, {
            key: 'initiatorInfo',
            value: function initiatorInfo(initiatorPublicKey, authToken) {
                this.initiatorPublicKey = validateKey(initiatorPublicKey, 'Initiator public key');
                this.authToken = validateKey(authToken, 'Auth token');
                this.hasInitiatorInfo = true;
                return this;
            }
        }, {
            key: 'processServerInfo',
            value: function processServerInfo(factory, publicKey) {
                var publicKeyHex = u8aToHex(publicKey);
                var data = factory(publicKeyHex);
                this.host = data.host;
                this.port = data.port;
            }
        }, {
            key: 'asInitiator',
            value: function asInitiator() {
                this.requireConnectionInfo();
                this.requireKeyStore();
                this.requireTasks();
                if (this.hasInitiatorInfo) {
                    throw new Error('Cannot initialize as initiator if .initiatorInfo(...) has been used');
                }
                if (this.serverInfoFactory !== null) {
                    this.processServerInfo(this.serverInfoFactory, this.keyStore.publicKeyBytes);
                }
                if (this.hasTrustedPeerKey) {
                    return new SaltyRTC(new Log(this.logLevel), this.keyStore, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval, this.peerTrustedKey).asInitiator();
                } else {
                    return new SaltyRTC(new Log(this.logLevel), this.keyStore, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval).asInitiator();
                }
            }
        }, {
            key: 'asResponder',
            value: function asResponder() {
                this.requireConnectionInfo();
                this.requireKeyStore();
                this.requireTasks();
                if (this.hasTrustedPeerKey) {
                    if (this.serverInfoFactory !== null) {
                        this.processServerInfo(this.serverInfoFactory, this.peerTrustedKey);
                    }
                    return new SaltyRTC(new Log(this.logLevel), this.keyStore, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval, this.peerTrustedKey).asResponder();
                } else {
                    this.requireInitiatorInfo();
                    if (this.serverInfoFactory !== null) {
                        this.processServerInfo(this.serverInfoFactory, this.initiatorPublicKey);
                    }
                    return new SaltyRTC(new Log(this.logLevel), this.keyStore, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval).asResponder(this.initiatorPublicKey, this.authToken);
                }
            }
        }], [{
            key: 'validateHost',
            value: function validateHost(host) {
                if (host.endsWith('/')) {
                    throw new Error('SaltyRTC host may not end with a slash');
                }
                if (host.indexOf('//') !== -1) {
                    throw new Error('SaltyRTC host should not contain protocol');
                }
            }
        }]);
        return SaltyRTCBuilder;
    }();

    var SaltyRTC = function () {
        function SaltyRTC(log, permanentKey, host, port, serverKey, tasks, pingInterval, peerTrustedKey) {
            classCallCheck(this, SaltyRTC);

            this.peerTrustedKey = null;
            this._signaling = null;
            this.logTag = '[SaltyRTC.Client]';
            if (permanentKey === undefined) {
                throw new Error('SaltyRTC must be initialized with a permanent key');
            }
            if (host === undefined) {
                throw new Error('SaltyRTC must be initialized with a target host');
            }
            if (tasks === undefined || tasks.length === 0) {
                throw new Error('SaltyRTC must be initialized with at least 1 task');
            }
            this.log = log;
            this.host = host;
            this.port = port;
            this.permanentKey = permanentKey;
            this.tasks = tasks;
            this.pingInterval = pingInterval;
            if (peerTrustedKey !== undefined) {
                this.peerTrustedKey = peerTrustedKey;
            }
            if (serverKey !== undefined) {
                this.serverPublicKey = serverKey;
            }
            this.eventRegistry = new EventRegistry();
        }

        createClass(SaltyRTC, [{
            key: 'asInitiator',
            value: function asInitiator() {
                if (this.peerTrustedKey !== null) {
                    this._signaling = new InitiatorSignaling(this, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval, this.permanentKey, this.peerTrustedKey);
                } else {
                    this._signaling = new InitiatorSignaling(this, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval, this.permanentKey);
                }
                return this;
            }
        }, {
            key: 'asResponder',
            value: function asResponder(initiatorPubKey, authToken) {
                if (this.peerTrustedKey !== null) {
                    this._signaling = new ResponderSignaling(this, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval, this.permanentKey, this.peerTrustedKey);
                } else {
                    var token = new AuthToken(authToken, this.log);
                    this._signaling = new ResponderSignaling(this, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval, this.permanentKey, initiatorPubKey, token);
                }
                return this;
            }
        }, {
            key: 'getTask',
            value: function getTask() {
                return this.signaling.task;
            }
        }, {
            key: 'getCurrentPeerCsn',
            value: function getCurrentPeerCsn() {
                return this.signaling.getCurrentPeerCsn();
            }
        }, {
            key: 'encryptForPeer',
            value: function encryptForPeer(data, nonce) {
                return this.signaling.encryptForPeer(data, nonce);
            }
        }, {
            key: 'decryptFromPeer',
            value: function decryptFromPeer(box) {
                return this.signaling.decryptFromPeer(box);
            }
        }, {
            key: 'connect',
            value: function connect() {
                this.signaling.connect();
            }
        }, {
            key: 'disconnect',
            value: function disconnect() {
                var unbind = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

                this.signaling.disconnect(unbind);
            }
        }, {
            key: 'on',
            value: function on(event, handler) {
                this.eventRegistry.register(event, handler);
            }
        }, {
            key: 'once',
            value: function once(event, handler) {
                var _this = this;

                var onceHandler = function onceHandler(ev) {
                    try {
                        handler(ev);
                    } catch (e) {
                        _this.off(ev.type, onceHandler);
                        throw e;
                    }
                    _this.off(ev.type, onceHandler);
                };
                this.eventRegistry.register(event, onceHandler);
            }
        }, {
            key: 'off',
            value: function off(event, handler) {
                if (event === undefined) {
                    this.eventRegistry.unregisterAll();
                } else {
                    this.eventRegistry.unregister(event, handler);
                }
            }
        }, {
            key: 'emit',
            value: function emit(event) {
                this.log.debug(this.logTag, 'New event:', event.type);
                var handlers = this.eventRegistry.get(event.type);
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = handlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var handler = _step.value;

                        try {
                            this.callHandler(handler, event);
                        } catch (e) {
                            this.log.error(this.logTag, 'Unhandled exception in', event.type, 'handler:', e);
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
        }, {
            key: 'sendApplicationMessage',
            value: function sendApplicationMessage(data) {
                this.signaling.sendApplication({
                    type: 'application',
                    data: data
                });
            }
        }, {
            key: 'callHandler',
            value: function callHandler(handler, event) {
                var response = handler(event);
                if (response === false) {
                    this.eventRegistry.unregister(event.type, handler);
                }
            }
        }, {
            key: 'signaling',
            get: function get$$1() {
                if (this._signaling === null) {
                    throw Error('SaltyRTC instance not initialized. Use .asInitiator() or .asResponder().');
                }
                return this._signaling;
            }
        }, {
            key: 'state',
            get: function get$$1() {
                return this.signaling.getState();
            }
        }, {
            key: 'keyStore',
            get: function get$$1() {
                return this.permanentKey;
            }
        }, {
            key: 'permanentKeyBytes',
            get: function get$$1() {
                return this.signaling.permanentKeyBytes;
            }
        }, {
            key: 'permanentKeyHex',
            get: function get$$1() {
                return u8aToHex(this.signaling.permanentKeyBytes);
            }
        }, {
            key: 'authTokenBytes',
            get: function get$$1() {
                return this.signaling.authTokenBytes;
            }
        }, {
            key: 'authTokenHex',
            get: function get$$1() {
                if (this.signaling.authTokenBytes) {
                    return u8aToHex(this.signaling.authTokenBytes);
                }
                return null;
            }
        }, {
            key: 'peerPermanentKeyBytes',
            get: function get$$1() {
                return this.signaling.peerPermanentKeyBytes;
            }
        }, {
            key: 'peerPermanentKeyHex',
            get: function get$$1() {
                return u8aToHex(this.signaling.peerPermanentKeyBytes);
            }
        }]);
        return SaltyRTC;
    }();

    exports.exceptions = exceptions;
    exports.SaltyRTCBuilder = SaltyRTCBuilder;
    exports.KeyStore = KeyStore;
    exports.Box = Box;
    exports.Cookie = Cookie;
    exports.CookiePair = CookiePair;
    exports.CombinedSequence = CombinedSequence;
    exports.CombinedSequencePair = CombinedSequencePair;
    exports.EventRegistry = EventRegistry;
    exports.explainCloseCode = explainCloseCode;
    exports.SignalingError = SignalingError;
    exports.ConnectionError = ConnectionError;
    exports.Log = Log;

    return exports;

}({},nacl,msgpack));
