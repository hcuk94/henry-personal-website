---
layout: post
title: "Adding Comment Functionality to my Static Jekyll Blog Using Staticman"
excerpt: "coming soon"
---
Last year I wrote about how I built this site and its associated blog functionality using Jekyll and a bunch of other tools. If you'd like to read that post then follow this link.

One of the noted limitations at the time was that I wasn't able to offer commenting on my blog posts. Instead, I put some text at the bottom of the blog post template file, which invited readers to contact me directly with any feedback or suggestions on my scribblings.

I never wanted this to be a permanent solution, and recently I finally got around to implementing comments. 

## Why Staticman?
I looked at a number of different solutions. Perhaps the most well known is Disqus, which has been around for years, and I understand is pretty easy to implement, with a bit of code you can add to any page to include their commenting widgets.

For those in search of an easy life, Disqus certainly seems a good solution. However, as a commercial product it is not without its downsides - the price isn't the cheapest if you don't want ads on your site, and I also felt it was a little 'heavy' a thing to load in the browser - part the reason for having a static site is keeping it fast and page ranks high, and I didn't want commenting to be a detriment to this.

Among other solutions I found Staticman, which stood out to me as the closest thing to what I needed, added to which it is designed to work with a Jekyll site exactly like mine. Dreamy.

## How it works
Staticman works by providing an API endpoint which can be called from the visitor's browser. The API takes details of the comment and the post to which it relates, and converts this information into a YAML file. This YAML file is then pushed to the GitHub repository for the main Jekyll site. Jekyll can then be configured to simply see these files like it does blog posts or pages - just another section of content to be processed into static HTML.

<img src="/img/blog/2022-01/staticman-how-it-works.png" alt="Diagram of how Staticman works" class="post-img">

## Staticman Architecture
As you can see from the above diagram, Staticman slots nicely into the existing deployment process for this blog (all changes into GitHub get pushed to CircleCI which runs the Jekyll build commands and deploys to my web server).

In the early days of Staticman it was exceptionally straightforward to use, since you would just configure your website to hit their hosted API. Sadly, since its popularity resulted in GitHub limits being hit, it can now only be self-hosted.
This did make me think long and hard about whether it was the right solution; since having to run additional infrastructure would seem to go against the reason I wanted a static blog in the first place.

Staticman do try to mitigate this by making it as easy as possible to deploy. It is a NodeJS application, but can be spun up pretty easily using Heroku (Staticman's recommended approach if you're not used to running applications) or Docker. I imagine it would also be relatively straight forward to deploy as an API using your *favourite cloud provider*™.

I opted for the Docker image, since I already run Docker hosts and had some spare capacity to run an additional container for Staticman.

## Step 1 - Creating a GitHub Application and Deploying Staticman
Whether you opt for a simple NodeJS runtime, or using Heroku or Docker, it is pretty simple to get Staticman up and running, because most of the configuration is handled in the remote repository.

You'll first need to set up a new GitHub application and link it to your repo. This is a fairly standard process but is covered in enough detail in the [Staticman Getting Started page](https://staticman.net/docs/getting-started).

Once you've got your App ID and private key, you have all you need to run Staticman.

I used the following docker-compose.yml:
```
version: '2'
services:
  staticman:
    build: .
    env_file: .env
    ports:
      - '3000:3000'
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3000
      GITHUB_APP_ID: 000000
      GITHUB_PRIVATE_KEY: 
      RSA_PRIVATE_KEY:
```

All that's needed is to swap in your GitHub App ID and Private Key. The RSA_PRIVATE_KEY field is a separate key which you can generate yourself, and is used for encrypting Staticman settings in your repo config file (which could be public).

These fields are just set as environment variables - if using Heroku you will need to find the settings for your app in the Heroku dashboard and set the environment variables from there.

That's really all the config you need for Staticman server-side. The rest is done in your repo and handled dynamically by your Staticman instance.

## Step 2 - Configuring Staticman in your Repo
The requests you end up making to the Staticman API will tell it which repo to connect to (it will need to be one to which your GitHub App ID has access).

We don't need to worry about making requests to the API just yet, but we do need to configure Staticman for our repo. This is done using a file called *staticman.yml*.

```
# Production (main)
comments:
  # Which Git Branch should Staticman push comments to
  branch: "main"
  # Which fields may be submitted? Any request with extra fields will be rejected.
  allowedFields: ["name", "email", "url", "message"]
  # Which fields are required? Any request missing any one of these will be rejected.
  requiredFields: ["name", "email", "message"]
  # How should we describe the commit from Staticman
  commitMessage: "New comment added on blog post"
  # Format of file - e.g. this might call the comment file entry1641558066969.yml
  filename: "entry{@timestamp}"
  format: "yaml"
  # Adds a timestamp field to every comment
  generatedFields:
    date:
      type: date
      options:
        format: "timestamp-seconds"
  # If set to true, we will receive a Pull Request in GitHub for every new comment
  moderation: false
  # Name of site
  name: "henrycole.uk"
  # Optional: Allowed cross-origin domains
  allowedOrigins: ["localhost", "henrycole.uk"]
  # Relative path where we should store comments - the 'slug' we will send to the API as the name
  # of the commented page
  path: "_data/comments/{options.slug}"
  # Store emails as md5 - this is how Gravatar accepts emails, and avoids storing plaintext emails
  # of our site visitors in a public repo
  transforms:
    email: md5
```

I've commented the above especially for this post. I actually suggest you start with the sample config from Staticman, and be sure to read their [full config reference](https://staticman.net/docs/configuration) for all the options you can use.

Essentially, this config file boils down to:
- Which branch is this config for?
- What fields do we want (or not) on comments?
- Where and how should we store these comments?

## Step 3 - Adding Comments to Your Site
We now have an API running which, given the right parameters, will convert our API request into a file, then push that file to our repo.
That leaves 2 bits missing:
- Jekyll won't yet do anything with those comment files
- We don't have any means of website visitors submitting a comment

To tackle point one, 

## Extras
Handling multiple branches....
Threaded comments
Have I made comments on/off per post work and written about it yet?

## Credits
I wanted to write this post to document my experience, as there were a couple of things I got stuck on (e.g. staticman.yml config sits in the remote repo, not in the app dir on the Staticman server!).
I cannot claim to have figured this all out on my own though, as I have drawn on multiple excellent pages to help me get to this stage.
I drew a lot from [this excellent post from MadeMistakes](https://mademistakes.com/mastering-jekyll/static-comments/), which details their experience in a way that is far more conclusive than I've managed.
The MadeMistakes approach used jQuery, which I wanted to avoid as I didn't need it anywhere else on my blog, so [this post from Joe Hendrix](https://www.joehxblog.com/decoupling-my-commenting-system-from-jquery/) helped me with a native JavaScript solution for submitting the comment form.
Last but not least, the [Staticman documentation](https://staticman.net/docs/) itself is of course very helpful, and if you're serious about setting up Staticman for yourself, you should read it to understand all the configurable options available to you.

Also worth noting, MadeMistakes have posted a [follow-up article](https://mademistakes.com/mastering-jekyll/static-comments-improved/) which covers some extra things you can do such as threaded comments.