module.exports = {
    get: async (req, res) => {
        const collectionName = req.params.collection;
        try {
            if (Object.keys(req.query).length > 0) {
                return res.json(await req.storage.query(collectionName, req.query));
            }
            res.json(await req.storage.get(collectionName));
        } catch (err) {
            console.log(err);

            if (err instanceof ReferenceError) {
                res.status(404);
                res.json({ error: 'Collection not found: ' + req.params.id });
                return;
            }
            res.status(400);
            res.json({ error: err });
        }
    },
    post: async (req, res) => {
        const collectionName = req.params.collection;
        try {
            const result = await req.storage.add(collectionName, req.body);
            res.json(result);
        } catch (err) {
            console.log(err);

            if (err instanceof ReferenceError) {
                res.status(404);
                res.json({ error: 'Collection not found: ' + req.params.id });
                return;
            }
            res.status(400);
            res.json({ error: err });
        }
    },
    getById: async (req, res) => {
        const collectionName = req.params.collection;
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
        const collectionName = req.params.collection;
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
        const collectionName = req.params.collection;
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
};