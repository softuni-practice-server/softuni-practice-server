const expect = require('chai').expect;

const storage = require('../storage/memoryStorage');

describe('Memory storage', () => {
    const seedData = {
        "cars": {
            "6f6bda02-5481-3680-9aab-4dce075a8338": {
                "make": "Fiat",
                "model": "Punto"
            },
            "37933e13-2736-46c0-533c-5bab5026fff6": {
                "make": "VW",
                "model": "Jetta"
            }
        },
        "people": {
            "caddfa33-e1f1-2c3f-837a-42c50ee02ed9": {
                "name": "Gosho",
                "age": 21
            }
        }
    }

    describe('Initialization', () => {
        it('initializes without error', () => {
            expect(() => storage(seedData), 'Storage initialization failed').to.not.throw();
        });
    });

    describe('Manipulation', () => {
        let instance = {};

        beforeEach(() => {
            instance = storage(seedData);
        });

        describe('Fetch', () => {
            it('returns list of available collections', async () => {
                const collections = await instance.get();
                expect(collections instanceof Array).to.be.true;
                expect(collections.length).to.equal(2);
            });

            it('return all entries in a collection', async () => {
                const entries = await instance.get('cars');
                expect(entries instanceof Array).to.be.true;
                expect(entries.length).to.equal(2);
            });

            it('fetches single entry', async () => {
                const targetId = '37933e13-2736-46c0-533c-5bab5026fff6';
                const entry = await instance.get('cars', targetId);
                expect(typeof entry).to.equal('object');
            });

            it('returned entry has correct values', async () => {
                const targetId = '37933e13-2736-46c0-533c-5bab5026fff6';
                const entry = await instance.get('cars', targetId);
                expect(entry._id).to.equal(targetId, 'ID property was did not match the requested value');
                expect(entry.make).to.equal('VW');
                expect(entry.model).to.equal('Jetta');
            });
        });

        describe('Create', () => {
            it('adds new entry', async () => {
                expect(async () => await instance.add('cars', { make: 'Opel', model: 'Vectra' })).to.not.throw();
            });

            it('returns added entry', async () => {
                const entry = await instance.add('cars', { make: 'Opel', model: 'Vectra' });
                expect(typeof entry).to.equal('object');
            });

            it('added entry has correct values', async () => {
                const entry = await instance.add('cars', { make: 'Opel', model: 'Vectra' });
                let obj = await instance.get('cars', entry._id);
                expect(obj.hasOwnProperty('_id')).to.be.true;
                expect(obj.make).to.equal('Opel');
                expect(obj.model).to.equal('Vectra');
            });

            it('creates new collection', async () => {
                let entry = await instance.add('dogs', {name: 'Sharo', color: 'mix'});
                expect((await instance.get()).length).to.equal(3);
            });

            it('adds correct entry to new collection', async () => {
                let entry = await instance.add('dogs', {name: 'Sharo', color: 'mix'});
                let obj = await instance.get('dogs', entry._id);
                expect(obj.hasOwnProperty('_id')).to.be.true;
                expect(obj.name).to.equal('Sharo');
                expect(obj.color).to.equal('mix');
            });
        });

        describe('Update', () => {
            it('updates correctly', async () => {
                const newObject = {make: 'VW', model: 'Golf'};
                await instance.set('cars', '37933e13-2736-46c0-533c-5bab5026fff6', newObject);
            });

            it('updated entry has correct values', async () => {
                const newObject = {make: 'VW', model: 'Golf'};
                await instance.set('cars', '37933e13-2736-46c0-533c-5bab5026fff6', newObject);
                const obj = await instance.get('cars', '37933e13-2736-46c0-533c-5bab5026fff6');
                expect(obj._id).to.equal('37933e13-2736-46c0-533c-5bab5026fff6');
                expect(obj.make).to.equal('VW');
                expect(obj.model).to.equal('Golf');
            });
        });

        describe('Error checking', () => {
            it('throws on getting missing collection', async () => {
                let threw = false;
                try {
                    await instance.get('cats');
                } catch (e) {
                    threw = true;
                }
                expect(threw).to.be.true;
            });

            it('throws on getting missing ID', async () => {
                let threw = false;
                try {
                    await instance.get('people', '5');
                } catch (e) {
                    threw = true;
                }
                expect(threw).to.be.true;
            });

            it('throws on updating missing collection', async () => {
                let threw = false;
                try {
                    await instance.set('cats', '5', {name: 'Pisancha', color: 'blue'});
                } catch (e) {
                    threw = true;
                }
                expect(threw).to.be.true;
            });

            it('throws on updating missing ID', async () => {
                let threw = false;
                try {
                    await instance.set('people', '5', {name: 'Pesho', age: '18'});
                } catch (e) {
                    threw = true;
                }
                expect(threw).to.be.true;
            });
        })
    });
});