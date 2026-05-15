/*
 * Klaro! Consent Manager Configuration
 * algomarketing.com + hire.algomarketing.com + new.algomarketing.com
 *
 * Cross-subdomain consent sharing via cookieDomain '.algomarketing.com'.
 * Consent Mode v2 integration for Google services.
 * Custom dataLayer events for non-Google services (LinkedIn, Microsoft, HubSpot, YouTube).
 *
 * v3: Fixed consent restoration for returning visitors.
 *     - IIFE at top of file runs immediately on script load (before Klaro init):
 *       reads cookie, fires gtag updates + klaro-*-accepted events.
 *     - Per-service onAccept/onDecline callbacks added to non-Google services
 *       for clean new-visitor flow.
 *
 * Repo: https://github.com/pkmateur/algomarketing-cmp
 * Klaro docs: https://klaro.org/docs
 */

/* ============================================================
   CONSENT RESTORATION IIFE
   Runs immediately when this file loads.
   For returning visitors: applies saved consent before Klaro initializes,
   so GTM gets the right signals from the very first event.
   ============================================================ */
(function restoreKlaroConsentOnLoad() {
  try {
    var cookieName = 'klaro-consent';
    var cookies = document.cookie.split(';');
    var consentCookie = null;
    for (var i = 0; i < cookies.length; i++) {
      var parts = cookies[i].trim().split('=');
      if (parts[0] === cookieName) {
        consentCookie = decodeURIComponent(parts.slice(1).join('='));
        break;
      }
    }

    if (!consentCookie) return; /* no saved consent — banner will show */

    var savedConsents = JSON.parse(consentCookie);

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ dataLayer.push(arguments); };

    /* gtag('consent','update') for Google services */
    var update = {};
    if (savedConsents['google-analytics']) {
      update.analytics_storage = 'granted';
    }
    if (savedConsents['google-ads']) {
      update.ad_storage = 'granted';
      update.ad_user_data = 'granted';
      update.ad_personalization = 'granted';
    }
    if (Object.keys(update).length > 0) {
      gtag('consent', 'update', update);
    }

    /* dataLayer events for non-Google services */
    var nonGoogleServices = ['linkedin-insight', 'microsoft-ads', 'hubspot', 'youtube'];
    for (var j = 0; j < nonGoogleServices.length; j++) {
      var svc = nonGoogleServices[j];
      if (savedConsents[svc]) {
        dataLayer.push({ 'event': 'klaro-' + svc + '-accepted' });
      }
    }
  } catch (e) {
    /* Silent fail — banner will show if cookie is malformed */
  }
})();

/* ============================================================
   KLARO CONFIG
   ============================================================ */
var klaroConfig = {
  version: 1,
  elementID: 'klaro',

  storageMethod: 'cookie',
  cookieName: 'klaro-consent',
  cookieDomain: '.algomarketing.com',
  cookieExpiresAfterDays: 365,

  default: false,
  mustConsent: false,
  acceptAll: true,
  hideDeclineAll: false,
  hideLearnMore: false,
  noticeAsModal: false,
  embedded: false,
  htmlTexts: true,
  groupByPurpose: true,
  disablePoweredBy: true,

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
        learnMore: 'Customize'
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
      microsoftClarity: {
        title: 'Microsoft Clarity',
        description: 'Anonymized session recordings and heatmaps that help us understand how visitors interact with the site and improve usability.'
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

  services: [
    {
      name: 'google-tag-manager',
      title: 'Google Tag Manager',
      purposes: ['functional'],
      required: true,
      cookies: [],
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
      onAccept: `gtag('consent', 'update', { 'analytics_storage': 'granted' });`,
      onDecline: `gtag('consent', 'update', { 'analytics_storage': 'denied' });`
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
      ],
      onAccept: `dataLayer.push({ 'event': 'klaro-linkedin-insight-accepted' });`,
      onDecline: `dataLayer.push({ 'event': 'klaro-linkedin-insight-declined' });`
    },

    {
      name: 'microsoft-ads',
      title: 'Microsoft Ads UET',
      purposes: ['marketing'],
      cookies: [
        [/^_uet.*$/, '/', '.algomarketing.com'],
        [/^MUID$/, '/', '.bing.com']
      ],
      onAccept: `dataLayer.push({ 'event': 'klaro-microsoft-ads-accepted' });`,
      onDecline: `dataLayer.push({ 'event': 'klaro-microsoft-ads-declined' });`
    },

    {
      name: 'microsoft-clarity',
      title: 'Microsoft Clarity',
      purposes: ['analytics'],
      cookies: [
        [/^_clck$/, '/', '.algomarketing.com'],
        [/^_clsk$/, '/', '.algomarketing.com'],
        [/^CLID$/, '/', '.clarity.ms'],
        [/^ANONCHK$/, '/', '.clarity.ms'],
        [/^SM$/, '/', '.clarity.ms']
      ],
      onAccept: `dataLayer.push({ 'event': 'klaro-microsoft-clarity-accepted' });`,
      onDecline: `dataLayer.push({ 'event': 'klaro-microsoft-clarity-declined' });`
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
      ],
      onAccept: `dataLayer.push({ 'event': 'klaro-hubspot-accepted' });`,
      onDecline: `dataLayer.push({ 'event': 'klaro-hubspot-declined' });`
    },

    {
      name: 'youtube',
      title: 'YouTube',
      purposes: ['marketing'],
      cookies: [],
      contextualConsentOnly: true,
      onAccept: `dataLayer.push({ 'event': 'klaro-youtube-accepted' });`,
      onDecline: `dataLayer.push({ 'event': 'klaro-youtube-declined' });`
    }
  ]
};
