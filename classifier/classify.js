'use strict';

const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;

const features = require('../javascript/feature-extraction.js');

const PYTHON_PATH = process.env.ANACONDA_PYTHON_PATH;
const CLASSIFIER_SCRIPT = path.join(__dirname, 'classify.py');

if (PYTHON_PATH == '') {
    console.log('Please set environment variable "ANACONDA_PYTHON_PATH" pointing to anaconda version of python.');
    process.exit();
}

var filename = process.argv[process.argv.length - 1];

fs.stat(filename, (err, stats) => {
    if (err || !stats.isFile()) {
        console.log('Please specify a readme file as last argument.');
    } else {
        fs.readFile(filename, (err, content) => {
            let extractedFeatures = features.extract(content.toString());
            let classifier = spawn(PYTHON_PATH, [CLASSIFIER_SCRIPT, extractedFeatures.join(',')]);

            classifier.stdout.on('data', data => {
                console.log(data.toString().trim());
            });

            classifier.stderr.on('data', data => {
                console.log(data.toString());
            });
        });
    }
});
