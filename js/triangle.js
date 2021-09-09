// triangleVertices = [];
   
var vertexShaderText = 
[
'precision mediump float;', //using medium precision on a float variable
'',
'attribute vec2 vertPosition;', //vector 2 element (x and y positions)
'',
'attribute vec3 vertColor;',
'',
'varying vec3 fragColor;',
'',
'void main()',
'{',
'fragColor = vertColor;',
'gl_Position = vec4(vertPosition, 0.0, 1.0);', //vector 4 element
'}'
].join('\n');

var fragmentShaderText = 
[
    'precision mediump float;',
    '',
    'varying vec3 fragColor;',
    '',
    'void main()',
    '{',
    'gl_FragColor = vec4(fragColor, 1.0);',
    '}'
].join('\n');

//initialize webgl
var InitDemo = function(){
    // console.log("This is working");
    
    // //prepare the canvas
     var canvas = document.getElementById('webgl-canvas');
     var gl = canvas.getContext('webgl');
    if(task != 6){
        resetRotation();
    }
    task = 6;
    $('#tessellated').prop('disabled', true).change()
    $('#tessellated').prop('checked', false).change()
    enableRotation('visible')

    // //browsers that do not support webgl
    // if(!gl){
    //     console.log('WebGL not supported,')
    //     gl - canvas.getContext('experimental-webgl');
    // }

    // if(!gl){
    //     alert('Your browser does not support WebGL');
    // }

    // // You can add canvas width and height here

    // //setting the color of the paint that is been used
     gl.clearColor(0.75, 0.85, 0.8, 1.0); //THIS IS RED GREEN BLUE ALPHA-VALUE(1.0)

    // //clear method performs the painting
    // //you paint using the clear method -- color buffer stores what the color pixels should be
    // // while depth buffer stores how deep into the screen that pixel was
     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //this renders the paint -- the argument is imperative

    //Create Shaders
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    //set the shader source
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    //compile the shaders to display any error
    gl.compileShader(vertexShader);
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.error('Error compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }
    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.error('Error compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    //Combine both shaders by attaching both to the program and linking both to program
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.error('Error linking program!', gl.getProgramInfoLog(program));
        return;
    }

    //this catches additional error -- good programming style
    gl.validateProgram(program);
    if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
        console.error('Error validating program!', gl.getProgramInfoLog(program));
        return;
    }

    //
    //Create Buffer
    //
    var vertices = 
    [ //X Y         R G B
        [-0.9, -0.8, 1.0, 1.0, 0.0],
        [-0.5, -0.8, 0.7, 0.0, 1.0],
        [-0.9, -0.2,  1.0, 1.0, 0.6],

        [-0.5, -0.8, 1.0, 1.0, 0.0],
        [-0.5, -0.2, 0.7, 0.0, 1.0],
        [-0.9, -0.2, 1.0, 1.0, 0.6],

        [-0.9, -0.2, 1.0, 1.0, 0.0],
        [-0.9, 0.5, 0.7,0.0, 1.0],
        [-0.5, -0.2, 1.0, 1.0, 0.6],

        [-0.5, -0.2, 1.0, 1.0, 0.0],
        [-0.5, 0.5, 0.7, 0.0, 1.0],
        [-0.9, 0.5, 1.0, 1.0, 0.6],

        [-0.5, 0.5, 1.0, 1.0, 0.0],
        [-0.5, 0.2, 0.7, 0.0, 1.0],
        [0.2, 0.2, 1.0, 1.0, 0.6],

        [-0.5, 0.5, 1.0, 1.0, 0.0],
        [0.2, 0.5, 0.7, 0.0, 1.0],
        [0.2, 0.2, 1.0, 1.0, 0.6],

        [0.2, 0.2, 1.0, 1.0, 0.0],
        [0.2, -0.2, 0.7, 0.0, 1.0],
        [-0.2, -0.2, 1.0, 1.0, 0.6],

        [-0.2, -0.2, 1.0, 1.0, 0.0],
        [-0.2, 0.2, 0.7, 0.0, 1.0],
        [0.2, 0.2, 1.0, 1.0, 0.6],

        [0.2, -0.4, 1.0, 1.0, 0.0],
        [-0.5, -0.4, 0.7, 0.0, 1.0],
        [-0.5, -0.2, 1.0, 1.0, 0.6],

        [-0.5, -0.2, 1.0, 1.0, 0.0],
        [0.2, -0.2, 0.7, 0.0, 1.0],
        [0.2, -0.4, 1.0, 1.0, 0.6]
    ];

    
   rotationAngle = $("#rotationAngle").val() * Math.PI / 180;
   triangleVertices = []
   vertices.forEach(function([x, y, r, g, b]){
        // nx = Math.sin(rotationAngle);
        // ny = Math.cos(rotationAngle);

        // // translate point back to origin:
        // x -= 0;
        // y -= 0;

        // // rotate point
        // vx = x * ny - y * nx;
        // vy = x * nx + y * ny;

        // // translate point back:
        // x = vx + 0;
        // y = vy + 0;


        dist = Math.sqrt(x * x + y * y),
        sinAng = Math.sin(dist * rotationAngle),
        cosAng = Math.cos(dist * rotationAngle);
        
        
        x = x * cosAng - y * sinAng;
        y = x * sinAng + y * cosAng;


        triangleVertices.push(
            x, y, r, g, b
        );
    });

    var triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    gl.vertexAttribPointer(
        positionAttribLocation, //Attribute location
        2, //number of elements per attribute
        gl.FLOAT, //type of elements (32 byte float)
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, //Size of an individual vertex which is 4
        0 //Offset start at the beginning of a single vertex to this attribute
    );

    gl.vertexAttribPointer(
        colorAttribLocation, //Attribute location
        3, //number of elements per attribute
        gl.FLOAT, //type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, //Size of an individual vertex
        2 * Float32Array.BYTES_PER_ELEMENT //Offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    //
    //Main render loop
    //
   gl.useProgram(program);
   gl.drawArrays(gl.TRIANGLES, 0, 30);
};
