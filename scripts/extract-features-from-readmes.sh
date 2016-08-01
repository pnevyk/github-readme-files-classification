#!/bin/bash

SCRIPTDIR=`cd "$(dirname "${BASH_SOURCE[0]}")" && pwd`
OUTPUT_FILE="$SCRIPTDIR/../data/raw.csv"
mkdir "$SCRIPTDIR/../data/" 2> /dev/null

echo "\
Name,\
Document length,\
Number of sections,\
Number of code blocks,\
Code blocks length,\
Number of links,\
Number of images,\
Usage/Examples text length,\
Usage/Examples code blocks length,\
Usage/Examples code blocks count,\
Usage/Examples link presence,\
Getting started/Documentation/API text length,\
Getting started/Documentation/API code blocks length,\
Getting started/Documentation/API link presence,\
Installation/Download plain and code length,\
Installation/Download link presence,\
Support/Community/Resources links,\
Build status badge presence,\
Code coverage badge presence,\
Code quality badge presence,\
Dependency status badge presence,\
Deprecation status,\
License section/link presence,\
Contributing section/link presence,\
Authors/Team section/link presence,\
Troubleshooting section/link presence\
"> $OUTPUT_FILE
for file in $SCRIPTDIR/../data/readmes/*.md
do
    echo "extract: `basename $file .md`"
    echo -n "`basename $file .md`," >> $OUTPUT_FILE
    cat "$file" | node "$SCRIPTDIR/../javascript/extract-features.js" >> $OUTPUT_FILE
done
