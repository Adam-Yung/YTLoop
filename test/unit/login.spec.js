'use strict';

// Unit tests for scripts/login.js: the plain-Chrome arguments that make the saved cookies readable by the automated browser.

const { test, expect } = require('@playwright/test');
const { chromeArgs, LOGIN_URL } = require('../../scripts/login');

test('chrome opens the app profile with the same keychain flags Playwright uses', () => {
  const args = chromeArgs('/p/chrome');
  expect(args).toContain('--user-data-dir=/p/chrome');
  expect(args).toContain('--use-mock-keychain');
  expect(args).toContain('--password-store=basic');
});

test('the sign-in page is the last argument and returns to YouTube', () => {
  const args = chromeArgs('/p/chrome');
  expect(args.at(-1)).toBe(LOGIN_URL);
  expect(decodeURIComponent(LOGIN_URL)).toContain('continue=https://www.youtube.com/');
});
