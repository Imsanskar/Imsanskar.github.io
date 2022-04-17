var mandelbrot_element = document.querySelector("#mandlebrot");
mandelbrot_element.width = window.innerWidth;
mandelbrot_element.height = window.innerHeight;
var rect_min = [-2.5, -2.0];
var rect_max = [2, 1.5];
var vertexSource = "\n\tattribute vec2 vertex;\n\n\tvoid main(){\n\t\tgl_Position = vec4(vertex, 0.0, 1.0);\n\t}\n";
var fragmentSource = "\n\tprecision highp float;\n\tprecision highp int;\n\tuniform vec2 rectMin;\n\tuniform vec2 rectMax;\n\tuniform float width;\n\tuniform float height;\n\tuniform vec2 resolution;\n\n\tstruct Complex{\n\t\tfloat real, imag;\n\t}; \n\t\n\t\n\tfloat magnitude(vec2 v){\n\t\treturn pow(v.x * v.x + v.y * v.y, 0.5);\n\t}\n\t\n\t#define MAX_ITERATIONS 250\n\t#define cproduct(a, b) vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x)\n\n\tfloat Radius = 5.0;\n\tvec3 ColorWeight = vec3(3.0, 4.0, 5.0);\n\n\tint Diverge(inout vec2 c, float radius) {\n\t\tvec2 z = vec2(0, 0);\n\t\tint iter = 0;\n\t\tfor(int i = 0; i < MAX_ITERATIONS; i++) {\n\t\t\tz = cproduct(z, z) + c;\n\t\t\titer += 1;\n\n\t\t\tif(length(z) >= radius) {\n\t\t\t\tbreak;\n\t\t\t} \n\t\t}\n\t\tc = z;\n\t\treturn iter;\n\t}\n\n\t#define brightness 2.0\n\n\tvoid main() {\n\t\tvec2 st = vec2(gl_FragCoord.x / width, gl_FragCoord.y / height);\n\t\tfloat aspect_ratio = width / height;\n\t\tvec2 z = rectMin + st * (rectMax - rectMin);\n\t\tint iterations = Diverge(z, Radius);\n\t\tfloat luminance = ((float(iterations) - log2(length(z) / float(Radius))) / float(MAX_ITERATIONS));\n\t\tvec3 color = ColorWeight * luminance;\n\t\tgl_FragColor = vec4(color, 1);\n  \t}\n";
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
function render(gl, program_info, buffers) {
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
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
function main() {
    var gl = mandelbrot_element.getContext("webgl");
    if (gl == null) {
        console.log("No open gl context found");
        alert("No open gl context found");
    }
    var shader_program = intialize_shader_program(gl);
    var program_info = {
        program: shader_program,
        attrib_location: {
            vertex_position: gl.getAttribLocation(shader_program, "vertex")
        },
        uniform_locations: {
            rect_min: gl.getUniformLocation(shader_program, "rectMin"),
            rect_max: gl.getUniformLocation(shader_program, "rectMax"),
            width: gl.getUniformLocation(shader_program, "width"),
            height: gl.getUniformLocation(shader_program, "height")
        }
    };
    var position_buffer = init_buffer(gl);
    render(gl, program_info, position_buffer);
}
requestAnimationFrame(main);
var lastKnownScrollPosition = 0;
var ticking = false;
function handleScrollPosition(scollPos) {
    var delta_scroll = scollPos - lastKnownScrollPosition;
    rect_min[0] -= 0.02 * delta_scroll;
    rect_min[1] -= 0.02 * delta_scroll;
    rect_max[0] += 0.02 * delta_scroll;
    rect_max[1] += 0.02 * delta_scroll;
}
document.addEventListener('scroll', function (e) {
    e.preventDefault();
    handleScrollPosition(window.scrollY);
    main();
    lastKnownScrollPosition = window.scrollY;
});