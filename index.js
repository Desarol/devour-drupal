/**
 * @file
 *
 * Support for things like File uploads will need to be added on top of regular
 * APIs as these require custom headers and binary bodies rather than serialized
 * JSON.
 * 
 * Devour's API provides a lot of JSON:API specific serialization and request
 * generation out of the box which the Drupal community can build on top of to
 * the extend and streamline usage of the JSON:API module.
 */

const JsonApi = require('devour-client')

const jsonapi = new JsonApi({
  logger: false,
  apiUrl: 'https://example.com/jsonapi',
  pluralize: false
})

/**
 * We can do this automatically with access to JSON:API Schema.
 * It's probably best that configuration is cached so that it does
 * not need to be fetched before every initialization of the client.
 * 
 * Models must be defined before you can fetch them. Here's a simple model:
 */
jsonapi.define('node--article', {
  nid: '',
})

/**
 * Devour assumes resources are locatable at their direct path:
 * 
 * ie.
 *  - default devour: /jsonapi/node--article
 *  - drupal resource: /jsonapi/node/article
 * 
 * We have to transform this URL such that it correctly finds the
 * Drupal resources. This middleware replaces "[entity_type]--[entity_bundle]"
 * with "[entity_type]/[entity_bundle]" in the URL.
 */
jsonapi.insertMiddlewareBefore('axios-request', {
  name: 'drupalize-url',
  req: (payload) => {
    const modelParts = payload.req.model.split('--')
    payload.req.url = payload.req.url.replace(payload.req.model, `${modelParts[0]}/${modelParts[1]}`)
    return payload
  }
})

/**
 * Use regular Devour API's to access Drupal data.
 */
jsonapi.findAll('node--article').then(console.log)

module.exports.JsonApi = jsonapi