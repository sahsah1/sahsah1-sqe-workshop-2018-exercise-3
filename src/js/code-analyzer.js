import * as esprima from 'esprima';
import * as esgraph from 'esgraph';
import * as escodegen from 'escodegen';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, { range: true });
};

var valueMap = {};
var numberOfNodes = 0;
var parameters = [];
var codeLines = [];
var reachableNodes = {};

function setParams(parsedCode,input) {
    let inputs = input.split(',');
    let params = parsedCode.body[0].params;
    for (var i=0;i<params.length;i++){
        let key = escodegen.generate(params[i]);
        valueMap[key] = inputs[i];
        parameters.push(key);
    }
}

function setNumOfNodes(number) {
    numberOfNodes = number;
}

function makeGraph(parsedCode){
    return esgraph(parsedCode);
}

function cfgToDot(cfg, codeToParse){
    return esgraph.dot(cfg, {counter:0, source:codeToParse});
}

function alterDot(dot) {
    valueMap.length = 0;
    codeLines.length = 0;
    reachableNodes.length = 0;

    removeExceptions(dot);
    removeInitials(dot);
    makeShapes(dot);
    replaceLet(dot);
    setCodeForNode(dot);
    nodeNumbering(dot);
    addMergeNodes(dot);
    setEdgesForNode(dot);
    colorPath(dot,1);

    return dot;
}

function setCodeForNode(dot) {
    for(var i = 0;i < numberOfNodes; i++){
        var temp = dot[i].split('"');
        codeLines[i] = temp[1].replace(';','');
    }
}

function setEdgesForNode(dot) {
    for(var i = 0;i < numberOfNodes; i++){
        reachableNodes[i+1] = new Array();
        for(var j = 0;j < dot.length; j++) {
            if (dot[j].includes('->')) {
                var temp = dot[j].split('-> ');
                if (temp[0].includes('n' + (i + 1) + ' ')) {
                    reachableNodes[i + 1].push(eval(temp[1].split(' [')[0].slice(1)));
                }
            }
        }
    }
}

function removeExceptions(dot) {
    for(var i = 0;i < dot.length; i++){
        if(isException(dot[i])){
            dot.splice(i,1);
            i--;
        }
    }
}

function isException(str) {
    if(str.includes('->') && (str.includes('exception'))){
        return true;
    }
    return false;
}

function removeInitials(dot) {
    for(var i = 0;i < dot.length; i++) {
        if (isInitial(dot[i])) {
            dot.splice(i, 1);
            i--;
        }
    }
    numberOfNodes = numberOfNodes - 2;
}

function isInitial(str) {
    if(str.includes('n0') || str.includes('n' + (numberOfNodes - 1))){
        return true;
    }
    return false;
}

function makeShapes(dot) {
    for(var i = 0;i < dot.length; i++) {
        if (!dot[i].includes('->')) {
            if(isBinaryOP(dot[i])){
                dot[i] = dot[i].replace('label','shape=diamond '+'label');
            }
            else {
                dot[i] = dot[i].replace('label', 'shape=box ' + 'label');
            }
        }
    }
}

function isBinaryOP(str) {
    if(isSmallerGreater(str) || str.includes('==') || str.includes('!=') || isBool(str)){
        return true;
    }
    return false;
}

function isSmallerGreater(str) {
    if(str.includes('>') || str.includes('<') || str.includes('>=') || str.includes('<=')){
        return true;
    }
    return false;
}

function isBool(str) {
    if(str.includes('true') || str.includes('false')){
        return true;
    }
    return false;
}

function replaceLet(dot) {
    for(var i = 0;i < dot.length; i++) {
        if (!dot[i].includes('->')) {
            dot[i] = dot[i].replace('let ', '');
        }
    }
}

function nodeNumbering(dot) {
    for(var i = 0;i < dot.length; i++) {
        if (!dot[i].includes('->')) {
            var temp = dot[i].split(' [');
            let num = temp[0].slice(1);
            dot[i] = dot[i].replace('label="', 'label=" -'+num+'- \n ');
        }
    }
}

function addMergeNodes(dot) {
    let edgesIntoNodes = {};
    for( var j = 1;j < numberOfNodes+1; j++) {
        let count = 0;
        for(var i = 0;i < dot.length; i++){
            if(dot[i].includes('->')){
                var temp = dot[i].split(' -> ');
                if(temp[1].includes('n'+ j + ' ')){
                    count++;
                }
            }
        }
        edgesIntoNodes[j] = count;
    }
    createMerge(edgesIntoNodes, dot);
}

function createMerge(dict, dot) {
    for(var j = 1;j <= Object.keys(dict).length; j++){
        if(dict[j]>1){
            numberOfNodes++;
            let newNode = 'n'+ (numberOfNodes) + ' [label=""]';
            dot.splice(numberOfNodes-1,0,newNode);
            insertMerge(dot,j);
        }
    }
}

function insertMerge(dot,j) {
    for(var i = 0;i < dot.length; i++){
        if(dot[i].includes('->')){
            var temp = dot[i].split(' -> ');
            if(temp[1].includes('n' + j + ' ')){
                dot[i] = dot[i].replace('n'+j,'n'+(numberOfNodes));
            }
        }
    }
    let newEdge = 'n' + numberOfNodes + ' -> ' + 'n' + j;
    dot.splice(dot.length,0,newEdge);
}

function colorPath(dot,node) {
    dot[node-1] = dot[node-1].replace('[', '[style=filled color=green ');
    if(reachableNodes[node].length==1){
        if(isNotMerge(node)){
            var temp = codeLines[node-1].split(' = ');
            temp[1] = replaceVars(temp[1]);
            valueMap[temp[0]] = eval(temp[1]);
        }
        colorPath(dot,reachableNodes[node][0]);
    }
    else if(reachableNodes[node].length>1){
        var bool = eval(replaceVars(codeLines[node-1]));
        if(bool){
            colorPath(dot,reachableNodes[node][0]);
        }
        else{
            colorPath(dot,reachableNodes[node][1]);
        }
    }
}

function replaceVars(str) {
    for(var key in valueMap){
        str = str.replace(key,valueMap[key]);
    }
    return str;
}

function isNotMerge(node){
    if(codeLines.length > node-1 && codeLines[node-1].includes(' = ')){
        return true;
    }
    return false;
}


export {parseCode,cfgToDot,makeGraph,alterDot,setNumOfNodes,colorPath,setParams};
