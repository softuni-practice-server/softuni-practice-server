# softuni-practice-server

## Features
### Configuration
Inside `config/config.js` you can specify the listenning port and other options. Currently, only memory storage is supported, so changing the value of `storage` will crash the server.

### Authentication
You can register a user by sending a **POST** request to `/user` with properties `email`, `password` and `name`. Login by posting `email` and `password` to `/user/login`. The server will respond with an object, containing a JSON Web Token.

### Collection access
An end point is revealed at `/data`, which grants access to information, stored on the server. **GET** requests to the server will return the following responses:
- `GET /data` - array of all abailable collections
- `GET /data/:collection` - array of all entries in target collection; will return 404 if collection does not exist
- `GET /data/:collection/:id` - entry matching the given ID; will return 404 if collection or entry do not exist with appropriate message attached to response

#### Create
Send **POST** request to `/data/:collection` to create new entry. ID will be generated automatically and will be included in the returned object. If the collection does not exist, it will be created.

#### Update
Send **POST** request to `/data/:collection/:id` to update a single entry. Note that the existing entry will be replaced!

#### Delete
Send **DELETE** request to `/data/:collection/:id` to delete a single entry.

#### Query
You can include a query string to your **GET** requests to `/data/:collection` that will return only entries, that match all properties inside the query. The returned object will always be an array, even there are no matches or if there is only one match.

## Server Architecture

https://docs.google.com/drawings/d/1SOUTqYK47CVph_WfKmjJoZJbjH4sBu7Bm0L4PSy9wUQ/edit?usp=sharing

## Implementation Roadmap
### Stage 1
- [x] Memory Storage - persist data in memory, start with seed data from file
- [x] Storage Service - recover data from persistence, keep data in memory, save data in persistence
- [x] User Authentication - registration, login, logout
- [x] Collection Access - save and retreive data from storage
- [x] Authentication and Collections accessible via REST

### Stage 2
- [ ] File Storage - persist data in json files
- [ ] App Config - specific collections and property validation, depending on config file, ability to seed and reset storage


### Stage 3
- StudentID - unique instance per student
- Database Storage - persist data in MongoDB instance

### Future
- Endpoints for individual exercise problems
- Socket.io support
- GraphQL support
