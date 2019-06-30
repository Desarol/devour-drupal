const DevourDrupal = require('devour-drupal')

const getClient = async () => {
  const client = new DevourDrupal({ baseUrl: 'https://dev-example.pantheonsite.io' })
  await client.init('https://dev-example.pantheonsite.io/openapi/jsonapi?_format=json')
  client.addBearer('EXAMPLE_BEARER_TOKEN')
  return client
}

const useClient = async () => {
  const client = await getClient()
  const { data } = await client.devour.findAll('node--article', { include: 'uid' })
  console.log(data)
}

useClient()