#!/bin/sh
set -xe

npm run build
cd build && ncc build index.js -o dist && mv dist/index.js ../cmd/boilerplate/dev/
cd .. && rm -rf cmd/boilerplate/dev/build && mv .moul/public/build cmd/boilerplate/dev/
mv cmd/boilerplate/dev/build/_assets cmd/boilerplate/dev/build/assets
mv cmd/boilerplate/dev/build/_shared cmd/boilerplate/dev/build/shared
rm -rf cmd/boilerplate/app && cp -R app cmd/boilerplate/ && rm -rf cmd/boilerplate/app/data