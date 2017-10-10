# softuni-practice-server

## Server Architecture

https://docs.google.com/drawings/d/1SOUTqYK47CVph_WfKmjJoZJbjH4sBu7Bm0L4PSy9wUQ/edit?usp=sharing

## Implementation Roadmap
### Stage 1
#### Memory Storage - persist data in memory, start with seed data from file
#### Storage Service - recover data from persistence, keep data in memory, save data in persistence
#### User Authentication - registration, login, logout
#### Collection Access - save and retreive data from storage
#### Authentication and Collections accessible via REST

### Stage 2
#### App Config - specific collections and property validation, depending on config file, ability to seed and reset storage
#### File Storage - persist data in json files


### Stage 3
#### StudentID - unique instance per student
#### Database Storage - persist data in MongoDB instance

### Future
#### Endpoints for individual exercise problems
#### Socket.io support
#### GraphQL support
