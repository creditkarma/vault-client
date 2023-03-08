#!/usr/bin/env node
import got from 'got'

// Defined in docker-compose.yml
export const clientToken = 'root_token'

setTimeout(async () => {
    console.log(
        `Enabling Vault's v1 Key/Value secrets engine (newer Vault images default to v2)`,
    )
    try {
        await got.delete('http://localhost:8200/v1/sys/mounts/secret', {
            headers: {
                'X-Vault-Token': clientToken,
            },
        })
        await got.post('http://localhost:8200/v1/sys/mounts/secret', {
            headers: {
                'X-Vault-Token': clientToken,
            },
            json: {
                path: 'secret',
                type: 'kv',
                generate_signing_key: true,
                config: { id: 'secret' },
                options: { version: 1 },
            },
        })
    } catch (err) {
        console.log(`An error occured during vault bootstrap: ${err}`)
    }
}, 2000)
