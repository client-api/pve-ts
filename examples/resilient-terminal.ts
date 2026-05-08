/**
 * Example: resilient terminal session that auto-reconnects on glitch.
 *
 * Run with:
 *   PVE_HOST=https://pve.example.com:8006 \
 *   PVE_TOKEN='PVEAPIToken=root@pam!auto=...' \
 *   PVE_NODE=orca PVE_VMID=100 \
 *   npx tsx examples/resilient-terminal.ts
 */

import { Configuration, connectTerminalResilient } from '../src';

async function main() {
    const token = process.env.PVE_TOKEN ?? '';
    const config = new Configuration({
        basePath: `${process.env.PVE_HOST ?? 'https://localhost:8006'}/api2/json`,
        apiKey: (name) => (name === 'Authorization' ? token : ''),
    });

    const session = await connectTerminalResilient(
        config,
        {
            kind: 'qemu',
            node: process.env.PVE_NODE ?? 'pve1',
            vmid: Number(process.env.PVE_VMID ?? 100),
        },
        {
            onMessage: (text) => process.stdout.write(text),
            onClose: (event) => console.log(`\n[final close: ${event.code}]`),
        },
        {
            maxRetries: 20,
            initialDelayMs: 250,
            onReconnect: (attempt) => console.log(`\n[reconnected after ${attempt} attempts]`),
            onGiveUp: (err) => console.error(`\n[retries exhausted]`, err),
        },
    );

    // Long-running session: send a command every 30 s.
    session.resize(120, 32);
    const interval = setInterval(() => session.send("date\n"), 30_000);
    session.send("date\n");

    // Run for 5 minutes, then close.
    setTimeout(() => {
        clearInterval(interval);
        session.close();
    }, 5 * 60 * 1000);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
