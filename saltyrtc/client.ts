/**
 * Copyright (C) 2016 Threema GmbH / SaltyRTC Contributors
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the `LICENSE.md` file for details.
 */

/// <reference path='saltyrtc.d.ts' />

import { KeyStore, AuthToken, Box } from "./keystore";
import { Signaling, InitiatorSignaling, ResponderSignaling } from "./signaling";
import { EventRegistry } from "./eventregistry";
import { u8aToHex } from "./utils";


export class SaltyRTCBuilder implements saltyrtc.SaltyRTCBuilder {
    private hasConnectionInfo = false;
    private hasKeyStore = false;
    private hasInitiatorInfo = false;
    private hasTrustedPeerKey = false;
    private hasTasks = false;

    private host: string;
    private port: number;
    private keyStore: KeyStore;
    private initiatorPublicKey: Uint8Array;
    private authToken: Uint8Array;
    private peerTrustedKey: Uint8Array;
    private tasks: saltyrtc.Task[];

    /**
     * Validate the SaltyRTC host. Throw an `Error` if it's invalid.
     */
    private validateHost(host: string): void {
        if (host.endsWith('/')) {
            throw new Error('SaltyRTC host may not end with a slash');
        }
        if (host.indexOf('//') !== -1) {
            throw new Error('SaltyRTC host should not contain protocol');
        }
    }

    /**
     * Assert that a keystore has been set.
     */
    private requireKeyStore(): void {
        if (!this.hasKeyStore) {
            throw new Error("Keys not set yet. Please call .withKeyStore method first.");
        }
    }

    /**
     * Assert that connection info has been set.
     */
    private requireConnectionInfo(): void {
        if (!this.hasConnectionInfo) {
            throw new Error("Connection info not set yet. Please call .connectTo method first.");
        }
    }

    /**
     * Assert that tasks have been set.
     */
    private requireTasks(): void {
        if (!this.hasTasks) {
            throw new Error("Tasks not set yet. Please call .usingTasks method first.");
        }
    }

    /**
     * Assert that initiator info has been set.
     */
    private requireInitiatorInfo(): void {
        if (!this.hasInitiatorInfo) {
            throw new Error("Initiator info not set yet. Please call .initiatorInfo method first.");
        }
    }

    /**
     * Set SaltyRTC signalling server connection info.
     *
     * @param host The SaltyRTC server host.
     * @param port The SaltyRTC server port. Default 8765.
     * @throws Error if the host string is invalid.
     */
    public connectTo(host: string, port: number = 8765): SaltyRTCBuilder {
        this.validateHost(host);
        this.host = host;
        this.port = port;
        this.hasConnectionInfo = true;
        return this;
    }

    /**
     * Set the key store. This can be either a new `KeyStore` instance, or a saved one if you
     * intend to use trusted keys.
     *
     * @param keyStore The KeyStore instance containing the public and private permanent key to use.
     */
    public withKeyStore(keyStore: KeyStore): SaltyRTCBuilder {
        this.keyStore = keyStore;
        this.hasKeyStore = true;
        return this;
    }

    /**
     * Set the trusted public key of the peer.
     *
     * @param peerTrustedKey The trusted public permanent key of the peer.
     */
    public withTrustedPeerKey(peerTrustedKey: Uint8Array): SaltyRTCBuilder {
        this.peerTrustedKey = peerTrustedKey;
        this.hasTrustedPeerKey = true;
        return this;
    }

    /**
     * Set a list of tasks in order of descending preference.
     *
     * @param tasks A list of objects implementing the `saltyrtc.Task` interface in descending preference.
     */
    public usingTasks(tasks: saltyrtc.Task[]): SaltyRTCBuilder {
        if (tasks.length < 1) {
            throw new Error("You must specify at least 1 task");
        }
        this.tasks = tasks;
        this.hasTasks = true;
        return this;
    }

