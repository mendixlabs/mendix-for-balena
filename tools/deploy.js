const {execute} = require("./_core");

(async () => {
    if (!process.env.BALENA_REPO) {
        console.error("BALENA_REPO is missing, are you sure you have set the correct env variables?");
        process.exit(1);
    }
    await execute([
        "deploy",
        process.env.BALENA_REPO
    ]);
})();
