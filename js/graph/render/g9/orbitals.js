//http://math.ucr.edu/~karl/WebGL/elasticsphereGPU.html

var gl;
var curRotQ = [1.0, 0.0, 0.0, 0.0];

function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

//quaternion multiplication
function qMultiply(q1, q2) {
    return [q1[0] * q2[0] - q1[1] * q2[1] - q1[2] * q2[2] - q1[3] * q2[3],
  q1[0] * q2[1] + q1[1] * q2[0] + q1[2] * q2[3] - q1[3] * q2[2],
  q1[0] * q2[2] - q1[1] * q2[3] + q1[2] * q2[0] + q1[3] * q2[1],
  q1[0] * q2[3] + q1[1] * q2[2] - q1[2] * q2[1] + q1[3] * q2[0]];
}

//quaternion normalization
function qNormalize(q) {
    var norm = Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);
    if (norm != 0) return [q[0] / norm, q[1] / norm, q[2] / norm, q[3] / norm];
    else return q;
}

var indexBuffer, numPts, drawLength, rotMatrix, projectionMatrix, modelviewMatrix;
var err = "Your browser does not support ";

var gl, canvas,
    prog, prog_show, texture, texture1, FBO, FBO1, samp, samp_show,
    mvpMatrixLoc, mvMatrixLoc, basecolorLoc,
    m = 64,
    offset = 1.0 / 128.0,
    dampingLoc, speedLoc, shininessLoc, pointsBuffer, stiffnessLoc;

var pix = new Float32Array(3 * m * m);

