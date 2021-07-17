---
layout: post
title: Building a Basic Personal Blog using Jekyll
excerpt: A rough overview of how I built this very website using Jekyll, Bootstrap, Nginx & CircleCI
---

I recently decided to re-build my personal blog/website (this very site) from the crumbled ashes of my previous attempts some years earlier. I've almost always gone to WordPress for this kind of thing - I've done enough years of WordPress administration to know that its a great piece of software.

But WordPress is also a large piece of software, and its functionality seems overkill for my basic needs. Not to mention the fact that it is natively not the quickest, and generally needs caching software to make it performant.

What I needed for my website was really just a static HTML site - but with the single complication of wanting to be able to write blog posts.
This lead me to discover [Jekyll](https://jekyllrb.com/), which, after a bit of research and deliberation, seemed to fit my needs.

Jekyll is a Ruby application which takes individual pages and blog posts written in HTML or Markdown, and ties them all together into a static HTML site using a layout of your choice.

I settled on the below as a rough plan:
![Diagram of deployment flow for this website](/img/blog/site-diagram.jpg)

One day I'll put some more text here...