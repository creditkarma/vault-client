import { CoreOptions } from 'request'
import { getToken } from './discovery'
import { HVFail, HVInvalidResponse } from './errors'
import * as logger from './logger'
import { HttpProtocol, IHVConfig, IReadResult } from './types'
import * as utils from './utils'
import { VaultService } from './VaultService'

export interface IVaultClientArgs {
    apiVersion?: 'v1'
    protocol?: HttpProtocol
    destination?: string
    requestOptions?: CoreOptions
    mount?: string
    namespace?: string
    tokenPath?: string
}

const INIT_TOKEN: string = '[init]'
const ERROR_TOKEN: string = '[error]'

export class VaultClient {
    private service: VaultService
    private config: IHVConfig
    private token: string
    private mount: string
    private namespace: string

    constructor(config: IVaultClientArgs, service?: VaultService) {
        this.config = utils.resolveConfig(config)
        this.mount = this.config.mount
        this.namespace = this.config.namespace
        this.service = service || new VaultService(this.config)
        this.token = INIT_TOKEN
    }

    public get<T>(key: string, options: CoreOptions = {}): Promise<T> {
        return this.getToken().then((tokenValue: string) => {
            const secretPath: string = utils.resolveSecretPath(this.mount, this.namespace, key)
            return this.service.read(secretPath, tokenValue, options).then((result: IReadResult) => {
                if (result.data && result.data.value) {
                    return result.data.value
                } else {
                    logger.warn('Invalid response from Vault: ', result)
                    throw new HVInvalidResponse(key)
                }
            })
        })
    }

    public set<T>(key: string, value: T, options: CoreOptions = {}): Promise<void> {
        return this.getToken().then((tokenValue: string) => {
            const secret: string = utils.resolveSecretPath(this.mount, this.namespace, key)
            return this.service.write(secret, { value }, tokenValue, options)
        })
    }

    private async getToken(): Promise<string> {
        switch (this.token) {
            case INIT_TOKEN:
                logger.log(`Loading token from file[${this.config.tokenPath}]`)
                return getToken(this.config).then((tokenValue: string) => {
                    logger.log(`Token loaded from file[${this.config.tokenPath}]`)
                    this.token = tokenValue
                    return this.token
                }, (err: any) => {
                    this.token = ERROR_TOKEN
                    throw new HVFail(`Unable to load token at path[${this.config.tokenPath}]`)
                })

            case ERROR_TOKEN:
                throw new HVFail(`Unable to load token at path[${this.config.tokenPath}]`)

            default:
                return this.token
        }
    }
}
