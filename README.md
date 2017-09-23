# SarClient

[![Travis-CI Build Status](https://travis-ci.org/sea-watch/SAR-Client.svg?branch=master)](https://travis-ci.org/sea-watch/SAR-Client)
[![AppVeyor Build status](https://ci.appveyor.com/api/projects/status/junqykua8xanmt9f/branch/master?svg=true)](https://ci.appveyor.com/project/xroboter/sar-client/branch/master)

## About
We want to improve the coordination of the rescue missions in the Mediterranean. The best way to do that is with a specialised app that makes it possible to share information on the position and situation of rafts in distress.

This project was generated with [angular-cli](https://github.com/angular/angular-cli).
## Installation

### Install Dependencies

Run `bower install` to install bower dependencies.

Run `npm install` to install npm dependencies.

### Modify config files

Add the remote db to:
/src/config/config.js

Add remote db and mail credentials for services in
/script/services/config.js

## Run Application

Run `npm run electron` to build angular and electron application.

Run `ng serve` inside the src/ directory to build and serve the angular application. 

## Services
If you want to use the services you also need to update the script/services/config.js with your couchDB remote and login data.

If you want to use the create_user.js service, please modify the script/_security-docs/_security-couchdb.json and insert your couchDB admin there.




## Contributing

Please see our [contributors guide](CONTRIBUTING.md) for details on how to contribute to the project. Thank you!

## Release New Version

Version examples:

- Stable release: `1.1.0`
- Alpha release: `1.1.0-alpha.1`, `1.1.0-alpha.2`
- Beta release. `1.1.0-beta.1`, `1.1.0-beta.2`
- Release candidate: `1.0.0-rc.1`

Use the following commands to create a new release:

1. Set new `version` in `package.json` (e.g. `"version": "0.2.0-rc.1"`)
1. Commit `package.json` file after changing the version
1. Push commit
1. Create git tag via `git tag v<version>` (e.g. `git tag v0.1.0-alpha.2`)
1. Push git tags via `git push --tags`

Travis-CI and Appveyor will build the release artifacts and upload them to
the GitHub releases page.

