#!/bin/bash

SCRIPTDIR=`cd "$(dirname "${BASH_SOURCE[0]}")" && pwd`

mkdir -p "$SCRIPTDIR/../data/sample" 2> /dev/null
cd "$SCRIPTDIR"

ls -1 "$SCRIPTDIR/../data/sample" | node -e "
'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');

const features = require('../javascript/feature-extraction.js');
const utils = require('../javascript/utils.js');

const SAMPLE_DIRECTORY = path.join(__dirname, '..', 'data', 'sample');
const EXTRACTED_FILENAME = path.join(__dirname, '..', 'data', 'sample.csv');

utils.console.read(content => {
    let header = features.list();
    let output = header.join(',') + os.EOL;

    content.split(os.EOL).forEach(filename => {
        if (filename == '') {
            return;
        }

        let markdown = fs.readFileSync(path.join(SAMPLE_DIRECTORY, filename)).toString();
        let extracted = features.extract(markdown);
        output += path.basename(filename, '.md') + ',' + extracted.join(',') + os.EOL;
    });

    fs.writeFile(EXTRACTED_FILENAME, output);
});
"
