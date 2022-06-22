import { expect } from '@hapi/code'
import * as Lab from '@hapi/lab'
import * as fs from 'fs'
import * as TokenDiscovery from '../../main/discovery'
import { IHVConfig } from '../../main/types'

export const lab = Lab.script()

const describe = lab.describe
const it = lab.it
const before = lab.before
const after = lab.after

describe('TokenDiscovery', () => {
    const tokenFilePath: string = '/tmp/token'
    const tokenValue: string = 'test-token'
    const mockConfig: IHVConfig = {
        apiVersion: 'v1',
        mount: 'secret',
        protocol: 'http',
        destination: '',
        namespace: '',
        tokenPath: tokenFilePath,
        requestOptions: {},
    }

    before(async () => {
        return new Promise<void>((resolve, reject) => {
            fs.writeFile(tokenFilePath, tokenValue, (err: any) => {
                resolve()
            })
        })
    })

    after(async () => {
        return new Promise<void>((resolve, reject) => {
            fs.unlink(tokenFilePath, (err) => {
                resolve()
            })
        })
    })

    describe('getToken', () => {
        it('should retrieve the token from a specified file', async () => {
            return TokenDiscovery.getToken(mockConfig).then((val: string) => {
                expect(val).to.equal(tokenValue)
            })
        })
    })
})
