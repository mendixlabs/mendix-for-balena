const {execute} = require("./_core");

(async () => {
    await execute([
        "build",
        "--deviceType",
        process.env.BALENA_DEVICE || "raspberrypi3",
        "--arch",
        process.env.BALENA_ARCH || "armv7hf",
        "--emulated",
        "--verbose",
        "--logs"
    ]);
})();
