// Requirements
const { spawn } = require("child_process");
const fs = require('fs');
const path = require("path");

// Passwords and stuff
const username = "source";
const passwort = "admin123";
const port = 3000;
const streamUrl =
    `icecast://${username}:${passwort}@uk2freenew.listen2myradio.com:${port}/stream`;

// Making logs prettier

var errors = 0;
var warnings = 0;

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

        if (errors >= 10 && !fatal) {
            await log(`Errors exceed one minute-limit,
         errors === ${errors}, 
         calling errcrash`, 4, false, "log");
             errcrash()
            return;
        } else {
            errors++;
            await log(`Errors dont exceed one minute-limit,
         errors === ${errors}`, 4, false, "log");
            writeToFile (
                `${time} ${"[" + name + ErrorWarnung} ${msg}`
            )
        }

        console.log(`\x1b[35m${time}\x1b[0m ${ RED + "[" + name + ErrorWarnung} ${msg} ${RESET}`);
        if (fatal) {
            console.error(msg);
            writeToFile (
                `${time} ${"[" + name + "FATAL ERROR]:"} ${msg}`
            )
            process.exit(1);
        }
    }
    if (type === 2) {
        if (warnings >= 100) {
            await log(`Warnings exceed one minute-limit,
         warnings === ${warnings}, 
         calling warncrash`, 4, false, "log");
            warncrash();
        } else {
            warnings++;
            await log(`Warnings dont exceed one minute-limit,
         warnings === ${warnings}`, 4, false, "log");
            console.log(`\x1b[35m${time}\x1b[0m ${YELLOW + "[" + name + WarnungWarnung} ${msg} ${RESET}`);
            writeToFile(
                `${time} ${"[" + name + WarnungWarnung} ${msg}`
            )
        }
    }
    if (type === 3) {
        console.log(`\x1b[35m${time}\x1b[0m ${RESET + "[" + name + Info} ${msg} ${RESET}`);
        writeToFile(
            `${time} ${"[" + name + Info} ${msg}`
        )
    }
    if (type === 4) {
        console.log(`\x1b[35m${time}\x1b[0m ${RESET + "[" + name + Debug} ${msg} ${RESET}`);
        writeToFile(
            `${time} ${"[" + name + Debug} ${msg}`
        )
    }
}

// Logging in txt files
const logDir = path.join(__dirname, "logs");
fs.mkdirSync(logDir, { recursive: true });

