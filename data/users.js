const usersById = { '1': { email: 'pesho@abv.bg', password: 'pppp', name: 'pesho', id: 1 } };
const usersByEmail = { 'pesho@abv.bg': { email: 'pesho@abv.bg', password: 'pppp', name: 'pesho', id: 1 } };

module.exports = {
    save: (user) => {
        const id = Object.keys(usersById).length + 1;
        user.id = id;

        usersById[id] = user;
        usersByEmail[user.email] = user;
        console.log('User registered: ' + user.name);
    },
    findByEmail: (email) => {
        return usersByEmail[email];
    },
    findById: (id) => {
        return usersById[id];
    }
};
