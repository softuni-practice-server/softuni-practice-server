# softuni-practice-server

## Usage

This is **REST service**, created for educational purposes. A compiled bundle should be available with every exercise's resources. To execute it, run the included **start.bat** file, or manually open a command prompt and run `node server.js`.

**Note:** You **do NOT need** to download anything from this repository - this is intended for reference only.

## Services

### JSON Store

#### Configuration
This service dynamically loads collections from the `./data/` folder, located with the server. Any JSON file in this folder will be accessible via requests.

This service does NOT use authentication - everything is fully accessible without any credentials.

#### Authentication
You can register a user by sending a **POST** request to `/user/register` with properties `email`, `password` and `name`. Login by posting `email` and `password` to `/user/login`. The server will respond with an object, containing a standard string token.

#### Collection access

This service uses authentication - reading resources is public, but creating, updating and deleting can only be performed by registered and logged-in users. Additionally, only the original creator of a resource can edit it.

An end point is revealed at `/data`, which grants access to information, stored on the server. **GET** requests to the server will return the following responses:
- `GET /data/:collection` - array of all entries in target collection; will return 404 if collection does not exist
- `GET /data/:collection/:id` - entry matching the given ID; will return 404 if collection or entry do not exist with appropriate message attached to response

##### Create
Send **POST** request to `/data/:collection` to create new entry. ID will be generated automatically and will be included in the returned object. If the collection does not exist, it will be created.

##### Update
Send **PUT** request to `/data/:collection/:id` to update a single entry. Note that the existing entry will be replaced!

##### Delete
Send **DELETE** request to `/data/:collection/:id` to delete a single entry.

##### Query
You can include a query string to your **GET** requests to `/data/:collection` that will return only entries, that match all properties inside the query. The returned object will always be an array, even there are no matches or if there is only one match.

*Documentation pending, check back soon for more information*