import $ from 'jquery';
import {alterDot, cfgToDot, makeGraph, setNumOfNodes, parseCode, setParams} from './code-analyzer';
import Viz from 'viz.js';
import {Module, render} from 'viz.js/full.render';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let inputVector = $('#inputPlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        setParams(parsedCode,inputVector);
        let cfg = makeGraph(parsedCode['body'][0]['body']);
        setNumOfNodes(cfg[2].length);
        let dot = cfgToDot(cfg, codeToParse).split('\n');
        dot = alterDot(dot);
        dot = dot.join('\n');
        let str = 'digraph d{' + dot + '}';
        let svg = new Viz({Module,render });
        svg.renderSVGElement(str).then(function (element) {
            var elm = document.getElementById('myDiv');
            elm.innerHTML = '';
            elm.append(element);
        });
    });
});
