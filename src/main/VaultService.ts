import { Response, OptionsOfJSONResponseBody } from 'got'

import got from 'got'

import * as logger from './logger'

import {
    HttpProtocol,
    IHealthStatusResult,
    IInitArgs,
    IInitResult,
    IListResult,
    IReadResult,
    ISealStatusResult,
    IStatusResult,
    IUnsealArgs,
    IUnsealResult,
} from './types'

import { HVFail, HVMissingResource } from './errors'

import * as utils from './utils'

import { loadSystemCerts } from './certs'

function responseAsError(res: Response): HVFail {
    let message: string
    const responseBody = res.body as any
    if (responseBody && responseBody.errors && responseBody.errors.length > 0) {
        message = responseBody.errors[0]
    } else {
        message = `Status ${res.statusCode}`
    }

    return new HVFail(message)
}

function fetch(
    options: OptionsOfJSONResponseBody,
    token?: string,
): Promise<any> {
    const requestOptions: OptionsOfJSONResponseBody =
        token !== undefined
            ? utils.deepMerge(options, {
                  headers: {
                      'X-Vault-Token': token,
                  },
              })
            : options

    return got(requestOptions).then(
        (res: Response) => {
            switch (res.statusCode) {
                case 200:
                case 204:
                    return Promise.resolve(res.body)

                case 404:
                    logger.error(`Resource not found[${requestOptions.url}]`)
                    return Promise.reject(
                        new HVMissingResource(requestOptions.url as string),
                    )

                default:
                    logger.error(`Vault failed with code[${res.statusCode}]`)
                    return Promise.reject(responseAsError(res))
            }
        },
        (err: any) => {
            logger.error(`Unable to connect[${requestOptions.url}]`)
            return Promise.reject(
                new HVFail(
                    `Unable to connect[${requestOptions.url}]. ${err.message}`,
                ),
            )
        },
    )
}

export interface IVaultServiceArgs {
    destination: string
    protocol?: HttpProtocol
    apiVersion?: 'v1'
    requestOptions?: OptionsOfJSONResponseBody
}

export class VaultService {
    private defaultOptions: OptionsOfJSONResponseBody
    private dest: string

    constructor({
        destination,
        protocol = 'http',
        apiVersion = 'v1',
        requestOptions = {},
    }: IVaultServiceArgs) {
        this.defaultOptions = {
            responseType: 'json',
            ...requestOptions,
        }
        if (protocol === 'https') {
            this.defaultOptions = utils.deepMerge(
                {
                    https: {
                        certificateAuthority: loadSystemCerts(),
                    },
                },
                this.defaultOptions,
            )
        }
        this.dest = `${protocol}://${destination}/${apiVersion}`
    }

    public health(
        token: string,
        options: OptionsOfJSONResponseBody = {},
    ): Promise<IHealthStatusResult> {
        return fetch(
            utils.deepMerge(this.defaultOptions, options, {
                url: `${this.dest}/sys/health`,
                method: 'GET',
            }),
            token,
        )
    }

    public status(
        options: OptionsOfJSONResponseBody = {},
    ): Promise<IStatusResult> {
        return fetch(
            utils.deepMerge(this.defaultOptions, options, {
                url: `${this.dest}/sys/init`,
                method: 'GET',
            }),
        )
    }

    public init(
        data: IInitArgs,
        options: OptionsOfJSONResponseBody = {},
    ): Promise<IInitResult> {
        return fetch(
            utils.deepMerge(this.defaultOptions, options, {
                url: `${this.dest}/sys/init`,
                json: data,
                method: 'PUT',
            }),
        )
    }

    public sealStatus(
        options: OptionsOfJSONResponseBody = {},
    ): Promise<ISealStatusResult> {
        return fetch(
            utils.deepMerge(this.defaultOptions, options, {
                url: `${this.dest}/sys/seal-status`,
                method: 'GET',
            }),
        )
    }

    public seal(
        token: string,
        options: OptionsOfJSONResponseBody = {},
    ): Promise<void> {
        return fetch(
            utils.deepMerge(this.defaultOptions, options, {
                url: `${this.dest}/sys/seal`,
                method: 'PUT',
            }),
            token,
        )
    }

    public unseal(
        data: IUnsealArgs,
        options: OptionsOfJSONResponseBody = {},
    ): Promise<IUnsealResult> {
        return fetch(
            utils.deepMerge(this.defaultOptions, options, {
                url: `${this.dest}/sys/unseal`,
                json: data,
                method: 'PUT',
            }),
        )
    }

    public read(
        path: string,
        token: string,
        options: OptionsOfJSONResponseBody = {},
    ): Promise<IReadResult> {
        return fetch(
            utils.deepMerge(this.defaultOptions, options, {
                url: `${this.dest}/${path}`,
                method: 'GET',
            }),
            token,
        )
    }

    public list(
        token: string,
        options: OptionsOfJSONResponseBody = {},
    ): Promise<IListResult> {
        return fetch(
            utils.deepMerge(this.defaultOptions, options, {
                url: `${this.dest}/secret?list=true`,
                method: 'GET',
            }),
            token,
        )
    }

    public write(
        path: string,
        data: any,
        token: string,
        options: OptionsOfJSONResponseBody = {},
    ): Promise<void> {
        return fetch(
            utils.deepMerge(this.defaultOptions, options, {
                url: `${this.dest}/${path}`,
                json: data,
                method: 'POST',
            }),
            token,
        )
    }
}
