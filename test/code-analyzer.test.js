import assert from 'assert';
import {
    addMergeNodes, alterDot,
    cfgToDot, getCodeLines,
    getNumOfNodes,
    getParams,
    makeGraph, makeShapes, nodeNumbering,
    parseCode, reachableNodes, removeExceptions, removeInitials, replaceLet, setCodeForNode, setEdgesForNode,
    setNumOfNodes,
    setParams
} from '../src/js/code-analyzer';

describe('The set parameters function', () => {
    it('is setting parameters correctly', () => {
        setParams(parseCode('function foo(x, y, z){}'),'1,2,3');
        assert.deepEqual(getParams().length,3);
        assert.deepEqual(getParams()[0],'x');
    });
});

describe('The make graph function', () => {
    it('is making a cfg correctly', () => {
        let cfg = makeGraph(parseCode('function foo(x, y, z){}')['body'][0]['body']);
        assert.deepEqual(cfg.length,3);
        assert.deepEqual(cfg[0]['type'],'entry');
    });
});

describe('The set number of nodes function', () => {
    it('is setting the number of nodes correctly', () => {
        let cfg = makeGraph(parseCode('function foo(x, y, z){}')['body'][0]['body']);
        setNumOfNodes(cfg[2].length);
        assert.deepEqual(getNumOfNodes(),2);
    });
});

describe('The cfg to dot function', () => {
    it('is making a dot correctly', () => {
        let codeToParse = 'function foo(x, y, z){}';
        let parsedCode = parseCode(codeToParse);
        let cfg = makeGraph(parsedCode['body'][0]['body']);
        let dot = cfgToDot(cfg, codeToParse).split('\n');
        assert.deepEqual(dot.length,4);
        assert.deepEqual(dot[0].includes('entry'),true);
    });
});

describe('The alter dot function', () => {
    it('is removing exceptions correctly', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    return a;\n' +
            '}';
        let parsedCode = parseCode(codeToParse);
        let cfg = makeGraph(parsedCode['body'][0]['body']);
        let dot = cfgToDot(cfg, codeToParse).split('\n');
        assert.deepEqual(dot[6].includes('exception'),true);
        removeExceptions(dot);
        assert.deepEqual(dot[6].includes('exception'),false);
    });
});

describe('The alter dot function', () => {
    it('is removing initial nodes correctly', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    return a;\n' +
            '}';
        let parsedCode = parseCode(codeToParse);
        let cfg = makeGraph(parsedCode['body'][0]['body']);
        let dot = cfgToDot(cfg, codeToParse).split('\n');
        assert.deepEqual(dot[0].includes('entry'),true);
        removeInitials(dot);
        assert.deepEqual(dot[0].includes('entry'),false);
    });
});

describe('The alter dot function', () => {
    it('is making shapes for nodes correctly', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = 3;\n' +
            '    if(a < 4){\n' +
            '        a = 2;\n' +
            '    }\n' +
            '    return a;\n' +
            '}';
        let parsedCode = parseCode(codeToParse);
        let cfg = makeGraph(parsedCode['body'][0]['body']);
        let dot = cfgToDot(cfg, codeToParse).split('\n');
        assert.deepEqual(dot[0].includes('box'),false);
        makeShapes(dot);
        assert.deepEqual(dot[0].includes('box'),true);
    });
});

describe('The alter dot function', () => {
    it('is replacing "let" correctly', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    return a;\n' +
            '}';
        let parsedCode = parseCode(codeToParse);
        let cfg = makeGraph(parsedCode['body'][0]['body']);
        let dot = cfgToDot(cfg, codeToParse).split('\n');
        assert.deepEqual(dot[1].includes('let'),true);
        replaceLet(dot);
        assert.deepEqual(dot[1].includes('let'),false);
    });
});

describe('The alter dot function', () => {
    it('is setting code for node correctly', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    return a;\n' +
            '}';
        let parsedCode = parseCode(codeToParse);
        let cfg = makeGraph(parsedCode['body'][0]['body']);
        setNumOfNodes(cfg[2].length);
        let dot = cfgToDot(cfg, codeToParse).split('\n');
        assert.deepEqual(getCodeLines().length==0,true);
        setCodeForNode(dot);
        assert.deepEqual(getCodeLines()[1]=='let a = x + 1',true);
    });
});

