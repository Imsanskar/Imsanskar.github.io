const fragmentSource = `
	precision highp float;
	precision highp int;
	uniform vec2 rectMin;
	uniform vec2 rectMax;
	uniform float width;
	uniform float height;
	uniform float time;
	uniform vec2 resolution;
	uniform int coloring_method;

	struct Complex{
		float real, imag;
	}; 
	
	
	float magnitude(vec2 v){
		return pow(v.x * v.x + v.y * v.y, 0.5);
	}
	
	#define MAX_ITERATIONS 1000
	#define cproduct(a, b) vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x)

	float Radius = 3.0;
	vec3 ColorWeight = vec3(4.0, 4.0, 6.9);

	int Diverge(inout vec2 c, float radius) {
		vec2 z = vec2(0, 0);
		int iter = 0;
		for(int i = 0; i < MAX_ITERATIONS; i++) {
			z = cproduct(z, z) + c;
			iter += 1;

			if(length(z) >= radius) {
				break;
			} 
		}
		c = z;
		return iter;
	}

	#define brightness 2.9

	vec3 lerp(vec3 v0, vec3 v1, vec3 t) {
		return v0 + t * (v1 - v0);
	}

	
	float lerp(float v0, float v1, float t) {
		return v0 + t * (v1 - v0);
	}

	vec3 hsv2rgb(vec3 c) {
		vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
		vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
		return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
	}

	vec3 SmoothColoring(vec2 c, float radius) {	
		const float Saturation = 1.0;
		const float Value = 0.5;
		const float MinHue = 0.1;
		const float MaxHue = 0.8;

		vec2 z = vec2(0, 0);
		int iterations = 0;
		for(int i = 0; i < MAX_ITERATIONS; i++) {
			z = cproduct(z, z) + c;
			iterations += 1;

			if(length(z) >= radius) {
				break;
			} 
		}

		float value = 0.0;
		if (iterations < MAX_ITERATIONS) {
			float log_zn = log(z.x * z.x + z.y * z.y) / 2.0;
			float nu = log(log_zn / log(2.0)) / log(2.0);
			// Rearranging the potential function.
			// Dividing log_zn by log(2) instead of log(N = 1<<8)
			// because we want the entire palette to range from the
			// center to radius 2, NOT our bailout radius.
			iterations = iterations + 1 - int(nu);
			value = Value;
		}
		
		float hue1 = float(iterations) / float(MAX_ITERATIONS);
		float hue2 = float(iterations + 10) / float(MAX_ITERATIONS);
		float hue = lerp(hue1, hue2, 1.0);
		hue = MinHue + hue1 * (MaxHue - MinHue);

		vec3 color = hsv2rgb(vec3(hue, Saturation, value)); 
		return color;
	}

	vec3 WaveColoring(vec2 c, float radius) {
		vec2 z = vec2(0, 0);
		int iterations = 0;
		for(int i = 0; i < MAX_ITERATIONS; i++) {
			z = cproduct(z, z) + c;
			iterations += 1;

			if(length(z) >= radius) {
				break;
			} 
		}

		vec3 color;
		const float Amount = 0.2;
		color.z = 0.5 * sin(Amount * float(iterations) + 4.188) + 0.2;
		color.x = 0.5 * sin(Amount * float(iterations)) + 0.2;
		color.y = 0.5 * sin(Amount * float(iterations) + 2.094) + 0.3;
		
		return color;
	}

	vec3 WaveColoringAnimated(vec2 c, float radius) {
		vec2 z = vec2(0, 0);
		int iterations = 0;
		const float speed = 0.69;
		for(int i = 0; i < MAX_ITERATIONS; i++) {
			z = cproduct(z, z) + c;
			iterations += 1;

			if(length(z) >= radius) {
				break;
			} 
		}

		vec3 color;
		const float Amount = 0.15;
		
		color.z = 0.5 * cos(time * speed + Amount * float(iterations) + 4.188) + 0.2;
		color.x = 0.5 * cos(time * speed + Amount * float(iterations)) + 0.2;
		color.y = 0.5 * sin(time * speed + Amount * float(iterations) + 2.094) + 0.3;
		
		return color;
	}

	vec3 SimpleColoring(vec2 c, float radius) {
		vec2 z = vec2(0, 0);
		int iterations = 0;
		for(int i = 0; i < MAX_ITERATIONS; i++) {
			z = cproduct(z, z) + c;
			iterations += 1;

			if(length(z) >= radius) {
				break;
			} 
		}
		float luminance = ((float(iterations) - log2(length(z) / float(Radius))) / float(MAX_ITERATIONS));
		vec3 color = ColorWeight * luminance;
		
		return color / 1.25;
	}

	void main() {
		vec2 st = vec2(gl_FragCoord.x / width, gl_FragCoord.y / height);
		float aspect_ratio = width / height;
		vec2 z = rectMin + st * (rectMax - rectMin) * vec2(aspect_ratio, 1);
		// int iterations = Diverge(z, Radius);
		vec3 color;
		if (coloring_method == 0) {
			color = SimpleColoring(z, Radius) * vec3(0.2);
		} else if (coloring_method == 1) {
			color = SmoothColoring(z, Radius);
		} else if (coloring_method == 2) {
			color = WaveColoringAnimated(z, Radius);
		} else {

		}
		gl_FragColor = vec4(color * vec3(0.4), 1);
  	}
`

