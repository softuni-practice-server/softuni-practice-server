# SoftUni Practice Server

| Contents
|---
| [Usage](#usage)
| [Build](#build)
| [Services](#services)
| - [JSON Store](#json-store)
| - [Authentication](#authentication)
| - [Collections](#collections)

## Usage

This is a **REST service**, created for educational purposes. A compiled bundle should be available with every exercise's resources. To execute it, run the included **start.bat** file, or manually open a command prompt and run `node server.js`.

**Note:** You **do NOT need** to download anything from this repository - this is intended for reference only.

## Build

To build the server, run the following commands in the terminal:
```
npm install
npm run client
npm run build
```

This will compile the admin panel and then bundle the client, the server and the settings file (this contains all rules and seed data for the Collections service) into a single executable script.

## Services

Note that changes to the data **will not be persisted**! All operations happen in memory and will be wiped when the service is restarted.

### JSON Store

| [Read the detailed documentation for this service](./JSONSTORE.md)
|---

#### Configuration
*The JSON Store service does NOT use authentication - everything is fully accessible without any credentials. Use the Collections service if you need authentication.*

This service dynamically loads collections from the `./data/` folder, located with the server. Any JSON file in this folder will be accessible via requests.

#### CRUD Operations

All requests are sent to `/jsonstore/:resource`. Resources can be nested and have any shape. Individual properties can be accessed by appending `/:propName` to the endpoint as deep as you require. Supported requests are `GET`, `POST`, `PUT`, `PATCH`, `DELETE`

### Authentication

The service is initialized with three users, which can be used for immediate testing:
* peter@abv.bg : 123456
* george@abv.bg : 123456
* admin@abv.bg : admin

#### Register
Create a new user by sending a `POST` request to `/users/register` with properties `email` and `password`. You can add any other property that you need, like username, avatar, etc. The service automatically creates a session and returns an authorization token, that can be used for requests.

#### Login
Login by sending a `POST` request with `email` and `password` to `/users/login`. The service will respond with an object, containing a standard string token, that can be used for requests.

#### Logout
Send an authorized `GET` request to `/users/logout`. **The service returns an empty response - if you attempt to parse it as JSON, you will receive an error!** You can check for this type of response by looking at the **status** (204 instead of 200) and the **content-type header** (will not be present).

#### Get User Details
Send an authorized `GET` request to `/users/me`. The service will return the record of the user, associated with the passed-in session token.

#### Authorized Requests
To make an authorized request, add the following header, where `{token}` is the access token, returned by the service upon successful login or registration:
```
X-Authorization: {token}
```

#### Admin Override
Any request which includes the `X-Admin` header will be **granted full access** to any resource inside the **Collections** service. The only exception is if the request has an invalid session token, which still throws a 403 with the appropriate message.

### Collections

| [Read the detailed documentation for this service](./COLLECTIONS.md)
|---

This service uses authentication - reading resources is public, but creating, updating and deleting can only be performed by authorized users. Additionally, only the original creator of a resource can edit or delete it.

#### CRUD Operations

Send requests to `/data/:collection` with appropriate method and headers. All operations, except for Read, require an authorization header to be present on the request (see the [Authentication](Authentication) section on how to obtain a valid token).

## Further Information
You may create issues, regarding missing, incorrect or incomplete information, regarding the use of this service. Any contribution is welcome!
