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

    server.register({
      register: GraphQL,
      options: {
        route: {
          path: '/graphql',
          config: {}
        }
      }
    }, (err) => {
      expect(err).to.not.exist();
      done();
    });
  });

  it('can be registered without a route', (done) => {
    const server = new Hapi.Server();
    server.register({register: GraphQL}, (err) => {
      expect(err).to.exist();
      done();
    });
  });
});

describe('GraphQl', () => {
  it('define a graphql route', (done) => {
    const server = new Hapi.Server();
    server.connection();

    server.register({
      register: GraphQL,
      options: {
        route: {
          path: '/graphql',
          config: {}
        }
      }
    }, (err) => {

      expect(err).to.not.exist();

      server.start(()=> {
        server.inject('/graphql', (res) => {
          expect(res).to.not.equal(404);
          done();
        });

      });
    });
  });

});
