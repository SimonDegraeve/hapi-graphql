import 'babel-core/register';
import 'babel-polyfill';


import Lab from 'lab';
import Code from 'code';

const lab = exports.lab = Lab.script();
const {describe, it, before, after } = lab;
const expect = Code.expect;

import Hapi from 'hapi';
import GraphQL from '../../src';

describe('Register', () => {
  it('can be registered', (done) => {
    const server = new Hapi.Server();
    server.connection();

    server.register({register: GraphQL}, (err) => {
      done();
    });
  });
});
