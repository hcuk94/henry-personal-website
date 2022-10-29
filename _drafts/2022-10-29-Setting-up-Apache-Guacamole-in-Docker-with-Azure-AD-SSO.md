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

## Azure AD Setup
First things first, lets set up our Azure AD application.

Navigate to the Azure Portal, click **Azure Active Directory** followed by **Enterprise Applications**, then click **New application**

On the following page choose **Create your own application**

<img src="/img/blog/2022-10/guacamole-sso-azure-create-app.png" class="post-img" alt="Screenshot of Azure portal showing App Creation Screen">

Once the app is created, in the sidebar click **Users and groups**, then select users/groups to allow access to Guacamole.

Back on the application page, click **Single Sign-on** in the sidebar, then click **SAML**.

<img src="/img/blog/2022-10/guacamole-sso-azure-config-saml.png" class="post-img" alt="Screenshot of Azure portal showing SAML configuration">

On step 1, click **Edit** and populate the *Identifier* and *Reply URL* with the base URL for your Guacamole install - this could be something like https://guacamole.example.com/guacamole

Next, on step 3, make note of the *App Federation Metadata Url*, and from step 4, take the *Login URL* - you'll need both of these shortly.

## Configure Guacamole Accounts
Next, we need to add our first Azure AD account into Guacamole. Others can follow at a later date, but right now lets just add an admin account.

Log in to Guacamole using your existing admin login (or the default guacuser if its a new install).

Click **Settings->Users** and add a new user. Leave the password blank, but set up other details. The username must match the email address in Azure AD:

<img src="/img/blog/2022-10/guacamole-sso-user-add.png" class="post-img" alt="Screenshot of Apache Guacamole showing the process of adding a user">

In the **Permissions** section, tick all permissions so we have an admin account ready to go once our SSO is set up and working.

## Docker Container Setup

We now need to configure our Guacamole Docker container to use the SAML plugin to authenticate against Azure AD.

I'm using the official guacamole/guacamole and guacamole/guacd Docker images from Apache, and I recommend doing the same. If you are not using Docker then you will need to modify your server files accordingly.

### Tweaks
I hit a couple of snags along the way which I've managed to resolve, but which require a little bit of tweaking:

#### Tweak One: Update start.sh script
When running Guacamole in Docker, your configuration options should be specified as environment variables. 
In Guacamole 1.4.0 however, the start.sh script used by Docker does not include the SAML module or its environment variables, even though the SAML module is shipped with this version of Guacamole.

If by the time you read this, Guacamole 1.5.0 is available then this should be a moot point, however if running 1.4.0 I recommend you download the latest version of start.sh from GitHub and save it in the same directory as your docker-compose.yml - otherwise your SAML variables will not be picked up.

Link to updated script here: [https://github.com/apache/guacamole-client/blob/master/guacamole-docker/bin/start.sh](https://github.com/apache/guacamole-client/blob/master/guacamole-docker/bin/start.sh)

We will then link this to the docker container in our compose file shortly.

#### Tweak Two: Edit Tomcat server.xml to set protocol to HTTPS
If you are running Guacamole on HTTP, and running a reverse proxy to provide TLS support, then you will likely need to specify in your Tomcat server.xml file that it is running over https, or you will get an error in your logs like the below:

*18:37:53.931 [http-nio-8080-exec-2] WARN  o.a.g.a.s.a.AssertionConsumerServiceResource - Authentication attempted with an invalid SAML response: SAML response did not pass validation: The response was received at http://guacamole.example.com/guacamole/api/ext/saml/callback instead of https://guacamole.example.com/guacamole/api/ext/saml/callback*

To do this, run the following command in the same directory as your docker-compose.yml on your docker host:

```
sudo docker exec -it guacamole cat /usr/local/tomcat/conf/server.xml >> server.xml
```
You will need to change *guacamole* to the name of your container if it differs.

You will now have a server.xml file in your docker compose directory. Open it with your favourite editor and find the below section:
```
<Connector port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443" scheme="https" />
```
Note the **scheme="https"** - this is the part you need to add, it will not be in this block by default.

Once you have done this, save and close the file.

### Docker Environment Variables

We now need to add the following environment variables to our docker compose file:

| Environment Variable      | Description |
| ------------------------- | ----------- |
| EXTENSION_PRIORITY        | Set to "SAML" to always use SAML auth, or set to "*, SAML" if you prefer to be given the choice.       |
| SAML_IDP_URL              | The 'Login URL' you saved from Azure.        |
| SAML_ENTITY_ID            | Your Guacamole URL |
| SAML_CALLBACK_URL         | Your Guacamole URL |
| SAML_IDP_METADATA_URL     | The 'App Federation Metadata URL' you saved from Azure |

You will also need to mount the following volumes to the container, per the 'Tweaks' section above:
```
volumes:
    - ./start.sh:/opt/guacamole/bin/start.sh
    - ./server.xml:/usr/local/tomcat/conf/server.xml
```
You can download my full docker-compose.yml for Guacamole and guacd [here](/img/blog/2022-10/guacamole-sso-docker-compose.yml){:target="_blank"}.



## Nginx Setup
Presuming you have Nginx in place as a reverse proxy, you'll need to ensure headers are set so that Guacamole receives the correct hostname for the SSO request - else it'll fail:

```
        location /guacamole {
                proxy_pass http://dockerhost:8080/guacamole;
                proxy_buffering off;
                proxy_http_version 1.1;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
                proxy_set_header Host $host;
                proxy_set_header X-Forwarded-Host $host;
                proxy_set_header X-Forwarded-Server $host;
                proxy_set_header X-Forwarded-Proto $scheme;
        }
```
NB: In this example I am using /guacamole as the location - this is because otherwise you will get a SAML validation failure. You could however add a similar block in your Nginx config for the root (/) so that the application is still accessible at this level.

## Restart Containers and Test
Once all this is done, we can re-apply our Docker Compose config to bring the containers back up:
```
sudo docker-compose up -d
```
In my case Nginx is run on separate infrastructure, so I also performed a reload of Nginx elsewhere.

Once Guacamole is back up, you can test your SSO. Depending on how you configured the EXTENSION_PRIORITY environment variable, you will either be taken straight to Azure AD auth, or presented with the Guacamole login and an option to use SSO.