describe('The alter dot function', () => {
    it('is setting reachable nodes for node correctly', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    return a;\n' +
            '}';
        let parsedCode = parseCode(codeToParse);
        let cfg = makeGraph(parsedCode['body'][0]['body']);
        setNumOfNodes(cfg[2].length);
        let dot = cfgToDot(cfg, codeToParse).split('\n');
        removeExceptions(dot);
        setEdgesForNode(dot);
        assert.deepEqual(reachableNodes['1'],[2]);
    });
});

describe('The alter dot function', () => {
    it('is numbering nodes correctly', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    return a;\n' +
            '}';
        let parsedCode = parseCode(codeToParse);
        let cfg = makeGraph(parsedCode['body'][0]['body']);
        setNumOfNodes(cfg[2].length);
        let dot = cfgToDot(cfg, codeToParse).split('\n');
        removeExceptions(dot);
        assert.deepEqual(dot[0].includes('-0-'),false);
        nodeNumbering(dot);
        assert.deepEqual(dot[0].includes('-0-'),true);
    });
});

describe('The alter dot function', () => {
    it('is adding merge nodes correctly', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = 3;\n' +
            '    if(a < 4){\n' +
            '        a = 2;\n' +
            '    }\n' +
            '    return a;\n' +
            '}';
        let parsedCode = parseCode(codeToParse);
        let cfg = makeGraph(parsedCode['body'][0]['body']);
        setNumOfNodes(cfg[2].length);
        let dot = cfgToDot(cfg, codeToParse).split('\n');
        removeExceptions(dot);
        let old = getNumOfNodes();
        addMergeNodes(dot);
        assert.deepEqual(getNumOfNodes(),old+1);
    });
});

describe('The alter dot function', () => {
    it('is coloring true path correctly', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = 3;\n' +
            '    if(true){\n' +
            '        a = 2;\n' +
            '    }\n' +
            '    return a;\n' +
            '}';
        let parsedCode = parseCode(codeToParse);
        setParams(parsedCode,'1,2,3');
        let cfg = makeGraph(parsedCode['body'][0]['body']);
        setNumOfNodes(cfg[2].length);
        let dot = cfgToDot(cfg, codeToParse).split('\n');
        assert.deepEqual(dot[0].includes('green'),false);
        alterDot(dot);
        assert.deepEqual(dot[0].includes('green'),true);
        assert.deepEqual(dot[getNumOfNodes()-1].includes('green'),true);
    });
});

describe('The alter dot function', () => {
    it('is coloring false path correctly', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = 3;\n' +
            '    if(false){\n' +
            '        a = 2;\n' +
            '    }\n' +
            '    return a;\n' +
            '}';
        let parsedCode = parseCode(codeToParse);
        setParams(parsedCode,'1,2,3');
        let cfg = makeGraph(parsedCode['body'][0]['body']);
        setNumOfNodes(cfg[2].length);
        let dot = cfgToDot(cfg, codeToParse).split('\n');
        assert.deepEqual(dot[0].includes('green'),false);
        alterDot(dot);
        assert.deepEqual(dot[0].includes('green'),true);
        assert.deepEqual(dot[getNumOfNodes()-1].includes('green'),true);
    });
});

describe('The alter dot function', () => {
    it('is coloring merge path correctly', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = 3;\n' +
            '    if(a > 3){\n' +
            '        a = 2;\n' +
            '    }\n' +
            '    return a;\n' +
            '}';
        let parsedCode = parseCode(codeToParse);
        setParams(parsedCode,'1,2,3');
        let cfg = makeGraph(parsedCode['body'][0]['body']);
        setNumOfNodes(cfg[2].length);
        let dot = cfgToDot(cfg, codeToParse).split('\n');
        assert.deepEqual(dot[0].includes('green'),false);
        alterDot(dot);
        assert.deepEqual(dot[0].includes('green'),true);
        assert.deepEqual(dot[getNumOfNodes()-1].includes('green'),true);
    });
});