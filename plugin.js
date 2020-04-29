const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');


const cliCommand = "nr1"
const commandMap = {
    "validate": "nerdpack:validate"
}

function exec(stream) {
    var proc
    var isStarted = false
    stream.on('data', (d) => {
        var {command, args, stdin} = d

        // The first block
        if (!isStarted) {
            if (command in commandMap) {
                command = commandMap[command]
            }

            var env = Object.create( process.env );
            env.FORCE_COLOR = 1
            proc = spawn(cliCommand, [command, ...args], { env: env })
            isStarted = true

            proc.stdin.on('data', (data) => {
                stream.write({
                    stdout: data
                })
            });
            proc.stdout.on('data', (data) => {
                stream.write({
                    stdout: data
                })
            });
            proc.stderr.on('data', (data) => {
                stream.write({
                    stderr: data
                })
            });
            proc.on('close', (code) => {
                stream.end()
            });

            proc.on('error', (e) => {
                console.error('error: ', e)
            });
        }

        // All successive stdin blocks
        if (stdin != null) {
            proc.stdin.write(stdin)
        }
    })
}

module.exports = { exec }