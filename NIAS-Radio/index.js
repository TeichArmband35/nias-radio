// Requirements
const { spawn } = require("child_process");
const fs = require('fs');

// Passwords and stuff
const username = "source";
const passwort = "admin123"; // Your broadcast password here
const port = 3000; // Your broadcast port here
const streamUrl =
    `icecast://${username}:${passwort}@uk2freenew.listen2myradio.com:${port}/stream`;

// Making logs prettier
const RED = "\x1b[31m"; // red
const YELLOW = "\u001b[38;2;253;182;0m" // yellow
const RESET = "\x1b[0m"; // reset of color

const ErrorWarnung = RED + " ERROR]:";
const WarnungWarnung = YELLOW + " WARNING]:";
const Info = RESET + " INFO]:";
const Debug = RESET + " DEBUG]:";

async function log(msg, type, fatal, name) {
    var time = new Date().toISOString();
    if (type === 1) {
        console.log(`\x1b[35m${time}\x1b[0m ${ RED + "[" + name + ErrorWarnung} ${msg} ${RESET}`);
        if (fatal) {
            console.error(msg);
            process.exit(1);
        }
    }
    if (type === 2) {
        console.log(`\x1b[35m${time}\x1b[0m ${YELLOW + "[" + name + WarnungWarnung} ${msg} ${RESET}`);
    }
    if (type === 3) {
        console.log(`\x1b[35m${time}\x1b[0m ${RESET + "[" + name + Info} ${msg} ${RESET}`);
    }
    if (type === 4) {
        console.log(`\x1b[35m${time}\x1b[0m ${RESET + "[" + name + Debug} ${msg} ${RESET}`);
    }
}

// RAM
const RAMprerec = {
    r7: [],
    r6: [],
    r5: [],
    r4: [],
    r3: [],
    r2: [],
    r1: [],
};

const RAMmusic = {
    r7: [],
    r6: [],
    r5: [],
    r4: [],
    r3: [],
    r2: [],
    r1: [],
};

// Pushing in RAM
async function RAMprerecPush(file) {
    try {
        for (let i = 7; i >= 2; i--) {
            RAMprerec[`r${i}`] = RAMprerec[`r${i - 1}`];
            await log(`Push: ${RAMprerec[`r${i}`]}`, 4, false, "RAMprerecPush");
        }
        RAMprerec.r1 = file;
        await log(`Push: ${RAMprerec.r1}`, 4, false, "RAMprerecPush");
    } catch (e) {
        return await log(`Unknown Error: ${e}`, 1, true, "RAMprerecPush");
    }
}

async function RAMmusicPush(file) {
    try {
        for (let i = 7; i >= 2; i--) {
            RAMmusic[`r${i}`] = RAMmusic[`r${i - 1}`];
            await log(`Push: ${RAMmusic[`r${i}`]}`, 4, false, "RAMmusicPush");
        }
        RAMmusic.r1 = file;
        await log(`Push: ${RAMmusic.r1}`, 4, false, "RAMmusicPush");
    } catch (e) {
        return await log(`Unknown Error: ${e}`, 1, true, "RAMmusicPush");
    }
}

// Checking RAM
async function RAMmusicCheck(file) {
    try {
        for (var i = 7; i >= 1; i--) {
            if (RAMmusic[`r${i}`] === file) {
                return true;
            }
        }
        return false;
    } catch (e) {
        return await log(`Unknown Error: ${e}`, 1, true, "RAMmusicCheck");
    }
}

async function RAMprerecCheck(file) {
    try {
        for (var i = 7; i >= 1; i--) {
            if (RAMprerec[`r${i}`] === file) {
                return true;
            }
        }
        return false;
    } catch (e) {
        return await log(`Unknown Error: ${e}`, 1, true, "RAMmusicCheck");
    }
}

// Counting RAM

async function RAMprerecCount() {
    var count = 0;
    for (var i = 7; i >= 1; i--) {
        if (RAMprerec[`r${i}`] !== null) {
            count++;
        }
    }
    return count;
}

