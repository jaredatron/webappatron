console.log('webappatron mocha setup')
process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT || '3000';

const { appPath } = require('./paths')

const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const server = require(appPath('build/server')).default;


chai.use(chaiHttp);

beforeEach(() => {
  global.browserInstance = null
})

// request('GET', '/api/users/12').then(response)
const request = (method, url, postBody) => {
  // TODO only do this in server tests
  global.browserInstance = global.browserInstance || chai.request.agent(server)
  method = method.toLowerCase()
  return new Promise((resolve, reject) => {
    var req = global.browserInstance[method](url)
    if (method === 'post' && postBody) req = req.send(postBody)
    req.end((error, response) => {
      if (error && error.status >= 500) {
        console.log(error)
        reject(error)
      }else{
        resolve(response)
      }
    })
  })
}


global.browserInstance = null
global.chai = chai
global.expect = expect
global.chaiHttp = chaiHttp
global.server = server
global.request = request