// removing color codes
function stripAnsi(str) {
    return String(str).replace(/\x1b\[[0-9;]*m/g, "");
}

function writeToFile(line) {
    try {
        const day = new Date().toISOString().slice(0, 10); // z.B. 2026-10-07
        const file = path.join(logDir, `radio-${day}.txt`);
        fs.appendFileSync(file, stripAnsi(line) + "\n");
    } catch (e) {
        console.error("Log-Datei nicht beschreibbar:", e);
    }
}

// RAM
const RAMprerec = {
    r15: [],
    r14: [],
    r13: [],
    r12: [],
    r11: [],
    r10: [],
    r9: [],
    r8: [],
    r7: [],
    r6: [],
    r5: [],
    r4: [],
    r3: [],
    r2: [],
    r1: [],
};

const RAMmusic = {
    r21: [],
    r20: [],
    r19: [],
    r18: [],
    r17: [],
    r16: [],
    r15: [],
    r14: [],
    r13: [],
    r12: [],
    r11: [],
    r10: [],
    r9: [],
    r8: [],
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
        for (let i = Object.keys(RAMprerec).length; i >= 2; i--) {
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
        for (let i =  Object.keys(RAMmusic).length; i >= 2; i--) {
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
        for (var i = Object.keys(RAMmusic).length; i >= 1; i--) {
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
        for (var i = Object.keys(RAMprerec).length; i >= 1; i--) {
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
    for (var i = Object.keys(RAMprerec).length; i >= 1; i--) {
        if (RAMprerec[`r${i}`] !== null) {
            count++;
        }
    }
    return count;
}

async function RAMmusicCount() {
    var count = 0;
    for (var i = Object.keys(RAMmusic).length; i >= 1; i--) {
        if (RAMmusic[`r${i}`] !== null) {
            count++;
        }
    }
    return count;
}

// Too many warnings = crash functions

function warnreset() {
    warnings = 0;
    log(`warnings = ${warnings}`, 4, false, "warnreset");
}

async function warncrash(){
    await log(`Too many warnings in one minute  
    warnings === ${warnings}`, 1, true, "warncrash");
}

// Too many errors = crash functions

function errreset() {
    errors = 0;
    log(`errors = ${errors}`, 4, false, "errreset");
}

async function errcrash(){
    await log(`Too many errors in one minute  
    warnings === ${errors}`, 1, true, "errcrash");
}

// Setting intervals
var timeoutIntervalWarnings = [];
var timeoutIntervalPrerec = [];

setInterval(() => coordinateFFmpeg(), 30000);
setInterval(() => warnreset(), 60000)
setInterval(() => errreset(), 60000)

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
    "PreRecorededMsg/quellen.wav",
    "PreRecorededMsg/offizielleMeldungen.wav",
    "PreRecorededMsg/chemieUnfall.wav",
    "PreRecorededMsg/hausMedis.wav",
    "PreRecorededMsg/hitze.wav",
    "PreRecorededMsg/hochwasser.wav",
    "PreRecorededMsg/kohlenstoffMonoxid.wav",
    "PreRecorededMsg/notfallGepäck.wav",
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
    if (await RAMmusicCount() >= Object.keys(RAMmusic).length ) {
        await log(`Clearing RAMmusic, RAMmusic.length: ${Object.keys(RAMmusic).length}`, 2, false, "coordinateFFmpeg()");
        for (var i = Object.keys(RAMmusic).length; i >= 1; i--) {
            await log(`RAMmusic: ${RAMmusic[`r${i}`]}`, 4, false, "coordinateFFmpeg()");
            RAMmusic[`r${i}`] = null;
            await log(`RAMmusic: ${RAMmusic[`r${i}`]}`, 4, false, "coordinateFFmpeg()");
        }
    }

    if (await RAMprerecCount() >= Object.keys(RAMprerec).length ) {
        await log(`Clearing RAMprerecCount, RAMprerecCount.length: ${Object.keys(RAMprerec).length}`, 2, false, "coordinateFFmpeg()");
        for (var i = Object.keys(RAMprerec).length; i >= 1; i--) {
            await log(`RAMmusic: ${RAMprerec[`r${i}`]}`, 4, false, "coordinateFF mpeg()");
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
    "Music/19fifty.mp3",
    "Music/areyouhuman.mp3",
    "Music/binarychill.mp3",
    "Music/copenhagen.mp3",
    "Music/culturo.mp3",
    "Music/firstencounter.mp3",
    "Music/goldenshuffel.mp3",
    "Music/helloworld.mp3",
    "Music/onthecanopy.mp3",
    "Music/sambabug.mp3",
    "Music/singleartifact.mp3",
    "Music/skyline.mp3",
    "Music/trickleondown.mp3",
    "Music/twilightarcade.mp3",
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

let totalSize = null;
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

    ffmpegStream.stdin.on("error", err => {
        log(`stream stdin error: ${err.code}`, 1, true, "ffmpeg-stream");
    });

    ffmpegStream.stderr.on('data', (data) => {   // <- der ffmpeg-stream Prozess, NICHT der source
        const m = data.toString().match(/size=\s*(\d+(?:\.\d+)?)\s*([kKmMgG]?i?B)/);
        if (m) totalSize = m[1] + m[2];   // z. B. "1125KiB"
        watchDog(totalSize);
    });

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
        const old = currentSource;
        currentSource = null;
        if (ffmpegStream && ffmpegStream.stdin) {
            old.stdout.unpipe(ffmpegStream.stdin);
        }
        old.kill("SIGKILL");
    }

    if (!ffmpegStream || !ffmpegStream.stdin || ffmpegStream.stdin.destroyed) {
        log("FFmpeg stream stdin is not available", 1, true, "pipeAudio()");
        return;
    }

    const args = [];
    if (loop) args.push("-stream_loop", "-1");
    args.push("-i", file, "-vn", "-f", "mp3", "-");

    const source = spawn("ffmpeg", args);
    currentSource = source;

    source.stdout.on("error", err => {
        log(`source stdout error: ${err.code} \n err: ${err}`, 1, true, "ffmpeg-source");
    });

    source.stdout.pipe(ffmpegStream.stdin, { end: false });

    source.stderr.on("data", (data) => {
        log(`${data}`, 4, false, "ffmpeg-source");
    });



    source.on("close", async (code, err) => {
        log(`Source-Process end: ${code}`, 4, false, "ffmpeg-source");
        if (err) {
            log(`ffmpeg stream error ${err}`, 1, false, "ffmpeg-source");
        }

        if (currentSource !== source) {
            log("stale source closed, ignoring", 2, false, "ffmpeg-source");
            return;
        }
        currentSource = null;

        runningFFmpeg = false;
        chooseFileDone = false;

        var i = Math.floor(Math.random() * music.length);
        while (music[i] === lastmusic || await RAMmusicCheck(music[i])) {
            i = Math.floor(Math.random() * music.length);
            await log(`new music ${music[i]} === lastmusic ${lastmusic} or in RAM, retrying`, 2, false, "ffmpeg-source");
        }

        lastmusic = music[i];
        RAMmusicPush(lastmusic);
        log(`Playing Music: ${music[i]}`, 2, false, "pipeAudio");
        pipeAudio(music[i], false);
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

// Watchdog, if internet cut kill programm with err fatal

var maxSameBytes = 200;
var numSameBytes = 0;
var lastsize;

function watchDog(size) {
    numSameBytes++;

    log(`size watchdog: ${size}`)

    if (size !== lastsize) {
        numSameBytes = 0;
        log(`watchDog status: No faulty Bytes detected; Faulty Bytes: ${numSameBytes}`, 4, false, "watchDog");
        lastsize = size;
        return;
    }

    log(`watchDog status: Faulty Bytes detected; Faulty Bytes: ${numSameBytes}; checking if crash should happen;`, 4, false, "watchDog");

    if (numSameBytes >= maxSameBytes) {
        log(`Maximum of allowed same bytes reached! Maximum: ${maxSameBytes}; This might bee a Network or Server error; Crashing NIAS-Radio; Faulty Bytes: ${numSameBytes}`,
            1, true, "watchDog");
    } else {
        log(`watchDog status: Faulty Bytes detected; Faulty Bytes: ${numSameBytes}; Faulty Bytes num too low for crash`, 3, false, "watchDog");
    }

    lastsize = size;

}

writeToFile ("--- NEW PROCESS STARTED ---");
writeToFile ("--- CALLING startRadio ---")
startRadio();
