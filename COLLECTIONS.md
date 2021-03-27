# Collections

Detailed information on the usage of the Collections REST service.

**This service uses authentication** - reading resources is public, but creating, updating and deleting can only be performed by authorized users. Additionally, only the original creator of a resource can edit or delete it (barring any special CLP or ACL rules for the record).

A tyipical request will have the following shape:
```
POST /data/collectionName
Content-Type: application/json
X-Authorization: {accessTokenFromAuthService}
[Request body]
```

| Contents
|---
| [Read](#read)
| [Create](#create)
| [Update](#update)
| [Partial Update](#partial-update)
| [Delete](#delete)
| [Selecting Properties](#selecting-properties)
| [Collection Size](#collection-size)
| [Pagination](#pagination)
| [Sorting](#sorting)
| [Search](#search)
| [Distinct Records](#distinct-records)
| [Relations](#relations)

## CRUD Operations

### Read
An end point is revealed at `/data`, which grants access to information, stored on the service. `GET` requests to the service will return the following responses:
- `GET /data/:collection` - array of all entries in target collection; will return 404 if collection does not exist
- `GET /data/:collection/:id` - entry matching the given ID; will return 404 if collection or entry do not exist with appropriate message attached to response

**By default, the service will only return the first 10 entries in a collection.** Use pagination options, as described in the section [Advanced Retrieval - Pagination](#pagination).

### Create
*This request requires authorization and content-type headers (see above).*

Send `POST` request to `/data/:collection` to create new entry. ID will be generated automatically and will be included in the returned object. If the collection does not exist, it will be created.

### Update
*This request requires authorization and content-type headers (see above). Only the owner of the resource can edit it.*

Send `PUT` request to `/data/:collection/:id` to update a single entry. Note that the existing entry will be replaced!

### Partial Update
*This request requires authorization and content-type headers (see above). Only the owner of the resource can edit it.*

Send `PATCH` request to `/data/:collection/:id` to partially update a single entry. The existing entry will be merged with the new data. System properties will **not** be affected.

### Delete
*This request requires authorization headers (see above). Only the owner of the resource can delete it.*

Send `DELETE` request to `/data/:collection/:id` to delete a single entry.

## Advanced Retrieval

By using **query parameters**, you can augment the returned results. Most of these parameters can be combined.

### Selecting Properties
Append `select={propList}` to the query parameters, where `{propList}` is a URL-encoded string of comma-separated property names. The returned entries will only have the selected properties, which may greatly reduce network traffic.

Note that system-generated properties, like `_id`, are **not** automatically included if you use this option and must be manually specified (if you need them).

**Example:** To retrieve only the fields `_id`, `name` and `img` from the `recipes` collection:
```
(unencoded) /data/recipes?select=_id,name,img
GET /data/recipes?select=_id%2Cname%2Cimg
```

### Collection Size
*This parameter **can** be combined with the `where` and `distinct` options. It **cannot** be combined with any of the other options.*

Append `count` to the query parameters. This changes the response from the service to be a single number, representing the number of entries in the collection (or number of matching entries, if combined with `where`). 

**Example:** To retrieve the number of entries in the `recipes` collection:
```
GET /data/recipes?count
```

### Pagination
*If you omit the `pageSize` option, the service automatically limits the result to 10 entries.*

Append `offset={skip}&pageSize={take}` to the query parameters, where `{skip}` is the number of entries to skip and `{take}` is the number of entries to return.

**Example:** To take the **third** page of entries from the `recipes` collection, assuming 5 entries per page (entries 11 to 15):
```
GET /data/recipes?offset=10&pageSize=5
```

### Sorting
*This operation is automatically performed **before** pagination, regardless of the order of query parameter.*

Append `sortBy={propList}` to the query parameters, where `{propList}` is a URL-encoded string of comma-separated property names. Sorting is performed **by value**, where the first listed property is the primary criteria, and any other properties are secondary, tertiary, and so on.

The list will be sorted in **ascending order** by default - if you want descending order, add `desc` separated by space after the property name.

If the values are numbers, they will be comapared by size. Everything else is compared lexicographically (using `localeCompare`).

**Examples:**
* To sort by creation time, newest first (descending):
```
(unencoded) /data/recipes?sortBy=_createdOn desc
GET /data/recipes?sortBy=_createdOn%20desc
```

* To sort by the value of field `val` (descending), then by creation time (ascending):
```
(unencoded) /data/records?sortBy=val desc,_createdOn
GET /data/records?sortBy=val%20desc%2C_createdOn
```

### Search
Append `where={match}` to the query parameters, where `{match}` is a URL-encoded string of comma-separated entries in format `propName=value`. Only full matches will be returned and you can query as many properties as you need. **Note the value must be JSON-compatible! If you are matching by string, include the double-quotes!**

**Example:** To find all comments, with matching field value `recipeId` (note `%22` is the code for double-quotes, since we're matching a string value):
```
(unencoded) /data/comments?where=recipeId="8f414b4f-ab39-4d36-bedb-2ad69da9c830"
GET /data/comments?where=recipeId%3D%228f414b4f-ab39-4d36-bedb-2ad69da9c830%22
```

You can also perform advanced search, such as number size comparison, string content and logical unions:

* **Compare numbers:** `where=val >= 5`
* **String contents (case-insensitive):** `where=title LIKE "lasagna"`
* **Match one from list:** `where=category IN ("main", "soup", "appetizer")`
* **Union to match on _all_ conditions:** `where=val >= 5 AND category IN ("main", "soup")`
* **Union to match on _any_ of the conditions:** `where=val >= 5 OR category IN ("main", "soup")`

Note that you **can chain** as many unions as you require, but you **cannot combine** AND and OR unions.

### Distinct Records
*This operation is performed **after** sorting, so you can control which entry is selected when a duplicate is encountered.*

Append `distinct={propList}` to the query parameters, where `{propList}` is a URL-encoded string of comma-separated property names. This will return a filtered list, where each **combination** of the given properties only appears once (if there were duplicates, only the first encountered will be taken). **Note that if the property is missing in an entry, it's value will be assumed to be `undefined` - if the property is not part of the collection, only a single entry will be returned, since all values will be the same (`undefined`).**

**Examples:**
* To get recipes by distinct author (one recipe per author):
```
GET /data/recipes?distinct=_ownerId
```

* To get a distinct list of only the names of recipes (combination with `select`):
```
GET /data/recipes?distinct=name&select=name
```

* To get the number of unique likes (combination with `count`):
```
GET /data/likes?distinct=_ownerId&count
```

### Relations
Append `load={relations}` to the query parameters, where `{relations}` is a URL-encoded string of comma-separated **relations**. Each relation has the following structure:
```
propName=id:collection
```

`propName` is the name of the property, which will receive the matched object from the related collection. `id` is the name of the property from the current collection, which holds the foreign key (`_id`). `collection` is the name of the related (foreign) collection. Note that matching can only be performed by the `_id` property in the foreign collection, so structure your relations accordingly.

**Example:** To include information about the author of a comment, match the `_ownerId` of the current record to the `_id` of records in foreign collection `users`; the result is also filtered for a specific `recipeId` (combined with `where`):
```
(unencoded) /data/comments?where=recipeId="8f414b4f-ab39-4d36-bedb-2ad69da9c830"&load=author=_ownerId:users
GET /data/comments?where=recipeId%3D%228f414b4f-ab39-4d36-bedb-2ad69da9c830%22&load=author%3D_ownerId%3Ausers
```
