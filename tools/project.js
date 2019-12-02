require("dotenv/config");

const execa = require('execa');
const shell = require('shelljs');
const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');

const deploymentTMP = path.resolve("./tmp", 'balena-mendix');

if (!process.env.BALENA_MENDIX_PROJECT) {
    console.error("BALENA_MENDIX_PROJECT does not exist, have you set the correct environment variables?");
    process.exit(1);
}

const sourceFolder = path.join(process.env.BALENA_MENDIX_PROJECT, 'releases/');
const distFolder = './docker/';

const copyMendixProject = async (callback = () => {}) => {

    await fs.ensureDir(deploymentTMP);
    await fs.emptyDir(deploymentTMP);

    const files = shell.ls('-l', sourceFolder).filter(l => l && l.name && l.name.indexOf(".mda") !== -1);

    if (!files || files.length === 0) {
        console.log('No file detected');
        callback();
        return;
    }

    const topFile = path.join(sourceFolder, (_.sortBy(files, 'atimeMs').pop()).name);

    console.log('Processing: ' + topFile);

    const distModel = path.join(distFolder, 'docker-mendix-buildpack/project/model');
    const distNative = path.join(distFolder, 'docker-mendix-buildpack/project/native');
    const distWeb = path.join(distFolder, 'docker-mendix-buildpack/project/web');
    const distNginxWeb = path.join(distFolder, 'nginx/web');
    const distFile = path.join(deploymentTMP, path.basename(topFile));

    await fs.copy(topFile, distFile);
    await execa('unzip', ['-X', '-K', distFile], { cwd: deploymentTMP });

    await fs.remove(distModel);
    await fs.remove(distNative);
    await fs.remove(distWeb);
    await fs.remove(distNginxWeb);

    await fs.copy(path.join(deploymentTMP, 'web'), distWeb);
    await fs.copy(path.join(deploymentTMP, 'model'), distModel);
    await fs.copy(path.join(deploymentTMP, 'native'), distNative);
    await fs.copy(path.join(deploymentTMP, 'web'), distNginxWeb);
}

copyMendixProject();
