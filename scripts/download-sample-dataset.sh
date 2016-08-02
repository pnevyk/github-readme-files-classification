#!/bin/bash

SCRIPTDIR=`cd "$(dirname "${BASH_SOURCE[0]}")" && pwd`

mkdir -p "$SCRIPTDIR/../data/sample" 2> /dev/null
cd "$SCRIPTDIR"

echo "size of dataset:"
read -r NUMBER

echo "downloading sample dataset... it may take a while"
echo $NUMBER | node -e "
'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');

const download = require('../javascript/dataset-download.js');
const utils = require('../javascript/utils.js');

const SAMPLE_DIRECTORY = path.join(__dirname, '..', 'data', 'sample');

utils.console.read(content => {
    download.sample(Number(content), (err, result) => {
        if (!err) {
            result.forEach(readme => {
                if (typeof readme[1] == 'string') {
                    let filename = readme[0].replace('/', '--');
                    filename = filename + '.md';
                    fs.writeFile(path.join(SAMPLE_DIRECTORY, filename), readme[1]);
                }
            });
        } else {
            utils.console.write(err);
        }
    });
});
"
