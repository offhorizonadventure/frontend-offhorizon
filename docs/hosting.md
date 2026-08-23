# Hosting on Hostinger

The site is a Node application, not a folder of files. Hostinger has to run
`node .next/standalone/server.js` (or `pnpm start`) and keep it running, with a
reverse proxy in front of it on 80 and 443.

## The scheduled job

One thing on this site cannot wait for a visitor: the balance deadline. Terms
say everything is due 14 days before departure, and after that the booking is
cancelled and the place goes back on sale. Nobody is browsing at the moment that
becomes true, so something has to run on a clock.

`POST /api/bookings/overdue` does that work: it cancels the bookings that owe
money past their deadline, releases their seats, and emails the rider. It is
guarded by `SITE_REVALIDATE_SECRET`, so only something holding that secret can
call it. Running it twice changes nothing.

Add this to the Hostinger cron panel (or `crontab -e`), once a day:

```
0 3 * * * curl -fsS -X POST -H "x-revalidate-secret: YOUR_SECRET" https://offhorizon.com/api/bookings/overdue > /dev/null
```

Without it, nothing is lost and no money is at risk: the account page already
shows an overdue booking as overdue, and the documents form stays shut. What
does not happen is the seat going back on sale, so the departure looks fuller
than it is until the job runs.

## Compression

Next compresses its own responses with gzip, and the home page is around 135KB
over the wire. If Hostinger terminates TLS with Nginx or LiteSpeed in front of
Node, turn on brotli there: it takes roughly another 15 percent off the same
HTML for anyone on a slow connection.

## Environment

Set these in the Node application's environment, not in a file in the web root:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL
SUPABASE_SECRET_KEY
SITE_REVALIDATE_SECRET
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
SMTP_FROM
```

`SUPABASE_SECRET_KEY`, both Razorpay secrets and the SMTP password are server
side only. None of them may ever be given a `NEXT_PUBLIC_` prefix: that prefix
is what puts a value into the JavaScript the browser downloads.
