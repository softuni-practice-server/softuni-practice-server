const delay = require('../util/delay');

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
     * @param {number|string=} id ID of requested entry. Throws error if not found. If omitted, returns list all entries in collection.
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
                v._id = k;
                return v;
            });
            return result;
        }
        if (!targetCollection.has(id)) {
            throw new ReferenceError('Entry does not exist: ' + id);
        }
        const entry = targetCollection.get(id);
        entry._id = id;
        return entry;
    }

    /**
     * Add new entry to collection. ID will be auto-generated
     * @param {string} collection Name of collection to access. If the collection does not exist, it will be created.
     * @param {Object} data Value to store.
     * @return {Object} Original value with resulting ID under _id property.
     */
    function add(collection, data) {
        let targetCollection = collections.get(collection);
        if (!targetCollection) {
            targetCollection = new Map();
            collections.set(collection, targetCollection);
        }
        let id = nextId();
        // Make sure new ID does not match existing value
        while (targetCollection.has(id)) {
            id = nextId();
        }
        // Make sure incoming entry has no _id property
        delete data._id;
        targetCollection.set(id, data);
        data._id = id;
        return data;
    }

    /**
     * Update entry by ID
     * @param {string} collection Name of collection to access. Throws error if not found.
     * @param {number|string} id ID of entry to update. Throws error if not found.
     * @param {Object} data Value to store. Entry will be replaced!
     */
    function set(collection, id, data) {
        if (!collections.has(collection)) {
            throw new ReferenceError('Collection does not exist: ' + collection);
        }
        const targetCollection = collections.get(collection);
        if (!targetCollection.has(id)) {
            throw new ReferenceError('Entry does not exist: ' + id);
        }
        // Make sure incoming entry has no _id property
        delete data._id;
        targetCollection.set(id, data);
    }

    return { get: delay(get), add: delay(add), set: delay(set) };
}

// Utility
function nextId() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

module.exports = createInstance;