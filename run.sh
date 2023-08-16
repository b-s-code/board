#!/bin/bash

# need to take care of killing server manually tho
python3 -m http.server -d ./build/release/ & firefox localhost:8000
