var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var fragmentSource = "\n\tprecision highp float;\n\tprecision highp int;\n\tuniform vec2 rectMin;\n\tuniform vec2 rectMax;\n\tuniform float width;\n\tuniform float height;\n\tuniform float time;\n\tuniform vec2 resolution;\n\tuniform int coloring_method;\n\n\tstruct Complex{\n\t\tfloat real, imag;\n\t}; \n\t\n\t\n\tfloat magnitude(vec2 v){\n\t\treturn pow(v.x * v.x + v.y * v.y, 0.5);\n\t}\n\t\n\t#define MAX_ITERATIONS 500\n\t#define cproduct(a, b) vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x)\n\n\tfloat Radius = 2.0;\n\tvec3 ColorWeight = vec3(4.0, 4.0, 6.9);\n\n\tint Diverge(inout vec2 c, float radius) {\n\t\tvec2 z = vec2(0, 0);\n\t\tint iter = 0;\n\t\tfor(int i = 0; i < MAX_ITERATIONS; i++) {\n\t\t\tz = cproduct(z, z) + c;\n\t\t\titer += 1;\n\n\t\t\tif(length(z) >= radius) {\n\t\t\t\tbreak;\n\t\t\t} \n\t\t}\n\t\tc = z;\n\t\treturn iter;\n\t}\n\n\t#define brightness 6.9\n\n\tvec3 lerp(vec3 v0, vec3 v1, vec3 t) {\n\t\treturn v0 + t * (v1 - v0);\n\t}\n\n\t\n\tfloat lerp(float v0, float v1, float t) {\n\t\treturn v0 + t * (v1 - v0);\n\t}\n\n\tvec3 hsv2rgb(vec3 c) {\n\t\tvec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n\t\tvec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n\t\treturn c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n\t}\n\n\tvec3 SmoothColoring(vec2 c, float radius) {\t\n\t\tconst float Saturation = 1.0;\n\t\tconst float Value = 0.5;\n\t\tconst float MinHue = 0.1;\n\t\tconst float MaxHue = 0.8;\n\n\t\tvec2 z = vec2(0, 0);\n\t\tint iterations = 0;\n\t\tfor(int i = 0; i < MAX_ITERATIONS; i++) {\n\t\t\tz = cproduct(z, z) + c;\n\t\t\titerations += 1;\n\n\t\t\tif(length(z) >= radius) {\n\t\t\t\tbreak;\n\t\t\t} \n\t\t}\n\n\t\tfloat value = 0.0;\n\t\tif (iterations < MAX_ITERATIONS) {\n\t\t\tfloat log_zn = log(z.x * z.x + z.y * z.y) / 2.0;\n\t\t\tfloat nu = log(log_zn / log(2.0)) / log(2.0);\n\t\t\t// Rearranging the potential function.\n\t\t\t// Dividing log_zn by log(2) instead of log(N = 1<<8)\n\t\t\t// because we want the entire palette to range from the\n\t\t\t// center to radius 2, NOT our bailout radius.\n\t\t\titerations = iterations + 1 - int(nu);\n\t\t\tvalue = Value;\n\t\t}\n\t\t\n\t\tfloat hue1 = float(iterations) / float(MAX_ITERATIONS);\n\t\tfloat hue2 = float(iterations + 10) / float(MAX_ITERATIONS);\n\t\tfloat hue = lerp(hue1, hue2, 1.0);\n\t\thue = MinHue + hue1 * (MaxHue - MinHue);\n\n\t\tvec3 color = hsv2rgb(vec3(hue, Saturation, value)); \n\t\treturn color;\n\t}\n\n\tvec3 WaveColoring(vec2 c, float radius) {\n\t\tvec2 z = vec2(0, 0);\n\t\tint iterations = 0;\n\t\tfor(int i = 0; i < MAX_ITERATIONS; i++) {\n\t\t\tz = cproduct(z, z) + c;\n\t\t\titerations += 1;\n\n\t\t\tif(length(z) >= radius) {\n\t\t\t\tbreak;\n\t\t\t} \n\t\t}\n\n\t\tvec3 color;\n\t\tconst float Amount = 0.2;\n\t\tcolor.z = 0.5 * sin(Amount * float(iterations) + 4.188) + 0.3;\n\t\tcolor.x = 0.5 * sin(Amount * float(iterations)) + 0.2;\n\t\tcolor.y = 0.5 * sin(Amount * float(iterations) + 2.094) + 0.3;\n\t\t\n\t\treturn color;\n\t}\n\n\tvec3 WaveColoringAnimated(vec2 c, float radius) {\n\t\tvec2 z = vec2(0, 0);\n\t\tint iterations = 0;\n\t\tconst float speed = 0.5;\n\t\tfor(int i = 0; i < MAX_ITERATIONS; i++) {\n\t\t\tz = cproduct(z, z) + c;\n\t\t\titerations += 1;\n\n\t\t\tif(length(z) >= radius) {\n\t\t\t\tbreak;\n\t\t\t} \n\t\t}\n\n\t\tvec3 color;\n\t\tconst float Amount = 0.15;\n\t\tcolor.z = 0.5 * sin(time * speed + Amount * float(iterations) + 4.188) + 0.3;\n\t\tcolor.x = 0.5 * sin(time * speed + Amount * float(iterations)) + 0.2;\n\t\tcolor.y = 0.5 * sin(time * speed + Amount * float(iterations) + 2.094) + 0.3;\n\t\t\n\t\treturn color / 1.5;\n\t}\n\n\tvec3 SimpleColoring(vec2 c, float radius) {\n\t\tvec2 z = vec2(0, 0);\n\t\tint iterations = 0;\n\t\tfor(int i = 0; i < MAX_ITERATIONS; i++) {\n\t\t\tz = cproduct(z, z) + c;\n\t\t\titerations += 1;\n\n\t\t\tif(length(z) >= radius) {\n\t\t\t\tbreak;\n\t\t\t} \n\t\t}\n\t\tfloat luminance = ((float(iterations) - log2(length(z) / float(Radius))) / float(MAX_ITERATIONS));\n\t\tvec3 color = ColorWeight * luminance;\n\t\t\n\t\treturn color;\n\t}\n\n\tvoid main() {\n\t\tvec2 st = vec2(gl_FragCoord.x / width, gl_FragCoord.y / height);\n\t\tfloat aspect_ratio = width / height;\n\t\tvec2 z = rectMin + st * (rectMax - rectMin) * vec2(aspect_ratio, 1);\n\t\t// int iterations = Diverge(z, Radius);\n\t\tvec3 color;\n\t\tif (coloring_method == 0) {\n\t\t\tcolor = SimpleColoring(z, Radius);\n\t\t} else if (coloring_method == 1) {\n\t\t\tcolor = SmoothColoring(z, Radius);\n\t\t} else if (coloring_method == 2) {\n\t\t\tcolor = WaveColoring(z, Radius);\n\t\t} else if (coloring_method == 3) {\n\t\t\tcolor = WaveColoringAnimated(z, Radius);\n\t\t} else {\n\n\t\t}\n\t\tgl_FragColor = vec4(color * vec3(0.4), 1);\n  \t}\n";
var vertexSource = "\n\tattribute vec2 vertex;\n\n\tvoid main(){\n\t\tgl_Position = vec4(vertex, 0.0, 1.0);\n\t}\n";
// width and height of mandelbrot
var mandelbrot_element = document.querySelector("#mandlebrot");
mandelbrot_element.width = window.innerWidth;
mandelbrot_element.height = window.innerHeight;
// coloring index
var color_index = 3;
var color_btn = document.getElementById("navbar_btn");
color_btn.onclick = color_button_on_click;
// let rect_max = [ -0.37825498624348763, -0.599601710877615 ]
// let rect_min = [ -0.3901103351130718, -0.6039416658977393 ]
var rect_max = [-0.3879056456676314, -0.5961265063044972];
var rect_min = [-0.3965481949935583, -0.5992903335141678];
function load_shader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}
function intialize_shader_program(gl) {
    var vertexShader = load_shader(gl, gl.VERTEX_SHADER, vertexSource);
    var fragmentShader = load_shader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    var glProgram = gl.createProgram();
    gl.attachShader(glProgram, vertexShader);
    gl.attachShader(glProgram, fragmentShader);
    gl.linkProgram(glProgram);
    if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(glProgram));
        return null;
    }
    return glProgram;
}
function init_buffer(gl) {
    var position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
    var positions = [
        1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        -1.0, -1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    return {
        position: position_buffer
    };
}
var delay = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };
function render(gl, program_info, buffers) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
            gl.clearDepth(1.0); // Clear everything
            gl.enable(gl.DEPTH_TEST); // Enable depth testing
            gl.depthFunc(gl.LEQUAL); // Near things obscure far things
            // Clear the canvas before we start drawing on it.
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.vertexAttribPointer(program_info.attrib_location.vertex_position, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(program_info.attrib_location.vertex_position);
            gl.useProgram(program_info.program);
            gl.uniform2f(program_info.uniform_locations.rect_min, rect_min[0], rect_min[1]);
            gl.uniform2f(program_info.uniform_locations.rect_max, rect_max[0], rect_max[1]);
            gl.uniform1f(program_info.uniform_locations.width, window.innerWidth);
            gl.uniform1f(program_info.uniform_locations.height, window.innerHeight);
            gl.uniform1f(program_info.uniform_locations.time, (new Date().getTime() / 1000) % 100);
            gl.uniform1i(program_info.uniform_locations.coloring_method, color_index);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            return [2 /*return*/];
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var gl, shader_program, program_info, position_buffer;
        return __generator(this, function (_a) {
            gl = mandelbrot_element.getContext("webgl");
            if (gl == null) {
                console.log("No open gl context found");
                alert("No open gl context found");
            }
            shader_program = intialize_shader_program(gl);
            program_info = {
                program: shader_program,
                attrib_location: {
                    vertex_position: gl.getAttribLocation(shader_program, "vertex")
                },
                uniform_locations: {
                    rect_min: gl.getUniformLocation(shader_program, "rectMin"),
                    rect_max: gl.getUniformLocation(shader_program, "rectMax"),
                    width: gl.getUniformLocation(shader_program, "width"),
                    height: gl.getUniformLocation(shader_program, "height"),
                    time: gl.getUniformLocation(shader_program, "time"),
                    coloring_method: gl.getUniformLocation(shader_program, "coloring_method")
                }
            };
            position_buffer = init_buffer(gl);
            render(gl, program_info, position_buffer);
            return [2 /*return*/];
        });
    });
}
function MapRange(from_x1, from_x2, to_x1, to_x2, x) {
    return (to_x2 - to_x1) / (from_x2 - from_x1) * (x - from_x1) + to_x1;
}
var mouse_x = 0;
var mouse_y = 0;
document.addEventListener("mousemove", function (event) {
    mouse_x = event.clientX;
    mouse_y = event.clientY;
});
document.addEventListener('dblclick', function (event) {
    var canvasWidth = mandelbrot_element.width;
    var canvasHeight = mandelbrot_element.height;
    var cx = MapRange(0, canvasWidth, rect_min[0], rect_max[0], mouse_x);
    var cy = MapRange(0, canvasHeight, rect_min[1], rect_max[1], mouse_y);
    rect_min[0] -= cx;
    rect_max[0] -= cx;
    rect_min[1] -= cy;
    rect_max[1] -= cy;
    var factor = 0.9;
    rect_min[0] *= factor;
    rect_max[0] *= factor;
    rect_min[1] *= factor;
    rect_max[1] *= factor;
    rect_min[0] += cx;
    rect_max[0] += cx;
    rect_min[1] += cy;
    rect_max[1] += cy;
    main();
});
document.addEventListener('scroll', function (event) {
    var canvasWidth = mandelbrot_element.width;
    var canvasHeight = mandelbrot_element.height;
    var cx = MapRange(0, canvasWidth, rect_min[0], rect_max[0], mouse_x);
    var cy = MapRange(0, canvasHeight, rect_min[1], rect_max[1], mouse_y);
    rect_min[0] -= cx;
    rect_max[0] -= cx;
    rect_min[1] -= cy;
    rect_max[1] -= cy;
    var factor = -2;
    rect_min[0] *= factor;
    rect_max[0] *= factor;
    rect_min[1] *= factor;
    rect_max[1] *= factor;
    rect_min[0] += cx;
    rect_max[0] += cx;
    rect_min[1] += cy;
    rect_max[1] += cy;
    main();
});
document.addEventListener('keypress', function (event) {
    var factor = (rect_max[0] - rect_min[0] + rect_max[1] - rect_min[1]) / 4;
    if (event.key == 'w') {
        rect_max[1] += factor;
        rect_min[1] += factor;
    }
    else if (event.key == 's') {
        rect_max[1] -= factor;
        rect_min[1] -= factor;
    }
    else if (event.key == 'a') {
        rect_max[0] -= factor;
        rect_min[0] -= factor;
    }
    else if (event.key == 'd') {
        rect_max[0] += factor;
        rect_min[0] += factor;
    }
    else if (event.key == 'o') {
        var canvasWidth = mandelbrot_element.width;
        var canvasHeight = mandelbrot_element.height;
        var cx = MapRange(0, canvasWidth, rect_min[0], rect_max[0], mouse_x);
        var cy = MapRange(0, canvasHeight, rect_min[1], rect_max[1], mouse_y);
        rect_min[0] -= cx;
        rect_max[0] -= cx;
        rect_min[1] -= cy;
        rect_max[1] -= cy;
        var factor_1 = 1.1;
        rect_min[0] *= factor_1;
        rect_max[0] *= factor_1;
        rect_min[1] *= factor_1;
        rect_max[1] *= factor_1;
        rect_min[0] += cx;
        rect_max[0] += cx;
        rect_min[1] += cy;
        rect_max[1] += cy;
    }
    main();
});
var start, tick = 0;
var f = function () {
    main();
    if (!start)
        start = new Date().getTime();
    var now = new Date().getTime();
    if (now < start + tick * 1000) {
        setTimeout(f, 0);
    }
    else {
        tick++;
        var diff = now - start;
        var drift = diff % 1000;
        setTimeout(f, 500);
    }
};
if (navigator.userAgent.indexOf("Firefox") != -1) {
    requestAnimationFrame(main);
}
else {
    main();
    setTimeout(f, 500);
}
// button click
function color_button_on_click() {
    color_index = (color_index + 1) % 4;
    main();
}
