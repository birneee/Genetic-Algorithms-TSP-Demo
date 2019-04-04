// Create front-end
/*
  WHAT NEXT:
    DONE display and acquire control values for population generation
    DONE analytics
      most important:
        # generations
        fittest individual (shortest path so far, + drawing);

    MOSTLY DONE change seedData
    DONE need to improve algorithm
    NAH preserve 10% elite?
    NAH take fittest in generation and clone/mutate for first 10% of next pop?

    DONE clear button should reset analytics
    DONE increase size of text, buttons, etc

    LOW PRIO: label fitness graph
*/

import Population from './population';
import {random30, smallSquare, createCircularPolygon} from './data';
import {
    getCanvasesAndContexts,
    clearCanvas,
    drawLocations,
    clearListeners,
    clearAnalytics,
    makeTicker,
    fitRouteToCanvas
} from './utils';

// FORGIVE THIS GLOBAL VARIABLE
const circle = createCircularPolygon(15)
const defaultSeed = random30;
var seed = defaultSeed;

firstInit(); // only thing this file actually does on load

function firstInit() {
    const {gCanvas, gCtx, fCanvas, fCtx, bCanvas, bCtx, wCanvas, wCtx} = getCanvasesAndContexts();
    // DO ONCE!! shift origin to bottom left, Y axis draws up instead of down
    gCtx.transform(1, 0, 0, -1, 0, gCanvas.height);
    fCtx.transform(1, 0, 0, -1, 0, fCanvas.height);
    bCtx.transform(1, 0, 0, -1, 0, bCanvas.height);
    wCtx.transform(1, 0, 0, -1, 0, fCanvas.height);

    initControls();
    restart();
}

function initControls() {
    setDefaultConfig();
    linkOutputElements(getInputElements());
}

function restart() {
    const population = newCohort(getInputElements());
    initCanvas(population);
}

// generate new cohort based on configured controls
function newCohort({popSizeIn, pCrossIn, pMutateIn, kDirectIn}) {
    const size = +popSizeIn.value;
    const pCross = +pCrossIn.value;
    const pMutate = +pMutateIn.value;
    const kDirect = kDirectIn.checked;
    const resized = fitRouteToCanvas(seed, 'gCanvas');
    return new Population(size, resized, pCross, pMutate, kDirect);
}

function initCanvas(population) {
    const {gCanvas, gCtx, fCanvas, fCtx, bCanvas, bCtx, wCanvas, wCtx} = getCanvasesAndContexts();

    const tickingFunc = makeTicker(population);
    initButtons(tickingFunc);

    const seed = population.getFittest().dna;

    clearCanvas(gCanvas);
    clearCanvas(fCanvas);
    clearCanvas(bCanvas);
    clearCanvas(wCanvas);
    drawLocations(gCtx, seed);
}

function initButtons(tick) {
    const step = document.getElementById('step');
    const play = document.getElementById('play');
    const pause = document.getElementById('pause');
    const reset = document.getElementById('reset');
    const config = document.getElementById('config');
    const changeMap = document.getElementById("changeMap")
    const buttons = {step, play, pause, reset, config, changeMap};

    addButtonListeners(tick, buttons);
}

function addButtonListeners(tick, {step, play, pause, reset, config, changeMap}) {
    let tickInterval;
    const playTicking = () => {
        if (tickInterval) return;
        const stepInterval = +document.getElementById('intervalIn').value;
        tickInterval = setInterval(tick, stepInterval);
    };

    const pauseTicking = () => {
        clearInterval(tickInterval);
        tickInterval = null;
    };

    const resetTicking = () => {
        if (tickInterval) pauseTicking();
        clearListeners(step, play, pause, reset, changeMap);
        clearAnalytics();
        restart();
    };

    const rotateMap = () => {
        switch (seed) {
            case circle:
                seed = smallSquare;
                break;
            case random30:
                seed = circle;
                break;
            default:
                seed = random30;
                break;
        }
        resetTicking();
    };

    step.addEventListener('click', tick);
    play.addEventListener('click', playTicking);
    pause.addEventListener('click', pauseTicking);
    reset.addEventListener('click', resetTicking);
    config.addEventListener('click', setDefaultConfig);
    changeMap.addEventListener('click', rotateMap)
}

function updateOutputElements(controls) {
    Object.values(controls).forEach(input => {
        const outputId = `${input.id.slice(0, -2)}Out`;
        const output = document.getElementById(outputId);
        if (output != null) {
            output.innerHTML = input.value;
        }
    });
}

function linkOutputElements(controls) {
    Object.values(controls).forEach(input => {
        const outputId = `${input.id.slice(0, -2)}Out`;
        const output = document.getElementById(outputId);
        if (output != null) {
            output.innerHTML = input.value;
            input.oninput = () => {
                output.innerHTML = input.value;
            };
        }
    });
}

function getInputElements() {
    const intervalIn = document.getElementById('intervalIn');
    const popSizeIn = document.getElementById('popSizeIn');
    const pCrossIn = document.getElementById('pCrossIn');
    const pMutateIn = document.getElementById('pMutateIn');
    const kDirectIn = document.getElementById('kDirectIn');
    return {intervalIn, popSizeIn, pCrossIn, pMutateIn, kDirectIn};
}

// who doesn't love some magic numbers
function setDefaultConfig() {
    const inputElements = getInputElements();
    const {intervalIn, popSizeIn, pCrossIn, pMutateIn, kDirectIn} = inputElements;

    intervalIn.value = 20;
    popSizeIn.value = 50;
    pCrossIn.value = 0.3;
    pMutateIn.value = 0;
    kDirectIn.checked = false;

    updateOutputElements(inputElements);
}