function initShaders() {
    projectionMatrix = new J3DIMatrix4();
    projectionMatrix.perspective(45, maincanvas.clientWidth / maincanvas.clientHeight, 0.1, 100.0);
    projmat = projectionMatrix.getAsArray();
    modelviewMatrix = new J3DIMatrix4();
    modelviewMatrix.load([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -5, 1]);
    projectionMatrix.multiply(modelviewMatrix);
    rotMatrix = new J3DIMatrix4();
    numPts = pointsdict.length / 3;
    drawLength = trianglearray.length;
    prog = gl.createProgram();
    gl.bindAttribLocation(prog, 0, "aTexCoord");
    gl.bindAttribLocation(prog, 1, "adjCoords12");
    gl.bindAttribLocation(prog, 2, "adjCoords34");
    gl.bindAttribLocation(prog, 3, "adjCoords56");
    gl.bindAttribLocation(prog, 4, "area");
    gl.bindAttribLocation(prog, 5, "adjWeights123");
    gl.bindAttribLocation(prog, 6, "adjWeights456");
    gl.attachShader(prog, getShader(gl, "shader-vs"));
    gl.attachShader(prog, getShader(gl, "shader-fs"));
    gl.linkProgram(prog);

    gl.useProgram(prog);
    gl.enableVertexAttribArray(0);
    var coords = [];
    for (i = 0; i < numPts; i++) coords.push.apply(coords, getTexCoords(i));
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    var adjc = [];
    for (i = 0; i < numPts; i++) {
        var q = edgedict[i];
        if (q.length == 5) {
            for (j = 0; j < 5; j++) adjc.push.apply(adjc, getTexCoords(q[j]));
            adjc.push.apply(adjc, getTexCoords(i));
        } else {
            for (j = 0; j < 6; j++) adjc.push.apply(adjc, getTexCoords(q[j]));
        }
    }
    var adjcoords = new Float32Array(adjc);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, adjcoords, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 12 * 4, 0);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 12 * 4, 4 * 4);
    gl.vertexAttribPointer(3, 4, gl.FLOAT, false, 12 * 4, 8 * 4);

    gl.enableVertexAttribArray(4);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(areadict), gl.STATIC_DRAW);
    gl.vertexAttribPointer(4, 1, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(5);
    gl.enableVertexAttribArray(6);
    var weights = [];
    for (i = 0; i < numPts; i++) {
        var q = weightdict[i];
        if (q.length == 5) weights.push.apply(weights, [q[0], q[1], q[2], q[3], q[4], 0.0]);
        else weights.push.apply(weights, [q[0], q[1], q[2], q[3], q[4], q[5]]);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(weights), gl.STATIC_DRAW);
    gl.vertexAttribPointer(5, 3, gl.FLOAT, false, 6 * 4, 0);
    gl.vertexAttribPointer(6, 3, gl.FLOAT, false, 6 * 4, 3 * 4);

    dampingLoc = gl.getUniformLocation(prog, "damping");
    gl.uniform1f(dampingLoc, 0.0);
    speedLoc = gl.getUniformLocation(prog, "speed");
    gl.uniform1f(speedLoc, 0.8);
    stiffnessLoc = gl.getUniformLocation(prog, "stiffness");
    gl.uniform1f(stiffnessLoc, 1.0);

    var ext = gl.getExtension("OES_texture_float");
    if (!ext) {
        alert(err + "OES_texture_float extension");
        return;
    }
    if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0) {
        alert(err + "Vertex texture");
        return;
    }

    texture1 = gl.createTexture();
    texture = gl.createTexture();
    FBO = gl.createFramebuffer();
    FBO1 = gl.createFramebuffer();

    samp = gl.getUniformLocation(prog, "samp");

    prog_show = gl.createProgram();
    gl.bindAttribLocation(prog_show, 0, "aTexCoord");
    gl.bindAttribLocation(prog_show, 1, "adjCoords12");
    gl.bindAttribLocation(prog_show, 2, "adjCoords34");
    gl.bindAttribLocation(prog_show, 3, "adjCoords56");
    gl.bindAttribLocation(prog_show, 7, "adjVertexPosition1");
    gl.bindAttribLocation(prog_show, 8, "adjVertexPosition2");
    gl.bindAttribLocation(prog_show, 9, "adjVertexPosition3");
    gl.bindAttribLocation(prog_show, 10, "adjVertexPosition4");
    gl.bindAttribLocation(prog_show, 11, "adjVertexPosition5");
    gl.bindAttribLocation(prog_show, 12, "adjVertexPosition6");
    gl.bindAttribLocation(prog_show, 13, "aVertexPosition");
    gl.attachShader(prog_show, getShader(gl, "shader-vs-show"));
    gl.attachShader(prog_show, getShader(gl, "shader-fs-show"));
    gl.linkProgram(prog_show);
    gl.useProgram(prog_show);

    gl.enableVertexAttribArray(13);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointsdict), gl.STATIC_DRAW);
    gl.vertexAttribPointer(13, 3, gl.FLOAT, false, 0, 0);

    var parr = [];
    for (i = 0; i < edgedict.length; i++) {
        a = edgedict[i];
        parr.push.apply(parr, [pointsdict[3 * a[0]], pointsdict[3 * a[0] + 1],
 pointsdict[3 * a[0] + 2]]);
        parr.push.apply(parr, [pointsdict[3 * a[1]], pointsdict[3 * a[1] + 1],
 pointsdict[3 * a[1] + 2]]);
        parr.push.apply(parr, [pointsdict[3 * a[2]], pointsdict[3 * a[2] + 1],
 pointsdict[3 * a[2] + 2]]);
        parr.push.apply(parr, [pointsdict[3 * a[3]], pointsdict[3 * a[3] + 1],
 pointsdict[3 * a[3] + 2]]);
        parr.push.apply(parr, [pointsdict[3 * a[4]], pointsdict[3 * a[4] + 1],
 pointsdict[3 * a[4] + 2]]);
        if (a.length == 5) parr.push.apply(parr, [0, 0, 0]);
        else parr.push.apply(parr, [pointsdict[3 * a[5]], pointsdict[3 * a[5] + 1],
 pointsdict[3 * a[5] + 2]]);
    }
    gl.enableVertexAttribArray(7);
    gl.enableVertexAttribArray(8);
    gl.enableVertexAttribArray(9);
    gl.enableVertexAttribArray(10);
    gl.enableVertexAttribArray(11);
    gl.enableVertexAttribArray(12);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(parr), gl.STATIC_DRAW);
    gl.vertexAttribPointer(7, 3, gl.FLOAT, false, 3 * 6 * 4, 0);
    gl.vertexAttribPointer(8, 3, gl.FLOAT, false, 3 * 6 * 4, 3 * 4);
    gl.vertexAttribPointer(9, 3, gl.FLOAT, false, 3 * 6 * 4, 6 * 4);
    gl.vertexAttribPointer(10, 3, gl.FLOAT, false, 3 * 6 * 4, 9 * 4);
    gl.vertexAttribPointer(11, 3, gl.FLOAT, false, 3 * 6 * 4, 12 * 4);
    gl.vertexAttribPointer(12, 3, gl.FLOAT, false, 3 * 6 * 4, 15 * 4);

    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(trianglearray), gl.STATIC_DRAW);
    samp_show = gl.getUniformLocation(prog_show, "samp");
    gl.uniform1i(samp_show, 0);
    mvpMatrixLoc = gl.getUniformLocation(prog_show, "u_modelViewProjMatrix");
    mvMatrixLoc = gl.getUniformLocation(prog_show, "modelViewMatrix");
    basecolorLoc = gl.getUniformLocation(prog_show, "basecolor");
    shininessLoc = gl.getUniformLocation(prog_show, "shininess");
    gl.uniform3f(basecolorLoc, 0.0, 1.0, 0.0);
    gl.uniform1f(shininessLoc, 0.0);
    gl.clearColor(0, 0, 0, 1);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    initialized = true;
    loadInitialValues("classic", 1);
}

