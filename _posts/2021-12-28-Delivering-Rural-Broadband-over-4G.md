---
layout: post
title: Delivering Rural Broadband over 4G
excerpt: A tale of rural broadband delivery via a 4G connection dependent on one specific 'good' cell tower
---
My parents live in rural Suffolk, where broadband still has some catching up to do.

A standard BT line would get them a whopping 2.5mbps ADSL2+ connection, which was 'fine but a bit slow' up until around 5 years ago when streaming **really** took off.

In 2017 I decided to explore other options, which boiled down to:
- P2P WiFi from a 'community' ISP
- 4G

I explored the Wireless ISP locally, and more recently I've explored Elon Musk's Starlink - but both came in at £80-90/month - which is really more than I'd like to pay for internet. The old DSL had been around £40/month.

Having tested the 4G option, I got a very respectable 60mbps from Three, on a £17/month contract with unlimited data. Pretty good. I had to do some investment in an external antenna and get the placement right, but once it was in place it provided great speeds.

This was the ideal solution until a couple of years ago, when Three decided to upgrade another, geographically closer mast from 3G to 4G. This seems great in principle; but the issue is with the uplink to internet behind that mast - which I can only assume is on the same exchange as the house - i.e. very slow. My parents' connection trickled down to 9mbps, which, while significantly better than the DSL speeds, was getting easily hammered by streaming services.

Since that happened, forcing my ISP-supplied Huawei modem to 4G-only was no longer enough to cling onto the much faster mast, which is geographically further away. Instead, it was pretty much always using the slower, closer one.

Enter the Teltonika RUT360. I'd used Teltonika devices before so knew they were decent, but also having done some searching online, I'd learned that it seemed to be possible to have them 'lock' to a specific cell.

I'll cover the 'how' of that in another post so as not to bore innocent search-referred visitors with this post, but with some help from Teltonika I managed to get this working - firstly by trying band locking (no good), then moving onto locking by cell ID. I even wrote a small Python script to keep an eye on it and make sure it was using the right cell in case of reboot etc.

So we finally have it - consistent ~60mbps internet over 4G. Unlimited data allowance. All for the bargain price of £17/month (excluding the kit I've purchased).

Here's a video of the loft-installed setup in its finished state:

<video width="75%" muted controls>
  <source src="/img/blog/2021-12/4g-loft-tour.webm" type="video/webm">
Your browser does not support this video.
</video> 

The UniFi Point-to-Point wireless is what's linking this to the rest of the house downstairs, where the main router and switches are. This obviously isn't ideal, so I'm looking to arrange for some cable to be run down the walls when I can.

The only thing I've sadly not quite cracked with this setup is Carrier Aggregation. Theoretically, I should be able to improve even further on the speeds I'm getting with CA enabled. When I go up in the loft with my iPhone, and toggle airplane mode enough times to get the right cell, I get 80mbps. The RUT360 will do Carrier Aggregation, but this seems to be disabled when using cell locking (perhaps because CA is using 2 cell IDs, therefore goes against the principle of locking?). I did ask Teltonika about this but they didn't get back to me.

Perhaps I'm just being greedy now though... 60mbps is plenty enough really 😊