const vertexSource = `
	attribute vec2 vertex;

	void main(){
		gl_Position = vec4(vertex, 0.0, 1.0);
	}
`

// width and height of mandelbrot
let mandelbrot_element:HTMLCanvasElement = document.querySelector("#mandlebrot");
mandelbrot_element.width = window.innerWidth
mandelbrot_element.height = window.innerHeight

// web gl variables
let gl: WebGLRenderingContext = mandelbrot_element.getContext("webgl")
let program_info
let position_buffer
let shader_program



//scroll zoom
let body_offset = 0;


// coloring index
const total_colors = 3;
var color_index = total_colors - 1;
let color_btn = document.getElementById("navbar_btn");
color_btn.onclick = color_button_on_click;

// let rect_max = [ -0.37825498624348763, -0.599601710877615 ]
// let rect_min = [ -0.3901103351130718, -0.6039416658977393 ]
let rect_max = [ -0.3879056456676314, -0.5961265063044972 ];
let rect_min = [ -0.3965481949935583, -0.5992903335141678 ];

if (window.innerHeight * window.innerHeight < 370944) {
	rect_max = [-0.37905086326593324, -0.5961265063044972]
	rect_min =  [-0.38769341259186013, -0.5992903335141678]
}


function load_shader(gl:WebGLRenderingContext, type:number, source:string): WebGLShader | null {
	let shader: WebGLShader = gl.createShader(type)

	gl.shaderSource(shader, source)
	gl.compileShader(shader)

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}

	return shader

}

function intialize_shader_program(gl:WebGLRenderingContext) {
	const vertexShader = load_shader(gl, gl.VERTEX_SHADER, vertexSource)
	const fragmentShader = load_shader(gl, gl.FRAGMENT_SHADER, fragmentSource)

	const glProgram = gl.createProgram()
	gl.attachShader(glProgram, vertexShader)
	gl.attachShader(glProgram, fragmentShader)
	gl.linkProgram(glProgram)

	if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
		alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(glProgram));
		return null;
	}
	
	return glProgram;
}

function init_buffer(gl:WebGLRenderingContext) {
	const position_buffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer)

	const positions = [
		1.0,  1.0,
	   -1.0,  1.0,
		1.0, -1.0,
	   -1.0, -1.0,
	];

	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(positions),
		gl.STATIC_DRAW
	);

	return {
		position: position_buffer
	}

}

let delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function update() {
	gl.uniform2f(
		program_info.uniform_locations.rect_min, rect_min[0], rect_min[1]
	)
	gl.uniform2f(
		program_info.uniform_locations.rect_max, rect_max[0], rect_max[1]
	)
	gl.uniform1f(	
		program_info.uniform_locations.width, mandelbrot_element.width
	)
	gl.uniform1f(
		program_info.uniform_locations.height, mandelbrot_element.height
	)
	gl.uniform1f(
		program_info.uniform_locations.time, (new Date().getTime() / 1000 ) % 100
	)
	gl.uniform1i(
		program_info.uniform_locations.coloring_method, color_index
	)
}


async function render() {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
	gl.clearDepth(1.0);                 // Clear everything
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
} 

