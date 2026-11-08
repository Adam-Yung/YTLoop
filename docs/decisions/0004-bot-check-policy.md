# 0004 Bot-check policy

Decision:
- Reduce suspicion: real headed Chrome, persistent profile, `viewport: null`, no `--enable-automation`, mouse moves with jitter before clicks, click links instead of `goto`, bounded retries with backoff, no reload loops.
- No stealth plugins: fragile and a cat-and-mouse game.
- If a bot check, CAPTCHA or sign-in wall appears: log it, pause, wait for a human up to a timeout. Never solve or bypass it. After the timeout the chain counts it as catastrophic and moves on.

Consequences: detection can be reduced but not guaranteed away. Automated viewing may conflict with YouTube's terms; this is the operator's responsibility.
