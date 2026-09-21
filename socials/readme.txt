How to use


🔐 Facebook Page Video Upload Token (Graph API)
What you need
A Facebook Page

A Meta App in Meta for Developers

A Page Access Token with:

pages_manage_posts

pages_read_engagement

Steps
Go to https://developers.facebook.com/

Create an app → choose Business type

In the left menu: App → Settings → Basic

Add your domain (optional)

Go to App → Products → Add Product → Facebook Login

Enable Facebook Login for Business

Go to App → App Review → Permissions & Features

Request:

pages_manage_posts

pages_read_engagement

Go to Tools → Graph API Explorer

Select your app + your Page

Generate a Page Access Token

Exchange it for a long‑lived token:
GET https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=SHORT_TOKEN

Final token to use:
Code
FB_TOKEN=EAAG...
FB_PAGE_ID=123456789
🔐 TikTok Open API Token
What you need
A TikTok Developer App

OAuth token with video.upload permissions






Steps
Go to https://developers.tiktok.com/

Create an app

In the left menu: App → Products → TikTok Login

Add Scopes:

video.upload

video.publish

Add your redirect URL

Implement OAuth (or use their test tool)

After user login, TikTok returns:

access_token

refresh_token

Final token:
Code
TIKTOK_TOKEN=your_access_token



https://www.tiktok.com/auth/authorize/
?client_key=
sbaw8uzfqlpbxdwzq1
&scope=video.upload,video.publish
&response_type=code
&redirect_uri=https://droneflight.website/socials








🔐 YouTube Data API v3 Token
What you need
Google Cloud Project

OAuth2 client

Token with youtube.upload scope

Steps
Go to https://console.cloud.google.com/ (console.cloud.google.com in Bing)

Create a project

Go to APIs & Services → Library

Enable YouTube Data API v3

Go to APIs & Services → Credentials

Create OAuth Client ID

Type: Desktop App

Download the client_secret.json

Run a small OAuth script to generate tokens:

js
const { google } = require("googleapis");
const oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
console.log(oauth2.generateAuthUrl({ scope: ["https://www.googleapis.com/auth/youtube.upload"] }));
Visit the URL → authorize → paste the returned code → get:

access_token

refresh_token

Final token:
Code
YT_TOKEN=ya29....
🔐 X (Twitter) Upload Token
What you need
A Twitter Developer account

A Project + App

OAuth2 Bearer token with media upload permissions

Steps
Go to https://developer.twitter.com/

Create a Project

Create an App

In User authentication settings:

Enable OAuth 2.0

Enable Read + Write

Generate:

Client ID

Client Secret

Use OAuth2 to get a Bearer token:

Scopes required:

tweet.write

tweet.read

users.read

Final token:
Code
X_BEARER=AAAAAAAAA...
🔐 LinkedIn Video Upload Token
What you need
LinkedIn Developer App

OAuth token with:

w_member_social

r_liteprofile

Steps
Go to https://www.linkedin.com/developers/

Create an app

In Products, enable:

Sign In with LinkedIn

Share on LinkedIn

In Auth → OAuth 2.0 settings:

Add redirect URL

Build OAuth URL:

Code
https://www.linkedin.com/oauth/v2/authorization
?response_type=code
&client_id=YOUR_CLIENT_ID
&redirect_uri=YOUR_REDIRECT_URI
&scope=w_member_social r_liteprofile
After login, LinkedIn returns code

Exchange it:

Code
POST https://www.linkedin.com/oauth/v2/accessToken
client_id=...
client_secret=...
redirect_uri=...
code=...
grant_type=authorization_code
You receive:

access_token

expires_in

Final token:
Code
LI_TOKEN=AQX....
LI_URN=urn:li:person:xxxx




node uploader.js video.mp4 "My Title"
