function isDebug(): boolean {
    return process.env.VAULT_DEBUG === 'true' || process.env.DEBUG === 'true'
}

export const log = (msg: string, data?: any) => {
    if (data !== undefined && isDebug()) {
        console.log(`[vault-client:info]: ${msg}: ${data}`)
    } else if (isDebug()) {
        console.log(`[vault-client:info]: ${msg}`)
    }
}

export const warn = (msg: string, data?: any) => {
    if (data !== undefined && isDebug()) {
        console.warn(`[vault-client:warn]: ${msg}: ${data}`)
    } else if (isDebug()) {
        console.warn(`[vault-client:warn]: ${msg}`)
    }
}

export const error = (msg: string, data?: any) => {
    if (data !== undefined) {
        console.error(`[vault-client:error]: ${msg}: ${data}`)
    } else {
        console.error(`[vault-client:error]: ${msg}`)
    }
}
