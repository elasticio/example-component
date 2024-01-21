# Example Component

## Table of Contents

* [Description](#description)
* [Environment variables](#environment-variables)
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

[elastic.io](http://www.elastic.io) iPaaS component that connects to [ API]().

The current release of the component tested on API `v1`.

## Environment variables
| Name                  | Mandatory | Description                                                                  | Values                |
|-----------------------|-----------|------------------------------------------------------------------------------|-----------------------|
| `API_RETRIES_COUNT`   | false     | Set how many time system try to make request to API on errors (3 by default) | any `integer` above 0 |
| `API_RETRY_DELAY`     | false     | Delay between retry attempts in milliseconds (10000 by default)              | any `integer` above 0 |
| `API_REQUEST_TIMEOUT` | false     | HTTP requests timeout in milliseconds (15000 by default)                     | any `integer` above 0 |

## Credentials

Component credentials configuration fields: 
* **API Base URI**  (string, required) - Indicates what URL base needs to be used.
* **Username**  (string, required)
* **Password**  (string, required)

## Actions

### Make Raw Request

Executes custom requests utilizing plain REST API

#### Configuration Fields

* **Don't throw error on 404 Response** - (optional, boolean): Treat 404 HTTP responses not as an error, defaults to `false`.

#### Input Metadata

* **Url** - (string, required): Path of the resource relative to the base URL (here comes a part of the path that goes after `https://example.com/v1/`)
* **Method** - (string, required): HTTP verb to use in the request, one of `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
* **Request Body** - (object, optional): Body of the request to send.

#### Output Metadata

* **Status Code** - (number, required): HTTP status code of the response.
* **HTTP headers** - (object, required): HTTP headers of the response.
* **Response Body** - (object, optional): HTTP response body.

### Upsert Object

Updates (if record found) or creates a new object.

#### Configuration Fields

* **Object Type** - (dropdown, required): Object-type to upsert. Currently, supported types are:
  * Products
  * Users

#### Input Metadata

* **ID** - (string, optional): ID of the object to upsert.
And dynamically generated fields according to the chosen `Object Type`.

#### Output Metadata

Result object from an upsert.

### Delete Object

Lookup a single object by a selected field that uniquely identifies it and delete it

#### Configuration Fields

* **Object Type** - (string, required): Object-type to delete. Currently, supported types are:
  * Products
  * Users
* **Lookup Criteria** - (dropdown, required): A list of object parameters that can uniquely identify the object in the database.

#### Input Metadata

* **Lookup Criteria Value** - (string, required): Value for unique search criteria in `Lookup Criteria` configuration field.

#### Output Metadata

Object with the result of deletion as value.

### Lookup Objects (plural)

Lookup a set of objects by defined criteria.

#### Configuration Fields

* **Object Type** - (dropdown, required): Object-type to lookup on. Currently, supported types are:
  * Products
  * Users
* **Emit Behavior** - (dropdown, required): Defines the way resulting objects will be emitted, one of `Emit all`, `Emit page` or `Emit individually`.
* **Number of search terms** - (number, optional): Specify a number of search terms (positive integer number [1-99] or 0).

#### Input Metadata

Depending on the configuration field `Number of search terms`.
  * If `Number of search terms` is empty or equals `0`, additional fields will not be generated.
  * If `Number of search terms = 1`, one search term will be added to the metadata.
  * If `Number of search terms > 1`, the number of search terms equals to `Number of search terms` and the number of criteria links equals to `Number of search terms - 1`

Each search term has 3 fields:
* **Field name** - Chosen object field name.
* **Condition** - Condition to apply on selected field
* **Field value** - Value for the selected field

links between conditions have one of the following values: `AND`, `OR` to combine several search terms

#### Output Metadata

* For `Emit All` and `Emit Page` mode: An object, with key `results` that has an array as its value.
* For `Emit Individually` mode: Each object which fill the entire message.

### Lookup Object (at most one)

Lookup a single object by a selected field that uniquely identifies it.

#### Configuration Fields

* **Object Type** - (dropdown, required): Object-type to upsert. Currently, supported types are:
  * Products
  * Users
* **Lookup Criteria** - (dropdown, required): A unique field by which you want to lookup the object. Currently, supported types are:
  * ID - for all object types
  * Title - for `Products` only
* **Allow criteria to be omitted** - (boolean, optional): If selected, the field Lookup Criteria Value becomes optional.
* **Allow zero results** - (boolean, optional): When selected, if the object is not found - an empty object will be returned instead of throwing an error.

#### Input Metadata

* **Lookup Criteria Value** - (string, required unless `Allow criteria to be omitted` is selected): Value for unique search criteria in `Lookup Criteria` configuration field.

#### Output Metadata

Result object depending on the object selected and the configuration setting `Allow Zero Result`.

### Lookup Object By ID

Lookup a single object by its ID.

#### Configuration Fields

* **Object Type** - (string, required): Object-type to lookup on. Currently, supported types are:
  * Products
  * Users

#### Input Metadata

* **ID Value** - (string, required): Value for ID of the object to lookup.

#### Output Metadata

Object with the result of lookup as value.

### Delete Object By ID

Delete a single object by its ID.

#### Configuration Fields

* **Object Type** - (string, required): Object-type to lookup on. Currently, supported types are:
  * Products
  * Users

#### Input Metadata

* **ID Value** - (string, required): Value for ID of the object to delete.

#### Output Metadata

Object with the result of delete.

## Triggers

### Get New and Updated Objects Polling

Retrieve all the updated or created objects within a given time range.

#### Configuration Fields

* **Object Type** - (string, required): Object-type to lookup on. Currently, supported types are:
  * Products
  * Users
* **Start Time** - (string, optional): The timestamp to start polling from (inclusive) - using ISO 8601 Date time utc format - YYYY-MM-DDThh:mm:ssZ. The default value is the beginning of time (January 1, 1970 at 00:00). 
* **End Time** - (string, optional): The timestamp to stop polling (exclusive) - using ISO 8601 Date time utc format - YYYY-MM-DDThh:mm:ssZ. The default value is flow execution time.
* **Timestamp field to poll on** - (string, optional): Can be either Last Modified or Created dates (updated or new objects, respectively). Defaults to Last Modified.

#### Input Metadata

None.

#### Output Metadata
- For `Fetch page`: An object with key ***results*** that has an array as its value
- For `Emit Individually`:  Each object fills the entire message

#### Limitations

None
