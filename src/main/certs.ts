import * as childProcess from 'child_process'
import * as fs from 'fs'

const trustedCa = [
    '/etc/pki/tls/certs/ca-bundle.crt',
    '/etc/ssl/certs/ca-certificates.crt',
    '/usr/local/etc/openssl/cert.pem',
]

const splitCa = (chain: string, split: string = '\n') => {
    const ca: Array<string> = []

    if (chain.indexOf('-END CERTIFICATE-') < 0 || chain.indexOf('-BEGIN CERTIFICATE-') < 0) {
        throw new Error("File does not contain 'BEGIN CERTIFICATE' or 'END CERTIFICATE'")
    }

    const chainArray = chain.split(split)
    let certs = []

    for (const line of chainArray) {
        if (line.length > 0) {
            certs.push(line)
            if (line.match(/-END CERTIFICATE-/)) {
                ca.push(certs.join(split))
                certs = []
            }
        }
    }

    return ca
}

const loadOsxCerts = () => {
    console.log('[vault-client]: Loading certs from osx keychain')
    const keyChains = [
        '/Library/Keychains/System.keychain',
        '/System/Library/Keychains/SystemRootCertificates.keychain',
    ]
    const caList: Array<string> = keyChains
        .map((chain) => `security find-certificate -a -p ${chain}`)
        .map((cmd) => splitCa(childProcess.execSync(cmd, { encoding: 'utf8' })))
        .reduce((prev, curr) => prev.concat(curr), [])
    console.log('[vault-client]: Certs from osx keychain loaded')
    return caList
}

const loadLinuxCerts = () => {
    console.log('[vault-client]: Loading system certs')
    const caList: Array<string> = []
    for (const caFile of trustedCa) {
        if (fs.existsSync(caFile)) {
            const caInfo = fs.readFileSync(caFile, { encoding: 'utf8'} )
            caList.push(...splitCa(caInfo))
        }
    }

    console.log('[vault-client]: System certs loaded')
    return caList
}

export const loadSystemCerts = (): Array<string> => {
    // if OSX, load certs from key chains
    if (process.platform === 'darwin') {
        return loadOsxCerts()

    } else {
        return loadLinuxCerts()
    }
}
