#!/bin/bash
set -e

docker build --no-cache -t tomhoon/dw-lms-pub-app:latest .
docker push tomhoon/dw-lms-pub-app:latest