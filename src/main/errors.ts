import * as url from 'url'

export class HVInvalidResponse extends Error {
    constructor(key: string, message: string) {
        super(`Data returned for key[${key}] is invalid. ${message}`)
    }
}

export class HVMissingResource extends Error {
    constructor(location: string | url.Url) {
        super(`Unable to locate vault resource[${location}]`)
    }
}

export class HVFail extends Error {
    constructor(message?: string) {
        super(message)
    }
}
