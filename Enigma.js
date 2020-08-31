/*
 * File: Enigma.js
 * ---------------
 * This program implements a graphical simulation of the Enigma machine.
 */

"use strict";

/* Main program */

function Enigma() {
    let enigmaImage = GImage("EnigmaTopView.png");
    enigmaImage.addEventListener("load", function() {
        let gw = GWindow(enigmaImage.getWidth(), enigmaImage.getHeight());
        gw.add(enigmaImage);
        runEnigmaSimulation(gw);
    });
}

// You are responsible for filling in the rest of the code.  Your
// implementation of runEnigmaSimulation should perform the
// following operations:
//
// 1. Create an object that encapsulates the state of the Enigma machine.
// 2. Create and add graphical objects that sit on top of the image.
// 3. Add listeners that forward mouse events to those objects.

function runEnigmaSimulation(gw) {
    let enigma = {
        keys: createKeyboard(gw),
        lamps: createLamps(gw),
        rotors: createRotor(gw)
    };
    gw.addEventListener("mousedown", mouseDownAction);
    gw.addEventListener("mouseup", mouseUpAction);
    gw.addEventListener("click", clickAction);

    function mouseDownAction(e) {
        let object = gw.getElementAt(e.getX(), e.getY());
        if (object !== null && object.mouseDownAction !== undefined) {
            object.mouseDownAction(enigma);
        }
    }

    function mouseUpAction(e) {
        let object = gw.getElementAt(e.getX(), e.getY());
        if (object !== null && object.mouseUpAction !== undefined) {
            object.mouseUpAction(enigma);
        }
    }

    function clickAction(e) {
        let object = gw.getElementAt(e.getX(), e.getY());
        if (object !== null && object.clickAction !== undefined) {
            object.clickAction(enigma);
        }
    }

    // Fill this in, along with helper functions that decompose the work
}



function createKeyboard(gw) {
    let keys = [];
    for (let i = 0; i < KEY_LOCATIONS.length; i++) {
        let xOfLetter = KEY_LOCATIONS[i].x;
        let yOfLetter = KEY_LOCATIONS[i].y;
        let ch = String.fromCharCode("A".charCodeAt(0) + i)
        let key = createKey(KEY_RADIUS, ch);
        gw.add(key, xOfLetter, yOfLetter);
        keys.push(key);
    }
    return keys;
}


function createKey(radius, letter) {
    let key = GCompound();
    let border = GOval(-radius, -radius, 2 * radius, 2 * radius); //Border
    border.setFilled(true);
    border.setColor(KEY_BORDER_COLOR);
    let bg = GOval(-radius + KEY_BORDER, -radius + KEY_BORDER, 2 * (radius - KEY_BORDER), 2 * (radius - KEY_BORDER)); // bg:background
    bg.setFilled(true);
    bg.setColor(KEY_BGCOLOR);
    let label = GLabel(letter); // LABEL
    label.setFont(KEY_FONT);
    label.setColor(KEY_UP_COLOR);
    let xOfLabel = -label.getWidth() / 2; //
    label.setLocation(xOfLabel, KEY_LABEL_DY);
    key.mouseDownAction = function(enigma) { // MOUSEDOWN ACTION
        label.setColor(KEY_DOWN_COLOR);
        advanceRotor(enigma);
        let newLetter = applyPermutation(letter, enigma);
        let lamp = enigma.lamps[newLetter.charCodeAt(0) - "A".charCodeAt(0)];
        lamp.lampLabel.setColor(LAMP_ON_COLOR);
    }
    key.mouseUpAction = function(enigma) { // MOUSEUP ACTION
        label.setColor(KEY_UP_COLOR);
        let newLetter = applyPermutation(letter, enigma);
        let lamp = enigma.lamps[newLetter.charCodeAt(0) - "A".charCodeAt(0)];
        lamp.lampLabel.setColor(LAMP_OFF_COLOR);
    }
    key.add(border);
    key.add(bg);
    key.add(label);
    return key;
}

function createLamps(gw) {
    let lamps = [];
    for (let i = 0; i < LAMP_LOCATIONS.length; i++) {
        let xOfLetter = LAMP_LOCATIONS[i].x;
        let yOfLetter = LAMP_LOCATIONS[i].y;
        let ch = String.fromCharCode("A".charCodeAt(0) + i)
        let lamp = createLamp(LAMP_RADIUS, ch);
        gw.add(lamp, xOfLetter, yOfLetter);
        lamps.push(lamp);
    }
    return lamps;
}

function createLamp(radius, letter) {
    let lamp = GCompound();
    let background = GOval(-radius, -radius, 2 * radius, 2 * radius); //Background OF Lamp
    background.setFilled(true);
    background.setFillColor(LAMP_BGCOLOR);
    background.setColor(LAMP_BORDER_COLOR); // BORDER COLOR
    let lampLabel = GLabel(letter); // LABEL
    lampLabel.setFont(LAMP_FONT);
    lampLabel.setColor(LAMP_OFF_COLOR);
    let xOfLampLabel = -lampLabel.getWidth() / 2; //
    lampLabel.setLocation(xOfLampLabel, LAMP_LABEL_DY);
    lamp.lampLabel = lampLabel; // defining label property
    lamp.add(background);
    lamp.add(lampLabel);
    return lamp;
}

