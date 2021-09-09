let gl;
let task = 1;
let triangleSize = 1;
let rotationAngle;
let triangleVertices = [];;
let shape;
let tessellationNo = 5;

init = () => {
    let canvas = document.getElementById("webgl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.75, 0.85, 0.8, 1.0);
}

cal_Shaders = (triangleVertices, type, count) => {
    let program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    let bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangleVertices), gl.STATIC_DRAW);

    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    render(type, count);
}


render = (type, count) => {

    let checkboxTessellated = document.getElementById("tessellated");

    gl.clear(gl.COLOR_BUFFER_BIT);
    if (type == 'WIREFRAME') {
        if (checkboxTessellated.checked) {
            for (let index = 0; index < count; index += 3) {
                gl.drawArrays(gl.LINE_LOOP, index, 3);
            }
        } else {
            gl.drawArrays(gl.LINE_LOOP, 0, count);
        }

    } else if (type == 'FILLED') {
        if (shape == 3) {
            gl.drawArrays(gl.TRIANGLES, 0, count); // for triangles (3 vertices) gl.TRIANGLES
        } else {
            let checkboxTessellated = document.getElementById("tessellated");
            if (checkboxTessellated.checked) {
                gl.drawArrays(gl.TRIANGLES, 0, count);
            } else {   
                gl.drawArrays(gl.TRIANGLE_FAN, 0, count); //use gl.TRIANGLE_FAN when triangleVertices side is more than 3
            }
        }
    }
}


PolygonVertices = (sides) => {
    let radius = 1 // initialized radius as 1 because coordinates is between -1 and 1.
    let verts = []
    let angle = (2 * Math.PI) / sides
    for (let i = 0; i < sides; i++) {
        x = Math.cos(2 * Math.PI * i / sides)
        y = Math.sin(2 * Math.PI * i / sides)
        verts.push(vec2(x, y))
    }
    return verts
}


triangleV = () => {
    let sideLength = 1.4 * triangleSize;
    rotationAngle = $("#rotationAngle").val() * Math.PI / 180;
    return triangleVertices = [
        //triangle lines
        vec2(0, sideLength / Math.sqrt(3)), 
        vec2(-sideLength / 2, -sideLength / (2 * Math.sqrt(3))), 
        vec2(sideLength / 2, -sideLength / (2 * Math.sqrt(3)))
    ];
}

twistV = (vector) => {
    let x = vector[0],
        y = vector[1],
        dist = Math.sqrt(x * x + y * y),
        sinAng = Math.sin(dist * rotationAngle),
        cosAng = Math.cos(dist * rotationAngle);
    return vec2(x * cosAng - y * sinAng, x * sinAng + y * cosAng);
}

tessellate = (tessellate_vertices, calculateRotation) => {
    let center = vec2(0, 0)
    let allVertices = []
    if (shape == 3) {
        allVertices = allVertices.concat(splitTriangle(tessellate_vertices[0], tessellate_vertices[1], tessellate_vertices[2], tessellationNo, calculateRotation))
    } else {
        for (let i = 0; i < tessellate_vertices.length; i++) {

            if (i == tessellate_vertices.length - 1) {
                allVertices = allVertices.concat(splitTriangle(center, tessellate_vertices[i], tessellate_vertices[0], tessellationNo, calculateRotation))
            } else {
                allVertices = allVertices.concat(splitTriangle(center, tessellate_vertices[i], tessellate_vertices[i + 1], tessellationNo, calculateRotation))
            }
        }
    }
    return allVertices;
}

splitTriangle = (a, b, c, no_of_tessellation, isRotation) => {
    if (no_of_tessellation === 0) {
        if (isRotation) {
            return [
                twistV(a), twistV(b), twistV(c)
            ]
        } else {
            return [a, b, c];
        }
    } else {
        //divide sides into two parts
        let ab = mix(a, b, 0.5);
        let ac = mix(a, c, 0.5);
        let bc = mix(b, c, 0.5);

        --no_of_tessellation;

        let first = splitTriangle(ab, bc, ac, no_of_tessellation, isRotation);
        let second = splitTriangle(a, ab, ac, no_of_tessellation, isRotation);
        let third = splitTriangle(c, ac, bc, no_of_tessellation, isRotation);
        let fourth = splitTriangle(b, bc, ab, no_of_tessellation, isRotation);

        let concat_array = first.concat(second).concat(third).concat(fourth)
        return concat_array

    }
}

