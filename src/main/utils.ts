import * as path from 'path'
import { merge } from 'lodash'

import { IHVConfig } from './types'

export function deepMerge<A, B>(a: A, b: B): A & B
export function deepMerge<A, B, C>(a: A, b: B, c: C): A & B & C
export function deepMerge<A, B, C, D>(a: A, b: B, c: C, d: D): A & B & C & D
export function deepMerge(...args: Array<any>): any {
    return merge({}, ...args)
}

export function resolveSecretPath(
    mount: string,
    namespace: string,
    key: string,
): string
export function resolveSecretPath(...parts: Array<string>): string {
    return path.join(...parts.map(removeLeadingTrailingSlash))
}

export function removeLeadingTrailingSlash(str: string): string {
    const tmp: string =
        str.charAt(0) === '/' ? str.substring(1, str.length) : str

    if (tmp.charAt(tmp.length - 1) === '/') {
        return tmp.substring(0, tmp.length - 1)
    } else {
        return tmp
    }
}

export const DEFAULT_CONFIG: IHVConfig = {
    apiVersion: 'v1',
    protocol: 'http',
    destination: 'localhost:8200',
    mount: '/secret',
    namespace: '',
    tokenPath: '/tmp/token',
    requestOptions: {},
}

export function resolveConfig(options: Partial<IHVConfig>): IHVConfig {
    return deepMerge(DEFAULT_CONFIG, options)
}
