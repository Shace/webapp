Shace web app
======
[![Build Status](https://travis-ci.org/ShaceEvent/webapp.png?branch=master)](https://travis-ci.org/ShaceEvent/webapp)
[![Coverage Status](https://coveralls.io/repos/ShaceEvent/webapp/badge.png)](https://coveralls.io/r/ShaceEvent/webapp)
[![Stories in Ready](https://badge.waffle.io/ShaceEvent/webapp.png?label=ready&title=Ready)](https://waffle.io/ShaceEvent/webapp)
[![Dependency Status](https://david-dm.org/ShaceEvent/webapp.png?theme=shields.io)](https://david-dm.org/ShaceEvent/webapp)
[![devDependency Status](https://david-dm.org/ShaceEvent/webapp/dev-status.png?theme=shields.io)](https://david-dm.org/ShaceEvent/webapp#info=devDependencies)


## Installation

Requires [node.js](http://nodejs.org/).

````
git clone git@github.com:ShaceEvent/webapp.git
cd webapp
npm install -g bower grunt-cli
npm install
bower install
````

## Start the application

````
grunt serve # For devel — original files used
grunt serve:dist # For production — dist used (Minified filed) 
node heroku-server.js # For heroku
````

The application should be live at http://localhost:8000

## Running unit tests

````
grunt test
````

## Contributing

### Editor

The project use an [.editorconfig](http://editorconfig.org/) file.
Make sure your editor is compatible, or configure it to follow our standard
(See the [download section](http://editorconfig.org/#download) to see the compatible editor, we recomend using [Github's Atome](https://atom.io) or [Sublime Text](http://www.sublimetext.com)).

### Basic commands (for the newbies)

Install a package using bower:
````
bower install -S package
grunt bowerInstall # to automatically add the package in the index.html file
````

Install a package using npm:
````
npm install --save-dep package # For a devDependency
npm install --save package # For a dependency
````
