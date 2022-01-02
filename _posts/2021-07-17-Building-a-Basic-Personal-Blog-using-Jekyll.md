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
In other words, to write a blog post I just have to write a basic markdown file with some text in it, and Jekyll will do the rest - put it into a page on my website, link to it from all the right places, etc etc.

I also wanted to automate this where possible - the likes of WordPress have an easy web editor. That's not something we get here, as we're just working with files, so realistically I'll be using text editing software to write blog posts and build the website.

I settled on the below as a plan for how I would make publishing to my new website as easy as possible:
<img src="/img/blog/site-diagram.jpg" alt="Diagram of deployment flow for this website" class="post-img">

The goal is to be able to use VS Code on my MacBook to edit my blog, and all I need to do is commit & push to GitHub when I make changes - the site will then be updated accordingly.

### Building Site Structure
Roughly speaking Jekyll uses the following structure:
```
    _drafts/
        |___Draft-Blog-Post.md
    _includes/
        |___header.html
        |___footer.html
    _layouts/
        |___default.html
        |___post.html
    _posts/
        |___2021-07-15-Published-Blog-Post.md
    _config.yml
    index.html
```

Most of the site HTML goes in the header.html and footer.html includes. This gives us the basic structure of the site.
The _layouts/ folder then contains a 'type' of page or post for example. I've gone for default (homepage) and post (blog posts).

Then, at the top of each markdown or HTML file, you simply start the file with the following:
```
    ---
    layout: post
    title: This is my blog post
    excerpt: A blog post about things and such
    ---
```
...and put your content underneath. Jekyll will do the rest, creating static HTML pages for your blog posts, homepage, etc, showing a list of your blog posts where you have chosen to do so.

### Deployment Flow in GitHub & CircleCI
So we have the basic