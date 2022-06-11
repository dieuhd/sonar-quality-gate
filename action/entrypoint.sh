#!/bin/sh -l
argv=""
for var in "$@"
do
    argv="$argv $var "
done

# run quality gate
quality-gate $argv -p=github