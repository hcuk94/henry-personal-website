---
layout: post
title: "Setting up Apache Guacamole in Docker with Azure AD SAML SSO"
excerpt: "Apache Guacamole is a clientless HTML5 remote desktop gateway. This is a quick guide on getting it up and running in Docker with SSO to Azure AD - ideal for home lab or small business environments."
comments: true
---
Apache Guacamole is a clientless remote desktop gateway, giving you easy and secure access to protocols such as RDP, SSH and VNC via an HTML5 web app.

In this write-up, I'll be using Docker to run the application, with an Nginx proxy in front and a MySQL database behind. The latter 2 services are run independently in my architecture, so from a Docker perspective I will be covering only Guacamole.

## Docker Compose
I'm using Docker Compose to define my Guacamole services, with the official guacamole and guacd images from Docker Hub.

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
#      EXTENSION_PRIORITY: "*, saml"
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
    - 8090:8080/tcp # Guacamole is on :8080/guacamole, not /.
    restart: always
    volumes:
     - ./start.sh:/opt/guacamole/bin/start.sh
     - ./metadata.xml:/opt/guacamole/metadata.xml
     - ./server.xml:/usr/local/tomcat/conf/server.xml
{% endhighlight %}