async function RAMmusicCount() {
    var count = 0;
    for (var i = 7; i >= 1; i--) {
        if (RAMmusic[`r${i}`] !== null) {
            count++;
        }
    }
    return count;
}

// Setting intervals
var timeoutIntervalWarnings = [];
var timeoutIntervalPrerec = [];

setInterval(() => coordinateFFmpeg(), 30000);

function startWarningInterval() {
    clearInterval(timeoutIntervalWarnings);
    timeoutIntervalWarnings = setInterval(() => warningIssuedTimer(), 10000);
    log("timeoutIntervalWarnings start", 4, false, "startWarningInterval()");
}

function startPrerecInterval() {
    clearInterval(timeoutIntervalPrerec);
    timeoutIntervalPrerec = setInterval(() => prerecIssuedTimer(), 40000);
    log("timeoutIntervalPrerec start", 4, false, "startPrerecInterval()");
}

// Pre-Recorded msg:
const premsg = [
    "PreRecorededMsg/keineMeldungen.wav",
    "PreRecorededMsg/notfallTipps.wav",
    "PreRecorededMsg/sirenenSignaleFacts.wav",
    "PreRecorededMsg/bundesweiterWarntag.wav",
    "PreRecorededMsg/extremWetter.wav",
    "PreRecorededMsg/feuerwehrNotrufSIM.wav",
    "PreRecorededMsg/notrufNummern.wav",
    "PreRecorededMsg/wasserVorrat.wav",
]

// Random File Choosing

var preRecMsgPlayed = false;
var chooseFileDone = false;
var random = 0;
var override = false;
var lastPreRecorededMsg = null;

async function chooseFile() {
    if (chooseFileDone) {
        await log("Choose File already done, returning", 4, false, "chooseFile()");
        return;
    }
    if (lastPreRecorededMsg) {
        random = Math.floor(Math.random()*premsg.length);
        await log(`random === ${random}, using if`, 4, false, "chooseFile()");

        while (lastPreRecorededMsg === premsg[random]) {
            await log(`old prerecmsg (${lastPreRecorededMsg}) === new prerecmsg (${premsg[random]}), retrying`, 2, false, "chooseFile()");
            random = Math.floor(Math.random()*premsg.length);
        }

        while (await RAMprerecCheck(premsg[random])) {
            await log(`new prerecmsg (${premsg[random]}) is in RAM, retrying`, 2, false, "chooseFile()");
            random = Math.floor(Math.random()*premsg.length);
        }

    } else {
        random = Math.floor(Math.random()*premsg.length);
        await log(`random === ${random}, using else`, 4, false, "chooseFile()");
    }

    lastPreRecorededMsg = premsg[random];
    await RAMprerecPush(lastPreRecorededMsg);
    await log(`lastPreRecorededMsg: ${lastPreRecorededMsg}`, 4, false, "chooseFile()");
    chooseFileDone = true;
}

// Deleting Warnings
var playedWarning = 0;
async function warningDeletionCheck() {
    if (playedWarning > 3) {
        return true;
    }
    else {
        return false;
    }
}

async function deleteWarning() {
    if (await warningDeletionCheck()) {
        fs.unlink(audiofile, async (err) => {
            if (err) {
                await log(`Unknown error when deleting file: ${err}`, 1 , false, "deleteWarning()");
                return;
            }
            await log("Deletion of warning complete", 2, false, "deleteWarning()");
            playedWarning = 0;
        });
    }
}

// Coordinating ffmpeg
const audiofile = "./output.mp3";
var warningHasBeenIssued = false;
var prerecHasBeenIssued = false;

async function checkFile() {
    if (fs.existsSync(audiofile)) {
        return true;
    } else {
        return false;
    }
}