function getTexCoords(i) {
    return [(i % m) / m + offset, Math.floor(i / m) / m + offset];
}

function loadInitialValues(type, jitter) {
    if (initialized) {
        var randvals = [];
        curRotQ = [1.0, 0.0, 0.0, 0.0];
        modelviewMatrix.load([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -5, 1]);
        projectionMatrix.load(projmat);
        projectionMatrix.multiply(modelviewMatrix);
        projectionMatrix.setUniform(gl, mvpMatrixLoc, false);
        gl.uniformMatrix3fv(mvMatrixLoc, false, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
        if (type == "classic") {
            for (i = 0; i < 7; i++) randvals.push(Math.floor(Math.random() * numPts));
            for (i = 0; i < numPts; i++) {
                var val = 0;
                for (j = 0; j < 7; j++) {
                    val += 1 / (Math.pow(1.5 * pointsdict[3 * randvals[j]] - pointsdict[3 * i], 2) +
                        Math.pow(1.5 * pointsdict[3 * randvals[j] + 1] - pointsdict[3 * i + 1], 2) +
                        Math.pow(1.5 * pointsdict[3 * randvals[j] + 2] - pointsdict[3 * i + 2], 2));
                }
                pix[3 * i] = 0.5 + val / 5 + jitter * Math.random() / 40;
                pix[3 * i + 1] = 0;
            }
        } else if (type == "pulse") {
            var k = Math.floor(Math.random() * numPts);
            for (i = 0; i < numPts; i++) {
                var val = 1 / (Math.pow(1.2 * pointsdict[3 * k] - pointsdict[3 * i], 2) +
                    Math.pow(1.2 * pointsdict[3 * k + 1] - pointsdict[3 * i + 1], 2) +
                    Math.pow(1.2 * pointsdict[3 * k + 2] - pointsdict[3 * i + 2], 2));
                pix[3 * i] = 1.0 + val / 20 + jitter * Math.random() / 40;
                pix[3 * i + 1] = 0;
            }
        } else if (type == "doublepulse") {
            for (i = 0; i < 2; i++) randvals.push(Math.floor(Math.random() * numPts));
            for (i = 0; i < numPts; i++) {
                var val = 0;
                for (j = 0; j < 2; j++) {
                    val += 1 / (Math.pow(1.2 * pointsdict[3 * randvals[j]] - pointsdict[3 * i], 2) +
                        Math.pow(1.2 * pointsdict[3 * randvals[j] + 1] - pointsdict[3 * i + 1], 2) +
                        Math.pow(1.2 * pointsdict[3 * randvals[j] + 2] - pointsdict[3 * i + 2], 2));
                }
                pix[3 * i] = 1.0 + val / 20 + jitter * Math.random() / 40;
                pix[3 * i + 1] = 0;
            }
        } else if (type == "ml24") {
            for (i = 0; i < numPts; i++) {
                pix[3 * i] = 1.5 * (7 * pointsdict[3 * i] * pointsdict[3 * i] - 1) *
                    (pointsdict[3 * i + 1] * pointsdict[3 * i + 1] - pointsdict[3 * i + 2] * pointsdict[3 * i + 2]);
                pix[3 * i + 1] = 0;
            }
        } else if (type == "ml04") {
            for (i = 0; i < numPts; i++) {
                var sq = pointsdict[3 * i] * pointsdict[3 * i];
                pix[3 * i] = (35 * sq * sq - 30 * sq + 3) / 4;
                pix[3 * i + 1] = 0;
            }
        } else if (type == "ml12") {
            for (i = 0; i < numPts; i++) {
                pix[3 * i] = 3 * pointsdict[3 * i] * pointsdict[3 * i + 1];
                pix[3 * i + 1] = 0;
            }
        } else if (type == "ml02") {
            for (i = 0; i < numPts; i++) {
                pix[3 * i] = 2 * pointsdict[3 * i] * pointsdict[3 * i] - pointsdict[3 * i + 1] * pointsdict[3 * i + 1] - pointsdict[3 * i + 2] * pointsdict[3 * i + 2];
                pix[3 * i + 1] = 0;
            }
        } else if (type == "ml14") {
            for (i = 0; i < numPts; i++) {
                pix[3 * i] = 1.5 * pointsdict[3 * i] * pointsdict[3 * i + 1] * (7 * pointsdict[3 * i] *
                    pointsdict[3 * i] - 3);
                pix[3 * i + 1] = 0;
            }
        } else if (type == "ml34") {
            for (i = 0; i < numPts; i++) {
                pix[3 * i] = 4 * (pointsdict[3 * i + 1] * pointsdict[3 * i + 1] - 3 * pointsdict[3 * i + 2] * pointsdict[3 * i + 2]) * pointsdict[3 * i + 1] * pointsdict[3 * i];
                pix[3 * i + 1] = 0;
            }
        } else if (type == "ml44") {
            for (i = 0; i < numPts; i++) {
                var sqx = pointsdict[3 * i + 1] * pointsdict[3 * i + 1];
                var sqy = pointsdict[3 * i + 2] * pointsdict[3 * i + 2];
                pix[3 * i] = 1.5 * (sqx * sqx - 6 * sqx * sqy + sqy * sqy);
                pix[3 * i + 1] = 0;
            }
        }
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture1);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, m, m, 0,
            gl.RGB, gl.FLOAT, pix);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, m, m, 0,
            gl.RGB, gl.FLOAT, pix);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindFramebuffer(gl.FRAMEBUFFER, FBO);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D, texture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, FBO1);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D, texture1, 0);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
            alert(err + "FLOAT as the color attachment to an FBO");
    }
}

