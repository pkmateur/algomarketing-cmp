algomarketing-cmp
Consent Management Platform configuration for Algomarketing's web properties.
Domains covered
`algomarketing.com` (production, Webflow)
`hire.algomarketing.com` (Emergent landing page)
`new.algomarketing.com` (Emergent — upcoming redesign)
All three share consent via the `.algomarketing.com` parent cookie domain — a user who accepts on any one of them won't see the banner on the others.
Stack
CMP: Klaro! v0.7.x — open source, GDPR-compliant, no vendor lock-in
Hosting: This repo + jsDelivr CDN (free, no API limits)
Tag management: Google Tag Manager `GTM-MNZLV25R` (single container, all three domains)
Consent Mode: Google Consent Mode v2 — `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`
CDN URL
```
https://cdn.jsdelivr.net/gh/pkmateur/algomarketing-cmp@main/klaro-config.js
```
After committing changes to this repo, jsDelivr cache refreshes within minutes. For instant cache purge, use `https://www.jsdelivr.com/tools/purge`.
Files
File	Purpose
`klaro-config.js`	Main config — service definitions, translations, callbacks
`README.md`	This file
Updating
```bash
git add klaro-config.js
git commit -m "Update consent banner text"
git push origin main
```
Changes propagate via jsDelivr automatically. To verify: open browser DevTools → Network → check that the latest `klaro-config.js` is served (use `Disable cache` or hard refresh).
Testing
Append `#klaro-testing` to any URL to force the banner to reappear, regardless of stored consent:
`https://algomarketing.com/#klaro-testing`
To inspect consent state in DevTools console:
```js
window.klaro.getManager().consents       // { 'google-analytics': true, ... }
window.klaro.getManager().getConsent('linkedin-insight')  // true/false
```
To reset consent (for testing):
```js
window.klaro.getManager().resetConsents()
location.reload()
```
