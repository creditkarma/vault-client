import { expect } from '@hapi/code'
import * as Lab from '@hapi/lab'
import { execSync } from 'child_process'
import { VaultService } from '../../main/VaultService'
import { IHVConfig } from '../../main/types'
import { cleanLastChar } from '../../main/discovery'

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
    const token: string = cleanLastChar(
        execSync('curl localhost:8201/client-token').toString(),
    )

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
            return service.write('secret/mock', mockObj, token)
        })
    })

    describe('list', () => {
        it('should list all secret names', async () => {
            return service.list(token).then((res: any) => {
                expect(res.data.keys).to.include('mock')
            })
        })
    })

    describe('read', () => {
        it('should read an object from hvault', async () => {
            return service.read('secret/mock', token).then((res: any) => {
                expect(res.data).to.equal(mockObj)
            })
        })
    })

    describe('https protocol', () => {
        const httpsConfig = Object.assign(mockConfig, {
            protocol: 'https',
        })
        const httpsService: any = new VaultService(httpsConfig)

        it('should have multiple ca', () => {
            expect(httpsService.defaultOptions.ca.length).to.be.greaterThan(1)
        })
    })
})
