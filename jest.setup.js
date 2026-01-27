// Optional: configure or set up a testing framework before each test
// jest.setup.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Next.js specific modules
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');
  
  return {
    ...actual,
    NextRequest: class NextRequest {
      constructor(input, init = {}) {
        this.url = input;
        this.method = init.method || 'GET';
        this.headers = new Headers(init.headers || {});
        this.body = init.body;
        this.bodyUsed = false;
        this.cookies = {
          get: jest.fn(),
          set: jest.fn(),
          delete: jest.fn(),
          getAll: jest.fn(),
          has: jest.fn(),
        };
        this.nextUrl = {
          pathname: new URL(input).pathname,
          search: new URL(input).search,
          searchParams: new URL(input).searchParams,
        };
        this.geo = {};
        this.ip = '';
        this.ua = {};
      }

      async json() {
        this.bodyUsed = true;
        return this.body ? JSON.parse(this.body) : {};
      }

      async text() {
        this.bodyUsed = true;
        return this.body || '';
      }

      clone() {
        return this;
      }
    },
    NextResponse: {
      json: (body, init = {}) => ({
        ...init,
        status: init.status || 200,
        json: async () => body,
      }),
      redirect: (url) => ({
        status: 307,
        headers: { location: url },
      }),
    },
  };
});