    /**
     * Set initiator connection info transferred via a secure data channel.
     *
     * @param initiatorPublicKey The public key of the initiator.
     * @param authToken The secret auth token.
     */
    public initiatorInfo(initiatorPublicKey: Uint8Array, authToken: Uint8Array): SaltyRTCBuilder {
        this.initiatorPublicKey = initiatorPublicKey;
        this.authToken = authToken;
        this.hasInitiatorInfo = true;
        return this;
    }

    /**
     * Return a SaltyRTC instance configured as initiator.
     * @throws Error if key or connection info haven't been set yet.
     * @returns {SaltyRTC}
     */
    public asInitiator(): SaltyRTC {
        this.requireConnectionInfo();
        this.requireKeyStore();
        this.requireTasks();
        if (this.hasTrustedPeerKey) {
            return new SaltyRTC(this.keyStore, this.host, this.port, this.tasks, this.peerTrustedKey)
                .asInitiator();
        } else {
            return new SaltyRTC(this.keyStore, this.host, this.port, this.tasks)
                .asInitiator();
        }
    }

    /**
     * Return a SaltyRTC instance configured as responder.
     * @throws Error if key or connection info or initiator info haven't been set yet.
     * @returns {SaltyRTC}
     */
    public asResponder(): SaltyRTC {
        this.requireConnectionInfo();
        this.requireKeyStore();
        this.requireTasks();
        if (this.hasTrustedPeerKey) {
            return new SaltyRTC(this.keyStore, this.host, this.port, this.tasks, this.peerTrustedKey)
                .asResponder();
        } else {
            this.requireInitiatorInfo();
            return new SaltyRTC(this.keyStore, this.host, this.port, this.tasks)
                .asResponder(this.initiatorPublicKey, this.authToken);
        }
    }
}

/**
 * The main class used to create a P2P connection through a SaltyRTC signaling
 * server.
 */
class SaltyRTC implements saltyrtc.SaltyRTC {
    private host: string;
    private port: number;
    private permanentKey: KeyStore;
    private tasks: saltyrtc.Task[];
    private peerTrustedKey: Uint8Array = null;
    private _signaling: Signaling = null;
    private eventRegistry: EventRegistry;

    /**
     * Create a new SaltyRTC instance.
     */
    constructor(permanentKey: KeyStore, host: string, port: number,
                tasks: saltyrtc.Task[], peerTrustedKey?: Uint8Array) {
        // Validate arguments
        if (permanentKey === undefined) {
            throw new Error('SaltyRTC must be initialized with a permanent key');
        }
        if (host === undefined) {
            throw new Error('SaltyRTC must be initialized with a target host');
        }
        if (tasks === undefined || tasks.length == 0) {
            throw new Error('SaltyRTC must be initialized with at least 1 task');
        }

        // Store properties
        this.host = host;
        this.port = port;
        this.permanentKey = permanentKey;
        this.tasks = tasks;
        if (peerTrustedKey !== undefined) {
            this.peerTrustedKey = peerTrustedKey;
        }

        // Create new event registry
        this.eventRegistry = new EventRegistry();
    }

    /**
     * Initialize SaltyRTC instance as initiator.
     */
    public asInitiator(): SaltyRTC {
        // Initialize signaling class
        if (this.peerTrustedKey !== null) {
            this._signaling = new InitiatorSignaling(this, this.host, this.port, this.tasks, this.permanentKey, this.peerTrustedKey);
        } else {
            this._signaling = new InitiatorSignaling(this, this.host, this.port, this.tasks, this.permanentKey);
        }

        // Return self
        return this;
    }

    /**
     * Initialize SaltyRTC instance as responder.
     */
    public asResponder(initiatorPubKey?: Uint8Array, authToken?: Uint8Array): SaltyRTC {
        if (this.peerTrustedKey !== null) {
            // Initialize signaling class
            this._signaling = new ResponderSignaling(this, this.host, this.port, this.tasks, this.permanentKey, this.peerTrustedKey);
        } else {
            // Create AuthToken instance
            const token = new AuthToken(authToken);

            // Initialize signaling class
            this._signaling = new ResponderSignaling(this, this.host, this.port, this.tasks, this.permanentKey, initiatorPubKey, token);
        }

        // Return self
        return this;
    }

