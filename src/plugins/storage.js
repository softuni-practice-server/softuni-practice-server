const { uuid } = require('../common/util');


function initPlugin(settings) {
    const storage = createInstance(settings.seedData);
    const protectedStorage = createInstance(settings.protectedData);

    return function decoreateContext(context, request) {
        context.storage = storage;
        context.protectedStorage = protectedStorage;
    };
}


/**
 * Create storage instance and populate with seed data
 * @param {Object=} seedData Associative array with data. Each property is an object with properties in format {key: value}
 */
function createInstance(seedData = {}) {
    const collections = new Map();

    // Initialize seed data from file    
    for (let collectionName in seedData) {
        if (seedData.hasOwnProperty(collectionName)) {
            const collection = new Map();
            for (let recordId in seedData[collectionName]) {
                if (seedData.hasOwnProperty(collectionName)) {
                    collection.set(recordId, seedData[collectionName][recordId]);
                }
            }
            collections.set(collectionName, collection);
        }
    }


    // Manipulation

    /**
     * Get entry by ID or list of all entries from collection or list of all collections
     * @param {string=} collection Name of collection to access. Throws error if not found. If omitted, returns list of all collections.
     * @param {number|string=} id ID of requested entry. Throws error if not found. If omitted, returns of list all entries in collection.
     * @return {Object} Matching entry.
     */
    function get(collection, id) {
        if (!collection) {
            return [...collections.keys()];
        }
        if (!collections.has(collection)) {
            throw new ReferenceError('Collection does not exist: ' + collection);
        }
        const targetCollection = collections.get(collection);
        if (!id) {
            const entries = [...targetCollection.entries()];
            let result = entries.map(([k, v]) => {
                return Object.assign(deepCopy(v), { _id: k });
            });
            return result;
        }
        if (!targetCollection.has(id)) {
            throw new ReferenceError('Entry does not exist: ' + id);
        }
        const entry = targetCollection.get(id);
        return Object.assign(deepCopy(entry), { _id: id });
    }

    /**
     * Add new entry to collection. ID will be auto-generated
     * @param {string} collection Name of collection to access. If the collection does not exist, it will be created.
     * @param {Object} data Value to store.
     * @return {Object} Original value with resulting ID under _id property.
     */
    function add(collection, data) {
        const record = assignClean({ _ownerId: data._ownerId }, data);

        let targetCollection = collections.get(collection);
        if (!targetCollection) {
            targetCollection = new Map();
            collections.set(collection, targetCollection);
        }
        let id = uuid();
        // Make sure new ID does not match existing value
        while (targetCollection.has(id)) {
            id = uuid();
        }

        record._createdOn = Date.now();
        targetCollection.set(id, record);
        return Object.assign(deepCopy(record), { _id: id });
    }

    /**
     * Replace entry by ID
     * @param {string} collection Name of collection to access. Throws error if not found.
     * @param {number|string} id ID of entry to update. Throws error if not found.
     * @param {Object} data Value to store. Record will be replaced!
     * @return {Object} Updated entry.
     */
    function set(collection, id, data) {
        if (!collections.has(collection)) {
            throw new ReferenceError('Collection does not exist: ' + collection);
        }
        const targetCollection = collections.get(collection);
        if (!targetCollection.has(id)) {
            throw new ReferenceError('Entry does not exist: ' + id);
        }

        const existing = targetCollection.get(id);
        const record = assignSystemProps(deepCopy(data), existing);
        record._updatedOn = Date.now();
        targetCollection.set(id, record);
        return Object.assign(deepCopy(record), { _id: id });
    }

    /**
     * Modify entry by ID
     * @param {string} collection Name of collection to access. Throws error if not found.
     * @param {number|string} id ID of entry to update. Throws error if not found.
     * @param {Object} data Value to store. Shallow merge will be performed!
     * @return {Object} Updated entry.
     */
     function merge(collection, id, data) {
        if (!collections.has(collection)) {
            throw new ReferenceError('Collection does not exist: ' + collection);
        }
        const targetCollection = collections.get(collection);
        if (!targetCollection.has(id)) {
            throw new ReferenceError('Entry does not exist: ' + id);
        }

        const existing = deepCopy(targetCollection.get(id));
        const record = assignClean(existing, data);
        record._updatedOn = Date.now();
        targetCollection.set(id, record);
        return Object.assign(deepCopy(record), { _id: id });
    }

    /**
     * Delete entry by ID
     * @param {string} collection Name of collection to access. Throws error if not found.
     * @param {number|string} id ID of entry to update. Throws error if not found.
     * @return {{_deletedOn: number}} Server time of deletion.
     */
    function del(collection, id) {
        if (!collections.has(collection)) {
            throw new ReferenceError('Collection does not exist: ' + collection);
        }
        const targetCollection = collections.get(collection);
        if (!targetCollection.has(id)) {
            throw new ReferenceError('Entry does not exist: ' + id);
        }
        targetCollection.delete(id);

        return { _deletedOn: Date.now() };
    }

    /**
     * Search in collection by query object
     * @param {string} collection Name of collection to access. Throws error if not found.
     * @param {Object} query Query object. Format {prop: value}.
     * @return {Object[]} Array of matching entries.
     */
    function query(collection, query) {
        if (!collections.has(collection)) {
            throw new ReferenceError('Collection does not exist: ' + collection);
        }
        const targetCollection = collections.get(collection);
        const result = [];
        // Iterate entries of target collection and compare each property with the given query
        for (let [key, entry] of [...targetCollection.entries()]) {
            let match = true;
            for (let prop in entry) {
                if (query.hasOwnProperty(prop)) {
                    const targetValue = query[prop];
                    // Perform lowercase search, if value is string
                    if (typeof targetValue === 'string' && typeof entry[prop] === 'string') {
                        if (targetValue.toLocaleLowerCase() !== entry[prop].toLocaleLowerCase()) {
                            match = false;
                            break;
                        }
                    } else if (targetValue != entry[prop]) {
                        match = false;
                        break;
                    }
                }
            }

            if (match) {
                result.push(Object.assign(deepCopy(entry), { _id: key }));
            }
        }

        return result;
    }

    return { get, add, set, merge, delete: del, query };
}


function assignSystemProps(target, entry, ...rest) {
    const whitelist = [
        '_id',
        '_createdOn',
        '_updatedOn',
        '_ownerId'
    ];
    for (let prop of whitelist) {
        if (entry.hasOwnProperty(prop)) {
            target[prop] = deepCopy(entry[prop]);
        }
    }
    if (rest.length > 0) {
        Object.assign(target, ...rest);
    }

    return target;
}


function assignClean(target, entry, ...rest) {
    const blacklist = [
        '_id',
        '_createdOn',
        '_updatedOn',
        '_ownerId'
    ];
    for (let key in entry) {
        if (blacklist.includes(key) == false) {
            target[key] = deepCopy(entry[key]);
        }
    }
    if (rest.length > 0) {
        Object.assign(target, ...rest);
    }

    return target;
}

function deepCopy(value) {
    if (Array.isArray(value)) {
        return value.map(deepCopy);
    } else if (typeof value == 'object') {
        return [...Object.entries(value)].reduce((p, [k, v]) => Object.assign(p, { [k]: deepCopy(v) }), {});
    } else {
        return value;
    }
}

module.exports = initPlugin;