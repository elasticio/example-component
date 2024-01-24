# Example Component

## Table of Contents

* [Description](#description)
* [Environment Variables](#environment-variables)
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

The component is an iPaaS component that connects to the API. This component has been tested on API v1.

## Environment Variables
| Name                  | Mandatory | Description                                                                  | Values                |
|-----------------------|-----------|------------------------------------------------------------------------------|-----------------------|
| `API_RETRIES_COUNT`   | false     | Sets how many times the system tries to make a request to the API on errors. The default value is 3. | any `integer` above 0 |
| `API_RETRY_DELAY`     | false     | The delay between retry attempts in milliseconds. The default value is 10000.              | any `integer` above 0 |
| `API_REQUEST_TIMEOUT` | false     | The timeout for HTTP requests in milliseconds. The default value is 15000.                     | any `integer` above 0 |

## Credentials

The component requires the following credentials to be configured:
* **API Base URI**  (string, required) - Indicates the URL base that needs to be used.
* **Username**  (string, required)
* **Password**  (string, required)

## Actions

### Make Raw Request

This action allows you to execute custom requests using the plain REST API.

#### Configuration Fields

* **Don't throw error on 404 Response** - (optional, boolean): When enabled, treats 404 HTTP responses as non-errors. The default value is `false`.

#### Input Metadata

* **Url** - (string, required): The path of the resource relative to the base URL (the part that comes after `https://example.com/v1/`).
* **Method** - (string, required): The HTTP verb to use in the request. Valid options are `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
* **Request Body** - (object, optional): The body of the request to send.

#### Output Metadata

* **Status Code** - (number, required): The HTTP status code of the response.
* **HTTP Headers** - (object, required): The HTTP headers of the response.
* **Response Body** - (object, optional): The body of the HTTP response.

### Upsert Object

This action updates an existing object if it is found, or creates a new object if it does not exist.

#### Configuration Fields

* **Object Type** - (dropdown, required): The type of object to upsert. Currently, supported types include:
  * Products
  * Users

#### Input Metadata

* **ID** - (string, optional): The ID of the object to upsert.
and other dynamically-generated fields based on the chosen `Object Type`.

#### Output Metadata

The result object from the upsert action.

### Delete Object

This action looks up a single object using a selected field that uniquely identifies it, and then deletes it.

#### Configuration Fields

* **Object Type** - (string, required): The type of object to delete. Currently, supported types include:
  * Products
  * Users
* **Lookup Criteria** - (dropdown, required): A list of object parameters that can uniquely identify the object in the database.

#### Input Metadata

* **Lookup Criteria Value** - (string, required): The value for the unique search criteria specified in the `Lookup Criteria` configuration field.

#### Output Metadata

An object with the result of the deletion.

### Lookup Objects (plural)

This action looks up a set of objects based on defined criteria.

#### Configuration Fields

* **Object Type** - (dropdown, required): The type of object to lookup. Currently, supported types include:
  * Products
  * Users
* **Emit Behavior** - (dropdown, required): Defines how the resulting objects will be emitted. Valid options include `Emit all`, `Emit page`, or `Emit individually`.
* **Number of search terms** - (number, optional): The number of search terms to specify. Valid values are positive integers between 1 and 99, or 0.

#### Input Metadata

The input metadata depends on the value of the configuration field `Number of search terms`.
  * If `Number of search terms` is empty or equals `0`, additional fields will not be generated.
  * If `Number of search terms = 1`, one search term will be added to the metadata.
  * If `Number of search terms > 1`, the number of search terms will equal `Number of search terms`, and the number of criteria links will equal `Number of search terms - 1`.

Each search term has 3 fields:
* **Field Name** - The name of the object field to search on.
* **Condition** - The condition to apply to the selected field.
* **Field Value** - The value to use for the selected field.

The links between conditions can have one of the following values: `AND`, `OR`, to combine several search terms.

#### Output Metadata

* For `Emit All` and `Emit Page` modes: An object with a key `results` that contains an array of objects.
* For `Emit Individually` mode: Each object fills the entire message.

### Lookup Object (at most one)

This action looks up a single object using a selected field that uniquely identifies it.

#### Configuration Fields

* **Object Type** - (dropdown, required): The type of object to lookup. Currently, supported types include:
  * Products
  * Users
* **Lookup Criteria** - (dropdown, required): A unique field by which you want to look up the object. Currently, supported types include:
  * ID - for all object types
  * Title - for `Products` only
* **Allow criteria to be omitted** - (boolean, optional): When enabled, the field Lookup Criteria Value becomes optional.
* **Allow zero results** - (boolean, optional): When enabled, if the object is not found, an empty object will be returned instead of throwing an error.

#### Input Metadata

* **Lookup Criteria Value** - (string, required unless `Allow criteria to be omitted` is enabled): The value for the unique search criteria specified in the `Lookup Criteria` configuration field.

#### Output Metadata

The result object depends on the selected object and the configuration setting `Allow Zero Result`.

### Lookup Object By ID

This action looks up a single object using its ID.

#### Configuration Fields

* **Object Type** - (string, required): The type of object to lookup. Currently, supported types include:
  * Products
  * Users

#### Input Metadata

* **ID Value** - (string, required): The value of the ID of the object to lookup.

#### Output Metadata

An object with the result of the lookup.

### Delete Object By ID

This action deletes a single object using its ID.

#### Configuration Fields

* **Object Type** - (string, required): The type of object to lookup. Currently, supported types include:
  * Products
  * Users

#### Input Metadata

* **ID Value** - (string, required): The value of the ID of the object to delete.

#### Output Metadata

An object with the result of the deletion.

## Triggers

### Get New and Updated Objects Polling

This trigger retrieves all the updated or created objects within a given time range.

#### Configuration Fields

* **Object Type** - (string, required): The type of object to lookup. Currently, supported types include:
  * Products
  * Users
* **Start Time** - (string, optional): The timestamp to start polling from (inclusive), using the ISO 8601 Date time UTC format (YYYY-MM-DDThh:mm:ssZ). The default value is the beginning of time (January 1, 1970 at 00:00). 
* **End Time** - (string, optional): The timestamp to stop polling (exclusive), using the ISO 8601 Date time UTC format (YYYY-MM-DDThh:mm:ssZ). The default value is the time of the flow execution.
* **Timestamp field to poll on** - (string, optional): Specifies whether to poll based on the Last Modified or Created dates (for updated or new objects, respectively). The default value is Last Modified.

#### Input Metadata

None.

#### Output Metadata
- For `Fetch page`: An object with a key ***results*** that contains an array of objects
- For `Emit Individually`: Each object fills the entire message

#### Limitations

None
