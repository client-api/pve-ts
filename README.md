# @client-api/pve-ts

TypeScript SDK for the Proxmox Virtual Environment (PVE) API. Generated
from the upstream `apidoc.js` via [openapi-generator-cli][gen] with
custom Mustache template overrides.

> **Not an official Proxmox project.** Community SDK derived from the
> upstream `apidoc.js`. Always verify against
> <https://pve.proxmox.com/pve-docs/api-viewer/>.

## Install

```bash
npm install @client-api/pve-ts
# or
pnpm add @client-api/pve-ts
```

## Usage

```ts
import { Configuration, Pve } from '@client-api/pve-ts';

const cfg = new Configuration({
  basePath: 'https://pve1.example.com:8006/api2/json',
  apiKey: 'PVEAPIToken=user@realm!tokenid=uuid-secret',
});
const pve = new Pve(cfg);

// Per-tag accessors are lazily instantiated and share the same Configuration.
const status = await pve.qemu().qemuVmStatus({ node: 'pve1', vmid: 100 });
const nodes = await pve.nodes().nodesIndex();
```

The unified `Pve` class wraps each per-tag API class
(`QemuApi`, `LxcApi`, `ClusterApi`, `NodesApi`, …) so consumers don't
need to instantiate them individually.

## Compound configs

PVE encodes many fields as CLI-style shorthand strings
(`net0=virtio,bridge=vmbr0,firewall=1`). Round-trip helpers are
emitted for every compound config schema:

```ts
import { PveQemuNetConfigToShorthand, PveQemuNetConfigFromShorthand } from '@client-api/pve-ts';

const shorthand = PveQemuNetConfigToShorthand({
  model: 'virtio',
  bridge: 'vmbr0',
  firewall: 1,
});
// → 'virtio,bridge=vmbr0,firewall=1'

const parsed = PveQemuNetConfigFromShorthand(shorthand);
```

## Indexed families

Numbered properties (`net0..net31`, `mp0..mp255`, …) are exposed on
every model as a single collapsed `nets` / `mps` / … field:

```ts
const req = {
  nets: {
    0: 'virtio,bridge=vmbr0',
    3: 'e1000,bridge=vmbr1',
  },
};
// Wire format: { net0: 'virtio,bridge=vmbr0', net3: 'e1000,bridge=vmbr1' }
```

## License

Apache 2.0 — see [LICENSE](./LICENSE).

[gen]: https://openapi-generator.tech
