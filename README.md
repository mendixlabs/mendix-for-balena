Mendix for Raspberry Pi - Balena Buildpack
===

**Version: 0.2.0**

## Disclaimer

**Note: This is work in progress and should not be used for any production setup. This README is not finished yet. See TODO (bottom of this README) for all steps that are still in development. We do not take responsibility if your Raspberry Pi decides to take over the world.**

> This is not supported by [Mendix](https://www.mendix.com/), purely a proof-of-concept created by two Mendix developers.

## Description

The Mendix Balena Buildpack allows you to run a Mendix application on a Raspberry Pi 3/4. We do this by forking the official Mendix build pack so that it will run on ARM and combining this with a ready-to-go configuration of NGINX & PostgreSQL in separate containers on the Raspberry Pi.

> In a previous version we included WiringPi, but this has been deprecated, as it doesn't work on a 64-bit architecture like the Raspberry Pi 4.

It is based on the following sources:

- [Mendix Buildpack for Docker](https://github.com/MXClyde/docker-mendix-buildpack/tree/pi) - this is the forked Mendix Docker buildpack made to run on ARM
- [Mendix Buildpack for Cloud Foundry](https://github.com/MXClyde/cf-mendix-buildpack/tree/pi) - this is modified and will be downloaded as part of the Docker buildpack flow.
- [Balena Raspberry Pi3 Ubuntu base image with OpenJDK](https://hub.docker.com/r/balenalib/raspberrypi3-ubuntu-openjdk/)

## Instructions

1. Create an account on Balena.io, create an application for Raspberry Pi 3 and burn the image on an SD. Have a look at [the How-to](https://www.balena.io/docs/learn/getting-started/raspberrypi3/nodejs/#create-an-application) describing setting this up for NodeJS. Follow the steps up to (and included) [Provision device](https://www.balena.io/docs/learn/getting-started/raspberrypi3/nodejs/#provision-your-device). From there on out, we will follow the steps that are described below.
2. Clone this repository from Github to your computer
3. Add the balena remote to this respository: `git remote add balena <username>@git.balena-cloud.com:<username>/<repo>.git`. You can find this command in the top right of your Balena dashboard in an app.
4. Create a deployment package for your application in Mendix Modeler.
5. Take the .MDA file and unzip it in the project folder in `docker/docker-mendix-buildpack/project`. Your project folder should contain two folders: `web` & `model`.
6. Now copy the `web` folder to the nginx (`docker/nginx`) folder in this buildpack. This is needed to serve static files.

Your repository should have the following (partial) structure (**_leave all other folder and files AS IS_**):

```
├── docker-compose.yml
├── docker/docker-mendix-buildpack
│   └── project
│       ├── web <web-folder from deployment>
│       └── model <model-folder from deployment>
└── docker/nginx
    └── web <web-folder from deployment>
```

7. Make changes to the Docker compose file, adding a License ID & Key (if necessary), your admin password, maybe a remote database. **Note: You can also put these as ENVIRONMENT variables in your Balena configuration (which is preferable instead of putting this in the configuration files itself). See [Environment and service variables on Balena.io](https://www.balena.io/docs/learn/manage/serv-vars/)**
7. Now add everything to a commit: `git add --all :/` and `git commit -m "Commit message"`
8. Push it to Balena: `git push balena master`
9. See the magic happening

## Local development

> Local development has changed since the previous iteration, now automating things using Node tools.

It is possible, using the Balena Cli, to build the Docker images locally. This will fix problems with the build server ARM1, which sometimes fails. Images are stored in your local Docker repo (on your computer). We're also checking if it will be possible to put this image on Docker Hub to make development easier.

### Automatic

1. Make sure Docker is running on your computer. You can download this for Mac/Linux/[Windows](https://docs.docker.com/docker-for-windows/)
2. Make sure you have Node 10.x (LTS) installed. (Tip, for Windows, use [NVM](https://github.com/coreybutler/nvm-windows))
3. Make sure you have installed the Balena cli, this can be done using NodeJS `npm install balena-cli -g` or download the installer [here](https://github.com/balena-io/balena-cli/releases/latest). The installer is necessary when you use this setup on Windows, on Mac you can use the NodeJS command
4. Copy the `.env.example` file to `.env` en fill in the correct values. You will need a Balena token (for authentication when deploying)
5. Run the following command (in a terminal) **ONCE** to install dependencies: `npm install`
6. Run `npm run project` to copy the most recent release from your Mendix project in this setup
7. Run `npm run build` to build the Docker image
8. Run `npm run deploy` to deploy this to your device

#### Environment variables

The automated tools will make use of a few environment variables. These can be set in your CI/CD pipeline, in your command when executing your npm tasks, or by the use of an `.env` file. The file contains the following (replace this with your values):

```text
BALENA_REPO="<userName>/<Balena App Name>"
BALENA_TOKEN="<token coming from Balena, used to login>"
BALENA_DEVICE="raspberrypi4-64"
BALENA_ARCH="aarch64"
BALENA_MENDIX_PROJECT="<Location of the root folder of your Mendix app>"
```

Explanation:

- **BALENA_REPO**
    - You can find this in your Balena app screen. On the top right it says `git remote add balena jwlagendijk@git.balena-cloud.com:jwlagendijk/balena-mendix-iot.git`. Derived from this, the repo in my case would be `jwlagendijk/balena-mendix-iot``
- **BALENA_TOKEN**
    - In order to push to your Balena app, you need to be authorized. This is done using a token, the documentation can be found [here](https://www.balena.io/docs/learn/manage/account/#access-tokens)
- **BALENA_DEVICE**
    - This has to do with the type of device you are building for. In my example I am building for a `Raspberry Pi 4 - 64Bit` device. The list of machines can be found [here](https://www.balena.io/docs/reference/base-images/devicetypes/)
- **BALENA_ARCH**
    - This is the architecture. [Same list as previous](https://www.balena.io/docs/reference/base-images/devicetypes/)
- **BALENA_MENDIX_PROJECT**
    - This will tell the `project` task where to find the Mendix project. Make sure you point to the **root** folder of your project. This folder should contain a folder called 'releases' with MDA files in it. If you are using a CI/CD pipeline, please make sure you use that same structure.

### Manual

#### Build

1. Make sure Docker is running on your computer
2. Make sure Balena Cli is installed on your computer and you are logged in.
3. Run the following command: `balena build --deviceType raspberrypi3 --arch armv7hf --emulated --verbose --logs`
4. This will build all the images and store them in your local Docker

#### Deploy

1. Make sure the build in the previous step is succesful
2. Deploy to Balena with the following command: `balena deploy <username>/<app-name>`

See for further instructions _*[Balena Cli Docs](https://www.balena.io/docs/reference/cli/)*_

## CI/CD

*_CONCEPT: not ready yet_*

This isn't finished yet, but the authors were able to create a CI/CD pipeline in Azure Devops, so you can just commit to the Teamserver in Mendix and it will automatically deploy to Balena. This will be updated once we have finished up the writeup for this. Right now this is using undocumented tools to download a deployment package, for which it is unable to be documented yet.

## TODO

This project is a proof of concept. The following things are on the todo list:

- `docker-compose.yml` includes a reference to a container for Google Cloud IOT, which is a way to send data to Google Cloud IOT. This component needs further development before it can be reliably used.
