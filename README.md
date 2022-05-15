# Example Component

## Table of Contents

* [Description](#description)
* [Actions](#actions)
   * [Make Raw Request](#make-raw-request)
   * [Lookup Object (at most one)](#lookup-object-at-most-one)
   * [Upsert Object](#upsert-object)
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
* **Method** - Allowed values `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, required. HTTP verb to use in the request.
* **Request Body** - (object, optional) Body of the request to send

#### Output Metadata

* **Status Code** - (number, required) HTTP status code of the response, required.
* **HTTP headers** - (object, required) HTTP headers of the response, required.
* **Response Body** - (object, optional) HTTP response body.

### Lookup Object (at most one)

Lookup a single object by a selected field that uniquely identifies it.

#### Configuration Fields

* **Object Type** - (string, required): One of the six object types available in the database.
* **Lookup Criteria** - (object, required): A list of object parameters that can uniquely identify the object in the database.
* **Allow criteria to be omitted** - (boolean, optional): If selected field `Lookup Criteria Value` becomes optional.
* **Allow zero results** - (boolean, optional): When selected, if the object is not found - an empty object will be returned instead of throwing error.

#### Input Metadata

* **Lookup Criteria Value** - (string, required unless `Allow criteria to be omitted` is selected): Value for unique search criteria in `Lookup Criteria` configuration field.

#### Output Metadata

Result object from lookup



### Upsert Object

Updates (of record found) or creates a new object.

#### Configuration Fields

* **Object Type** - (dropdown, required) Object-type to upsert. E.g `Users`

#### Input Metadata

* **ID** - (string, optional) ID of the object to upsert
And dynamically generated fields according to chosen `Upsert Schema`

#### Output Metadata

Result object from upsert.

## Triggers

### Get New and Updated Objects Polling

Retrieve all the updated or created objects within a given time range.

#### Configuration Fields

* **Object Type** - (required), one of the six object types available in the database 
* **Start Time** - The timestamp, in ISO8601 format, to start polling from (inclusive). Default value is the beginning of time (January 1, 1970 at 00:00.000). 
* **End Time** - The timestamp, in ISO8601 format, to end at (inclusive). Default value is never. 
* **Timestamp field to poll on** - Can be either Last Modified or Created dates (updated or new objects, respectively). Defaults to Last Modified.

#### Input/Output Metadata

None.

#### Limitations

Pagination has not been implemented yet in this trigger. Running a flow will return a single page with all of the results of the query.
