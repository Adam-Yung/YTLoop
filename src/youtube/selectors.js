'use strict';

// Every YouTube selector and wall-detection pattern. Update here when YouTube changes its DOM; run npm run probe to check.

module.exports = {
  player: '#movie_player',
  video: 'video.html5-main-video',
  playButton: '#movie_player .ytp-play-button',
  autonavToggle: '#movie_player .ytp-autonav-toggle-button',
  skip: [
    '#movie_player .ytp-skip-ad-button',
    '#movie_player .ytp-ad-skip-button-modern',
    '#movie_player .ytp-ad-skip-button',
    '#movie_player .videoAdUiSkipButton',
    '#movie_player button[aria-label="Skip Ad"]',
    '#movie_player button[aria-label="Skip Ads"]',
    '#movie_player button[title="Skip Ad"]',
  ].join(', '),
  like: [
    'ytd-watch-metadata like-button-view-model button[aria-pressed]',
    'ytd-watch-metadata ytd-segmented-like-dislike-button-renderer #segmented-like-button button[aria-pressed]',
    'ytd-watch-metadata segmented-like-dislike-button-view-model like-button-view-model button[aria-pressed]',
  ].join(', '),
  signedOut: 'ytd-masthead a[href*="accounts.google.com/ServiceLogin"], ytd-masthead ytd-button-renderer a[href*="ServiceLogin"]',
  ownerLink: [
    'ytd-watch-metadata #owner ytd-channel-name a[href]',
    'ytd-video-owner-renderer ytd-channel-name a[href]',
    '#owner #channel-name a[href]',
  ].join(', '),
  related: {
    cards: '#related ytd-compact-video-renderer, ytd-watch-next-secondary-results-renderer ytd-compact-video-renderer, #related yt-lockup-view-model, ytd-watch-next-secondary-results-renderer yt-lockup-view-model',
    link: 'a#video-title[href*="watch"], a#thumbnail[href*="watch"], a.ytLockupMetadataViewModelTitle[href*="watch"], a.ytLockupViewModelContentImage[href*="watch"], a[href*="/watch?v="]',
    channelLink: 'ytd-channel-name a[href], #channel-name a[href], a[href^="/@"], a[href*="/channel/"]',
    channelText: 'ytd-channel-name, #channel-name, .ytContentMetadataViewModelMetadataText',
  },
  channelGrid: {
    cards: 'ytd-rich-grid-media, ytd-grid-video-renderer, ytd-video-renderer, yt-lockup-view-model',
    link: 'a#video-title-link[href*="watch"], a#video-title[href*="watch"], a#thumbnail[href*="watch"], a[href*="/watch?v="]',
  },
  wall: {
    text: /confirm you.{0,3}re not a bot|unusual traffic|are you a robot|verify (that )?you.{0,3}re (a )?human|sign in to confirm/i,
    selectors: 'iframe[src*="recaptcha"], iframe[src*="captcha"], form[action*="consent.youtube.com"], ytd-consent-bump-v2-renderer',
    hosts: ['consent.youtube.com', 'accounts.google.com', 'www.google.com/sorry'],
  },
};
