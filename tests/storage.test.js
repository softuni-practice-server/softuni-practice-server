const expect = require('chai').expect;

const storagePlugin = require('../src/plugins/storage');


describe('Memory storage', () => {
    const seedData = {
        'cars': {
            '6f6bda02-5481-3680-9aab-4dce075a8338': {
                'make': 'Fiat',
                'model': 'Punto',
                'miles': 15649
            },
            '37933e13-2736-46c0-533c-5bab5026fff6': {
                'make': 'VW',
                'model': 'Jetta',
                'miles': 9946
            },
            '3245933e-6456-4e00-5f3c-5bab5026f526': {
                'make': 'VW',
                'model': 'Golf',
                'miles': 97465
            }
        },
        'people': {
            'caddfa33-e1f1-2c3f-837a-42c50ee02ed9': {
                'name': 'Gosho',
                'age': 21,
                'youngDriver': true,
            },
            '666f61c3-2736-46c0-533c-5bab50269797': {
                'name': 'Pesho',
                'age': 25,
                'youngDriver': false,
            }
        }
    };

    beforeEach(() => {

    });

    describe('Initialization', () => {
        it('initializes without error', () => {
            const context = {};
            expect(() => storagePlugin({ seedData })(context), 'Storage initialization failed').to.not.throw();
        });
    });

    describe('Manipulation', () => {
        const context = {};
        let instance;

        beforeEach(() => {
            storagePlugin({ seedData })(context);
            instance = context.storage;
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
                expect(entries.length).to.equal(3);
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
                let entry = await instance.add('dogs', { name: 'Sharo', color: 'mix' });
                expect((await instance.get()).length).to.equal(3);
            });

            it('adds correct entry to new collection', async () => {
                let entry = await instance.add('dogs', { name: 'Sharo', color: 'mix' });
                let obj = await instance.get('dogs', entry._id);
                expect(obj.hasOwnProperty('_id')).to.be.true;
                expect(obj.name).to.equal('Sharo');
                expect(obj.color).to.equal('mix');
            });
        });

        describe('Update', () => {
            it('updates correctly', async () => {
                const newObject = { make: 'VW', model: 'Golf' };
                await instance.set('cars', '37933e13-2736-46c0-533c-5bab5026fff6', newObject);
            });

            it('updated entry has correct values', async () => {
                const newObject = { make: 'VW', model: 'Golf' };
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
                    await instance.set('cats', '5', { name: 'Pisancha', color: 'blue' });
                } catch (e) {
                    threw = true;
                }
                expect(threw).to.be.true;
            });

            it('throws on updating missing ID', async () => {
                let threw = false;
                try {
                    await instance.set('people', '5', { name: 'Pesho', age: '18' });
                } catch (e) {
                    threw = true;
                }
                expect(threw).to.be.true;
            });
        });

        describe('Query', () => {
            it('works with one property', async () => {
                const result = await instance.query('cars', { 'make': 'Fiat' });
                expect(result.length).to.equal(1);
                expect(result[0]._id).to.equal('6f6bda02-5481-3680-9aab-4dce075a8338');
                expect(result[0].make).to.equal('Fiat');
                expect(result[0].model).to.equal('Punto');
            });

            it('returns all with one property', async () => {
                const result = await instance.query('cars', { 'make': 'VW' });
                expect(result.length).to.equal(2);
                expect(result[0]._id).to.equal('37933e13-2736-46c0-533c-5bab5026fff6');
                expect(result[0].make).to.equal('VW');
                expect(result[0].model).to.equal('Jetta');
                expect(result[1]._id).to.equal('3245933e-6456-4e00-5f3c-5bab5026f526');
                expect(result[1].make).to.equal('VW');
                expect(result[1].model).to.equal('Golf');
            });

            it('is case insensitive', async () => {
                const result = await instance.query('cars', { 'make': 'fiat' });
                expect(result.length).to.equal(1);
                expect(result[0]._id).to.equal('6f6bda02-5481-3680-9aab-4dce075a8338');
                expect(result[0].make).to.equal('Fiat');
                expect(result[0].model).to.equal('Punto');
            });

            it('works with two properties', async () => {
                const result = await instance.query('cars', { 'make': 'VW', 'model': 'Jetta' });
                expect(result.length).to.equal(1);
                expect(result[0]._id).to.equal('37933e13-2736-46c0-533c-5bab5026fff6');
                expect(result[0].make).to.equal('VW');
                expect(result[0].model).to.equal('Jetta');
            });

            it('returns empty array when no match', async () => {
                const result = await instance.query('cars', { 'model': 'Corsa' });
                expect(result.length).to.equal(0);
            });

            it('queries number values', async () => {
                const result = await instance.query('cars', { 'miles': 9946 });
                expect(result.length).to.equal(1);
                expect(result[0]._id).to.equal('37933e13-2736-46c0-533c-5bab5026fff6');
                expect(result[0].make).to.equal('VW');
                expect(result[0].model).to.equal('Jetta');
            });

            it('does not query number values as string', async () => {
                const result = await instance.query('cars', { 'miles': '9946' });
                expect(result.length).to.equal(0);
            });

            it('queries boolean values', async () => {
                const result = await instance.query('people', { 'youngDriver': true });
                expect(result.length).to.equal(1);
                expect(result[0]._id).to.equal('caddfa33-e1f1-2c3f-837a-42c50ee02ed9');
                expect(result[0].name).to.equal('Gosho');
            });
        });
    });
});