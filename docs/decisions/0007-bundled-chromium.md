# 0007 Playwright Chromium by default, Chrome optional

Context: on the development Mac, Google Chrome is enrolled in the company's cloud management. After its first run in a profile it downloads a policy (`<profile>/Policy/Machine Level User Cloud Policy`) and from then on prints `DevTools remote debugging is disallowed by the system admin`. Playwright cannot attach, so `npm run probe` showed a blank window (about:blank) and hung. A new profile works only until the policy arrives, which is why short fixture tests passed.

Decision:
- Default browser is Playwright's Chromium (`BROWSER_CHANNEL=chromium`, installed by `npm run setup`). It is not enrolled in any policy.
- Installed Chrome stays available with `BROWSER_CHANNEL=chrome` on machines where it is not admin-locked.
- The policy is never removed or raced. A launch that is blocked fails within `launchTimeoutMs` with an explanation (`explainLaunchError`).
- Profiles are per channel: `.profile/chromium` and `.profile/chrome`.

Consequences: supersedes the "system Chrome" part of decision 0001. Playwright's Chromium lacks Chrome's proprietary codecs; YouTube still plays through VP9, AV1 and Opus. Tests moved to the same browser and became stable.

Update 2026-11-09: on the test VM the app now runs on that machine's unmanaged Chrome (`BROWSER_CHANNEL=chrome` in `.env`), see decision 0009. The default in the code stays Chromium, and admin-managed Chrome is still unsupported.