function createRotor(gw) {
    let rot = [];
    for (let i = 0; i < ROTOR_LOCATIONS.length; i++) {
        let rotor = GCompound();
        let rect = GRect(-ROTOR_WIDTH / 2, -ROTOR_HEIGHT / 2, ROTOR_WIDTH, ROTOR_HEIGHT);
        rect.setFilled(true);
        rect.setColor(ROTOR_BGCOLOR);
        rotor.rotorLabel = GLabel("A");
        rotor.rotorLabel.setFont(ROTOR_FONT);
        let xOfrotorLabel = -rotor.rotorLabel.getWidth() / 2;
        rotor.rotorLabel.setLocation(xOfrotorLabel, ROTOR_LABEL_DY);
        rotor.rotorLabel.setColor(ROTOR_COLOR);
        gw.add(rotor, ROTOR_LOCATIONS[i].x, ROTOR_LOCATIONS[i].y);
        rotor.add(rect);
        rotor.add(rotor.rotorLabel);
        rot.push(rotor);
        rotor.offset = 0;
        rotor.permutation = ROTOR_PERMUTATIONS[i];
        rotor.clickAction = function(enigma) {
            rotor.offset = (rotor.offset + 1) % 26;
            rotor.ch = String.fromCharCode("A".charCodeAt(0) + rotor.offset);
            rotor.rotorLabel.setLabel(rotor.ch);
        }
    }
    return rot;
}

function applyPermutation(letter, enigma) {
    let temporaryLetter = letter;
    let encodedLetter;

    // from right to left
    for (let i = ROTOR_LOCATIONS.length - 1; i >= 0; i--) {
        let permutation = enigma.rotors[i].permutation;
        let offset = enigma.rotors[i].offset;
        let shiftedLetter = ALPHABET.charAt((ALPHABET.indexOf(temporaryLetter) + offset) % 26);
        let permutatedShiftedLetter = permutation.charAt(ALPHABET.indexOf(shiftedLetter));
        if (permutatedShiftedLetter.charCodeAt(0) - offset < "A".charCodeAt(0)) {
            temporaryLetter = String.fromCharCode(permutatedShiftedLetter.charCodeAt(0) - offset + 26);
        } else {
            temporaryLetter = String.fromCharCode(permutatedShiftedLetter.charCodeAt(0) - offset);
        }
    }

    // reflector
    let reflectedLetter = REFLECTOR_PERMUTATION.charAt(ALPHABET.indexOf(temporaryLetter));

    // from left to right
    for (let i = 0; i < ROTOR_LOCATIONS.length; i++) {
        let permutation = enigma.rotors[i].permutation;
        let offset = enigma.rotors[i].offset;
        let shiftedReflectedLetter = ALPHABET.charAt((ALPHABET.indexOf(reflectedLetter) + offset) % 26);
        let permutatedVersion = ALPHABET.charAt(permutation.indexOf(shiftedReflectedLetter));
        if (permutatedVersion.charCodeAt(0) - offset < "A".charCodeAt(0)) {
            reflectedLetter = String.fromCharCode(permutatedVersion.charCodeAt(0) - offset + 26);
        } else {
            reflectedLetter = String.fromCharCode(permutatedVersion.charCodeAt(0) - offset);
        }

    }
    encodedLetter = reflectedLetter;
    return encodedLetter;
}

function advanceRotor(enigma) {
    enigma.rotors[2].offset = (enigma.rotors[2].offset + 1) % 26; // advance fast rotor
    enigma.rotors[2].ch = String.fromCharCode("A".charCodeAt(0) + enigma.rotors[2].offset);
    enigma.rotors[2].rotorLabel.setLabel(enigma.rotors[2].ch);
    if (enigma.rotors[2].offset === 0) { // advance medium rotor
        enigma.rotors[1].offset = (enigma.rotors[1].offset + 1) % 26;
        enigma.rotors[1].ch = String.fromCharCode("A".charCodeAt(0) + enigma.rotors[1].offset);
        enigma.rotors[1].rotorLabel.setLabel(enigma.rotors[1].ch);

    }
    if (enigma.rotors[1].offset === 0 && enigma.rotors[2].offset === 0) { // advance slow rotor
        enigma.rotors[0].offset = (enigma.rotors[0].offset + 1) % 26;
        enigma.rotors[0].ch = String.fromCharCode("A".charCodeAt(0) + enigma.rotors[0].offset);
        enigma.rotors[0].rotorLabel.setLabel(enigma.rotors[0].ch);
    }
}
