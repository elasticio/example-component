# Example Component

## Table of Contents

* [Description](#description)
   * [Purpose](#purpose)
   * [Completeness Matrix](#completeness-matrix)
   * [How it works](#how-it-works)
   * [Requirements](#requirements)
      * [Environment variables](#environment-variables)
      * [Others](#others)
* [Credentials](#credentials)
* [Triggers](#triggers)
   * [Get New and Updated Objects Polling](#get-new-and-updated-objects-polling)
* [Actions](#actions)
   * [Upsert Object by Unique Criteria](#upsert-object-by-unique-criteria)
   * [Lookup Object (at most 1) by Unique Criteria](#lookup-object-at-most-1-by-unique-criteria)
   * [Delete Object by Unique Criteria](#delete-object-by-unique-criteria)
* [Additional info](#additional-info)
* [API and Documentation links](#api-and-documentation-links)
* [Notes for developers](#notes-for-developers)


## Description

This is an example component with implementations of actions and triggers based off of the [Open Integration Hub (OIH) Standard](https://github.com/elasticio/Connectors/blob/master/Adapters/AdapterBehaviorStandardization/StandardizedActionsAndTriggers.md). In addition to the information provided in this standard and the [elastic.io documentation](https://docs.elastic.io/), the code in this repository is filled with comments explaining how actions, triggers, and other elements of an elastic.io integration component work.


### Purpose

The Example Component is intended to provide a model of elastic.io's integration and development best practices, as a working component implementation at a level of complexity on par with pre-fabricated components available on the platform. For developers seeking to understand more deeply the functioning of elastic.io components, or create components to facilitate integration with APIs not-yet-supported by the platform, the Example Component is the place to start.


### Completeness Matrix

![example-component-completeness-matrix](https://user-images.githubusercontent.com/23000904/80265320-750a1480-8697-11ea-8a16-bf6e86754502.png)

[Example Component Completeness Matrix](https://docs.google.com/spreadsheets/d/1YVLjDEz74fE4pd1OvYz_MaI-tcaEyO0YTmdSpyYn2co/edit?usp=sharing)


### How it works

All of the component's actions and triggers are based off of the OIH Standard, which defines common rules on how an adapter responds to changes and performs actions on generic domain objects, facilitating interoperability between components created by different developers.

The API used is the [Example Service](https://github.com/elasticio/example-service), which has a mock dataset and API endpoints created in Express.js. The API is not currently running on a server and must be set up locally with a VPN Agent in order to run calls via the elastic.io platform. More information about the API can be found on the [Example Service github repository](https://github.com/elasticio/example-service).


### Requirements

#### Environment variables

A `.env.example` file is included in this repository with mock user credentials for running integration tests/ Remove the `.example` suffix before use.

#### Others

See the above section for other setup requirements.


## Credentials

Basic authentication credentials (a `username` and `password`) are required to make calls to the example service. Credentials have been provided on the [Example Service API Documentation](https://github.com/elasticio/example-service). 


## Triggers

### Get New and Updated Objects Polling

Retrieve all the updated or created objects within a given time range.

#### Configuration Fields

- Object Type (required): One of the six object types available in the database
- Start Time: The timestamp, in ISO8601 format, to start polling from (inclusive). Default value is the beginning of time (January 1, 1970 at 00:00.000).
- End Time: The timestamp, in ISO8601 format, to end at (inclusive). Default value is never.
- Timestamp field to poll on: Can be either Last Modified or Created dates (updated or new objects, respectively). Defaults to Last Modified.

#### Input/Output Metadata

None.

#### Limitations

Pagination has not been implemented yet in this trigger. Running a flow will return a single page with all of the results of the query.


## Actions

### Upsert Object by Unique Criteria

Given a particular object, either create a new object if the given object (specified by uniquely-identifiable criteria such as an ID) doesn't yet exist in the database, or update the specified properties of the object, if it already exists. 

#### Configuration Fields

- Object Type (required): One of the six object types available in the database.
- Upsert Criteria (required): A list of object parameters that can uniquely identify the object in the database.

#### Input Metadata

- The unique criteria, which is required unless it's the object ID. The value of this field uniquely identifies the object in the database.
- Object parameters, some of which may be required for the case that the object must be created.

#### Output Metadata

- The created or updated object, including `lastModified` and `created` timestamps. If the object is being created, a new ID value will be provided in the response.

#### Limitations

All database calls that modify resources are mocked. This means that the resources are not in fact changed, but a successful response will still be returned to the action.


### Lookup Object (at most 1) by Unique Criteria

Lookup a single object by a selected field that uniquely identifies it in the database.

#### Configuration Fields

- Object Type (required): One of the six object types available in the database.
- Lookup Criteria (required): A list of object parameters that can uniquely identify the object in the database.
- Allow criteria to be omitted: If selected, a value for the object lookup criteria in the input metadata is not required and an empty object is returned by the action.
- Allow zero results: If selected, if the object is not found an empty object will be returned instead of an error.
- Wait for object to exist: If selected, if no results are found apply rebounds and wait until the object exists.
- Linked object to populate: A list of parent and child objects that can be included in the lookup query result.

#### Input Metadata

- The lookup criteria, which is required unless `allow criteria to be omitted` is selected.

#### Output Metadata

- The object being looked up with `lastModified` and `created` timestamps, optionally also with all instances of a linked parent or child object.

#### Limitations

Due to API limitations, only one linked object can be included in the lookup query instead of multiple as specified in the OIH standard.


### Delete Object by Unique Criteria

Delete a single object by a selected field that uniquely identifies it in the database.

#### Configuration Fields

- Object Type (required): One of the six object types available in the database.
- Delete Criteria (required): A list of object parameters that can uniquely identify the object in the database.

#### Input Metadata

- The delete criteria (required).

#### Output Metadata

- The id of the object that was just deleted.


## Additional info

ESLint is used for all javascript files in the component. A pre-test script for styles will be run upon pushing the component to the elastic.io platform. 

Unit tests have not been written for this component, only integration tests.


## API and documentation links

- [Open Integration Hub (OIH) Standard](https://github.com/elasticio/Connectors/blob/master/Adapters/AdapterBehaviorStandardization/StandardizedActionsAndTriggers.md)
- [Example Service API](https://github.com/elasticio/example-service)
- [Example Component Completeness Matrix](https://docs.google.com/spreadsheets/d/1YVLjDEz74fE4pd1OvYz_MaI-tcaEyO0YTmdSpyYn2co/edit?usp=sharing) (only visible to elastic.io organization members)
- [elastic.io documentation](https://docs.elastic.io/)


## Notes for developers

- When developing new actions and triggers for this component, make sure to follow the OIH standard as closely as possible. Usually it makes sense to match variable names and use predictable titles with clear descriptions. 
- Comments in the code are really important. Make sure to explain what each line is doing, how it accomplishes the steps laid out in the OIH standard pseudocode, why certain steps in the standard are (or are not) being taken, and why any departures are being made from the outlined steps.
- Over the course of writing this component, a number of changes have had to be made to the API to accommodate certain functionalities. Feel free to go into the [example service](https://github.com/elasticio/example-service) and make changes as necessary. At the same time, if it is too troublesome to add certain functionalities (particularly those changes which necessitate modifying JSONServer module files directly), feel free to modify the behaviour of the action/trigger in question. Make sure to provide an explanation in this case and highlight where the code deviates from the standard.
- There is currently some special 404 error handling the `handleRestResponse` function of the `ExampleClient`. However, it may be determined that this special behaviour is not needed (it isn't being used in any of the actions/triggers implemented as of April 24, 2020), and the `ExampleClient` can be replaced in favour of the [component commons library](https://github.com/elasticio/component-commons-library) `BasicAuthRestClient`.
- The Get New and Updated Objects polling trigger is not completed, since it does not handle pagination. Although there are some API limitations with this, the current trigger code handles some of these limitations already, so it's totally possible to add pagination on top of this. Feel free to add it in the future.
- To run flows from the elastic.io platform with the example service on localhost, you will have to set up a VPN/Duplo Agent to tunnel to your local machine. Follow the instructions on the [VPN Agent documentation](https://github.com/elasticio/docs/blob/master/duplo.md) to do this. Make sure to have the agent listen on a local IP that is not the same as the address that the service is running on!
