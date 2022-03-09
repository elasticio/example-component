# Example Component

## Table of Contents

* [Description](#description)
* [Actions](#actions)
   * [Make Raw Request](#make-raw-request)
   * [Lookup Object (at most 1)](#lookup-object-at-most-1)

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

### Lookup Object (at most 1)

Lookup a single object by a selected field that uniquely identifies it in the database.

#### Configuration Fields

* **Object Type** - (string, required): One of the six object types available in the database.
* **Lookup Criteria** - (object, required): A list of object parameters that can uniquely identify the object in the database.
* **Allow criteria to be omitted** - (boolean, optional): If selected, a value for the object lookup criteria in the input metadata is not required and an empty object is returned by the action.
* **Allow zero results** - (boolean, optional): If selected, if the object is not found an empty object will be returned instead of an error.
* **Wait for object to exist** - (boolean, optional): If selected, if no results are found apply rebounds and wait until the object exists.
* **Linked object to populate** - (object, optional): A list of parent and child objects that can be included in the lookup query result.

#### Input Metadata

* **The `lookup criteria value`**, which is required unless `Allow criteria to be omitted` is selected.

#### Output Metadata

* **The object being looked up** with `lastModified` and `created` timestamps, optionally also with all instances of a linked parent or child object.

#### Limitations

Due to API limitations, only one linked object can be included in the lookup query instead of multiple as specified in the OIH standard.
