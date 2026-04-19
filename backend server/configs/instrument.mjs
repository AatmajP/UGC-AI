import * as Sentry from "@sentry/node"


Sentry.init({
  dsn: "https://250eb79d752a597c04fac530358d944c@o4511246134411264.ingest.us.sentry.io/4511246139850752",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});