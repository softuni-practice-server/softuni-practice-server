const expect = require('chai').expect;

const authPlugin = require('../src/plugins/auth');

function fnSpy(fn = () => { }) {
    const spy = (...params) => {
        spy.called = true;
        return fn(...params);
    };
    spy.called = false;
    return spy;
}

fnSpy.returns = data => {
    return fnSpy(() => data);
};


describe('Authentication plugin', () => {

    describe('Decoration', () => {
        const decorator = authPlugin({ identity: 'email' });
        let context;
        let request = { headers: {} };

        beforeEach(() => {
            context = {
                storage: {
                    get: fnSpy(),
                    add: fnSpy(),
                    set: fnSpy(),
                    delete: fnSpy(),
                    query: fnSpy(),
                }
            };
            request = { headers: {} };
        });

        describe('Header parsing', () => {
            it('finds user by token', () => {
                const mockUser = { _id: '0001' };
                request.headers['user-token'] = 'AAAA';
                context.storage.query = fnSpy((_, query) => {
                    expect(query.accessToken).to.equal('AAAA');
                    return [{ userId: '0001' }];
                });
                context.storage.get = fnSpy((_, id) => {
                    expect(id).to.equal('0001');
                    return mockUser;
                });

                decorator(context, request);

                expect(context.user).to.equal(mockUser);
                expect(context.storage.query.called).to.be.true;
                expect(context.storage.get.called).to.be.true;
            });

            it('throws on missing session (bad token)', () => {
                request.headers['user-token'] = 'AAAA';
                context.storage.query = fnSpy.returns([]);

                expect(() => decorator(context, request)).to.throw('Invalid access token');
                expect(context.user).to.be.undefined;
            });

            it('throws on missing user (bad session)', () => {
                request.headers['user-token'] = 'AAAA';
                context.storage.query = fnSpy.returns([]);

                expect(() => decorator(context, request)).to.throw('Invalid access token');
                expect(context.user).to.be.undefined;
            });

        });

        describe('Register', () => {

            describe('Happy path', () => {
                beforeEach(() => {
                    context.storage.query = fnSpy((_, query) => {
                        expect(query.email).to.equal('a@a.a');
                        return [];
                    });
                    context.storage.add = fnSpy((collection, data) => {
                        switch (collection) {
                            case 'users':
                                expect(data.email).to.equal('a@a.a');
                                return Object.assign(data, { _id: '0001' });
                            case 'sessions':
                                expect(data.userId).to.equal('0001');
                                return Object.assign(data, { _id: '0002' });
                        }
                    });
                    context.storage.set = fnSpy((_, id, session) => {
                        expect(id).to.equal('0002');
                        return Object.assign(session);
                    });
                });

                it('adds new user and saves session', () => {
                    decorator(context, request);

                    context.auth.register({ email: 'a@a.a', password: '123456' });

                    expect(context.storage.query.called).to.be.true;
                    expect(context.storage.add.called).to.be.true;
                    expect(context.storage.set.called).to.be.true;
                });

                it('returns token and omits hashed password upon success', () => {
                    decorator(context, request);

                    const result = context.auth.register({ email: 'a@a.a', password: '123456' });

                    expect(result.accessToken).to.not.be.undefined;
                    expect(result.hashedPassword).to.be.undefined;

                    expect(context.storage.query.called).to.be.true;
                    expect(context.storage.add.called).to.be.true;
                    expect(context.storage.set.called).to.be.true;
                });
            });

            describe('Error checking', () => {
                it('throws on missing identity', () => {
                    decorator(context, request);
                    expect(() => context.auth.register({ password: '123456' })).to.throw('Missing fields');
                });

                it('throws on missing password', () => {
                    decorator(context, request);
                    expect(() => context.auth.register({ email: 'a@a.a' })).to.throw('Missing fields');
                });

                it('throws on existing identity', () => {
                    context.storage.query = fnSpy.returns([{ _id: '0001', email: 'a@a.a' }]);

                    decorator(context, request);

                    expect(() => context.auth.register({ email: 'a@a.a', password: '123456' })).to.throw('A user with the same email already exists');
                    expect(context.storage.query.called).to.be.true;
                });
            });

        });

        describe('Login', () => {

            describe('Happy path', () => {
                beforeEach(() => {
                    context.storage.query = fnSpy((_, query) => {
                        expect(query.email).to.equal('a@a.a');
                        return [{ _id: '0001', email: 'a@a.a', hashedPassword: '83313014ed3e2391aa1332615d2f053cf5c1bfe05ca1cbcb5582443822df6eb1' }];
                    });
                    context.storage.add = fnSpy((_, session) => {
                        expect(session.userId).to.equal('0001');
                        return Object.assign(session, { _id: '0002' });
                    });
                    context.storage.set = fnSpy((_, id, session) => {
                        expect(id).to.equal('0002');
                        return Object.assign(session);
                    });
                });

                it('logs in user and saves session', () => {
                    decorator(context, request);

                    context.auth.login({ email: 'a@a.a', password: '123456' });

                    expect(context.storage.query.called).to.be.true;
                    expect(context.storage.add.called).to.be.true;
                    expect(context.storage.set.called).to.be.true;
                });

                it('returns token and omits hashed password upon success', () => {
                    decorator(context, request);

                    const result = context.auth.login({ email: 'a@a.a', password: '123456' });

                    expect(result.accessToken).to.not.be.undefined;
                    expect(result.hashedPassword).to.be.undefined;

                    expect(context.storage.query.called).to.be.true;
                    expect(context.storage.add.called).to.be.true;
                    expect(context.storage.set.called).to.be.true;
                });
            });

            describe('Error checking', () => {
                it('throws on wrong identity', () => {
                    context.storage.query = fnSpy.returns([]);

                    decorator(context, request);
                    expect(() => context.auth.login({ email: 'a@a.a', password: '123456' })).to.throw('Login or password don\'t match');
                });

                it('throws on wrong password', () => {
                    context.storage.query = fnSpy.returns([{
                        _id: '0001',
                        email: 'a@a.a',
                        hashedPassword: '83313014ed3e2391aa1332615d2f053cf5c1bfe05ca1cbcb5582443822df6eb1'
                    }]);

                    decorator(context, request);
                    expect(() => context.auth.login({ email: 'a@a.a', password: '111111' })).to.throw('Login or password don\'t match');
                });
            });

        });

        describe('Logout', () => {
            it('logs out user and deletes session', () => {
                context.user = { _id: '0001' };
                context.storage.query = fnSpy.returns([{ _id: 'AAAA' }]);
                context.storage.delete = fnSpy((_, id) => {
                    expect(id).to.equal('AAAA');
                });

                decorator(context, request);

                context.auth.logout();

                expect(context.storage.query.called).to.be.true;
                expect(context.storage.delete.called).to.be.true;
            });

            it('throws on unauthenticated attempt', () => {
                decorator(context, request);
                expect(() => context.auth.logout()).to.throw('User session does not exist');
            });
        });
    });

    describe('Identity overloading', () => {
        const decorator = authPlugin({ identity: 'username' });
        let context;
        let request = { headers: {} };

        beforeEach(() => {
            context = {
                storage: {
                    get: fnSpy(),
                    add: fnSpy(),
                    set: fnSpy(),
                    delete: fnSpy(),
                    query: fnSpy(),
                }
            };
            request = { headers: {} };
        });

        it('register works with username', () => {
            context.storage.query = fnSpy((_, query) => {
                expect(query.username).to.equal('aaa');
                return [];
            });
            context.storage.add = fnSpy((collection, data) => {
                switch (collection) {
                    case 'users':
                        expect(data.username).to.equal('aaa');
                        return Object.assign(data, { _id: '0001' });
                    case 'sessions':
                        expect(data.userId).to.equal('0001');
                        return Object.assign(data, { _id: '0002' });
                }
            });
            context.storage.set = fnSpy((_, id, session) => {
                expect(id).to.equal('0002');
                return Object.assign(session);
            });

            decorator(context, request);

            context.auth.register({ username: 'aaa', password: '123456' });

            expect(context.storage.query.called).to.be.true;
            expect(context.storage.add.called).to.be.true;
            expect(context.storage.set.called).to.be.true;
        });

        it('login works with username', () => {
            context.storage.query = fnSpy((_, query) => {
                expect(query.username).to.equal('aaa');
                return [{ _id: '0001', username: 'aaa', hashedPassword: '83313014ed3e2391aa1332615d2f053cf5c1bfe05ca1cbcb5582443822df6eb1' }];
            });
            context.storage.add = fnSpy((_, session) => {
                expect(session.userId).to.equal('0001');
                return Object.assign(session, { _id: '0002' });
            });
            context.storage.set = fnSpy((_, id, session) => {
                expect(id).to.equal('0002');
                return Object.assign(session);
            });

            decorator(context, request);

            context.auth.login({ username: 'aaa', password: '123456' });

            expect(context.storage.query.called).to.be.true;
            expect(context.storage.add.called).to.be.true;
            expect(context.storage.set.called).to.be.true;
        });
    });

});
