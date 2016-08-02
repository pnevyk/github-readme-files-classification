#!/bin/bash

SCRIPTDIR=`cd "$(dirname "${BASH_SOURCE[0]}")" && pwd`

mkdir -p "$SCRIPTDIR/../data/classified" 2> /dev/null
cd "$SCRIPTDIR"

ls -1 "$SCRIPTDIR/../data/classified" | node -e "
'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');

const features = require('../javascript/feature-extraction.js');
const utils = require('../javascript/utils.js');

const CLASSIFIED_DIRECTORY = path.join(__dirname, '..', 'data', 'classified');
const EXTRACTED_FILENAME = path.join(__dirname, '..', 'data', 'classified.csv');

utils.console.read(content => {
    let header = features.list();
    header.push('Label');
    let output = header.join(',') + os.EOL;

    content.split(os.EOL).forEach(filename => {
        if (filename == '') {
            return;
        }

        let markdown = fs.readFileSync(path.join(CLASSIFIED_DIRECTORY, filename)).toString();
        let extracted = features.extract(markdown);

        let label;
        filename = filename.replace(/\[([^\]]+)\]/, (match, group) => {
            label = group;
            return '';
        });

        output += path.basename(filename, '.md') + ',';
        output += extracted.join(',') + ',' + label + os.EOL;
    });

    fs.writeFile(EXTRACTED_FILENAME, output);
});
"
