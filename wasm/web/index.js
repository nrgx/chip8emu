import init, * as wasm from './../pkg/wasm.js';

const WIDTH = 64;
const HEIGHT = 32;
const SCALE = 15;
const TICKS_PER_FRAME = 10;
let anim_frame = 0;

const canvas = document.getElementById("canvas");
canvas.width = WIDTH * SCALE;
canvas.height = HEIGHT * SCALE;

const ctx = canvas.getContext("2d");
ctx.fillStyle = "black";
ctx.fillRect(0, 0, WIDTH * SCALE, HEIGHT * SCALE);
const input = document.getElementById("fileinput");

async function run() {
    await init();
    let chip8 = new wasm.EmuWasm();
    document.addEventListener("keydown", (evt) => { chip8.keypress(evt, true) });
    document.addEventListener("keyup", (evt) => { chip8.keypress(evt, false) });
    input.addEventListener("change", (evt) => {
        if (anim_frame != 0) {
            window.cancelAnimationFrame(anim_frame);
        }
        let file = evt.target.files[0];
        if (!file) {
            alert("error reading file");
            return;
        }
        let fr = new FileReader();
        fr.onload = (e) => {
            let buf = fr.result;
            const rom = new Uint8Array(buf);
            chip8.reset();
            chip8.load_game(rom);
            mainloop(chip8);
        }
        fr.readAsArrayBuffer(file);
    }, false);
};

function mainloop(chip8) {
    for (let i = 0; i < TICKS_PER_FRAME; i++) {
        chip8.tick();
    }
    chip8.tick_timers();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, WIDTH * SCALE, HEIGHT * SCALE);
    ctx.fillStyle = "white";
    chip8.draw(SCALE);
    anim_frame = window.requestAnimationFrame(() => {
        mainloop(chip8);
    })
}

run().catch(console.error);
