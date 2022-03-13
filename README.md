# is-core-module-es

> ESM fork of [is-core-module](https://github.com/inspect-js/is-core-module)

Is this specifier a node.js core module? Optionally provide a node version to check; defaults to the current node version.

## Example

```js
import { isCore } from 'is-core-module-es';
import assert from 'assert';
assert(isCore('fs'));
assert(!isCore('butts'));
```

## Tests
Clone the repo, `pnpm install`, and run `pnpm run test`.
