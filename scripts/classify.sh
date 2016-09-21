#!/bin/bash

FILEPATH=`readlink -f $1`
SCRIPTDIR=`cd "$(dirname "${BASH_SOURCE[0]}")" && pwd`
cd "$SCRIPTDIR"

export ANACONDA_PYTHON_PATH=~/anaconda3/bin/python

node ../classifier/classify.js $FILEPATH
