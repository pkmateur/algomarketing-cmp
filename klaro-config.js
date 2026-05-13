/*
 * Klaro! Consent Manager Configuration
 * algomarketing.com + hire.algomarketing.com + new.algomarketing.com
 *
 * Cross-subdomain consent sharing via cookieDomain '.algomarketing.com'.
 * Consent Mode v2 integration via google-tag-manager service (onInit/onAccept).
 *
 * Repo: https://github.com/pkmateur/algomarketing-cmp
 * Klaro docs: https://klaro.org/docs
 */

var klaroConfig = {
  /* Klaro version pinning — must match the loaded klaro.js version */
  version: 1,

  /* Element ID for the Klaro container */
  elementID: 'klaro',

  /* Where to store consent — share across subdomains */
  storageMethod: 'cookie',
  cookieName: 'klaro-consent',
  cookieDomain: '.algomarketing.com',
  cookieExpiresAfterDays: 365,

  /* Banner behavior */
  default: false,            /* Services denied by default */
  mustConsent: false,        /* Don't force consent — allow "Decline All" */
  acceptAll: true,           /* Show "Accept All" button */
  hideDeclineAll: false,     /* Show "Decline All" — required for GDPR compliance */
  hideLearnMore: false,
  noticeAsModal: false,      /* Bottom bar, not blocking modal */
  embedded: false,
  htmlTexts: true,

  /* Group services by purpose (Marketing / Analytics / etc.) */
  groupByPurpose: true,

  /* Disable "Powered by Klaro" link */
  disablePoweredBy: true,

  /* Translations — English only */
  translations: {
    en: {
      privacyPolicyUrl: 'https://algomarketing.com/privacy-policy',
      consentModal: {
        title: 'Privacy preferences',
        description:
          'We use cookies and similar technologies to provide you with the best experience on our website, to analyze traffic, and to support our marketing efforts. You can choose which categories you allow. Your choice will be saved across our sites for one year. See our <a href="/privacy-policy">privacy policy</a> for details.'
      },
      consentNotice: {
        title: 'We value your privacy',
        description:
          'We use cookies for analytics and marketing. You can accept all, decline all, or customize.',
        learnMore: 'Customize',
        testing: 'Testing mode!'
      },
      purposes: {
        functional: { title: 'Essential' },
        analytics: { title: 'Analytics' },
        marketing: { title: 'Marketing' }
      },
      ok: 'Accept all',
      decline: 'Decline all',
      acceptSelected: 'Save preferences',
      acceptAll: 'Accept all',
      service: {
        disableAll: {
          title: 'Toggle all services',
          description: 'Use this to enable or disable all services at once.'
        },
        optOut: { title: '(opt-out)', description: 'Loads by default; opt-out available.' },
        required: { title: '(required)', description: 'Always loaded — required for the site to function.' },
        purpose: 'Purpose',
        purposes: 'Purposes'
      },
      googleTagManager: {
        title: 'Google Tag Manager',
        description: 'Manages other tracking tags (required for the site to function correctly).'
      },
      googleAnalytics: {
        title: 'Google Analytics 4',
        description: 'Anonymized website usage statistics. Helps us improve content and performance.'
      },
      googleAds: {
        title: 'Google Ads',
        description: 'Conversion tracking and retargeting for our paid advertising on Google.'
      },
      linkedinInsight: {
        title: 'LinkedIn Insight Tag',
        description: 'Conversion tracking, retargeting, and audience insights for LinkedIn Ads.'
      },
      microsoftAds: {
        title: 'Microsoft Ads (UET)',
        description: 'Conversion tracking and retargeting for our paid advertising on Bing / Microsoft.'
      },
      hubspot: {
        title: 'HubSpot',
        description: 'Visitor identification, form tracking, and marketing automation by our CRM.'
      },
      youtube: {
        title: 'YouTube',
        description: 'Embedded YouTube videos. Loading these allows Google to set tracking cookies.'
      }
    }
  },

  /* ============================================================
     SERVICES
     ============================================================
     google-tag-manager: required. Initializes gtag default state.
     google-analytics, google-ads: marketing. Update Consent Mode v2 on accept.
     linkedin-insight, microsoft-ads, hubspot: marketing. Fire klaro-X-accepted events.
     youtube: marketing. contextualConsentOnly — placeholder until user opts in.
     ============================================================ */
  services: [
    {
      name: 'google-tag-manager',
      title: 'Google Tag Manager',
      purposes: ['functional'],
      required: true,
      cookies: [],
      /* Runs once on every page load, before any user interaction.
         Sets gtag default consent to denied for all marketing/analytics. */
      onInit: `
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function(){ dataLayer.push(arguments); };
        gtag('consent', 'default', {
          'ad_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied',
          'analytics_storage': 'denied',
          'functionality_storage': 'granted',
          'security_storage': 'granted',
          'wait_for_update': 500
        });
        gtag('set', 'ads_data_redaction', true);
        gtag('set', 'url_passthrough', true);
      `,
      /* Runs when user accepts any service. Push klaro-{service}-accepted
         events for each consented service so GTM can react via Custom Event triggers. */
      onAccept: `
        for (var k in opts.consents) {
          if (opts.consents[k]) {
            dataLayer.push({ 'event': 'klaro-' + k + '-accepted' });
          }
        }
      `,
      onDecline: `
        for (var k in opts.consents) {
          if (!opts.consents[k]) {
            dataLayer.push({ 'event': 'klaro-' + k + '-declined' });
          }
        }
      `
    },

    {
      name: 'google-analytics',
      title: 'Google Analytics 4',
      purposes: ['analytics'],
      cookies: [
        [/^_ga.*$/, '/', '.algomarketing.com'],
        [/^_gid.*$/, '/', '.algomarketing.com']
      ],
      onAccept: `
        gtag('consent', 'update', { 'analytics_storage': 'granted' });
      `,
      onDecline: `
        gtag('consent', 'update', { 'analytics_storage': 'denied' });
      `
    },

    {
      name: 'google-ads',
      title: 'Google Ads',
      purposes: ['marketing'],
      cookies: [
        [/^_gcl.*$/, '/', '.algomarketing.com'],
        [/^_gac.*$/, '/', '.algomarketing.com']
      ],
      onAccept: `
        gtag('consent', 'update', {
          'ad_storage': 'granted',
          'ad_user_data': 'granted',
          'ad_personalization': 'granted'
        });
      `,
      onDecline: `
        gtag('consent', 'update', {
          'ad_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied'
        });
      `
    },

    {
      name: 'linkedin-insight',
      title: 'LinkedIn Insight Tag',
      purposes: ['marketing'],
      cookies: [
        [/^lidc$/, '/', '.linkedin.com'],
        [/^bcookie$/, '/', '.linkedin.com'],
        [/^li_.*$/, '/', '.algomarketing.com']
      ]
    },

    {
      name: 'microsoft-ads',
      title: 'Microsoft Ads UET',
      purposes: ['marketing'],
      cookies: [
        [/^_uet.*$/, '/', '.algomarketing.com'],
        [/^MUID$/, '/', '.bing.com']
      ]
    },

    {
      name: 'hubspot',
      title: 'HubSpot',
      purposes: ['marketing'],
      cookies: [
        [/^__hs.*$/, '/', '.algomarketing.com'],
        [/^hubspotutk$/, '/', '.algomarketing.com'],
        [/^__hssc$/, '/', '.algomarketing.com'],
        [/^__hssrc$/, '/', '.algomarketing.com']
      ]
    },

    {
      name: 'youtube',
      title: 'YouTube',
      purposes: ['marketing'],
      cookies: [],
      contextualConsentOnly: true
    }
  ]
};
