# Example Component

## Table of Contents

* [Description](#description)
* [Credentials](#credentials)
* [Actions](#actions)
   * [Make Raw Request](#make-raw-request)
   * [Lookup Object (at most one)](#lookup-object-at-most-one)
   * [Upsert Object](#upsert-object)
   * [Delete Object](#delete-object)
   * [Lookup Objects (plural)](#lookup-objects-plural)
   * [Lookup Object By ID](#lookup-object-by-id)
   * [Delete Object By ID](#delete-object-by-id)
* [Triggers](#triggers)
   * [Get New and Updated Objects Polling](#get-new-and-updated-objects-polling)

## Description

This is an example component 

## Credentials

Component credentials configuration fields: 
* **API Base URI**  (string, required) - Indicates what URL base needs to be used
* **Username**  (string, required)
* **Password**  (string, required)

## Actions

### Make Raw Request

Executes custom request.

#### Configuration Fields

* **Don't throw error on 404 Response** - (optional, boolean): Treat 404 HTTP responses not as error, defaults to `false`.

#### Input Metadata

* **Url** - (string, required): Path of the resource relative to the base URL.
* **Method** - (string, required): HTTP verb to use in the request, one of `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
* **Request Body** - (object, optional): Body of the request to send.

#### Output Metadata

* **Status Code** - (number, required): HTTP status code of the response.
* **HTTP headers** - (object, required): HTTP headers of the response.
* **Response Body** - (object, optional): HTTP response body.

### Upsert Object

Updates (of record found) or creates a new object.

#### Configuration Fields

* **Object Type** - (dropdown, required): Object-type to upsert. E.g `Users`.

#### Input Metadata

* **ID** - (string, optional): ID of the object to upsert.
And dynamically generated fields according to chosen `Upsert Schema`.

#### Output Metadata

Result object from upsert.

### Delete Object

Lookup a single object by a selected field that uniquely identifies it.

#### Configuration Fields

* **Object Type** - (string, required): Object-type to delete. E.g `Users`.
* **Lookup Criteria** - (object, required): A list of object parameters that can uniquely identify the object in the database.

#### Input Metadata

* **Lookup Criteria Value** - (array of strings, required): Value for unique search criteria in `Lookup Criteria` configuration field.

#### Output Metadata

`result` object with result of deletion as value.

### Lookup Objects (plural)

Lookup a set of object by defined criteria list. Can be emitted in different way.

#### Configuration Fields

* **Object Type** - (string, required): Object-type to lookup on. E.g `Users`.
* **Emit Behavior** - (dropdown, required): Defines the way result objects will be emitted, one of `Emit all`, `Emit page` or `Emit individually`.

#### Input Metadata

* **Search Criteria** - (string, required): Search terms as array of strings. Search terms are to be combined with the AND operator, E.g: `["userAge>29", "userName=Alex"]`

If selected `Emit Behavior` is `Emit page` additionally fields will be added:
* **Page Number** - (number, defaults to X): Indicates amount of pages to be fetched.
* **Page Size** - (number, defaults to X): Indicates the size of pages to be fetched.

#### Output Metadata

For `Emit All` mode: An object, with key `results` that has an array as its value.
For `Emit Page` mode: An object with key `results` that has an array as its value (if `Page Size` > 0). Key `totalCountOfMatchingResults` which contains the total number of results (not just on the page) which match the search criteria (if `Page Size` = 0).
For `Emit Individually` mode: Each object which fill the entire message.

### Lookup Object (at most one)

Lookup a single object by a selected field that uniquely identifies it.

#### Configuration Fields

* **Object Type** - (string, required): Object-type to lookup on. E.g `Users`.
* **Lookup Criteria** - (object, required): A list of object parameters that can uniquely identify the object in the database.
* **Allow criteria to be omitted** - (boolean, optional): If selected field `Lookup Criteria Value` becomes optional.
* **Allow zero results** - (boolean, optional): When selected, if the object is not found - an empty object will be returned instead of throwing error.

#### Input Metadata

* **Lookup Criteria Value** - (string, required unless `Allow criteria to be omitted` is selected): Value for unique search criteria in `Lookup Criteria` configuration field.

#### Output Metadata

`result` object with result of lookup as value.

### Lookup Object By ID

Lookup a single object by its ID.

#### Configuration Fields

* **Object Type** - (string, required): Object-type to lookup on. E.g `Users`.

#### Input Metadata

* **ID Value** - (string, required): Value for ID of the object to lookup.

#### Output Metadata

`result` object with result of lookup as value.

### Delete Object By ID

Delete a single object by its ID.

#### Configuration Fields

* **Object Type** - (string, required): Object-type to lookup on. E.g `Users`.

#### Input Metadata

* **ID Value** - (string, required): Value for ID of the object to delete.

#### Output Metadata

`result` object with result of delete.

## Triggers

### Get New and Updated Objects Polling

Retrieve all the updated or created objects within a given time range.

#### Configuration Fields

* **Object Type** - (string, required): Object-type to lookup on. E.g `Users`.
* **Start Time** - (string, optional): The timestamp, in ISO8601 format, to start polling from (inclusive). Default value is the beginning of time (January 1, 1970 at 00:00.000). 
* **End Time** - (string, optional): The timestamp, in ISO8601 format, to end at (inclusive). Default value is never. 
* **Timestamp field to poll on** - (string, optional): Can be either Last Modified or Created dates (updated or new objects, respectively). Defaults to Last Modified.

#### Input/Output Metadata

None.

#### Limitations

Pagination has not been implemented yet in this trigger. Running a flow will return a single page with all of the results of the query.
