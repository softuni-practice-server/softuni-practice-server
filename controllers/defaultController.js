// TODO add error handling for incorrect requests

module.exports = makeController;

/**
 * Initialize controller with CRUD actions for specific collection
 * @param {string} collectionName Name of collection to bind to controller
 * @returns {Object} Controller object with all actions
 */
function makeController(collectionName) {
    return ({
        get: async (req, res) => {
            res.json(await req.storage.get(collectionName));
        },
        post: async (req, res) => {
            try {
                const result = await req.storage.add(collectionName, req.body);
                res.json(result);
            } catch (err) {
                console.log(err);
                res.status(400);
                res.json({ error: err });
            }
        },
        getById: async (req, res) => {
            try {
                const result = await req.storage.get(collectionName, req.params.id);
                res.json(result);
            } catch (err) {
                console.log(err);

                if (err instanceof ReferenceError) {
                    res.status(404);
                    res.json({ error: 'ID not found: ' + req.params.id });
                    return;
                }
                res.status(400);
                res.json({ error: err });
            }
        },
        postById: async (req, res) => {
            try {
                const result = await req.storage.set(collectionName, req.params.id, req.body);
                res.json(result);
            } catch (err) {
                console.log(err);

                if (err instanceof ReferenceError) {
                    res.status(404);
                    res.json({ error: 'ID not found: ' + req.params.id });
                    return;
                }
                res.status(400);
                res.json({ error: err });
            }
        },
        deleteById: async (req, res) => {
            try {
                await req.storage.delete(collectionName, req.params.id);
                res.json({ count: 1 });
            } catch (err) {
                console.log(err);

                if (err instanceof ReferenceError) {
                    res.status(404);
                    res.json({ error: 'ID not found: ' + req.params.id });
                    return;
                }
                res.status(400);
                res.json({ error: err });
            }
        }
    });
}