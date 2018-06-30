# registrar-middleware

`registrar-middleware` is a very simple API that proxies authenticated requests to the nOS
[name-service](https://github.com/nos/name-service) smart contract.

## Installation

1. Install dependencies: `yarn install`
2. (optional) Copy env file: `cp .env.local.example .env.local`

## Usage

Running `registrar-middleware` depends on the `NETWORK`, `AUTH_TOKEN`, `CONTRACT_ADDRESS` and
`CONTRACT_WIF` environment variables being set.  Either specify these via an `.env.local` file, or
pass them as command line arguments when running the below commands.

### Production

```bash
$ yarn start
```

### Development

```bash
$ yarn dev
```
