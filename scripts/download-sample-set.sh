#!/bin/bash

SCRIPTDIR=`cd "$(dirname "${BASH_SOURCE[0]}")" && pwd`
echo "spawning requests..."
node "$SCRIPTDIR/../javascript/download-sample-set.js"
