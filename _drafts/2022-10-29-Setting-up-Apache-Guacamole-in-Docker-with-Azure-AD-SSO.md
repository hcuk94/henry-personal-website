---
layout: post
title: "Setting up Azure AD SAML SSO on Apache Guacamole in Docker"
excerpt: "Apache Guacamole is a clientless HTML5 remote desktop gateway. This is a quick guide on setting up Azure AD SAML SSO to be able to authenticate to Guacamole running in Docker, behind an Nginx reverse proxy."
comments: true
---
Apache Guacamole is a clientless remote desktop gateway, giving you easy and secure access to protocols such as RDP, SSH and VNC via an HTML5 web app.

In this write-up, I'll be setting up SAML SSO to Azure AD, enabling us to log in to Guacamole using our Azure AD credentials.

I will be making the following assumptions:
- You already have Guacamole up and running in Docker, preferably defined by a Docker Compose file
- You have an Nginx reverse proxy running in front of the Guacamole web application
- You have admin access to Azure AD
If any of the above are not true, you may need to tweak my settings for your own environment.

First things first, lets set up our Azure AD application.

Navigate to the Azure Portal, click **Azure Active Directory** followed by **Enterprise Applications**, then click **New application**

On the following page choose **Create your own application**

<img src="/img/blog/2022-10/guacamole-sso-azure-create-app.png" class="post-img" alt="Screenshot of Azure portal showing App Creation Screen">

Once the app is created, in the sidebar click **Users and groups**, then select users/groups to allow access to Guacamole.

Back on the application page, click **Single Sign-on** in the sidebar, then click **SAML**.

<img src="/img/blog/2022-10/guacamole-sso-azure-config-saml.png" class="post-img" alt="Screenshot of Azure portal showing SAML configuration">

On step 1, click **Edit** and populate the *Identifier* and *Reply URL* with the base URL for your Guacamole install - this could be something like https://guacamole.example.com
















## Docker Compose
I'm using Docker Compose to define my Guacamole services, with the official guacamole and guacd images from Docker Hub.













Below is my docker-compose.yml file. I'll explain some of the custom configuration later in this post, but the main principle is that we have 2 containers - guacamole and guacd. Guacamole is the web frontend, while guacd handles the actual connections to other machines.

{% highlight yaml %}
version: '2.0'

networks:
  guacnet:
    driver: bridge

services:
  guacd:
    container_name: guacd
    image: guacamole/guacd
    networks:
      guacnet:
    restart: always
    volumes:
    - ./drive:/drive:rw
    - ./record:/record:rw

  guacamole:
    container_name: guacamole
    depends_on:
    - guacd
    environment:
      GUACD_HOSTNAME: guacd
      MYSQL_DATABASE: guacamole
      MYSQL_HOSTNAME: mysql
      MYSQL_PASSWORD: 'password'
      MYSQL_USER: guacamole
      EXTENSION_PRIORITY: "*, saml" # comment out to always use SAML auth
      SAML_IDP_URL: https://login.microsoftonline.com/guid/saml2
      SAML_ENTITY_ID: https://guacamole
      SAML_CALLBACK_URL: https://guacamole
      SAML_IDP_METADATA_URL: file:///opt/guacamole/metadata.xml
    image: guacamole/guacamole
    links:
    - guacd
    networks:
      guacnet:
    ports:
    - 8080:8080/tcp # Guacamole is on :8080/guacamole, not /.
    restart: always
    volumes:
     - ./start.sh:/opt/guacamole/bin/start.sh
     - ./metadata.xml:/opt/guacamole/metadata.xml
     - ./server.xml:/usr/local/tomcat/conf/server.xml
{% endhighlight %}

As you can see from the above compose file, guacd requires very little config.

Guacamole requires some config however, including:
- A hostname for guacd (essentially the name of the guacd container)
- The config for our MySQL database 