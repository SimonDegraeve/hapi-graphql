/**
 * Import dependencies
 */
import Joi from 'joi';
import Boom from 'boom';
import {Stream} from 'stream';
import {graphql} from 'graphql';
import {formatError} from 'graphql/error';
import {version} from '../package.json';
import renderGraphiQL from './renderGraphiQL';

/**
 * Define constants
 */
const optionsSchema = {
  query: [
    Joi.func(),
    Joi.object({
      schema: Joi.object().required(),
      rootValue: Joi.object(),
      pretty: Joi.boolean(),
      graphiql: Joi.boolean()
    }).required()
  ],
  route: Joi.object().keys({
    path: Joi.string().required(),
    config: Joi.object()
  }).required()
};


/**
 * Define helper: get options from object/function
 */
const getOptions = (options, request) => {
  // Get options
  const optionsData = typeof options === 'function' ? options(request) : options;

  // Validate options
  const validation = Joi.validate(optionsData, optionsSchema.query);
  if (validation.error) {
    throw validation.error;
  }
  return validation.value;
};


/**
 * Define helper: parse payload
 */
const parsePayload = async (request) => {
  // Read stream
  const result = await new Promise((resolve) => {
    if (request.payload instanceof Stream) {
      let data = '';
      request.payload.on('data', chunk => data += chunk);
      request.payload.on('end', () => resolve(data));
    }
    else {
      resolve('{}');
    }
  });

  // Return normalized payload
  return request.mime === 'application/graphql' ? {query: result} : JSON.parse(result);
};


/**
 * Define helper: get GraphQL parameters from query/payload
 */
const getGraphQLParams = (request, payload = {}) => {
  // GraphQL Query string.
  const query = request.query.query || payload.query;

  // Parse the variables if needed.
  let variables = request.query.variables || payload.variables;
  if (variables && typeof variables === 'string') {
    try {
      variables = JSON.parse(variables);
    }
    catch (error) {
      throw Boom.badRequest('Variables are invalid JSON.');
    }
  }

  // Name of GraphQL operation to execute.
  const operationName = request.query.operationName || payload.operationName;

  // Return params
  return {query, variables, operationName};
};

/**
 * Helper function to determine if GraphiQL can be displayed.
 */
const canDisplayGraphiQL = (request, data) => {

  // If `raw` exists, GraphiQL mode is not enabled.
  var raw = request.query.raw !== undefined || data.raw !== undefined;

  // Allowed to show GraphiQL if not requested as raw and this request
  // prefers HTML over JSON.
  const accept = accepts(request.raw.req);
  return !raw && accept.type(['json', 'html']) === 'html';
};


/**
 * Define GraphQL runner
 */
const runGraphQL = async (params, schema, rootValue, showGraphiQL) => {

  const { query, variables, operationName } = params;

  if (!query) {
    if (showGraphiQL) {
      return null;
    }

    throw Boom.badRequest('Must provide query string.');
  }

  // Run GraphQL query.
  const result = await graphql(schema, query, rootValue, variables, operationName);

  // Format any encountered errors.
  if (result.errors) {
    result.errors = result.errors.map(formatError);
  }

  // Return GraphQL result
  return result;
};


/**
 * Define handler
 */
const handler = (route, options = {}) => async (request, reply) => {
  try {
    // Get GraphQL options given this request.
    const {schema, rootValue, pretty, graphiql} = getOptions(options, request);

    // Set up JSON output settings
    if (pretty) {
      request.route.settings.json.space = 2;
    }

    // Parse payload
    const payload = await parsePayload(request);

    // Get GraphQL params from the request and POST body data.
    const params = await getGraphQLParams(request, payload);

    // Can we show graphiQL?
    const showGraphiQL = graphiql && await canDisplayGraphiQL(request, payload);

    // Run GraphQL
    const result = await runGraphQL(params, schema, rootValue, showGraphiQL);

    // Show GraphiQL if we can
    if (showGraphiQL) {
      const { query, variables } = params;
      console.log('graphiql', renderGraphiQL);
      return reply(renderGraphiQL({ query, variables, result }));
    }

    // Return result
    return reply(result)
      .code(result.hasOwnProperty('data') ? 200 : 400);
  }
  catch (error) {
    // Return error
    return reply(error);
  }
};


/**
 * Define handler defaults
 */
handler.defaults = (method) => {
  if (method === 'post') {
    return {
      payload: {
        output: 'stream'
      }
    };
  }
  return {};
};


/**
 * Define plugin
 */
function register(server, options = {}, next) {
  // Validate options
  const validation = Joi.validate(options, optionsSchema);
  if (validation.error) {
    throw validation.error;
  }
  const {route, query} = validation.value;

  // Register handler
  server.handler('graphql', handler);

  // Register route
  server.route({
    method: ['get', 'post'],
    path: route.path,
    config: route.config,
    handler: {
      graphql: query
    }
  });

  // Done
  return next();
}


/**
 * Define plugin attributes
 */
register.attributes = {name: 'graphql', version};


/**
 * Export plugin
 */
export default register;
