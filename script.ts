let mandelbrot_element:HTMLCanvasElement = document.querySelector("#mandlebrot");
mandelbrot_element.width = window.innerWidth
mandelbrot_element.height = window.innerHeight

let rect_min = [-0.58, -0.5435277544383506]
let rect_max = [-0.5155981075602742, -0.5005446357189197]



const vertexSource = `
	attribute vec2 vertex;

	void main(){
		gl_Position = vec4(vertex, 0.0, 1.0);
	}
`

const fragmentSource = `
	precision highp float;
	precision highp int;
	uniform vec2 rectMin;
	uniform vec2 rectMax;
	uniform float width;
	uniform float height;
	uniform vec2 resolution;

	struct Complex{
		float real, imag;
	}; 
	
	
	float magnitude(vec2 v){
		return pow(v.x * v.x + v.y * v.y, 0.5);
	}
	
	#define MAX_ITERATIONS 800
	#define cproduct(a, b) vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x)

	float Radius = 7.5;
	vec3 ColorWeight = vec3(3.0, 4.0, 5.0);

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

	#define brightness 2.0

	void main() {
		vec2 st = vec2(gl_FragCoord.x / width, gl_FragCoord.y / height);
		float aspect_ratio = width / height;
		vec2 z = rectMin + st * (rectMax - rectMin);
		int iterations = Diverge(z, Radius);
		float luminance = ((float(iterations) - log2(length(z) / float(Radius))) / float(MAX_ITERATIONS));
		vec3 color = ColorWeight * luminance;
		gl_FragColor = vec4(color, 1);
  	}
`

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

function render(gl:WebGLRenderingContext, program_info, buffers) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
	gl.clearDepth(1.0);                 // Clear everything
	gl.enable(gl.DEPTH_TEST);           // Enable depth testing
	gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  
	// Clear the canvas before we start drawing on it.
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
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

	gl.uniform2f(
		program_info.uniform_locations.rect_min, rect_min[0], rect_min[1]
	)
	gl.uniform2f(
		program_info.uniform_locations.rect_max, rect_max[0], rect_max[1]
	)
	gl.uniform1f(	
		program_info.uniform_locations.width, window.innerWidth
	)
	gl.uniform1f(
		program_info.uniform_locations.height, window.innerHeight
	)


	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
} 

function main() {
	const gl = mandelbrot_element.getContext("webgl")
	if(gl == null) {
		console.log("No open gl context found")
		alert("No open gl context found")
	}

	const shader_program = intialize_shader_program(gl)
	const program_info = {
		program: shader_program,
		attrib_location: {
			vertex_position: gl.getAttribLocation(shader_program, "vertex") 
		},
		uniform_locations: {
			rect_min: gl.getUniformLocation(shader_program, "rectMin"),
			rect_max: gl.getUniformLocation(shader_program, "rectMax"),
			width: gl.getUniformLocation(shader_program, "width"),
			height: gl.getUniformLocation(shader_program, "height"),
		}
	}
	let position_buffer = init_buffer(gl)
	render(gl, program_info, position_buffer)
}

requestAnimationFrame(main)


let lastKnownScrollPosition = 0;
let ticking = false;

function handleScrollPosition(scollPos) {
	let delta_scroll = scollPos -lastKnownScrollPosition
	rect_min[0] -= 0.02 * delta_scroll
	rect_min[1] -= 0.02 * delta_scroll
	rect_max[0] += 0.02 * delta_scroll
	rect_max[1] += 0.02 * delta_scroll
}

document.addEventListener('scroll', function(e) {
	e.preventDefault()
	handleScrollPosition(window.scrollY)
	main()
	lastKnownScrollPosition = window.scrollY;
})

document.addEventListener('dblclick', event => {
	let canvasWidth = mandelbrot_element.width
	let canvasHeight = mandelbrot_element.height
	let zoomsize = 2
	const selectedWidth = canvasWidth / zoomsize;
	const selectedHeight = canvasHeight / zoomsize;

	const initialX = (event.clientX - (selectedWidth / 2)) / canvasWidth;
	const finalX = (event.clientX + (selectedWidth / 2)) / canvasWidth;
	const initialY = (event.clientY - (selectedHeight / 2)) / canvasHeight;
	const finalY = (event.clientY + (selectedHeight / 2)) / canvasHeight;

	rect_min[0] = ((rect_max[0] - rect_min[0]) * initialX) + rect_min[0],
	rect_max[0] = ((rect_max[0] - rect_min[0]) * finalX) + rect_min[0],

	
	rect_min[1] = ((rect_max[1] - rect_min[0]) * initialY) + rect_min[0]
	rect_max[1] = ((rect_max[1] - rect_min[0]) * finalY) + rect_min[0]

	main()
})