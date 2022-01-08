---
layout: post
title: Adding Comment Functionality to my Static Jekyll Blog Using Staticman
excerpt: ADD EXCERTP HERE
---
Last year I wrote about how I built this site and its associated blog functionality using Jekyll and a bunch of other tools. If you'd like to read that post then follow this link.

One of the noted limitations at the time was that I wasn't able to offer commenting on my blog posts. Instead, I put some text at the bottom of the blog post template file, which invited readers to contact me directly with any feedback or suggestions on my scribblings.

I never wanted this to be a permanent solution, and recently I finally got around to implementing comments. 

## Why Staticman?
I looked at a number of different solutions. Perhaps the most well known is Disqus, which has been around for years, and I understand is pretty easy to implement, with a bit of code you can add to any page to include their commenting widgets.

For those in search of an easy life, Disqus certainly seems a good solution. However, as a commercial product it is not without its downsides - the price isn't the cheapest if you don't want ads on your site, and I also felt it was a little 'heavy' a thing to load in the browser - part the reason for having a static site is keeping it fast and page ranks high, and I didn't want commenting to be a detriment to this.

Among other solutions I found Staticman, which stood out to me as the closest thing to what I needed, added to which it is designed to work with Jekyll site exactly like mine. Dreamy.