async function coordinateFFmpeg() {
    if (await RAMmusicCount() >= 7 ) {
        await log(`Clearing RAMmusic, RAMmusic.length: ${Object.keys(RAMmusic).length}`, 2, false, "coordinateFFmpeg()");
        for (var i = 7; i >= 1; i--) {
            await log(`RAMmusic: ${RAMmusic[`r${i}`]}`, 4, false, "coordinateFFmpeg()");
            RAMmusic[`r${i}`] = null;
            await log(`RAMmusic: ${RAMmusic[`r${i}`]}`, 4, false, "coordinateFFmpeg()");
        }
    }

    if (await RAMprerecCount() >= 7 ) {
        await log(`Clearing RAMprerecCount, RAMprerecCount.length: ${Object.keys(RAMprerecCount).length}`, 2, false, "coordinateFFmpeg()");
        for (var i = 7; i >= 1; i--) {
            await log(`RAMmusic: ${RAMprerec[`r${i}`]}`, 4, false, "coordinateFFmpeg()");
            RAMprerec[`r${i}`] = null;
            await log(`RAMmusic: ${RAMprerec[`r${i}`]}`, 4, false, "coordinateFFmpeg()");
        }
    }

    var warningissued = await checkFile();
    if (!chooseFileDone && !prerecHasBeenIssued) {
        await log("Choose File not done, calling chooseFile()", 2, false, "coordinateFFmpeg()");
        await chooseFile();
    }
    if (warningissued) {
        if (runningFFmpeg) {
            await log("ffmpeg already running, skipping warning", 2, false, "coordinateFFmpeg()");
            return;
        }
        if (warningHasBeenIssued)  {
            await log(`warningHasBeenIssued === ${warningHasBeenIssued}, skipping warning`, 2, false, "coordinateFFmpeg()");
            return;
        }
        if (!(await warningDeletionCheck())) {
            await playPlaylist(warningissued);
            warningHasBeenIssued = true;
        } else {
            await deleteWarning();
        }
        playedWarning++;
    } else {
        if (prerecHasBeenIssued) {
            await log("PreRec hasBeenIssued, returning", 2, false, "coordinateFFmpeg()");
            return;
        }
        if (runningFFmpeg) {
            await log("ffmpeg already running, skipping prerec msg", 2, false, "coordinateFFmpeg()");
        } else {
            prerecHasBeenIssued = true
            await playPlaylist(warningissued);
        }
    }
}

// Streaming music / noise files
const music = [
    "Music/bagellust.mp3",
    "Music/bootloader.mp3",
    "Music/runningerrands.mp3",
    "Music/cacherich.mp3",
    "Music/cartoonslooking.mp3",
    "Music/closingtime.mp3",
    "Music/easterncredits.mp3",
    "Music/miamichai.mp3",
]

// Play ffmpeg
var runningFFmpeg = false;

async function playPlaylist(warning) {
    if (runningFFmpeg) {
        await log("ffmpeg already running, returning", 2, false, "ffmpeg");
        return;
    }
    runningFFmpeg = true;

    if (warning) {
        preRecMsgPlayed = true;
        override = true;
        await log(`warning received, override === ${override}`, 2, false, "ffmpeg");

        await pipeAudio(audiofile); // change pipe from music to warning
        startWarningInterval();
    } else {
        await pipeAudio(premsg[random]);
        startPrerecInterval(); // change pipe from music to prerecorded message
    }
}

// Start Stream

var ffmpegStream = null;
var currentSource = null;

function startStream() {
    ffmpegStream = spawn("ffmpeg", [
        "-re",
        "-f", "mp3",
        "-i", "pipe:0",
        "-c:a", "libmp3lame",
        "-b:a", "128k",
        "-f", "mp3",
        "-content_type", "audio/mpeg",
        "-reconnect", "1", // reconnect if stream died
        "-reconnect_streamed", "1", // reconnect if stream died
        streamUrl
    ]);

    ffmpegStream.stderr.on("data", data =>
        log(`${data}`, 4, false, "ffmpeg-stream")
    );

    ffmpegStream.on("close", code => {
        log(`FFmpeg stream closed: ${code}`, 1, false, "ffmpeg-stream");

        if (currentSource) {
            currentSource.kill("SIGKILL");
            currentSource = null;
        }

        ffmpegStream = null;

        setTimeout(() => {
            startStream();
        }, 1000);
    });
    log("Stream started", 3, false, "startStream()");
}

