import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

function createLocalStorageMock() {
    let store = {}

    return {
        getItem(key) {
            return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null
        },
        setItem(key, value) {
            store[key] = String(value)
        },
        removeItem(key) {
            delete store[key]
        },
        clear() {
            store = {}
        },
    }
}

if (!globalThis.localStorage || typeof globalThis.localStorage.clear !== 'function') {
    globalThis.localStorage = createLocalStorageMock()
}

afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
})

beforeEach(() => {
    localStorage.clear()
})
