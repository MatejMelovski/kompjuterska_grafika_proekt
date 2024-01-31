#version 330 core
out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D screenTexture;
uniform bool NightVisionFlag;
uniform bool texFlag;
uniform float time;

uniform float offset;
uniform int effectNum;

float contrast = 1.0f;

float edgeOffset = 1.0/300.0;

// Function to generate Perlin noise
float perlin(vec2 co)
{
    return fract(sin(dot(co.xy + time, vec2(12.9898, 78.233))) * 43758.5453);
}

vec4 nightVision()
{
    float kernel[9] = float[](
    -1, -1, -1,
    -1, 9, -1,
    -1, -1, -1
    );

    vec3 sampleTex[9];
    for (int i = 0; i < 9; i++)
    {
        sampleTex[i] = texture(screenTexture, TexCoords.st).rgb;
    }

    vec3 col = vec3(0.0);
    for (int i = 0; i < 9; i ++)
    {
        col += sampleTex[i] * kernel[i];
    }
    if(texture(screenTexture, TexCoords).a==0)
    {
        discard;
    }
    if(texFlag)
    {
        // Use Perlin noise for the green channel
        float noise = perlin(TexCoords) * 0.1;

        // Apply contrast to the noise
        noise = clamp(contrast * (noise - 0.5) + 0.5, 0.0, 1.0);

        // Apply the noise to the green channel
        col.g += noise;

        // Apply contrast and set the output color
        col.g = clamp(contrast * (col.g - 0.5) + 0.5, 0.0, 1.0);
        col.g = clamp(col.g / 0.59, 0.0, 1.0);
    }

    return vec4(0.0, col.g, 0.0, 1.0);
}

vec4 blurEffect()
{
    vec2 offsets[9] = vec2[](
    vec2(-offset,  offset), // top-left
    vec2( 0.0f,    offset), // top-center
    vec2( offset,  offset), // top-right
    vec2(-offset,  0.0f),   // center-left
    vec2( 0.0f,    0.0f),   // center-center
    vec2( offset,  0.0f),   // center-right
    vec2(-offset, -offset), // bottom-left
    vec2( 0.0f,   -offset), // bottom-center
    vec2( offset, -offset)  // bottom-right
    );

    float kernel[9] = float[](
    1.0 / 16, 2.0 / 16, 1.0 / 16,
    2.0 / 16, 4.0 / 16, 2.0 / 16,
    1.0 / 16, 2.0 / 16, 1.0 / 16
    );

    vec3 sampleTex[9];
    for(int i = 0; i < 9; i++)
    {
        sampleTex[i] = vec3(texture(screenTexture, TexCoords.st + offsets[i]));
    }
    vec3 col = vec3(0.0);
    for(int i = 0; i < 9; i++)
    col += sampleTex[i] * kernel[i];

    return vec4(col, 1.0);
}

vec4 edgeDetection()
{
    vec2 offsets[9] = vec2[](
    vec2(-edgeOffset,  edgeOffset), // top-left
    vec2( 0.0f,    edgeOffset), // top-center
    vec2( edgeOffset,  edgeOffset), // top-right
    vec2(-edgeOffset,  0.0f),   // center-left
    vec2( 0.0f,    0.0f),   // center-center
    vec2( edgeOffset,  0.0f),   // center-right
    vec2(-edgeOffset, -edgeOffset), // bottom-left
    vec2( 0.0f,   -edgeOffset), // bottom-center
    vec2( edgeOffset, -edgeOffset)  // bottom-right
    );

    float kernel[9] = float[](
    1, 1, 1,
    1, -8, 1,
    1, 1, 1
    );

    vec3 sampleTex[9];
    for(int i = 0; i < 9; i++)
    {
        sampleTex[i] = vec3(texture(screenTexture, TexCoords.st + offsets[i]));
    }
    vec3 col = vec3(0.0);
    for(int i = 0; i < 9; i++)
    col += sampleTex[i] * kernel[i];

    return vec4(col, 1.0);
}

void main()
{
    if(effectNum==0)
    {
        if(NightVisionFlag)
            FragColor = nightVision();
        else
            FragColor = vec4(vec3(texture(screenTexture, TexCoords)), 1.0);
    }
    else if(effectNum==1)
    {
        FragColor = blurEffect();
    }
    else if(effectNum==2)
    {
        FragColor = vec4(vec3(1.0 - texture(screenTexture, TexCoords)), 1.0);
    }
    else if(effectNum==3)
    {
        FragColor = texture(screenTexture, TexCoords);
        float average = 0.2126 * FragColor.r + 0.7152 * FragColor.g + 0.0722 * FragColor.b;
        FragColor = vec4(average, average, average, 1.0);
    }
    else if(effectNum==4)
    {
        FragColor = edgeDetection();
    }
}
