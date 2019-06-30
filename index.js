/**
 * @file
 *
 * Support for things like File uploads will need to be added on top of regular
 * APIs as these require custom headers and binary bodies rather than serialized
 * JSON.
 * 
 * Devour's API provides a lot of JSON:API specific serialization and request
 * generation out of the box which the Drupal community can build on top of to
 * extend and streamline usage of the JSON:API module.
 */

const JsonApi = require('devour-client')

function DevourDrupal({
  baseUrl,
  jsonApi = '/jsonapi',
  logger = true,
}) {
  this.baseUrl = baseUrl
  this.jsonApi = jsonApi
  this.devour = new JsonApi({
    logger,
    apiUrl: `${baseUrl}${jsonApi}`,
    pluralize: false,
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
  this.devour.insertMiddlewareBefore('axios-request', {
    name: 'drupalize-url',
    req: (payload) => {
      const modelParts = payload.req.model.split('--')
      payload.req.url = payload.req.url.replace(payload.req.model, `${modelParts[0]}/${modelParts[1]}`)
      return payload
    }
  })

  this.addBearer = function (token) {
    this.devour.headers['Authorization'] = `Bearer ${token}`
  }

  this.init = function (openApi) {
    return this.devour.axios
      .get(openApi)
      .then(response => {
        Object.keys(response.data.definitions)
          .map(key => {
            try {
              const definition = response.data.definitions[key]
              const attributes = definition.properties.data.properties.attributes
              const relationships = definition.properties.data.properties.relationships

              this.devour.define(key, {
                ...Object.keys(attributes.properties)
                      .map(key => ({
                        key,
                        value: attributes.properties[key]
                      }))
                      .reduce((prev, curr) => {
                        let type
                        switch (curr.value.type) {
                          case 'boolean':
                            type = false
                            break
                          case 'string':
                            type = ''
                            break
                          case 'float':
                          case 'integer':
                          case 'number':
                            type = 0
                            break
                          case 'object':
                            type = {}
                            break
                          case 'array':
                            type = []
                            break
                        }
                        prev[curr.key] = type
                        return prev
                      }, {}),
                ...Object.keys(relationships.properties)
                      .map(key => {
                        const relationship = relationships.properties[key]
                        const relationshipType = relationship.properties.data.type
                        let relationshipModel

                        if (relationshipType === 'array') {
                          relationshipModel = relationship.properties.data.items.properties.type.enum
                        } else {
                          relationshipModel = relationship.properties.data.properties.type.enum
                        }

                        return {
                          key,
                          value: {
                            jsonApi: relationshipType === 'array' ? 'hasMany' : 'hasOne',
                            type: relationshipModel
                          }
                        }
                      })
                      .reduce((prev, curr) => {
                        prev[curr.key] = curr.value
                        return prev
                      }, {}),
              })
            } catch (err) {
              console.error(`Failed to define model for ${key}`, err)
            }
          })
      })
      .then(() => this)
  }
}

module.exports.DevourDrupal = DevourDrupal