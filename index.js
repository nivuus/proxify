/*
 * Copyright 2020 Allanic.me ISC License License
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Created by Maxime Allanic <maxime@allanic.me> at 25/03/2020
 */

class Proxify {
    constructor (objectToProxify, key, parent) {
        const self = this;

        self.parents = [];
        self._watch = {};

        if (parent) {
            var defaultParent = {
                key: key,
                parent: parent
            };
            self.parents.push(defaultParent);
        }

        self.objectToProxify = objectToProxify || {};
        self.onSet = [];

        for (const key in self.objectToProxify) {
            objectToProxify[ key ] = valueToProxify(self.objectToProxify[key], key, self);
        }

        return new Proxy(self.objectToProxify, {
            get: (objectToProxify, property) => {
                if (property === '$onSet')
                    return (callback) => {
                        return self.$onSet(callback);
                    };
                else if (property === '$watch')
                    return (...args) => {
                        return self.$watch(...args);
                    };
                else if (property === '$setWithoutDispatch')
                    return (...args) => {
                        return self.$setWithoutDispatch(...args);
                    }
                else if (property === '$addParent')
                    return (parent, key) => {
                        self.parents.push({
                            parent,
                            key
                        });
                    };
                else if (property === '$isProxy')
                    return true;
                return objectToProxify[ property ];
            },
            set: (objectToProxify, property, value) => {
                if (isProxy(value)) {
                    value.$addParent(self, property);
                    objectToProxify[ property ] = value;
                }
                else
                    objectToProxify[ property ] = valueToProxify(value, key, self);

                if (Array.isArray(objectToProxify) && property === 'length')
                    return true;
                self.$dispatchSet(property, value);
                return true;
            },
            deleteProperty: () => {

            }
        });
    }

    $setWithoutDispatch(key, value) {
        this.objectToProxify[ key ] = valueToProxify(value, key, this);
        this._watch[ key ].forEach((callback) => callback(value));
    }

    $watch(key, callback) {
        if (!this._watch[ key ])
            this._watch[ key ] = [];
        this._watch[ key ].push(callback);
    }

    $dispatchSet(key, value) {
        this.onSet.forEach((callback) => callback(key, value));
        this.parents.forEach((parent) => {
            parent.parent.$dispatchSet(parent.key + '.' + key, value)
        });
    }

    $onSet(callback) {
        this.onSet.push(callback);
    }
}

function isProxy(object) {
    return typeof object === 'object' && object.$isProxy;
}

function valueToProxify(value, key, parent) {
    if (typeof value === 'object' && !isProxy(value)) {
        return new Proxify(value, key, parent);
    }
    return value;
}

if (typeof module !== 'undefined')
    module.exports = Proxify;