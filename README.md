Mendix for Raspberry Pi - Balena Buildpack
===

**Version: 0.1.0**

## Disclaimer

**Note: This is work in progress and should not be used for any production setup. This README is not finished yet. See TODO (bottom of this README) for all steps that are still in development. We do not take responsibility if your Raspberry Pi decides to take over the world.**

> This is not supported by [Mendix](https://www.mendix.com/), purely a proof-of-concept created by two Mendix developers.

## Description

The Mendix Balena Buildpack is an attempt to run a Mendix application on a Raspberry Pi 3. We do this by forking the official Mendix build pack so that it will run on ARM and combining this with a ready-to-go configuration of NGINX & PostgreSQL in separate containers on the Raspberry Pi.

This modified buildpack also contains WiringPi ([version 2.46.1](http://wiringpi.com/wiringpi-updated-for-the-pi-v3plus/), included) & Pi4J ([version 1.2-SNAPSHOT](http://pi4j.com/download.html), included), so we can control GPIO ports from Java Actions in Mendix. A separate module for this will be published later on.

It is based on the following sources:

- [Mendix Buildpack for Docker](https://github.com/MXClyde/docker-mendix-buildpack/tree/pi) - this is the forked Mendix Docker buildpack made to run on ARM
- [Mendix Buildpack for Cloud Foundry](https://github.com/MXClyde/cf-mendix-buildpack/tree/pi) - this is modified and will be downloaded as part of the Docker buildpack flow.
- [Balena Raspberry Pi3 Ubuntu base image with OpenJDK](https://hub.docker.com/r/balenalib/raspberrypi3-ubuntu-openjdk/)

## Instructions

1. Create an account on Balena.io, create an application for Raspberry Pi 3 and burn the image on an SD. Have a look at [the How-to](https://www.balena.io/docs/learn/getting-started/raspberrypi3/nodejs/#create-an-application) describing setting this up for NodeJS. Follow the steps up to (and included) [Provision device](https://www.balena.io/docs/learn/getting-started/raspberrypi3/nodejs/#provision-your-device). From there on out, we will follow the steps that are described below.
2. Clone this repository from Github to your computer
3. Add the balena remote to this respository: `git remote add balena <username>@git.balena-cloud.com:<username>/<repo>.git`. You can find this command in the top right of your Balena dashboard in an app.
4. Create a deployment package for your application in Mendix Modeler.
5. Take the .MDA file and unzip it in the project folder in `docker-mendix-buildpack/project`. Your project folder should contain two folders: `web` & `model`.
6. Now copy the `web` folder to the nginx folder in this buildpack. This is needed to serve static files.

This folder should have the following structure (leave all other folder and files **AS IS**):

```
├── docker-compose.yml
├── docker-mendix-buildpack
│   └── project
│       ├── web <web-folder from deployment>
│       └── model <model-folder from deployment>
└── nginx
    └── web <web-folder from deployment>
```

7. Make changes to the Docker compose file, adding a License ID & Key (if necessary), your admin password, maybe a remote database. **Note: You can also put these as ENVIRONMENT variables in your Balena configuration (which is preferable instead of putting this in the configuration files itself). See [Environment and service variables on Balena.io](https://www.balena.io/docs/learn/manage/serv-vars/)**
7. Now add everything to a commit: `git add --all :/` and `git commit -m "Commit message"`
8. Push it to Balena: `git push balena master`
9. See the magic happening

## Local development

`This section is not finished yet`

It is possible, using the Balena Cli, to build the Docker images locally. This will fix problems with the build server ARM1, which sometimes fails. (because you are building it locally).

### Build

1. Make sure Docker is running on your computer
2. Make sure Balena Cli is installed on your computer and you are logged in.
3. Run the following command: `balena build --deviceType raspberrypi3 --arch armv7hf --emulated --verbose --logs`
4. This will build all the images and store them in your local Docker

### Deploy

1. Make sure the build in the previous step is succesful
2. Deploy to Balena with the following command: `balena deploy <username>/<app-name>`

See for further instructions _*[Balena Cli Docs](https://www.balena.io/docs/reference/cli/)*_

## CI/CD

*_CONCEPT: not ready yet_*

This isn't finished yet, but the authors were able to create a CI/CD pipeline in Azure Devops, so you can just commit to the Teamserver in Mendix and it will automatically deploy to Balena. This will be updated once we have finished up the writeup for this. Right now this is using undocumented tools to download a deployment package, for which it is unable to be documented yet.

## TODO

This project is a proof of concept. The following things are on the todo list:

- Use the MDA file instead of the unzipped contents
- Check if we need the web folder (static content) in the mendix buildpack, or only in NGINX
- Finish up the RPI Module for Mendix (this will be a separate repository)
- `docker-compose.yml` includes a reference to a container for Google Cloud IOT, which is a way to send data to Google Cloud IOT. This component needs further development before it can be reliably used.
- We will update the Dockerfile in the Mendix buildpack to become a `Dockerfile.template`, making it possible to run it on other devices as well.