function initialize_webgl() {
	gl = mandelbrot_element.getContext("webgl")
	if(gl == null) {
		console.log("No open gl context found")
		alert("No open gl context found")
		return ;
	}

	shader_program = intialize_shader_program(gl)
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
	}
	position_buffer = init_buffer(gl)
	
	gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer.position)
	gl.vertexAttribPointer(
		program_info.attrib_location.vertex_position,
		2,
		gl.FLOAT,
		false,
		0,
		0
	)

	gl.enableVertexAttribArray(program_info.attrib_location.vertex_position);
	gl.useProgram(program_info.program)
	render()
}

function loop() {
	update()
	render()

	window.requestAnimationFrame(loop)
}

function MapRange(from_x1: number, from_x2: number, to_x1: number, to_x2: number, x: number): number {
    return (to_x2 - to_x1) / (from_x2 - from_x1) * (x - from_x1) + to_x1;
}

document.addEventListener('dblclick', event => {
	let canvasWidth = mandelbrot_element.width
	let canvasHeight = mandelbrot_element.height

	let cx: number = MapRange(0, canvasWidth, rect_min[0], rect_max[0], mandelbrot_element.width / 2);
	let cy: number = MapRange(0, canvasHeight, rect_min[1], rect_max[1], mandelbrot_element.height / 2);
	rect_min[0] -= cx;
	rect_max[0] -= cx;
	rect_min[1] -= cy;
	rect_max[1] -= cy;

	let factor = 0.9;

	rect_min[0] *= factor;
	rect_max[0] *= factor;
	rect_min[1] *= factor;
	rect_max[1] *= factor;
	
	rect_min[0] += cx;
	rect_max[0] += cx;
	rect_min[1] += cy;
	rect_max[1] += cy;
})

document.addEventListener('scroll', event => {
	let canvasWidth = mandelbrot_element.width
	let canvasHeight = mandelbrot_element.height

	let cx: number = MapRange(0, canvasWidth, rect_min[0], rect_max[0], mandelbrot_element.width / 2);
	let cy: number = MapRange(0, canvasHeight, rect_min[1], rect_max[1], mandelbrot_element.height / 2);
	rect_min[0] -= cx;
	rect_max[0] -= cx;
	rect_min[1] -= cy;
	rect_max[1] -= cy;

	let offset = window.scrollY - body_offset
	let factor = offset > 0? 0.9: 1.1;
	body_offset = window.scrollY

	rect_min[0] *= factor;
	rect_max[0] *= factor;
	rect_min[1] *= factor;
	rect_max[1] *= factor;
	
	rect_min[0] += cx;
	rect_max[0] += cx;
	rect_min[1] += cy;
	rect_max[1] += cy;
})

document.addEventListener('keypress', event => {
	let factor = (rect_max[0] - rect_min[0] + rect_max[1] - rect_min[1]) / 4
	if (event.key == 'w') {
		rect_max[1] += factor
		rect_min[1] += factor 
	} else if (event.key == 's') {
		rect_max[1] -= factor
		rect_min[1] -= factor 
	} else if (event.key == 'a') {
		rect_max[0] -= factor
		rect_min[0] -= factor 
	} else if (event.key == 'd') {
		rect_max[0] += factor
		rect_min[0] += factor 
	} else if (event.key == 'o') {
		let canvasWidth = mandelbrot_element.width
		let canvasHeight = mandelbrot_element.height

		let cx: number = MapRange(0, canvasWidth, rect_min[0], rect_max[0], mandelbrot_element.width / 2);
		let cy: number = MapRange(0, canvasHeight, rect_min[1], rect_max[1], mandelbrot_element.width / 2);
		rect_min[0] -= cx;
		rect_max[0] -= cx;
		rect_min[1] -= cy;
		rect_max[1] -= cy;

		let factor = 1.1;

		rect_min[0] *= factor;
		rect_max[0] *= factor;
		rect_min[1] *= factor;
		rect_max[1] *= factor;
		
		rect_min[0] += cx;
		rect_max[0] += cx;
		rect_min[1] += cy;
		rect_max[1] += cy;
	}
})

function window_resize_handler() {
	mandelbrot_element.width = window.innerWidth
	mandelbrot_element.height = window.innerHeight
	gl.viewport(0, 0, mandelbrot_element.width, mandelbrot_element.height)
}
window.onresize = window_resize_handler

// button click
function color_button_on_click() {
	color_index = (color_index + 1) % total_colors
	initialize_webgl()
}

initialize_webgl()
window.requestAnimationFrame(loop)