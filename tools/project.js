require("dotenv/config");

const unzipper = require('unzipper');
const shell = require('shelljs');
const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');

const deploymentTMP = path.resolve("./tmp", 'balena-mendix');

if (!process.env.BALENA_MENDIX_PROJECT) {
    console.error("BALENA_MENDIX_PROJECT does not exist, have you set the correct environment variables?");
    process.exit(1);
}

const sourceFolder = path.resolve(path.join(process.env.BALENA_MENDIX_PROJECT, 'releases/'));
const distFolder = path.resolve('./docker/');

const unzip = (file, dest) =>
    fs.createReadStream(file)
        .pipe(unzipper.Extract({
            path: dest
        }))
        .promise();

const copyMendixProject = async (callback = () => {}) => {
    try {
        await fs.emptyDir(deploymentTMP);

        const files = shell.ls('-l', sourceFolder).filter(l => l && l.name && l.name.indexOf(".mda") !== -1);

        if (!files || files.length === 0) {
            console.log('No file detected');
            callback();
            return;
        }

        const topFile = path.resolve(path.join(sourceFolder, (_.sortBy(files, 'atimeMs').pop()).name));

        console.log('Processing: ' + topFile);

        const distModel = path.resolve(path.join(distFolder, 'docker-mendix-buildpack/project/model'));
        const distNative = path.resolve(path.join(distFolder, 'docker-mendix-buildpack/project/native'));
        const distWeb = path.resolve(path.join(distFolder, 'docker-mendix-buildpack/project/web'));
        const distNginxWeb =path.resolve( path.join(distFolder, 'nginx/web'));
        const distFile = path.resolve(path.join(deploymentTMP, path.basename(topFile)));

        await fs.copy(topFile, distFile);

        await unzip(distFile, deploymentTMP);

        await fs.emptyDir(distModel);
        await fs.emptyDir(distNative);
        await fs.emptyDir(distWeb);
        await fs.emptyDir(distNginxWeb);

        await fs.copy(path.resolve(path.join(deploymentTMP, 'web')), distWeb);
        await fs.copy(path.resolve(path.join(deploymentTMP, 'model')), distModel);
        await fs.copy(path.resolve(path.join(deploymentTMP, 'native')), distNative);
        await fs.copy(path.resolve(path.join(deploymentTMP, 'web')), distNginxWeb);
    } catch (error) {
        console.error('Error', error);
    }
}

copyMendixProject();
