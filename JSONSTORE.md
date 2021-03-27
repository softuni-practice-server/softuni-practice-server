# JSON Store
Detailed information on the usage of the JSON Store REST service.

| Contents
| ---
| [Configuration](#configuration)
| [CRUD Operations](#crud-operations)
| - [Read](#read)
| - [Create](#create)
| - [Update](#update)
| - [Partial Update](#partial-update)
| - [Delete](#delete)

## Configuration
*This service does NOT use authentication - everything is fully accessible without any credentials.*

This service dynamically loads collections from the `./data/` folder, located with the server. Any JSON file in this folder will be accessible via requests.

## CRUD Operations

All requests are sent to `/jsonstore/:resource`. Resources can be nested and have any shape. Individual properties can be accessed by appending `/:propName` to the endpoint as deep as you require. Supported requests are `GET`, `POST`, `PUT`, `PATCH`, `DELETE`

### Read

Send a `GET` request to the endpoint. The response will be in JSON format.

**Examples**

Retrieve everything inside the `books` collection:
- **Method:** `GET`
- **Endpont:** `/jsonstore/books`


Retrieve entry with ID **"asdf-1234"** from the `books` collection:
- **Method:** `GET`
- **Endpont:** `/jsonstore/books/asdf-1234`


### Create

Send a `POST` request to the endpoint. The shape of the body is not restricted. The service will respond with the object, created in the store, which will have an added `_id` property, that is automatically generated.

**Examples**

Create a new entry inside the `books` collection:
- **Method:** `POST`
- **Endpont:** `/jsonstore/books`
- **Headers:** `Content-Type: application/json`
- **Body:** *JSON-formatted data*

### Update

Send a `PUT` request to the endpoint, appending the Id or any appropriate property name. The existing resource will be **fully replaced**! The service will respond with the updated object.

**Examples**

Update entry with ID **"asdf-1234"** in the `books` collection:
- **Method:** `PUT`
- **Endpont:** `/jsonstore/books/asdf-1234`
- **Headers:** `Content-Type: application/json`
- **Body:** *JSON-formatted data*

### Partial Update

Send a `PATCH` request to the endpoint, appending the Id or any appropriate property name. The service will perform a **shallow merge** with the new data and respond with the updated object.

**Examples**

Partially update entry with ID **"asdf-1234"** in the `books` collection:
- **Method:** `PATCH`
- **Endpont:** `/jsonstore/books/asdf-1234`
- **Headers:** `Content-Type: application/json`
- **Body:** *JSON-formatted data*

### Delete

Send a `DELETE` request to the endpoint, appending the Id or any appropriate property name. The service will respond with the deleted object.

**Examples**

Delete entry with ID **"asdf-1234"** from the `books` collection:
- **Method:** `DELETE`
- **Endpont:** `/jsonstore/books/asdf-1234`
