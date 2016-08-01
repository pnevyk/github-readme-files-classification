#!/bin/bash

SCRIPTDIR=`cd "$(dirname "${BASH_SOURCE[0]}")" && pwd`
echo "spawning requests..."

mkdir -p "$SCRIPTDIR/../data/sample" 2> /dev/null
node "$SCRIPTDIR/../javascript/download-sample-set.js"