function drawScene() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.useProgram(prog_show);
    gl.uniform1i(samp_show, currentSampler);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.flush();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, drawLength, gl.UNSIGNED_SHORT, 0);
}

var currentSampler = 0;

function tick() {
    requestAnimFrame(tick, maincanvas);
    gl.useProgram(prog);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.viewport(0, 0, m, m);
    if (currentSampler == 0) {
        gl.uniform1i(samp, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, FBO1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, numPts);
        currentSampler = 1;
    } else {
        gl.uniform1i(samp, 1);
        gl.bindFramebuffer(gl.FRAMEBUFFER, FBO);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, numPts);
        currentSampler = 0;
    }
    drawScene();
}

var maincanvas, colorcanvas, colorctx, baseRotQ, dragBaseX, dragBaseY, projmat;
var mainDrag = false;
var colorDrag = false;
var initialized = false;

function webGLStart() {
    maincanvas = document.getElementById("example");
    gl = WebGLUtils.setupWebGL(maincanvas);
    maincanvas.width = maincanvas.clientWidth;
    maincanvas.height = maincanvas.clientHeight;
    initShaders();
    document.getElementById("damping").value = 0.0;
    updateValue("dampingValue", "0");
    document.getElementById("speed").value = 1.0;
    updateValue("speedValue", "1");
    document.getElementById("shininess").value = 0.0;
    updateValue("shineValue", "0");
    document.getElementById("stiffness").value = 1.0;
    updateValue("stiffValue", "1");
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(100);
    maincanvas.addEventListener("mousedown", handleMouseDown, false);
    document.documentElement.onmouseup = function () {
        mainDrag = false;
        colorDrag = false
    };
    document.documentElement.onmouseleave = function () {
        mainDrag = false;
        colorDrag = false
    };
    document.documentElement.onmousemove = function (event) {
        handleMouseMove(event)
    };
    colorcanvas = document.getElementById("colorcanvas");
    colorctx = colorcanvas.getContext("2d");
    colorcanvas.addEventListener("mousedown", function (event) {
        colorDrag = true;
        handleMouseMove(event);
    }, false);
    colormousemove(55, 10);
    document.getElementById("loading").innerHTML = "";

    tick();
}

