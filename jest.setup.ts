// jest.setup.ts
import '@testing-library/jest-dom'

// Mock fetch globally
global.fetch = jest.fn() as jest.Mock

// Polyfill Web APIs for Next.js in test environment
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(public input: any, public init?: any) {}
  } as any
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(public body?: any, public init?: any) {}
  } as any
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    private headers: Map<string, string> = new Map()
    
    constructor(headersInit?: any) {
      if (headersInit) {
        Object.entries(headersInit).forEach(([key, value]) => {
          this.headers.set(key, String(value))
        })
      }
    }
    
    get(name: string): string | null {
      return this.headers.get(name.toLowerCase()) || null
    }
    
    set(name: string, value: string): void {
      this.headers.set(name.toLowerCase(), value)
    }
  } as any
}