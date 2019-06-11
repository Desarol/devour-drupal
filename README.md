# devour-drupal

### Roadmap
- [ ] Integrate a schema definition so that models can be defined automatically
- [ ] Add support for common use-cases (ie. file uploads)

### Modules exporting model schemas

- [Schemata](https://www.drupal.org/project/schemata)
- [JSON:API Schema](https://www.drupal.org/project/jsonapi_schema)

### Differences between `JSON Schema` and `Open API`

- `JSON Schema`
  - Handles describing typed data
  - Data types for arguments and responses
- `OpenAPI`
  - Handles describing routes and the information about them
  - Uses `JSON Schema` to describe arguments, params, and response data