sectionOne = () => {
    shape = 3
    task = 1
    enableRotation('collapse')
    enablePolygonOptions('collapse')
    resetRotation()
    tessellationCheckbox(false, false)
    triangleVertices = triangleV()
    cal_Shaders(triangleVertices, 'WIREFRAME', shape)
}

sectionTwo = () => {
    shape = 3
    task = 2
    enableRotation('visible')
    enablePolygonOptions('collapse')
    resetRotation()
    tessellationCheckbox(false, false)
    triangleVertices = triangleV()
    cal_Shaders(triangleVertices, 'FILLED', shape)
}


sectionThree = () => {
    disableTriangle()
    shape = 4
    task = 3
    enableRotation('collapse')
    enablePolygonOptions('visible')
    resetRotation()
    tessellationCheckbox(false, true)
    //specifying the triangleVertices as 4 means it starts from square(four sides)
    triangleVertices = PolygonVertices(4) 
    cal_Shaders(triangleVertices, 'WIREFRAME', shape)
}


sectionFour = () => {
    disableTriangle()
    shape = 4
    task = 4
    enableRotation('collapse')
    enablePolygonOptions('visible')
    resetRotation()
    tessellationCheckbox(true, true)
    triangleVertices = PolygonVertices(shape)
    let tessellatedVertices = tessellate(triangleVertices, false)
    cal_Shaders(tessellatedVertices, 'WIREFRAME', tessellatedVertices.length)
}


sectionFive = () => {
    enableTriangle()
    shape = 4 
    task = 5
    enableRotation('visible')
    enablePolygonOptions('visible')
    resetRotation()
    tessellationCheckbox(false, false)
    triangleVertices = PolygonVertices(shape)
    cal_Shaders(triangleVertices, 'FILLED', shape)
}

triangle = () => {
    shape = 3
    if (task == 5) {
        resetRotation()
        FilledTriangle(shape)
    } else {
        WiredTriangle(shape)
    }

}

square = () => {
    shape = 4
    if (task == 5) {
        resetRotation()
        FilledPolygon(shape)
    } else {
        WiredPolygon(shape)
    }

}

pentagon = () => {
    shape = 5
    if (task == 5) {
        resetRotation()
        FilledPolygon(shape)
    } else {
        WiredPolygon(shape)
    }
}

hexagon = () => {
    shape = 6
    if (task == 5) {
        resetRotation()
        FilledPolygon(shape)
    } else {
        WiredPolygon(shape)
    }
}

octagon = () => {
    shape = 8
    if (task == 5) {
        resetRotation()
        FilledPolygon(shape)
    } else {
        WiredPolygon(shape)
    }
}

resetRotation = () => {
    document.getElementById("rotationAngle").value = 0
    document.getElementById("rotationAngleOutput").value = 0
    rotationAngle = 0
}

tessellationCheckbox = (OnOff, disable) => {
    $('#tessellated').prop('disabled', false).change()
    $('#tessellated').prop('checked', OnOff).change()
    $('#tessellated').prop('disabled', disable).change()

}

enableRotation = (enable) => {
    document.getElementById("rotationSet").style.visibility = enable
}

enablePolygonOptions = (enable) => {
    document.getElementById("polygonOptions").style.visibility = enable
}

WiredPolygon = (sides) => {
    triangleVertices = PolygonVertices(sides)
    let checkboxTessellated = document.getElementById("tessellated");
    if (checkboxTessellated.checked) {
        let tessellatedVertices = tessellate(triangleVertices, false)
        cal_Shaders(tessellatedVertices, 'WIREFRAME', tessellatedVertices.length)
    } else {
        cal_Shaders(triangleVertices, 'WIREFRAME', sides)
    }
}

