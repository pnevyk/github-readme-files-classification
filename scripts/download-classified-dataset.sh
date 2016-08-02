#!/bin/bash

SCRIPTDIR=`cd "$(dirname "${BASH_SOURCE[0]}")" && pwd`
echo "downloading classified dataset... it may take a while"

mkdir -p "$SCRIPTDIR/../data/classified" 2> /dev/null
cd "$SCRIPTDIR"

cat classified-readmes.txt | node -e "
'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');

const download = require('../javascript/dataset-download.js');
const utils = require('../javascript/utils.js');

const CLASSIFIED_DIRECTORY = path.join(__dirname, '..', 'data', 'classified');

utils.console.read(content => {
    let repos = [];
    let labels = [];
    content.split(os.EOL).forEach(line => {
        if (line == '') {
            return;
        }
        
        let split = line.split(' ');
        repos.push(split[0]);
        labels.push(split[1]);
    });

    download.classified(repos, labels, (err, result) => {
        if (!err) {
            result.forEach(readme => {
                if (typeof readme[1] == 'string') {
                    let filename = readme[0] + '[' + readme[2] + '].md';
                    filename = filename.replace('/', '--');
                    fs.writeFile(path.join(CLASSIFIED_DIRECTORY, filename), readme[1]);
                }
            });
        } else {
            utils.console.write(err);
        }
    });
});
"
