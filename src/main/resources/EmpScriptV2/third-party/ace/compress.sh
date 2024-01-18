#!/bin/bash
for file in *.js; do
    if [[ -f "$file" ]]; then
	echo $file
        uglifyjs  $file -o $file
    fi
done
