#!/usr/bin/env sh

pnpm run build
cd ./examples/laravel10-app
./vendor/bin/sail restart laravel.test
./vendor/bin/sail bash -c "rm -rf /var/www/html/node_modules/@7nohe/laravel-zodgen"
./vendor/bin/sail bash -c "cp -R /laravel-zodgen/dist /var/www/html/node_modules/@7nohe/laravel-zodgen"
./vendor/bin/sail npm run zodgen
