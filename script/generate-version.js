/**
 * Script to generate the src/config/version.js file from a template.
 */
const Mustache = require('mustache');
const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');
const nodePackage = require(path.resolve(__dirname, '..', 'package.json'));

const configDir = path.resolve(__dirname, '..', 'src', 'config');
const templateFile = path.resolve(configDir, 'version.js.mustache');
const outputFile = path.resolve(configDir, 'version.js');

const view = {
  version: nodePackage.version,
  gitRevision: () => execSync('git rev-parse --short HEAD').toString().trim(),
};

const template = readFileSync(templateFile).toString();

const output = Mustache.render(template, view);

writeFileSync(outputFile, output);
