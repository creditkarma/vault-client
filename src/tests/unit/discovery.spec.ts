import { expect } from '@hapi/code'
import * as Lab from '@hapi/lab'
import * as TokenDiscovery from '../../main/discovery'

export const lab = Lab.script()

const describe = lab.describe
const it = lab.it

describe('TokenDiscovery', () => {
    describe('cleanLastChar', () => {
        it('should remove trailing \\n character from string', async () => {
            const test: string = 'This is a test\n'
            const actual: string = TokenDiscovery.cleanLastChar(test)
            const expected: string = 'This is a test'
            expect(actual).to.equal(expected)
        })

        it('should remove trailing \\r character from string', async () => {
            const test: string = 'This is a test\r'
            const actual: string = TokenDiscovery.cleanLastChar(test)
            const expected: string = 'This is a test'
            expect(actual).to.equal(expected)
        })

        it('should return a string without trailing newline unaltered', async () => {
            const test: string = 'This is a test'
            const actual: string = TokenDiscovery.cleanLastChar(test)
            const expected: string = 'This is a test'
            expect(actual).to.equal(expected)
        })
    })
})
