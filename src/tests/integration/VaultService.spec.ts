import { expect, fail } from '@hapi/code'
import * as Lab from '@hapi/lab'
import { VaultService } from '../../main/VaultService'
import { IHVConfig } from '../../main/types'
import { clientToken } from './bootstrap'
import { HVMissingResource } from '../../main/errors'

export const lab = Lab.script()

const describe = lab.describe
const it = lab.it

describe('VaultService', () => {
    const mockConfig: IHVConfig = {
        apiVersion: 'v1',
        protocol: 'http',
        destination: 'localhost:8200',
        mount: 'secret',
        namespace: '',
        tokenPath: '',
        requestOptions: {},
    }
    const service = new VaultService(mockConfig)
    const mockObj = { value: 'bar' }

    describe('health', () => {
        it('should read the health status', async () => {
            return service.health(clientToken).then((res) => {
                expect(res.initialized).to.be.equal(true)
                expect(res.sealed).to.be.equal(false)
                expect(res.standby).to.be.equal(false)
            })
        })
    })

    describe('status', () => {
        it('should read the satus as { intialized: true }', async () => {
            return service.status().then((res) => {
                expect(res).to.equal({ initialized: true })
            })
        })
    })

    describe('sealStatus', () => {
        it('should correctly get seal status of vault', async () => {
            return service.sealStatus().then((res) => {
                expect(res.sealed).to.equal(false)
                expect(res).to.include([
                    'sealed',
                    't',
                    'n',
                    'progress',
                    'version',
                ])
            })
        })
    })

    describe('write', () => {
        it('should write a secret to hvault', async () => {
            return service.write('secret/mock', mockObj, clientToken)
        })
    })

    describe('list', () => {
        it('should list all secret names', async () => {
            return service.list(clientToken).then((res: any) => {
                expect(res.data.keys).to.include('mock')
            })
        })
    })

    describe('read', () => {
        it('should read an object from hvault', async () => {
            return service.read('secret/mock', clientToken).then((res: any) => {
                expect(res.data).to.equal(mockObj)
            })
        })
    })

    describe('read missing', () => {
        it('should throw when reading a missing object from hvault', async () => {
            return service.read('secret/missing', clientToken).then(
                () => {
                    fail('should have thrown HVMissingResource')
                },
                (err: any) => {
                    expect(err).to.be.equal(
                        new HVMissingResource(
                            'http://localhost:8200/v1/secret/missing',
                        ),
                    )
                },
            )
        })
    })

    describe('https protocol', () => {
        const httpsConfig = Object.assign(mockConfig, {
            protocol: 'https',
        })
        const httpsService: any = new VaultService(httpsConfig)

        it('should have multiple ca', () => {
            expect(
                httpsService.defaultOptions.https.certificateAuthority.length >
                    1,
            )
        })
    })
})
