import { expect } from '@hapi/code'
import * as Lab from '@hapi/lab'
import * as fs from 'fs'
import { execSync } from 'child_process'
import { VaultClient } from '../../main/VaultClient'
import { IHVConfig } from '../../main/types'
import { cleanLastChar } from '../../main/discovery'

export const lab = Lab.script()

const describe = lab.describe
const it = lab.it
const before = lab.before
const after = lab.after

describe('VaultClient', () => {
    const mockConfig: IHVConfig = {
        apiVersion: 'v1',
        protocol: 'http',
        destination: 'localhost:8200',
        mount: 'secret',
        namespace: '',
        tokenPath: '/tmp/token',
        requestOptions: {},
    }
    const client: VaultClient = new VaultClient(mockConfig)
    const mockStr = 'test'
    const mockNum = 5
    const mockBool = true
    const mockObj = { value: 'bar' }
    const token: string = cleanLastChar(
        execSync('curl localhost:8201/client-token').toString(),
    )

    // Client expects the token to be available in the local file system
    before(async () => {
        return new Promise<void>((resolve, reject) => {
            fs.writeFile(mockConfig.tokenPath, token, (err: any) => {
                resolve()
            })
        })
    })

    after(async () => {
        return new Promise<void>((resolve, reject) => {
            fs.unlink(mockConfig.tokenPath, (err) => {
                resolve()
            })
        })
    })

    describe('set', () => {
        it('should write an string to hvault', async () => {
            return client.set('str', mockStr)
        })

        it('should write an number to hvault', async () => {
            return client.set('num', mockNum)
        })

        it('should write an boolean to hvault', async () => {
            return client.set('bool', mockBool)
        })

        it('should write an object to hvault', async () => {
            return client.set('obj', mockObj)
        })
    })

    describe('get', () => {
        it('should read a string from hvault', async () => {
            return client.get('str').then((res: any) => {
                expect(res).to.equal(mockStr)
            })
        })

        it('should read a number from hvault', async () => {
            return client.get('num').then((res: any) => {
                expect(res).to.equal(mockNum)
            })
        })

        it('should read a boolean from hvault', async () => {
            return client.get('bool').then((res: any) => {
                expect(res).to.equal(mockBool)
            })
        })

        it('should read an object from hvault', async () => {
            return client.get('obj').then((res: any) => {
                expect(res).to.equal(mockObj)
            })
        })
    })

    describe('health', () => {
        it('should respond health check', async () => {
            return client.health().then((res: any) => {
                expect(res).to.equal(true)
            })
        })
    })
})
