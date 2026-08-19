# Auth email templates

Supabase sends these, not the site, so they are pasted into the dashboard rather
than imported by any code.

**Where:** Supabase → Authentication → Emails → Templates.

| File | Template |
| --- | --- |
| `reset-password.html` | Reset Password |
| `confirm-signup.html` | Confirm signup |

Paste the file into the message body and leave `{{ .ConfirmationURL }}` exactly
as it is: Supabase replaces it with the one-time link.

## Before they work

Authentication → URL Configuration. The two fields take different things, and
putting the callback in both is the usual mistake:

| Field | Value | Why |
| --- | --- | --- |
| **Site URL** | `http://localhost:3000` (and your domain in production) | The origin only, no path. It is the fallback when a link has no redirect of its own, and it is what `{{ .SiteURL }}` becomes in an email. A callback path here sends people to the callback with no code to exchange. |
| **Redirect URLs** | `http://localhost:3000/auth/callback`<br>`https://yourdomain.com/auth/callback` | The allow list. Every address the code asks to return to has to match one of these, or Supabase refuses the redirect. |

One Site URL, as many redirect URLs as you have environments.

## Why they look like 2005 HTML

Mail clients are not browsers. Outlook renders through Word, Gmail strips
`<style>` blocks on forwarded mail, and remote images are blocked by default in
most corporate clients. So: tables for layout, inline styles on everything, no
web fonts, no background images, and a button built from a bordered table cell
so it survives having its CSS thrown away.

## The default sender

Supabase's built-in SMTP is rate limited and sends from their domain, which
lands in spam often enough to matter. For anything real, point Authentication →
SMTP Settings at the same Gmail account the admin already replies from, or at a
transactional provider.