    private get signaling(): Signaling {
        if (this._signaling === null) {
            throw Error('SaltyRTC instance not initialized. Use .asInitiator() or .asResponder().');
        }
        return this._signaling;
    }

    /**
     * Return the signaling state.
     */
    public get state(): saltyrtc.SignalingState {
        return this.signaling.getState();
    }

    /**
     * Return the keystore containing the personal permanent key private/public keypair.
     */
    public get keyStore(): KeyStore {
        return this.permanentKey;
    }

    /**
     * Return the public permanent key as Uint8Array.
     */
    public get permanentKeyBytes(): Uint8Array {
        return this.signaling.permanentKeyBytes;
    }

    /**
     * Return the public permanent key as hex string.
     */
    public get permanentKeyHex(): string {
        return u8aToHex(this.signaling.permanentKeyBytes);
    }

    /**
     * Return the auth token as Uint8Array.
     */
    public get authTokenBytes(): Uint8Array {
        return this.signaling.authTokenBytes;
    }

    /**
     * Return the auth token as hex string.
     */
    public get authTokenHex(): string {
        return u8aToHex(this.signaling.authTokenBytes);
    }

    /**
     * Return the peer permanent key as Uint8Array.
     */
    public get peerPermanentKeyBytes(): Uint8Array {
        return this.signaling.peerPermanentKeyBytes;
    }

    /**
     * Return the peer permanent key as hex string.
     */
    public get peerPermanentKeyHex(): string {
        return u8aToHex(this.signaling.peerPermanentKeyBytes);
    }

    /**
     * Connect to the SaltyRTC server.
     *
     * This method is asynchronous. To get notified when the connection is up
     * and running, subscribe to the `connected` event.
     */
    public connect(): void {
        this.signaling.connect();
    }

    /**
     * Disconnect from the SaltyRTC server.
     *
     * This method is asynchronous. To get notified when the connection is has
     * been closed, subscribe to the `connection-closed` event.
     */
    public disconnect(): void {
        this.signaling.disconnect();
    }

    /**
     * Attach an event handler to the specified event(s).
     *
     * Note: The same event handler cannot be registered twice. It will only
     * run once.
     */
    public on(event: string | string[], handler: saltyrtc.SaltyEventHandler): void {
        this.eventRegistry.register(event, handler);
    }

    /**
     * Attach a one-time event handler to the specified event(s).
     *
     * Note: If the same handler was already registered previously as a regular
     * event handler, it will be completely removed after running once.
     */
    public once(event: string | string[], handler: saltyrtc.SaltyEventHandler): void {
        const onceHandler: saltyrtc.SaltyEventHandler = (ev: saltyrtc.SaltyRTCEvent) => {
            try {
                handler(ev);
            } catch (e) {
                // Handle exceptions
                this.off(ev.type, onceHandler);
                throw e;
            }
            this.off(ev.type, onceHandler);
        };
        this.eventRegistry.register(event, onceHandler);
    }

    /**
     * Remove an event handler from the specified event(s).
     *
     * If no handler is specified, remove all handlers for the specified
     * event(s).
     */
    public off(event: string | string[], handler?: saltyrtc.SaltyEventHandler): void {
        this.eventRegistry.unregister(event, handler);
    }

    /**
     * Emit an event.
     */
    public emit(event: saltyrtc.SaltyRTCEvent) {
        console.debug('SaltyRTC: New event:', event.type);
        const handlers = this.eventRegistry.get(event.type);
        for (let handler of handlers) {
            try {
                this.callHandler(handler, event);
            } catch (e) {
                console.error('SaltyRTC: Unhandled exception in', event.type, 'handler:', e);
            }
        }
    }

    /**
     * Call a handler with the specified event.
     *
     * If the handler returns `false`, unregister it.
     */
    private callHandler(handler: saltyrtc.SaltyEventHandler, event: saltyrtc.SaltyRTCEvent) {
        const response = handler(event);
        if (response === false) {
            this.eventRegistry.unregister(event.type, handler);
        }
    }

}
