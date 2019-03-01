#version 300 es
precision highp float;

uniform vec2 u_Dimensions;

out vec4 out_col;

const vec4 sky[3] = vec4[](vec4(0.4, 0.42, 0.4, 1.0),
                               vec4(0.8, 0.6, 0.6, 1.0),
                               vec4(0.70, 0.78, 0.85, 1.0));

void main()
{
    vec2 uv = vec2(gl_FragCoord.x / u_Dimensions.x, gl_FragCoord.y / u_Dimensions.y);
    vec4 color = vec4(0.1, 0.6, 0.5, 1);
    // gradient
    if (uv.y <= 0.5) {
        color = mix(sky[1], sky[1], (uv.y - 0.2) / 0.3);
    } else if (uv.y < 0.5) {
        color = sky[1];
    } else if (uv.y <= 0.6) {
        color = mix(sky[1], sky[2], (uv.y - 0.5) / 0.1);
    } else {
        color = sky[2];
    }

// contrast
    color = color*color*(3.0-2.0*color);



    //VIGNETTE
    float fallOff = 0.25;
    vec2 coord = (uv - 0.5) * (u_Dimensions.x/u_Dimensions.y) * 2.0;
    float rf = sqrt(dot(coord, coord)) * fallOff;
    float rf2_1 = rf * rf + 1.0;
    float e = 1.0 / (rf2_1 * rf2_1);
    color *= e;

    out_col = color;
}