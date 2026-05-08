/**
 * Example: list cluster nodes.
 *
 * Run with:
 *   PVE_HOST=https://pve.example.com:8006 \
 *   PVE_TOKEN='PVEAPIToken=root@pam!auto=...' \
 *   npx tsx examples/list-nodes.ts
 */

import { Configuration, Pve } from '../src';

async function main() {
    const token = process.env.PVE_TOKEN ?? '';
    const config = new Configuration({
        basePath: `${process.env.PVE_HOST ?? 'https://localhost:8006'}/api2/json`,
        // apiKey is called per security scheme (`Authorization`,
        // `PVEAuthCookie`, `CSRFPreventionToken`); supply the token
        // for the Authorization slot.
        apiKey: (name) => (name === 'Authorization' ? token : ''),
    });
    const pve = new Pve(config);

    const result = await pve.nodes().getNodes();
    const nodes = result.data ?? [];
    console.log(`Found ${nodes.length} node(s):`);
    for (const node of nodes) {
        console.log(`  - ${node.node} (status=${node.status}, cpu=${node.cpu}, mem=${node.mem}/${node.maxmem})`);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