function handleMouseMove(evt) {
    if (mainDrag) rotate(evt.clientX, evt.clientY);
    else if (colorDrag) {
        var rect = colorcanvas.getBoundingClientRect();
        colormousemove(evt.clientX - rect.left, evt.clientY - rect.top);
    }
}

function updateValue(id, value) {
    if (initialized) {
        var val = Number(value);
        if (id == 'dampingValue') {
            gl.useProgram(prog);
            gl.uniform1f(dampingLoc, val / 100);
            document.getElementById("dampval").innerHTML = value;
        }
        if (id == 'speedValue') {
            gl.useProgram(prog);
            gl.uniform1f(speedLoc, 0.8 * val);
            document.getElementById("speedval").innerHTML = value;
        }
        if (id == 'shineValue') {
            gl.useProgram(prog_show);
            gl.uniform1f(shininessLoc, val);
            document.getElementById("shineval").innerHTML = value;
        }
        if (id == 'stiffValue') {
            gl.useProgram(prog);
            gl.uniform1f(stiffnessLoc, val);
            document.getElementById("stiffval").innerHTML = value;
        }
    }
}

function rotate(x, y) {
    var dx = x - dragBaseX;
    var dy = y - dragBaseY;
    var norm = Math.sqrt(dx * dx + dy * dy);
    if (norm > 0) {
        dx = dx / norm;
        dy = dy / norm;
    }
    curRotQ = qMultiply(baseRotQ, [Math.cos(norm / 200), -dy * Math.sin(norm / 200), -dx * Math.sin(norm / 200), 0]);
    modelviewMatrix.load([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -5, 1]);
    curRotQ = qNormalize(curRotQ);
    qr = curRotQ[0];
    qi = curRotQ[1];
    qj = curRotQ[2];
    qk = curRotQ[3];
    mat = [1 - 2 * qj * qj - 2 * qk * qk, 2 * (qi * qj - qk * qr), 2 * (qi * qk + qj * qr), 0,
  2 * (qi * qj + qk * qr), 1 - 2 * qi * qi - 2 * qk * qk, 2 * (qj * qk - qi * qr), 0,
  2 * (qi * qk - qj * qr), 2 * (qj * qk + qi * qr), 1 - 2 * qi * qi - 2 * qj * qj, 0,
  0, 0, 0, 1];
    rotMatrix.load(mat);
    gl.uniformMatrix3fv(mvMatrixLoc, false, [mat[0], mat[1], mat[2], mat[4], mat[5], mat[6], mat[8], mat[9], mat[10]]);
    modelviewMatrix.multiply(rotMatrix);

    projectionMatrix.load(projmat);
    projectionMatrix.multiply(modelviewMatrix);
    projectionMatrix.setUniform(gl, mvpMatrixLoc, false);
}

function handleMouseDown(evt) {
    if (evt.button == 0 && initialized) {
        mainDrag = true;
        dragBaseX = evt.clientX;
        dragBaseY = evt.clientY;
        baseRotQ = curRotQ;
    }
}

function colormousemove(x, y) {
    if (x > 135) x = 135;
    if (x < 15) x = 15;
    colorctx.clearRect(0, 0, 150, 20);
    var grd = colorctx.createLinearGradient(15, 0, 120, 0);
    grd.addColorStop(0, "#FF0808");
    grd.addColorStop(0.333, "#08FF08");
    grd.addColorStop(0.666, "#0808FF");
    grd.addColorStop(1.0, "#FF0808");
    colorctx.fillStyle = grd;
    colorctx.fillRect(15, 7, 120, 6);
    colorctx.fillStyle = "#DC143C";
    colorctx.beginPath();
    colorctx.arc(x, 10, 5, 0, 2 * Math.PI, false);
    colorctx.fill();
    var xscale = (x - 15) / 40.0;
    var hColor;
    if (xscale <= 1) {
        hColor = [1 - xscale, xscale, 0];
    } else if (xscale <= 2) {
        hColor = [0, 2 - xscale, xscale - 1];
    } else {
        hColor = [xscale - 2, 0, 3 - xscale];
    }
    gl.useProgram(prog_show);
    gl.uniform3f(basecolorLoc, hColor[0], hColor[1], hColor[2]);
}
