# Example Component

## Table of Contents

* [Description](#description)
* [Actions](#actions)
   * [Make Raw Request](#make-raw-request)
   * [Lookup Object (at most one)](#lookup-object-at-most-one)
   * [Upsert Object](#upsert-object)
   * [Delete Object](#delete-object)
   * [Lookup Objects](#lookup-objects)
* [Triggers](#triggers)
   * [Get New and Updated Objects Polling](#get-new-and-updated-objects-polling)

## Description

This is an example component with implementations of actions and triggers based off of the [Open Integration Hub (OIH) Standard](https://github.com/elasticio/Connectors/blob/master/Adapters/AdapterBehaviorStandardization/StandardizedActionsAndTriggers.md). In addition to the information provided in this standard and the [elastic.io documentation](https://docs.elastic.io/), the code in this repository is filled with comments explaining how actions, triggers, and other elements of an elastic.io integration component work.

## Actions

### Make Raw Request
Executes custom request
#### Configuration Fields

* **Don't throw error on 404 Response** - (optional, boolean) Treat 404 HTTP responses not as error, defaults to `false`.

#### Input Metadata

* **Url** - (string, required) Path of the resource relative to the base URL.
* **Method** - (string, required). HTTP verb to use in the request, one of `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
* **Request Body** - (object, optional) Body of the request to send

#### Output Metadata

* **Status Code** - (number, required) HTTP status code of the response, required.
* **HTTP headers** - (object, required) HTTP headers of the response, required.
* **Response Body** - (object, optional) HTTP response body.

### Lookup Object (at most one)

Lookup a single object by a selected field that uniquely identifies it.

#### Configuration Fields

* **Object Type** - (string, required): Object-type to lookup on. E.g `Users`
* **Lookup Criteria** - (object, required): A list of object parameters that can uniquely identify the object in the database.
* **Allow criteria to be omitted** - (boolean, optional): If selected field `Lookup Criteria Value` becomes optional.
* **Allow zero results** - (boolean, optional): When selected, if the object is not found - an empty object will be returned instead of throwing error.

#### Input Metadata

* **Lookup Criteria Value** - (string, required unless `Allow criteria to be omitted` is selected): Value for unique search criteria in `Lookup Criteria` configuration field.

#### Output Metadata

`result` object with result of lookup as value.

### Upsert Object

Updates (of record found) or creates a new object.

#### Configuration Fields

* **Object Type** - (dropdown, required) Object-type to upsert. E.g `Users`

#### Input Metadata

* **ID** - (string, optional) ID of the object to upsert
And dynamically generated fields according to chosen `Upsert Schema`

#### Output Metadata

Result object from upsert.

### Delete Object

Lookup a single object by a selected field that uniquely identifies it.

#### Configuration Fields

* **Object Type** - (string, required): Object-type to delete. E.g `Users`
* **Lookup Criteria** - (object, required): A list of object parameters that can uniquely identify the object in the database.

#### Input Metadata

* **Lookup Criteria Value** - (string, required): Value for unique search criteria in `Lookup Criteria` configuration field.

#### Output Metadata

`result` object with result of deletion as value.

### Lookup Objects

Lookup a set of object by defined criteria list. Can be emitted in different way.

#### Configuration Fields

* **Object Type** - (string, required): Object-type to lookup on. E.g `Users`
* **Emit Behavior** - (dropdown, required). Defines the way result objects will be emitted, one of `Emit all`, `Emit page` or `Emit individually`

#### Input Metadata

* **Lookup Criteria Value** - (string, required unless `Allow criteria to be omitted` is selected): Value for unique search criteria in `Lookup Criteria` configuration field.

If selected `Emit Behavior` is `Emit page` additionally fields will be added:
* **Page Number** - (number, defaults to X): Indicates amount of pages to be fetched.
* **Page Size** (number, defaults to X): Indicates the size of pages to be fetched.

#### Output Metadata

For `Emit All` mode: An object, with key `results` that has an array as its value.
For `Emit Page` mode: An object with key `results` that has an array as its value (if `Page Size` > 0). Key `totalCountOfMatchingResults` which contains the total number of results (not just on the page) which match the search criteria (if `Page Size` = 0).
For `Emit Individually` mode: Each object which fill the entire message.

## Triggers

### Get New and Updated Objects Polling

Retrieve all the updated or created objects within a given time range.

#### Configuration Fields

* **Object Type** - (string, required): Object-type to lookup on. E.g `Users`
* **Start Time** - (string, optional): The timestamp, in ISO8601 format, to start polling from (inclusive). Default value is the beginning of time (January 1, 1970 at 00:00.000). 
* **End Time** - (string, optional): The timestamp, in ISO8601 format, to end at (inclusive). Default value is never. 
* **Timestamp field to poll on** - (string, optional): Can be either Last Modified or Created dates (updated or new objects, respectively). Defaults to Last Modified.

#### Input/Output Metadata

None.

#### Limitations

Pagination has not been implemented yet in this trigger. Running a flow will return a single page with all of the results of the query.
