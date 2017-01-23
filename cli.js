process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const development = process.env.NODE_ENV === 'development'
const test = process.env.NODE_ENV === 'test'
const production = process.env.NODE_ENV === 'production'

const cli = require('commander')
const chalk = require('chalk')
const package = require('./package.json')
const { init, buildAll, startWebServer, runTests } = require('./actions')

cli.version(package.version)
cli.usage('command [options]')

const defineCommand = (name, block) => {
  block(cli.command(name))
}

defineCommand('init', command => {
  command.description('create a minimal application skeleton')
  command.action( command => {
    init().catch(fail)
  })
})

defineCommand('build', command => {
  command.description('build the app')
  if (development) {
    command.option('-w, --watch', 'watch files and automaticall rebuild')
  }
  command.action( command => {
    buildAll(command.watch).catch(fail)
  })
})

defineCommand('start', command => {
  command.description('start the app')
  if (development) {
    command.option('-B, --dont-build', 'just start the server, dont also build')
  }
  command.action( command => {
    startWebServer(command).catch(fail)
  })
})

defineCommand('test', command => {
  command._allowUnknownOption = true
  command.description('test the app')
  command.action( command => {
    runTests(process.argv.slice(3)).catch(fail)
  })
})


cli.run = () => {
  cli.parse(process.argv)
  if (cli.args.length === 0) cli.outputHelp();
}

module.exports = cli

const fail = (error) => {
  // console.warn(error)
  process.exit(error.code)
}
