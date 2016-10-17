# webappatron

an awesome react app setup

## Usage


```
mkdir my-project
cd my-project
npm init
…
npm install --save webappatron
webappatron init
git init
git commit -m init
webappatron start
open http://localhost:3000
```


### The Problem:

Making single page react web apps using es2016 & React requires way too much setup


This project aims to solve that problem with smart defaults that works for most apps. The hope is that we can provide unobtrusive ways to override these defaults when customization is needed.


## The Build

- We build one server.js file
- We build one browser.js file
- We build one browser.css file
- We serve the same `index.html` in response to all uncaught GET requests

## The Server


#### In development

We run a proxy server that restarts when changes are detected?
Do we use nodemon for this?

We could start a webpack watcher and then use `nodemon build/server.js` watching for changes in the build dir

We could also add the webpack-dev-middleware with hot module reloading for just the `webpack.browser.js` config

#### In production


### File structure


```
.
├── build
├── server
│   ├── index.js
├── browser
│   ├── index.js
│   ├── index.sass
```


## Deploy optimizations

Is webpacking a node server really an optimization?

### Heroku

add this to your `package.json` to significantly shrink the size of your slug

```
TODO: look this up later
```

## Future Features

- support for multiple browser.{js,css} files
