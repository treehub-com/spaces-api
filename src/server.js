const bodyparser = require('koa-bodyparser');
const cors = require('kcors');
const fs = require('fs');
const {graphql} = require('graphql');
const Koa = require('koa');
const LevelDOWN = require('leveldown');
const path = require('path');
const Router = require('koa-router');
const schema = require('./schema.js');
const Space = require('@treehub/space');

if (!process.env.DATA_PATH) {
  process.env.DATA_PATH = process.cwd();
}

const port = process.env.PORT || 8080;
const app = new Koa();
const router = new Router();
const spaces = {};

router.post('/', async (ctx) => {
  const {query, variables, operationName} = ctx.request.body;

  ctx.body = await graphql(
    schema,
    query,
    {}, // root
    {}, // ctx
    variables,
    operationName
  );
});

router.post('/:space', async (ctx) => {
  const space = await getSpace(ctx.params.space);

  let {query, variables, operationName} = ctx.request.body;

  if (typeof variables === 'string') {
    variables = JSON.parse(variables);
  }

  ctx.body = await space.request({
    query,
    variables,
    operationName,
  });
});

router.post('/:space/:tree', async (ctx) => {
  const space = await getSpace(ctx.params.space);

  let {query, variables, operationName} = ctx.request.body;

  if (typeof variables === 'string') {
    variables = JSON.parse(variables);
  }

  ctx.body = await space.request({
    tree: ctx.params.tree,
    query,
    variables,
    operationName,
  });
});

app
  .use(cors())
  .use(bodyparser({detectJSON: (ctx) => true, jsonLimit: '5mb'}))
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(port);

/* Utility Functions */

async function getSpace(id) {
  if (spaces[id] !== undefined) {
    return spaces[id];
  }

  const exists = await spaceExists(id);

  if (!exists) {
    throw new Error('Space does not exist');
  }

  spaces[id] = new Space({
    name: id,
    prefix: `${path.join(process.env.DATA_PATH, id)}${path.sep}`,
    backend: LevelDOWN,
    mode: Space.SERVER,
  });

  return spaces[id];
}

function spaceExists(id) {
  return new Promise((resolve, reject) => {
    fs.stat(path.join(process.env.DATA_PATH, id), (error) => {
      if (error) {
        if (error.code === 'ENOENT') {
          resolve(false);
        } else {
          reject(error);
        }
      } else {
        resolve(true);
      }
    });
  });
}
