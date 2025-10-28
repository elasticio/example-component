# elastic.io Component Development Guide

This document serves as a comprehensive guide for developing components on the elastic.io integration platform. It aims to provide a compact yet essential description of the platform's core concepts and component building practices, enabling developers and even other LLMs to understand and build components correctly.

## 1. Introduction to elastic.io Components

elastic.io is an integration Platform as a Service (iPaaS) that allows users to connect various applications and automate workflows. Components are the building blocks of these integrations, responsible for interacting with external services, transforming data, and orchestrating flows. The platform offers a rich user interface for building integration flows, managing contracts, and monitoring logs and quotas. A wide array of pre-built components exist, categorized by function (e.g., CRM, Marketing, Protocol, Utility, ERP, Finance, Service, E-Commerce, Office, Database), showcasing the breadth of integrations possible and the need for versatile component design.

**Key Principles:**
*   **Modularity:** Components are self-contained units with specific functionalities (e.g., connecting to a CRM, transforming data).
*   **Event-Driven:** Components often react to events (triggers) or perform actions based on incoming messages.
*   **Stateless (mostly):** While triggers can maintain state using snapshots, actions are generally designed to be stateless.
*   **Standardized Interface:** Components adhere to a defined interface for communication with the elastic.io platform.

For more detailed information, refer to the official [elastic.io Developer Documentation](https://docs.elastic.io/developers/).

### 1.1 Data Flow Overview

In elastic.io, integration flows are built by connecting components. Data typically flows from a **Trigger** component, which initiates the flow by detecting new or updated information in an external system. This data is then passed as a message to one or more **Action** components, which perform operations (e.g., data transformation, writing to another system) based on the incoming message. This creates a chain of operations, allowing for complex automation and data synchronization across various applications.


## 2. Core Component Files and Structure

An elastic.io component typically consists of several key files and a well-defined directory structure.

### 2.1 `component.json` - The Component Manifest

This file is the entry point and manifest for any elastic.io component. It defines the component's metadata, available actions, triggers, and credential types.

**Example (`component.json` from `example-component`):**
```json
{
  "id": "example-component",
  "name": "Example Component",
  "description": "An example component for elastic.io platform",
  "version": "1.0.0",
  "triggers": {
    "getNewAndUpdatedObjectsPolling": {
      "type": "polling",
      "title": "Get New and Updated Objects (Polling)",
      "description": "Polls for new and updated objects from an external system."
    }
  },
  "actions": {
    "upsertObject": {
      "title": "Upsert Object",
      "description": "Creates or updates an object in an external system."
    },
    "lookupObject": {
      "title": "Lookup Object",
      "description": "Looks up a single object in an external system."
    },
    "lookupObjects": {
      "title": "Lookup Objects",
      "description": "Looks up multiple objects in an external system."
    },
    "deleteObject": {
      "title": "Delete Object",
      "description": "Deletes an object from an external system."
    },
    "deleteObjectById": {
      "title": "Delete Object by ID",
      "description": "Deletes an object by its ID from an external system."
    },
    "lookupObjectById": {
      "title": "Lookup Object by ID",
      "description": "Looks up an object by its ID in an external system."
    },
    "rawRequest": {
      "title": "Raw Request",
      "description": "Performs a raw HTTP request to the external system."
    }
  },
  "credentials": {
    "apiKey": {
      "type": "apiKeyAuth",
      "fields": {
        "apiKey": {
          "label": "API Key",
          "required": true,
          "type": "string"
        }
      }
    }
  }
}
```

**Key Sections:**
*   `id`, `name`, `description`, `version`: Basic component identification.
*   `triggers`: Defines available triggers. Each trigger has a `type` (e.g., `polling`, `webhook`), `title`, and `description`.
*   `actions`: Defines available actions. Each action has a `title` and `description`.
*   `credentials`: Specifies the authentication methods supported by the component (e.g., `apiKeyAuth`, `oauth2`). For Java-based components, this section can also contain a `verifier` property that points to a Java class responsible for verifying the credentials.

### 2.2 `package.json` - Project Dependencies and Scripts

This standard Node.js file manages project dependencies, scripts, and metadata.

**Important Note on Dependencies:**
When defining dependencies in `package.json`, it is **forbidden** to use caret (`^`) or tilde (`~`) characters in version numbers (e.g., `"axios": "0.27.2"` instead of `"axios": "^0.27.2"`). This ensures deterministic builds and prevents unexpected breaking changes from minor or patch updates.

**Key Dependencies for elastic.io Components:**
*   `@elastic.io/component-commons-library`: Provides common utilities and helpers.
*   `elasticio-node`, `elasticio-rest-node`, `elasticio-sailor-nodejs`: Core libraries for interacting with the elastic.io platform.
*   `axios`: A popular HTTP client for making API requests to external systems.

### 2.3 `src/client.ts` - The API Client (Common Pattern)

While not strictly required by the elastic.io platform, it is a common and recommended practice to encapsulate external API interactions within a dedicated client class, typically found in `src/client.ts`.

**Purpose:**
*   **Centralized API Logic:** Provides a single point for making API calls, handling authentication, error retries, and logging.
*   **Consistency:** Ensures all actions and triggers interact with the external system in a consistent manner.
*   **Testability:** Makes it easier to mock API calls during testing.

**Example (`src/client.ts` from `example-component`):**
```typescript
/* eslint-disable no-restricted-syntax, class-methods-use-this */
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { axiosReqWithRetryOnServerError } from '@elastic.io/component-commons-library';

export default class Client {
  private logger: any;
  private cfg: any;

  constructor(context, cfg) {
    this.logger = context.logger;
    this.cfg = cfg;
  }

  async apiRequest(opts: AxiosRequestConfig): Promise<AxiosResponse> {
    return axiosReqWithRetryOnServerError.call(this, opts);
  }
}
```
This example demonstrates using `axios` with `axiosReqWithRetryOnServerError` from the `component-commons-library` for robust API calls with built-in retry logic.

## 3. Implementing Actions

Actions are functions that perform a specific task in an external system, usually triggered by an incoming message from an integration flow.

### 3.1 `processAction` Function

Every action must export a `process` function (or `processAction` which is then exported as `process`). This function receives the incoming message (`msg`), the component's configuration (`cfg`), and a `context` object (accessible via `this`).

**Note on Exports:** While TypeScript files often use `export async function processAction(...)`, the elastic.io platform typically loads components using CommonJS `require`. Therefore, it's common to see `module.exports.process = processAction;` to expose the function correctly to the platform. The `context` object provides access to essential platform functionalities, including:
*   `this.logger`: For logging information, warnings, and errors.
*   `this.emit`: For emitting messages (`data`, `error`, `snapshot`, `rebound`) to the platform.
*   `this.cfg`: The component's configuration (also passed as a direct argument, but accessible via `this` for consistency).

**Key Responsibilities:**
*   **Input Processing:** Extract data from `msg.body` and `cfg`.
*   **API Interaction:** Use the `Client` to interact with the external system.
*   **Error Handling:** Gracefully handle API errors and provide meaningful feedback.
*   **Output Emission:** Emit new messages (e.g., `messages.newMessageWithBody(data)`) to pass results to the next step in the flow.

**Example (`src/actions/upsertObject.ts` - simplified):**
```typescript
import { messages } from 'elasticio-node';
import Client from '../client';
// ... schema imports

export async function processAction(msg: any, cfg: any) {
  this.logger.info('"Upsert Object" action started');
  const { id } = msg.body;
  const { objectType } = cfg;
  const reqData = JSON.parse(JSON.stringify(msg.body));
  delete reqData.id;

  const client = new Client(this, cfg);
  if (id) {
    // Attempt to update
    try {
      const { data } = await client.apiRequest({
        url: `/${objectType}/${id}`,
        method: 'PUT',
        data: reqData
      });
      return messages.newMessageWithBody(data);
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(`Object with id "${id}" is not found!`);
      }
      throw error;
    }
  }
  // Create new object
  const { data } = await client.apiRequest({
    url: `/${objectType}`,
    method: 'POST',
    data: reqData
  });
  return messages.newMessageWithBody(data);
}
```

### 3.2 `getMetaModel` Function (Dynamic Metadata)

Actions can optionally export a `getMetaModel` function. This function dynamically generates the input and output schemas (metadata) for the action based on the component's configuration. This is particularly useful when the schema depends on user-selected options (e.g., `objectType`).

**Example (`src/actions/upsertObject.ts` - `getMetaModel`):**
```typescript
// ... imports and processAction

export const getMetaModel = async function (cfg: { objectType: string }) {
  const schemas = {
    users: usersSchema, // Imported JSON schema
    products: productSchema // Imported JSON schema
  };
  const metadata = {
    in: {
      type: 'object',
      properties: {
        ...schemas[cfg.objectType].in,
        id: {
          type: 'string',
          title: 'ID'
        }
      }
    },
    out: {
      type: 'object',
      properties: {
        ...schemas[cfg.objectType].out,
        id: {
          type: 'string',
          required: true
        }
      }
    }
  };
  return metadata;
};
```

### 3.3 Schemas (`.json` files)

Input and output schemas for actions are typically defined in JSON files (e.g., `src/schemas/actions/users.json`, `src/schemas/actions/products.json`). These schemas describe the expected structure and data types of messages entering and leaving the action.

**Example of a simple JSON Schema:**
```json
{
  "type": "object",
  "properties": {
    "firstName": {
      "type": "string",
      "title": "First Name"
    },
    "lastName": {
      "type": "string",
      "title": "Last Name"
    },
    "email": {
      "type": "string",
      "format": "email",
      "title": "Email Address"
    }
  },
  "required": ["firstName", "email"]
}
```

## 4. Implementing Triggers

Triggers are functions that initiate an integration flow, usually by detecting new or updated data in an external system.

### 4.1 `processTrigger` Function (Polling Example)

Triggers must export a `process` function (or `processTrigger` which is then exported as `process`). For polling triggers, this function is periodically invoked by the platform. It receives the incoming message (`msg` - always empty for triggers, as triggers initiate flows rather than processing messages from a previous step), the component's configuration (`cfg`), and a `snapshot` object. The `context` object (accessible via `this`) provides access to essential platform functionalities, including:
*   `this.logger`: For logging information, warnings, and errors.
*   `this.emit`: For emitting messages (`data`, `error`, `snapshot`, `rebound`) to the platform.
*   `this.cfg`: The component's configuration (also passed as a direct argument, but accessible via `this` for consistency).

**Note on Exports:** Similar to actions, while TypeScript files often use `export async function processTrigger(...)`, the elastic.io platform typically loads components using CommonJS `require`. Therefore, it's common to see `module.exports.process = processTrigger;` to expose the function correctly to the platform.

**Key Responsibilities:**
*   **API Interaction:** Use the `Client` to query the external system for changes.
*   **State Management (`snapshot`):** The `snapshot` object is crucial for polling triggers. It allows the trigger to store and retrieve state between invocations (e.g., the timestamp of the last processed item) to avoid reprocessing old data.
*   **Data Filtering:** Filter retrieved data to identify only new or updated items since the last poll.
*   **Output Emission:** Emit new messages (`this.emit('data', messages.newMessageWithBody(result))`) for each new or updated item.
*   **Snapshot Update:** Update and emit the `snapshot` (`this.emit('snapshot', snapshot)`) to persist the new state for the next polling cycle.

**Example (`src/triggers/getNewAndUpdatedObjectsPolling.ts` - simplified):**
```typescript
import { messages } from 'elasticio-node';
import Client from '../client';

export async function processTrigger(msg, cfg, snapshot = { startTime: undefined }) {
  this.logger.info('"Get New and Updated Objects" trigger started');
  const client = new Client(this, cfg);
  const { objectType, startTime, endTime, pollConfig = 'lastModified' } = cfg;

  const pollingStartTime = new Date(snapshot.startTime || startTime || 0);
  const pollingEndTime = new Date(endTime || 8640000000000000);

  // ... validation and logging

  const queryString = `${encodeURIComponent(objectType)}?_sort=${pollConfig}&_order=asc`;
  const resultsList = await client.apiRequest({
    url: queryString,
    method: 'GET',
  });

  const filteredResults = resultsList.data.map((obj) => {
    obj[pollConfig] = new Date(obj[pollConfig]);
    return obj;
  }).filter((obj) => (snapshot.startTime
    ? obj[pollConfig] > pollingStartTime && obj[pollConfig] <= pollingEndTime
    : obj[pollConfig] >= pollingStartTime && obj[pollConfig] <= pollingEndTime));

  for (const result of filteredResults) {
    await this.emit('data', messages.newMessageWithBody(result));
  }

  snapshot = {
    startTime: filteredResults[filteredResults.length - 1][pollConfig].toISOString(),
  };
  await this.emit('snapshot', snapshot);
  this.logger.info(`Polling complete. Future snapshot set to ${snapshot.startTime}`);
}
```

## 5. Testing Components

Robust testing is crucial for elastic.io components. The `example-component` demonstrates a clear separation between unit and integration tests.

**Key Practices:**
*   **Unit Tests (`spec/`):**
    *   Focus on individual functions and classes (e.g., `Client`, action/trigger logic in isolation).
    *   Use mocking libraries (like `nock`) to simulate external API responses, ensuring tests are fast and independent.
    *   Typically use `mocha` and `chai`.
*   **Integration Tests (`spec-integration/`):**
    *   Verify the end-to-end flow, including actual API calls to a test environment of the external system.
    *   Have longer timeouts due to network latency.
    *   Also use `mocha` and `chai`.
*   **Code Coverage:** Use tools like `nyc` to ensure adequate test coverage.
*   **TypeScript:** Components are often written in TypeScript, with `ts-node` used to run tests directly without a separate compilation step.

**Example `package.json` scripts for testing:**
```json
{
  "scripts": {
    "pretest": "eslint --ext .ts --quiet --fix && find src spec spec-integration -name "*.js" -type f -delete && rm -f verifyCredentials.js",
    "test": "nyc mocha --require ts-node/register "spec/**/*spec.ts" --timeout 10000",
    "posttest": "tsc",
    "integration-test": "npm run pretest && nyc mocha --require ts-node/register "spec-integration/**/*spec.ts" --timeout 500000"
  },
  "devDependencies": {
    "mocha": "10.0.0",
    "chai": "4.3.4",
    "nock": "13.2.7",
    "nyc": "15.1.0",
    "ts-node": "10.2.1",
    "typescript": "4.4.3"
  }
}
```

## 6. General Guidelines and Best Practices

*   **Logging:** Utilize `this.logger` for informative logging within actions and triggers.
*   **Configuration (`cfg`):** Design actions and triggers to be configurable via the `cfg` object, allowing users to customize behavior without code changes.
*   **Error Handling:** Implement robust error handling, providing clear and actionable error messages to the user. The platform distinguishes between different types of errors:
    *   **Permanent Errors:** For unrecoverable issues (e.g., invalid credentials, malformed data that cannot be corrected), throw a standard JavaScript `Error` or use `this.emit('error', error)`. This typically stops the flow.
    *   **Temporary Errors (Rebound):** For transient issues (e.g., network timeouts, rate limits) that might resolve on retry, use `this.emit('rebound', error)`. The platform will then attempt to re-process the message after a delay.
*   **Idempotency:** Where possible, design actions to be idempotent, meaning that performing the same action multiple times has the same effect as performing it once.
*   **Data Transformation:** Components are often responsible for transforming data between the elastic.io platform's message format and the external system's API requirements. Understanding common [integration patterns](https://docs.elastic.io/guides/integration-patterns/) is crucial for designing effective and reusable components.
*   **Security:** Always handle credentials securely and avoid logging sensitive information.

## 7. Advanced Features and Patterns

This section covers more advanced features and common patterns that can be useful when developing components.

### 7.1. Java-based Components

While this guide primarily focuses on Node.js/TypeScript components, it's also possible to develop components in Java using the `sailor-jvm` library.

**Key Differences from Node.js Components:**

*   **`component.json`:**
    *   The `main` property for actions and triggers points to a fully qualified Java class name, e.g., `"main": "io.elastic.petstore.triggers.GetPetsByStatus"`.
    *   Credential verification is done by a Java class specified in the `verifier` property inside `credentials`, e.g., `"verifier": "io.elastic.petstore.ApiKeyVerifier"`.
    *   Dynamic dropdown models (`SelectView`) can be populated by a Java class specified in the `model` property of a field, e.g., `"model": "io.elastic.petstore.providers.PetStatusModelProvider"`.
*   **Implementation:**
    *   Actions and triggers implement the `io.elastic.api.Function` interface.
    *   The main logic is within the `execute(ExecutionParameters parameters)` method.
    *   The `ExecutionParameters` object provides access to configuration, the logger, and the event emitter.

**Example of a Java Trigger:**
```java
package io.elastic.petstore.triggers;

import io.elastic.api.ExecutionParameters;
import io.elastic.api.Function;
import io.elastic.api.Message;
import io.elastic.petstore.HttpClientUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.json.JsonString;

public class GetPetsByStatus implements Function {
    private static final Logger logger = LoggerFactory.getLogger(GetPetsByStatus.class);

    @Override
    public void execute(final ExecutionParameters parameters) {
        final JsonObject configuration = parameters.getConfiguration();
        final JsonString status = configuration.getJsonString("status");
        if (status == null) {
            throw new IllegalStateException("status field is required");
        }
        logger.info("About to find pets by status {}", status.getString());
        final String path = "/pet/findByStatus?status=" + status.getString();
        final JsonArray pets = HttpClientUtils.getMany(path, configuration);
        logger.info("Got {} pets", pets.size());
        final JsonObject body = Json.createObjectBuilder()
                .add("pets", pets)
                .build();
        final Message data = new Message.Builder().body(body).build();
        logger.info("Emitting data");
        parameters.getEventEmitter().emitData(data);
    }
}
```

### 7.2. File Handling (Attachments and Streaming)

Components often need to process files, either by reading data from an incoming attachment (e.g. a CSV file from an FTP server) or by creating a new attachment with generated data (e.g. creating a PDF report). The `@elastic.io/component-commons-library` provides a convenient `AttachmentProcessor` to handle these tasks.

#### Reading and Processing Attachments

A common pattern is to check for a file URL in the message body, and if it's not there, fall back to an attachment from a previous step. The `AttachmentProcessor` can then fetch the attachment content as a stream for efficient processing or as a buffer. The example below, inspired by the Salesforce component, shows how to retrieve binary data from an attachment and encode it in base64 to be sent to an API.

**Example: Preparing Binary Data from an Attachment**
```javascript
/* eslint-disable no-param-reassign */
const { AttachmentProcessor } = require('@elastic.io/component-commons-library');
const { callJSForceMethod } = require('./wrapper'); // A helper for Salesforce API calls
const { isValidURL, getUserAgent } = require('../util'); // Utility functions

exports.prepareBinaryData = async function prepareBinaryData(msg, configuration, emitter) {
  // This function is often called from within an action's process function.
  // It modifies the msg.body in place.

  if (!configuration.utilizeAttachment) return false;
  let attachmentUrl;
  let attachmentContentType;

  // Find the binary field in the object metadata (e.g., a field named 'Body' of type 'base64')
  const objectFields = await callJSForceMethod.call(emitter, configuration, 'getObjectFieldsMetaData');
  const binField = objectFields.find((field) => field.type === 'base64');
  if (!binField) {
    emitter.logger.info('Attachment fields not found!');
    return false;
  }

  // Check if a URL is provided directly in the body field
  if (msg.body[binField.name] && isValidURL(msg.body[binField.name])) {
    attachmentUrl = msg.body[binField.name];
    emitter.logger.info('Found an attachment url in message body');
  } else if (msg.attachments && Object.keys(msg.attachments).length > 0) {
    // Fallback to the incoming message's attachments
    const attachment = msg.attachments[Object.keys(msg.attachments)[0]];
    attachmentUrl = attachment.url;
    attachmentContentType = attachment['content-type'];
    emitter.logger.info('Found an attachment url from the previous component.');
  }

  if (!attachmentUrl) return false;

  // Use AttachmentProcessor to download the file content
  const attachmentProcessor = new AttachmentProcessor(getUserAgent(), msg.id);
  const { data } = await attachmentProcessor.getAttachment(attachmentUrl, 'arraybuffer');

  // Replace the URL in the body with the base64 encoded content
  msg.body[binField.name] = data.toString('base64');

  // Optionally, add the content type to the body if the target API needs it
  if (attachmentContentType && objectFields.find((field) => field.name === 'ContentType')) {
    msg.body.ContentType = attachmentContentType;
  }
  return binField;
};
```

#### Creating and Uploading Attachments

To create a new attachment, you can provide a readable stream to the `attachmentProcessor.uploadAttachment()` method. The processor handles uploading the content to the platform's storage and provides a URL to the new attachment.

**Example: Creating an Attachment from API Data**
```javascript
const { AttachmentProcessor } = require('@elastic.io/component-commons-library');
const { callJSForceMethod } = require('./wrapper'); // A helper for Salesforce API calls
const { getUserAgent } = require('../util'); // Utility functions

exports.getAttachment = async function getAttachment(configuration, objectContent, emitter, msgId) {
  // This function finds a binary field in a Salesforce object,
  // downloads the content, and uploads it as a new attachment.

  const objectFields = await callJSForceMethod.call(emitter, configuration, 'getObjectFieldsMetaData');
  const binField = objectFields.find((field) => field.type === 'base64');
  if (!binField) return false;

  const binDataUrl = objectContent[binField.name];
  if (!binDataUrl) return false;

  // This function will be called by the AttachmentProcessor to get the file stream
  const getSfAttachment = async () => callJSForceMethod.call(
    emitter,
    configuration,
    'sobjectDownload', // This is a custom method in the Salesforce client to download the file
    { fieldName: objectContent[binField.name], id: objectContent.Id }
  );

  const attachmentProcessor = new AttachmentProcessor(getUserAgent(), msgId);
  const createdAttachmentId = await attachmentProcessor.uploadAttachment(getSfAttachment);
  const attachmentUrl = attachmentProcessor.getMaesterAttachmentUrlById(createdAttachmentId);

  // Create a new attachment object to be added to the outgoing message
  const attachment = {
    [`${objectContent.Name || 'attachment'}.bin`]: {
      url: attachmentUrl,
    },
  };

  return attachment;
};
```

### 7.3. Advanced `component.json` Properties

The `component.json` file has several properties for more advanced configurations:

*   `"deprecated": true`: Marks the component as deprecated in the UI.
*   `"buildType": "docker"`: Specifies that the component runs in a Docker container. This is the standard for all modern components.
*   **Custom `viewClass`**: You can define custom UI elements for your component's fields. For example, `"viewClass": "CodeFieldView"` provides a code editor, and `"viewClass": "CSVReadView"` can provide a specialized UI for CSV configuration.

### 7.4. Dynamic Code Execution

For advanced use cases, you can create components that execute user-provided code.

*   **Sandboxing:** It is **critical** to execute user code in a sandboxed environment to prevent security vulnerabilities. Node.js's `vm` module can be used for this purpose.
*   **Context:** You can provide a controlled context to the sandboxed code, exposing only necessary globals and libraries.

**Example of using `vm` to run user code:**
```javascript
const vm = require('vm');
// ...
const vmExports = {};
const ctx = vm.createContext({
  // Node Globals
  console,
  exports: vmExports,
  module: { exports: vmExports },
  require,
  // EIO Specific Functionality
  emitter: this,
  messages,
  msg,
  // Other Libraries
  _,
  request,
});
vm.runInContext(conf.code, ctx);
if (ctx.run && typeof ctx.run.apply === 'function') {
  // ... execute the run function
}
```

This document provides a foundational understanding of elastic.io component development. It is a living document and will be extended as new ideas and best practices emerge.