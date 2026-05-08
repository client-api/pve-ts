/**
 * Example: open a terminal session against a QEMU VM and run a command.
 *
 * Run with:
 *   PVE_HOST=https://pve.example.com:8006 \
 *   PVE_TOKEN='PVEAPIToken=root@pam!auto=...' \
 *   PVE_NODE=orca PVE_VMID=100 \
 *   npx tsx examples/terminal.ts
 */

import { Configuration, Pve } from '../src';

async function main() {
    const token = process.env.PVE_TOKEN ?? '';
    const config = new Configuration({
        basePath: `${process.env.PVE_HOST ?? 'https://localhost:8006'}/api2/json`,
        apiKey: (name) => (name === 'Authorization' ? token : ''),
    });
    const pve = new Pve(config);
    const node = process.env.PVE_NODE ?? 'pve1';
    const vmid = Number(process.env.PVE_VMID ?? 100);

    console.log(`Opening terminal on ${node}:qemu/${vmid}...`);
    const session = await pve.connectTerminal(
        { kind: 'qemu', node, vmid },
        {
            onMessage: (text) => process.stdout.write(text),
            onClose: (event) => console.log(`\n[closed: ${event.code} ${event.reason}]`),
            onError: (event) => console.error(`\n[error: ${event}]`),
        },
    );

    // Resize the pty to a sensible size and run a single command.
    session.resize(120, 32);
    session.send('uname -a\n');

    // Read for 5 seconds, then close.
    await new Promise((r) => setTimeout(r, 5000));
    session.close();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
