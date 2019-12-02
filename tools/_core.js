require("dotenv/config");

const execa = require("execa");

const checkTOKEN = () => {
    if (!process.env.BALENA_TOKEN) {
        console.error("BALENA_TOKEN is missing, are you sure you have set the correct env variables?");
        process.exit(1);
    }
}

const login = async () => {
    checkTOKEN();
    return execa('./node_modules/.bin/balena', [
        "login",
        "--token",
        process.env.BALENA_TOKEN
    ]);
}

const execute = async (execArgs, pipeOut = true) => {
    await login();
    const buildProc = execa('./node_modules/.bin/balena', execArgs);

    if (pipeOut) {
        buildProc.stdout.pipe(process.stdout);
    }

    await buildProc;
}

module.exports = {
    login,
    execute
};