FilledPolygon = (sides) =>{
    triangleVertices = PolygonVertices(sides)
    let checkboxTessellated = document.getElementById("tessellated");
    if (checkboxTessellated.checked) {
        let tessellatedVertices = tessellate(triangleVertices, false)
        cal_Shaders(tessellatedVertices, 'FILLED', tessellatedVertices.length)
    } else {
        cal_Shaders(triangleVertices, 'FILLED', sides)
    }
}

WiredTriangle = (sides) =>{
    triangleVertices = triangleV(sides)
    let checkboxTessellated = document.getElementById("tessellated");
    if (checkboxTessellated.checked) {
        let tessellatedVertices = tessellate(triangleVertices, false)
        cal_Shaders(tessellatedVertices, 'WIREFRAME', tessellatedVertices.length)
    } else {
        cal_Shaders(triangleVertices, 'WIREFRAME', sides)
    }
}

FilledTriangle = (sides) => {
    triangleVertices = triangleV(sides)
    let checkboxTessellated = document.getElementById("tessellated");
    if (checkboxTessellated.checked) {
        let tessellatedVertices = tessellate(triangleVertices, false)
        cal_Shaders(tessellatedVertices, 'FILLED', tessellatedVertices.length)
    } else {
        cal_Shaders(triangleVertices, 'FILLED', sides)
    }
}

disableTriangle = () => {
    document.getElementById("myBtn").disabled = true;
  }

enableTriangle = () => {
    document.getElementById("myBtn").disabled = false;
  }

// Tessellated Checkbox  
$(function () {
    $('#tessellated').change(function () {
        let checkboxTessellated = $(this).prop('checked')

        if (checkboxTessellated) {
            if (task == 1) {
                let tessellatedVertices = tessellate(triangleVertices, false)
                cal_Shaders(tessellatedVertices, 'WIREFRAME', tessellatedVertices.length)
            } else if (task == 2) {
                let tessellatedVertices = tessellate(triangleVertices, true)
                cal_Shaders(tessellatedVertices, 'FILLED', tessellatedVertices.length)
            } else if (task == 3) {
                let tessellatedVertices = tessellate(triangleVertices, false)
                cal_Shaders(tessellatedVertices, 'WIREFRAME', tessellatedVertices.length)
            }

        } else {
            switch (task) {
                case 1:
                case 3:
                    cal_Shaders(triangleVertices, 'WIREFRAME', shape)
                    break;
                case 2:
                case 5:
                    resetRotation()
                    if (shape == 3) {
                        triangleVertices = triangleV()
                    } else {
                        triangleVertices = PolygonVertices(shape)
                    }

                    cal_Shaders(triangleVertices, 'FILLED', shape)
                    break;
                case 6:
                    break;

                default:
                    break;
            }
        }
    })
})

// Shape Rotation 
$(function () {

    $('#rotationAngle').change(function () {
        rotationAngle = this.value * Math.PI / 180;
        $("#rotationAngleOutput").text(this.value); 
        let checkboxTessellated = document.getElementById("tessellated");

        if (checkboxTessellated.checked) {
            let tessellatedVertices = tessellate(triangleVertices, true)
            cal_Shaders(tessellatedVertices, 'FILLED', tessellatedVertices.length)
        } else if(task == 6) {
            InitDemo();
        } else {
            if (task == 5) {
                let twistedPolygon = []
                for (let index = 0; index < triangleVertices.length; index++) {
                    twistedPolygon.push(twistV(triangleVertices[index]))
                }
                cal_Shaders(twistedPolygon, 'FILLED', twistedPolygon.length)
            } else {
                console.log(task)
                triangleVertices = [
                    twistV(triangleV()[0]),
                    twistV(triangleV()[1]),
                    twistV(triangleV()[2])
                ]
                cal_Shaders(triangleVertices, 'FILLED', shape)
            }

        }

    })
})

window.onload = function() {
    init();
    this.sectionOne()
};