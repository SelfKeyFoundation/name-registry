# selfkey-name-registry

Smart contract for registering names for Selfkey Identity.

* `develop` — [![CircleCI](https://circleci.com/gh/SelfKeyFoundation/selfkey-name-registry/tree/develop.svg?style=svg)](https://circleci.com/gh/SelfKeyFoundation/selfkey-name-registry/tree/develop) [![codecov](https://codecov.io/gh/SelfKeyFoundation/selfkey-name-registry/branch/develop/graph/badge.svg)](https://codecov.io/gh/SelfKeyFoundation/selfkey-name-registry)
* `master` — [![CircleCI](https://circleci.com/gh/SelfKeyFoundation/selfkey-name-registry/tree/master.svg?style=svg)](https://circleci.com/gh/SelfKeyFoundation/selfkey-name-registry/tree/master) [![codecov](https://codecov.io/gh/SelfKeyFoundation/selfkey-name-registry/branch/master/graph/badge.svg)](https://codecov.io/gh/SelfKeyFoundation/selfkey-name-registry)

## Overview

The `NameRegistry` contract provides the following functionality.

1. Addresses are able to register any 32 byte value linked to it. Staking is required in order to
register a name. For more information about staking, check the [selfkey-staking](https://github.com/SelfKeyFoundation/selfkey-staking) project
documentation.

2. Names can be revoked by withdrawing the stake associated with it.

3. The contract is able to "resolve" a name into its corresponding address, as long as its
associated stake is still in place.

## Development

All smart contracts are being implemented in Solidity `0.4.23`.

### Prerequisites

* [NodeJS](htps://nodejs.org), version 9.5+ (I use [`nvm`](https://github.com/creationix/nvm) to manage Node versions — `brew install nvm`.)
* [truffle](http://truffleframework.com/), which is a comprehensive framework for Ethereum development. `npm install -g truffle` — this should install Truffle v4+.  Check that with `truffle version`.

### Initialization

    npm install

### Testing

#### Standalone

    npm test

or with code coverage

    npm run test:cov

#### From within Truffle

Run the `truffle` development environment

    truffle develop

then from the prompt you can run

    compile
    migrate
    test

as well as other Truffle commands. See [truffleframework.com](http://truffleframework.com) for more.

### Linting

We provide the following linting options

* `npm run lint:sol` — to lint the Solidity files, and
* `npm run lint:js` — to lint the Javascript.

## Contributing

Please see the [contributing notes](CONTRIBUTING.md).
