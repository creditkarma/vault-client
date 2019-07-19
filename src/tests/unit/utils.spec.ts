import { expect } from '@hapi/code'
import * as Lab from '@hapi/lab'
import * as Utils from '../../main/utils'
import { IHVConfig } from '../../main/types'

export const lab = Lab.script()

const describe = lab.describe
const it = lab.it

describe('Utils', () => {
    describe('deepMerge', () => {
        it('should merge two objects', async () => {
            const obj1 = { foo: 'bar' }
            const obj2 = { one: 'two' }
            const expected = { foo: 'bar', one: 'two' }
            const actual = Utils.deepMerge(obj1, obj2)

            expect(actual).to.equal(expected)
        })

        it('should perform a deep merge on two objects', async () => {
            const obj1 = {
                foo: 'bar',
                obj: {
                    one: 'one',
                    three: 'three',
                },
            }
            const obj2 = {
                obj: {
                    one: 'two',
                    four: 'four',
                },
            }
            const expected = {
                foo: 'bar',
                obj: {
                    one: 'two',
                    three: 'three',
                    four: 'four',
                },
            }
            const actual = Utils.deepMerge(obj1, obj2)

            expect(actual).to.equal(expected)
        })
    })

    describe('resolveConfig', () => {
        it('should apply options to default config', async () => {
            const options: Partial<IHVConfig> = {
                destination: 'localhost:8000',
                namespace: 'path',
                requestOptions: {
                    headers: {
                        host: 'localhost',
                    },
                },
            }
            const expected: IHVConfig = {
                apiVersion: 'v1',
                protocol: 'http',
                destination: 'localhost:8000',
                mount: '/secret',
                namespace: 'path',
                tokenPath: '/tmp/token',
                requestOptions: {
                    headers: {
                        host: 'localhost',
                    },
                },
            }
            const actual = Utils.resolveConfig(options)

            expect(actual).to.equal(expected)
        })
    })

    describe('resolveSecretPath', () => {
        it('should correctly join a secret path', async () => {
            const mount: string = 'secret'
            const namespace: string = 'what'
            const secret: string = 'key'
            const actual: string = Utils.resolveSecretPath(
                mount,
                namespace,
                secret,
            )
            const expected: string = 'secret/what/key'

            expect(actual).to.equal(expected)
        })

        it('should correctly handle extra slashes', async () => {
            const mount: string = 'secret/'
            const namespace: string = '/what/'
            const secret: string = '/key'
            const actual: string = Utils.resolveSecretPath(
                mount,
                namespace,
                secret,
            )
            const expected: string = 'secret/what/key'

            expect(actual).to.equal(expected)
        })

        it('should remove leading slash', async () => {
            const mount: string = '/secret/'
            const namespace: string = '/what/'
            const secret: string = '/key'
            const actual: string = Utils.resolveSecretPath(
                mount,
                namespace,
                secret,
            )
            const expected: string = 'secret/what/key'

            expect(actual).to.equal(expected)
        })

        it('should remove trailing slash', () => {
            const mount: string = '/secret/'
            const namespace: string = '/what/'
            const secret: string = '/key/'
            const actual: string = Utils.resolveSecretPath(
                mount,
                namespace,
                secret,
            )
            const expected: string = 'secret/what/key'

            expect(actual).to.equal(expected)
        })
    })
})
