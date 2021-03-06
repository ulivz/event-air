/**
 * EventEmitter
 */

export default function EventAir() {
    if (this instanceof EventAir) {
        return new EventAir()
    }
    this.__openlog__ = arguments && arguments[0] === 'openlog' ? 0 : 1
    this.__maxListeners__ = 5
    this.stack = []
}

// Log
EventAir.log = {
    repeatRegister: name => {
        console.info(`[Warning] event ${name} has been registered`)
    },
    notFound: name => {
        console.error(`[Error Code 404] event '${name}' is not registered`)
    },
    maxLimit: (name, n)=> {
        console.error(`[Warning] Listeners of event '${name}' goes beyond the maximum limit ${n}`)
    }
}

/**
 * Get event from events stack by event's name
 * @param name
 * @returns {*}
 */
EventAir.prototype.getEventByName = function (name) {
    return this.stack.find(event => event.name === name)
}

/**
 * Get listener by event's name and listener
 * If the given event is present and the listener is present ...
 * the listener will be returned, otherwise it returns undefined
 * @param name
 * @param listener
 * @returns {T}
 */
EventAir.prototype.getListener = function (event, listener) {
    return event ? event.listeners.find(l => l === listener) : void 0
}

/**
 *
 * @param n
 * @returns {Event}
 */
EventAir.prototype.setMaxListeners = function (n) {
    this.__maxListeners__ = n
    return this;
}

/**
 * Base register
 * @param name
 * @param listener
 * @param typeId
 * @returns {Event}
 * @private
 */
EventAir.prototype._baseRegister = function (name, listener, typeId) {

    let _event = this.getEventByName(name),
        _listener = this.getListener(_event, listener),
        _max = this.__maxListeners__

    if (!_event) {

        this.stack.push({
            name,
            listeners: [listener],
            typeId: typeId
        })

    } else if (!_listener) {

        _event.listeners.push(listener)

        if (_event.listeners.length > _max) {
            Event.log.maxLimit(name, _max)
        }
    }

    return this
}

/**
 * Register or add a listener for the specified event
 * @param name
 * @param listener
 */
EventAir.prototype.on = function (name, listener) {
    return this._baseRegister(name, listener, 1)
}


/**
 * Register a single listener for the specified event
 * that is, the listener will only trigger once
 * and the listener will be released immediately after the trigger.
 * @param name
 * @param listener
 */
EventAir.prototype.once = function (name, listener) {
    return this._baseRegister(name, listener, 2)
}


/**
 * Base catch
 * @param statusCode
 * @private
 */
EventAir.prototype._baseCatch = function (statusCode) {

    if (this.errorCatch)
        this.errorCatch(statusCode);

    return null;
}

/**
 *
 * @param name
 * @returns {Event}
 */
EventAir.prototype.emit = function (name) {

    let _event = this.getEventByName(name)

    if (!_event) {

        if (this.__openlog__)
            Event.log.notFound(name);

        this._baseCatch(404)

        return this
    }

    if (_event.listeners.length === 0) {
        this._baseCatch(405)
    }

    // run listener
    for (let listener of _event.listeners) {
        listener()
    }

    // for Event.prototype.once()
    _event.typeId === 2 ? this.stack.splice(
        this.stack.indexOf(_event), 1
    ) : void 0

    return this

}


/**
 * Removes specified listener for the specified event
 * The listener must be a listener that the event has already registered.
 * @param name
 * @param listener
 * @returns {Event}
 */
EventAir.prototype.removeListener = function (name, listener) {

    let _event = this.getEventByName(name),
        _listener = this.getListener(_event, listener);


    // Unregisted event
    if (!_event) {
        this._baseCatch(404)
        return this

        // Unregisted listener
    } else if (!_listener) {
        this._baseCatch(405)
        return this
    }

    _event.listeners.splice(
        _event.listeners.indexOf(_listener), 1
    )

    return this

}

/**
 * Removes all listeners for all events,
 * and if the event is specified,
 * then removes all listeners for the specified event.
 * @returns {Event}
 */
EventAir.prototype.removeAllListeners = function () {

    // no arguments
    if (arguments.length === 0) {
        for (let _event of this.stack) {
            _event.listeners = []
        }
        return this;
    }

    // exist arguments
    Array.prototype.forEach.call(arguments, name => {
        if (typeof name === 'string') {
            let _event = this.getEventByName(name)
            _event.listeners = []
        }
    })

    return this;

}

/**
 * Returns an array of listeners for the specified event.
 * @param name
 * @returns {Array|Event.listeners|*}
 */
EventAir.prototype.listeners = function (name) {

    let _event = this.getEventByName(name)

    return _event ? _event.listeners : this._baseCatch(405)

}

/**
 * Catch Error
 * @param func
 */
EventAir.prototype.catch = function (func) {
    this.errorCatch = typeof func === 'function' ? func : null
}


if (!window.$Event) {
    window.$Event = EventAir
}
