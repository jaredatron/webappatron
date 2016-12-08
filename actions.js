const fs = require('fs-extra');
const path = require('path');
const { spawn, exec } = require('child-process-promise');
const rmdir = require('rmdir');
const chalk = require('chalk')
const resolveBin = require('resolve-bin').sync
const { appRoot, appPath, relativeAppPath, modulePath } = require('./config/paths')

const init = () => {
  return new Promise((resolve, reject) => {

    const appPackage = require(appPath('package.json'))
    if (!appPackage.scripts) appPackage.scripts = {}
    appPackage.scripts.start = 'webappatron start'
    appPackage.scripts.build = 'webappatron build'
    appPackage.scripts.test  = 'webappatron test'

    fs.writeFileSync(
      appPath('package.json'),
      JSON.stringify(appPackage, null, 2)
    );

    // copy the skeleton into the app directory
    fs.copySync(modulePath('template'), appRoot);

    // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
    // See: https://github.com/npm/npm/issues/1862
    fs.move(appPath('gitignore'), appPath('.gitignore'), [], function (err) {
      if (err) {
        // Append if there's already a `.gitignore` file there
        if (err.code === 'EEXIST') {
          var data = fs.readFileSync(appPath('gitignore'));
          fs.appendFileSync(appPath('.gitignore'), data);
          fs.unlinkSync(appPath('gitignore'));
        } else {
          reject(err)
        }
      }
      resolve()
    });

  })
}


const builder = (name, buildCommand) => {
  return (watch) => {
    const [cmd, ...args] = buildCommand(watch)
    return spawn(cmd, args, {stdio: 'inherit'})
      .catch(error => {
        console.log(chalk.red(name+': error'))
        console.log(error)
        throw error
      })
  }
}


const buildServer = builder('buildServer', (watch) => {
  const cmd = [modulePath('bin/babel-cli'), relativeAppPath('server'),  '--out-dir', relativeAppPath('build/server')]
  if (watch) cmd.push('--watch')
  return cmd
})


const buildBrowser = builder('buildBrowser', (watch) => {
  const cmd = [modulePath('bin/babel-cli'), relativeAppPath('browser'), '--out-dir', relativeAppPath('build/browser')]
  if (watch) cmd.push('--watch')
  return cmd
})


const buildWebpack = builder('buildWebpack', (watch) => {
  const cmd = [resolveBin('webpack'), '--config', modulePath('config/webpack.config.js')]
  if (watch) cmd.push('--watch')
  return cmd
})


const buildTest = builder('buildTest', (watch) => {
  const cmd = [modulePath('bin/babel-cli'), relativeAppPath('test'),  '--out-dir', relativeAppPath('build/test')]
  if (watch) cmd.push('--watch')
  return cmd
})


const rmBuildDir = () => {
  console.log(chalk.blue('removing build directory'))
  return new Promise((resolve, reject) => {
    rmdir(relativeAppPath('build'), (error) => {
      if (error && !error.message.includes('ENOENT')) {
        reject(error)
      }else{
        resolve()
      }
    })
  })
}


const buildAll = ({
  production: () => {
    return Promise.all([
      buildServer(),
      buildWebpack(),
    ])
  },
  development: (watch) => {
    return rmBuildDir().then(() => {
      return Promise.all([
        buildServer(watch),
        buildBrowser(watch),
        buildTest(watch),
        buildWebpack(watch),
      ])
    })
  },
  test: (watch) => {
    return Promise.all([
      buildServer(watch),
      buildBrowser(watch),
      buildTest(watch),
    ])
  },
})[process.env.NODE_ENV]



const waitForFileToExist = (path, callback) => {
  fs.lstat(path, (error, stats) => {
    if (stats)
      callback()
    else
      waitForFileToExist(path, callback)
  })
}

const delay = (milliseconds) =>
  new Promise(resolve =>
    setTimeout(resolve, milliseconds)
  )


const startWebServer = {
  production: () => {
    return spawn('node', [relativeAppPath('build/server')], {stdio: 'inherit'})
  },
  development: () => {
    buildAll(true)
    return delay(100).then(() => {
      return waitForFileToExist(relativeAppPath('build/server/index.js'), () => {
        spawn(resolveBin('nodemon'), [relativeAppPath('build/server'), '--watch', relativeAppPath('build/server')], {stdio: 'inherit'})
      })
    })
  },
  test: () => {
    console.warn('you cannot start the server in the text env')
  }
}[process.env.NODE_ENV]

const _runTests = (watch) => {
  const setupFilePath = appPath('buid/test/setup.js')
  const args = []
  args.push(modulePath('config/mocha-setup.js'))
  if (fs.existsSync(setupFilePath)) args.push(setupFilePath)
  args.push('--recursive')
  args.push(relativeAppPath('build/test'))
  if (watch) args.unshift('--watch')
  return spawn(resolveBin('mocha'), args, {stdio: 'inherit'})
}

const runTests = {
  production: () => {
    console.warn('you cannot run the tests in production')
    process.exit(1)
  },
  development: _runTests,
  test: () => buildAll(false).then(() => _test(false))
}[process.env.NODE_ENV]


module.exports = {
  init: init,
  buildServer: buildServer,
  buildBrowser: buildBrowser,
  buildWebpack: buildWebpack,
  buildAll: buildAll,
  startWebServer: startWebServer,
  runTests: runTests,
}