// Audio Pipe
var lastmusic = null;

function pipeAudio(file, loop = false) {
    if (currentSource) {
        currentSource.kill("SIGKILL");
        currentSource = null;
    }
    const args = [];
    if (loop) args.push("-stream_loop", "-1");
    args.push("-i", file, "-vn", "-f", "mp3", "-");

    currentSource = spawn("ffmpeg", args);

    if (!ffmpegStream || !ffmpegStream.stdin || ffmpegStream.stdin.destroyed) {
        log("FFmpeg stream stdin is not available", 1, false, "pipeAudio()");
        currentSource.kill("SIGKILL");
        currentSource = null;
        return;
    }

    currentSource.stdout.pipe(ffmpegStream.stdin, { end: false }); // Stream audio to pipe

    currentSource.stderr.on("data", data =>
        log(`${data}`, 4, false, "ffmpeg-source")
    );

    currentSource.on("close", async code => {
        log(`Source-Process end: ${code}`, 4, false, "ffmpeg-source");
        currentSource = null;

        if (code === null) {
            log("source killed SIGKILL, no restart", 2, false, "ffmpeg-source");
            return;
        }

        runningFFmpeg = false;
        chooseFileDone = false;

        var i = Math.floor(Math.random()*music.length);
        if (lastmusic) {

            while (music[i] === lastmusic) {
                log(`old music (${lastmusic}) === new music (${music[i]}), retrying`, 2, false, "pipeAudio");
                i = Math.floor(Math.random()*music.length);
            }

            while (await RAMmusicCheck(music[i])) {
                log(`new music (${music[i]}) is in RAM, retrying`, 2, false, "pipeAudio");
                i = Math.floor(Math.random()*music.length);
            }

            log(`old music (${lastmusic}) !== new music (${music[i]}), retrying complete`, 2, false, "pipeAudio");
            pipeAudio(music[i], false); // stream music if warning finished
        } else {
            pipeAudio(music[i], false); // stream music if warning finished
        }

        log(`Playing Music: ${music[i]}`, 2, false, "pipeAudio");
        lastmusic = music[i];
        RAMmusicPush(lastmusic);
        log(`lastmusic: ${lastmusic}`, 4, false, "pipeAudio");

    });
    log(`Piping: ${file}`, 3, false, "pipeAudio()");
}

// Checking for new Warnings
var warningTimer = 0
var prerecTimer = 0

function warningIssuedTimer() {
    warningTimer++;
    log(`warningTimer === ${warningTimer}`, 4, false, "warningIssuedTimer()");
    if (warningTimer >= 5) {
        warningHasBeenIssued = false;
        clearInterval(timeoutIntervalWarnings);
        warningTimer = 0;
        log(`warningTimer reset; warningTimer === ${warningTimer}`, 4, false, "warningIssuedTimer()");
    }
}

function prerecIssuedTimer() {
    prerecTimer++;
    log(`prerecTimer === ${prerecTimer}`, 4, false, "prerecIssuedTimer()");
    if (prerecTimer >= 5) {
        prerecHasBeenIssued = false;
        clearInterval(timeoutIntervalPrerec);
        prerecTimer = 0;
        log(` prerecTimer reset; prerecTimer === ${prerecTimer}`, 4, false, "prerecIssuedTimer()");
    }
}

process.on('uncaughtException', async (err) => {
    await log(err, 1, true, "nodejs");
});

process.on('unhandledRejection', async (reason) => {
    await log(reason, 1, true, "nodejs");
});

function startRadio() {
    var i = Math.floor(Math.random()*music.length);
    startStream();
    setTimeout(() => pipeAudio(music[i], true), 1000);// wait for pipeAudio -> wait 1s -> start music
    log(`Playing Music: ${music[i]}`, 2, false, "pipeAudio");
}

startRadio();
