# Laravel Zodgen

This is a package that generates [Zod](https://zod.dev) schemas from Laravel FormRequests. This allows you to share your validation rules between your Laravel backend and your TypeScript frontend.

## Features

- Generate Zod schemas from Laravel FormRequests
- Support Nested arrays and objects

## Supported Versions
This library supports the following versions:

- Laravel 9.x and 10.x
- TypeScript 5.0 and above

## Installation

```bash
$ npm install -D @7nohe/laravel-zodgen
```

## Usage

Edit package.json
```json
{
    "scripts": {
        "zodgen": "laravel-zodgen"
    },
}
```

```bash
$ npm run zodgen
```

## Example

For example, you have the FormRequest class below.

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'body' => 'required|string',
        ];
    }
}

```

After running the `zodgen` command, you will get the following output.

```ts
export const StorePostRequest = z.object({
    title: z.string().max(255).nonempty(),
    body: z.string().nonempty()
});
```

Optionally you can use `--coercion` option to coerce primitive values.

```ts
export const StorePostRequest = z.object({
    title: z.coerce.string().max(255).nonempty(),
    body: z.coerce.string().nonempty()
});
```

## Available options

```bash
Usage: laravel-zodgen [options]

Generate Zod schemas from Laravel FormRequests

Options:
  -V, --version         output the version number
  -o, --output <value>  Output directory (default: "resources/js")
  --form-request-path   Path for Laravel's FormRequest classes
  --coercion            Coercion for primitives (default: false)
  -h, --help            display help for command
```

## Development

### Setup example project

```bash
$ cd examples/laravel10-app
$ cp .env.example .env
$ docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php81-composer:latest \
    composer install --ignore-platform-reqs
$ ./vendor/bin/sail up -d
$ ./vendor/bin/sail php artisan key:generate
$ ./vendor/bin/sail php artisan migrate --seed
$ ./vendor/bin/sail npm install
```

### Debug

```bash
$ pnpm install
$ sh debug.sh
```
