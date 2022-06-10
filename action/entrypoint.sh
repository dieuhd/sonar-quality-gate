#!/bin/sh -l
argv=""
for var in "$@"
do
    argv="$argv -D $var "
done

# run quality gate
quality-gate $argv