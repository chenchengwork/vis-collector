/**
 * The main plotty module.
 * @module plotty
 * @name plotty
 * @author: Daniel Santillan
 */

/**
 * @constant
 */
import { colorscales } from './colorscales';

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function defaultFor(arg, val) { return typeof arg !== 'undefined' ? arg : val; }

function create3DContext(canvas, optAttribs) {
  const names = ['webgl', 'experimental-webgl'];
  let context = null;
  for (let ii = 0; ii < names.length; ++ii) {
    try {
      context = canvas.getContext(names[ii], optAttribs);
    } catch(e) {}  // eslint-disable-line
    if (context) {
      break;
    }
  }
  if (!context || !context.getExtension('OES_texture_float')) {
    return null;
  }
  return context;
}

function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
  // create the shader program
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(vertexShader));
  }

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(fragmentShader));
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  return program;
}

function setRectangle(gl, x, y, width, height) {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2]), gl.STATIC_DRAW);
}

function createDataset(gl, id, data, width, height) {
  let textureData;
  if (gl) {
    gl.viewport(0, 0, width, height);
    textureData = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureData);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0,
      gl.LUMINANCE,
      width, height, 0,
      gl.LUMINANCE, gl.FLOAT, new Float32Array(data)
    );
  }
  return { textureData, width, height, data, id };
}

function destroyDataset(gl, dataset) {
  if (gl) {
    gl.deleteTexture(dataset.textureData);
  }
}

/**
 * Add a new colorscale to the list of available colorscales.
 * @memberof module:plotty
 * @param {String} name the name of the newly defined color scale
 * @param {String[]} colors the array containing the colors. Each entry shall
 *                          adhere to the CSS color definitions.
 * @param {Number[]} positions the value position for each of the colors
 */
function addColorScale(name, colors, positions) {
  if (colors.length !== positions.length) {
    throw new Error('Invalid color scale.');
  }
  colorscales[name] = { colors, positions };
}

/**
 * Render the colorscale to the specified canvas.
 * @memberof module:plotty
 * @param {String} name the name of the color scale to render
 * @param {HTMLCanvasElement} canvas the canvas to render to
 */
function renderColorScaleToCanvas(name, canvas) {
  /* eslint-disable no-param-reassign */
  const csDef = colorscales[name];
  canvas.height = 1;
  const ctx = canvas.getContext('2d');

  if (Object.prototype.toString.call(csDef) === '[object Object]') {
    canvas.width = 256;
    const gradient = ctx.createLinearGradient(0, 0, 256, 1);

    for (let i = 0; i < csDef.colors.length; ++i) {
      gradient.addColorStop(csDef.positions[i], csDef.colors[i]);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 1);
  } else if (Object.prototype.toString.call(csDef) === '[object Uint8Array]') {
    canvas.width = 256;
    const imgData = ctx.createImageData(256, 1);
    imgData.data.set(csDef);
    ctx.putImageData(imgData, 0, 0);
  } else {
    throw new Error('Color scale not defined.');
  }
  /* eslint-enable no-param-reassign */
}

const vertexShaderSource = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
uniform mat3 u_matrix;
uniform vec2 u_resolution;
varying vec2 v_texCoord;
void main() {
  // apply transformation matrix
  vec2 position = (u_matrix * vec3(a_position, 1)).xy;
  // convert the rectangle from pixels to 0.0 to 1.0
  vec2 zeroToOne = position / u_resolution;
  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;
  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  // pass the texCoord to the fragment shader
  // The GPU will interpolate this value between points.
  v_texCoord = a_texCoord;
}`;


// Definition of fragment shader
const fragmentShaderSource = `
precision mediump float;
// our textur
uniform sampler2D u_textureData;
uniform sampler2D u_textureScale;
uniform vec2 u_textureSize;
uniform vec2 u_domain;
uniform float u_noDataValue;
uniform bool u_clampLow;
uniform bool u_clampHigh;
// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;
void main() {
  vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
  float value = texture2D(u_textureData, v_texCoord)[0];
  if (value == u_noDataValue)
    gl_FragColor = vec4(0.0, 0, 0, 0.0);
  else if ((!u_clampLow && value < u_domain[0]) || (!u_clampHigh && value > u_domain[1]))
    gl_FragColor = vec4(0, 0, 0, 0);
  else {
    float normalisedValue = (value - u_domain[0]) / (u_domain[1] - u_domain[0]);
    gl_FragColor = texture2D(u_textureScale, vec2(normalisedValue, 0));
  }
}`;

/**
 * The raster plot class.
 * @memberof module:plotty
 * @constructor
 * @param {Object} options the options to pass to the plot.
 * @param {HTMLCanvasElement} [options.canvas] the canvas to render to
 * @param {TypedArray} [options.data] the raster data to render
 * @param {Number} [options.width] the width of the input raster
 * @param {Number} [options.height] the height of the input raster
 * @param {Object[]} [options.datasets] a list of named datasets. each must
 *                                      have 'id', 'data', 'width' and 'height'.
 * @param {(HTMLCanvasElement|HTMLImageElement)} [options.colorScaleImage] the color scale
 *                                                                         image to use
 * @param {String} [options.colorScale] the name of a named color scale to use
 * @param {Number[]} [options.domain] the value domain to scale the color
 * @param {Boolean} [options.clampLow] whether or now values below the domain
 *                                     shall be clamped
 * @param {Boolean} [options.clampHigh] whether or now values above the domain
 *                                      shall be clamped
 * @param {Number} [options.noDataValue] the no-data value that shall always
 *                                       hidden
 *
 * @param {Array} [options.matrix] Transformation matrix
 *
 */
class plot {
  constructor(options) {
    this.datasetCollection = {};
    this.currentDataset = null;

    this.setCanvas(options.canvas);
    // check if a webgl context is requested and available and set up the shaders
    let gl;

    // eslint-disable-next-line no-cond-assign
    if (defaultFor(options.useWebGL, true) && (gl = create3DContext(this.canvas))) {
      this.gl = gl;

      this.program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
      gl.useProgram(this.program);

      // look up where the vertex data needs to go.
      const texCoordLocation = gl.getAttribLocation(this.program, 'a_texCoord');

      // provide texture coordinates for the rectangle.
      this.texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0]), gl.STATIC_DRAW);

      gl.enableVertexAttribArray(texCoordLocation);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
    } else {
      this.ctx = this.canvas.getContext('2d');
    }

    if (options.colorScaleImage) {
      this.setColorScaleImage(options.colorScaleImage);
    } else {
      this.setColorScale(defaultFor(options.colorScale, 'viridis'));
    }
    this.setDomain(defaultFor(options.domain, [0, 1]));
    this.setClamp(defaultFor(options.clampLow, true), options.clampHigh);
    this.setNoDataValue(options.noDataValue);

    if (options.data) {
      const l = options.data.length;
      this.setData(
        options.data,
        defaultFor(options.width, options.data[l - 2]),
        defaultFor(options.height, options.data[l - 2])
      );
    }

    if (options.datasets) {
      for (let i = 0; i < options.datasets.length; ++i) {
        const ds = options.datasets[i];
        this.addDataset(ds.id, ds.data, ds.width, ds.height);
      }
    }

    if (options.matrix) {
      this.matrix = options.matrix;
    } else {  // if no matrix is provided, supply identity matrix
      this.matrix = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1,
      ];
    }
  }

  /**
   * Get the raw data from the currently selected dataset.
   * @returns {TypedArray} the data of the currently selected dataset.
   */
  getData() {
    const dataset = this.currentDataset;
    if (!dataset) {
      throw new Error('No dataset available.');
    }
    return dataset.data;
  }

  /**
   * Query the raw raster data at the specified coordinates.
   * @param {Number} x the x coordinate
   * @param {Number} y the y coordinate
   * @returns {Number} the value at the specified coordinates
   */
  atPoint(x, y) {
    const dataset = this.currentDataset;
    if (!dataset) {
      throw new Error('No dataset available.');
    } else if (x >= dataset.width || y >= dataset.height) {
      throw new Error('Coordinates are outside of image bounds.');
    }
    return dataset.data[(y * dataset.width) + x];
  }

  /**
   * Set the raw raster data to be rendered. This creates a new unnamed dataset.
   * @param {TypedArray} data the raw raster data. This can be a typed array of
   *                          any type, but will be coerced to Float32Array when
   *                          beeing rendered.
   * @param {int} width the width of the raster image
   * @param {int} height the height of the data
   */
  setData(data, width, height) {
    if (this.currentDataset && this.currentDataset.id === null) {
      destroyDataset(this.gl, this.currentDataset);
    }
    this.currentDataset = createDataset(this.gl, null, data, width, height);
  }

  /**
   * Add a new named dataset. The semantics are the same as with @see setData.
   * @param {string} id the identifier for the dataset.
   * @param {TypedArray} data the raw raster data. This can be a typed array of
   *                          any type, but will be coerced to Float32Array when
   *                          beeing rendered.
   * @param {int} width the width of the raster image
   * @param {int} height the height of the data
   */
  addDataset(id, data, width, height) {
    if (this.datasetAvailable(id)) {
      throw new Error(`There is already a dataset registered with id '${id}'`);
    }
    this.datasetCollection[id] = createDataset(this.gl, id, data, width, height);
    if (!this.currentDataset) {
      this.currentDataset = this.datasetCollection[id];
    }
  }

  /**
   * Set the current dataset to be rendered.
   * @param {string} id the identifier of the dataset to be rendered.
   */
  setCurrentDataset(id) {
    if (!this.datasetAvailable(id)) {
      throw new Error(`No such dataset registered: '${id}'`);
    }
    if (this.currentDataset && this.currentDataset.id === null) {
      destroyDataset(this.gl, this.currentDataset);
    }
    this.currentDataset = this.datasetCollection[id];
  }

  /**
   * Remove the dataset.
   * @param {string} id the identifier of the dataset to be removed.
   */
  removeDataset(id) {
    const dataset = this.datasetCollection[id];
    if (!dataset) {
      throw new Error(`No such dataset registered: '${id}'`);
    }
    destroyDataset(this.gl, dataset);
    if (this.currentDataset === dataset) {
      this.currentDataset = null;
    }
    delete this.datasetCollection[id];
  }

  /**
   * Check if the dataset is available.
   * @param {string} id the identifier of the dataset to check.
   * @returns {Boolean} whether or not a dataset with that identifier is defined
   */
  datasetAvailable(id) {
    return hasOwnProperty(this.datasetCollection, id);
  }

  /**
   * Retrieve the rendered color scale image.
   * @returns {(HTMLCanvasElement|HTMLImageElement)} the canvas or image element
   *                                                 for the rendered color scale
   */
  getColorScaleImage() {
    return this.colorScaleImage;
  }

  /**
   * Set the canvas to draw to. When no canvas is supplied, a new canvas element
   * is created.
   * @param {HTMLCanvasElement} [canvas] the canvas element to render to.
   */
  setCanvas(canvas) {
    this.canvas = canvas || document.createElement('canvas');
  }

  /**
   * Set the new value domain for the rendering.
   * @param {float[]} domain the value domain range in the form [low, high]
   */
  setDomain(domain) {
    if (!domain || domain.length !== 2) {
      throw new Error('Invalid domain specified.');
    }
    this.domain = domain;
  }

  /**
   * Get the canvas that is currently rendered to.
   * @returns {HTMLCanvasElement} the canvas that is currently rendered to.
   */
  getCanvas() {
    return this.canvas;
  }

  /**
   * Set the currently selected color scale.
   * @param {string} name the name of the colorscale. Must be registered.
   */
  setColorScale(name) {
    if (!hasOwnProperty(colorscales, name)) {
      throw new Error(`No such color scale '${name}'`);
    }
    if (!this.colorScaleCanvas) {
      // Create single canvas to render colorscales
      this.colorScaleCanvas = document.createElement('canvas');
      this.colorScaleCanvas.width = 256;
      this.colorScaleCanvas.height = 1;
    }
    renderColorScaleToCanvas(name, this.colorScaleCanvas);
    this.name = name;
    this.setColorScaleImage(this.colorScaleCanvas);
  }

  /**
   * Set the clamping for the lower and the upper border of the values. When
   * clamping is enabled for either side, the values below or above will be
   * clamped to the minimum/maximum color.
   * @param {Boolean} clampLow whether or not the minimum shall be clamped.
   * @param {Boolean} clampHigh whether or not the maxmimum shall be clamped.
   *                            defaults to clampMin.
   */
  setClamp(clampLow, clampHigh) {
    this.clampLow = clampLow;
    this.clampHigh = (typeof clampHigh !== 'undefined') ? clampHigh : clampLow;
  }

  /**
   * Set the currently selected color scale as an image or canvas.
   * @param {(HTMLCanvasElement|HTMLImageElement)} colorScaleImage the new color
   *                                                               scale image
   */
  setColorScaleImage(colorScaleImage) {
    this.colorScaleImage = colorScaleImage;
    const gl = this.gl;
    if (gl) {
      if (this.textureScale) {
        gl.deleteTexture(this.textureScale);
      }
      this.textureScale = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.textureScale);

      // Set the parameters so we can render any size image.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      // Upload the image into the texture.
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, colorScaleImage);
    }
  }

  /**
   * Set the no-data-value: a special value that will be rendered transparent.
   * @param {float} noDataValue the no-data-value. Use null to clear a
   *                            previously set no-data-value.
   */
  setNoDataValue(noDataValue) {
    this.noDataValue = noDataValue;
  }

  /**
   * Render the map to the specified canvas with the given settings.
   */
  render() {
    const canvas = this.canvas;
    const dataset = this.currentDataset;

    canvas.width = dataset.width;
    canvas.height = dataset.height;

    if (this.gl) {
      const gl = this.gl;
      gl.viewport(0, 0, dataset.width, dataset.height);
      gl.useProgram(this.program);
      // set the images
      gl.uniform1i(gl.getUniformLocation(this.program, 'u_textureData'), 0);
      gl.uniform1i(gl.getUniformLocation(this.program, 'u_textureScale'), 1);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, dataset.textureData);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.textureScale);

      const positionLocation = gl.getAttribLocation(this.program, 'a_position');
      const domainLocation = gl.getUniformLocation(this.program, 'u_domain');
      const resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution');
      const noDataValueLocation = gl.getUniformLocation(this.program, 'u_noDataValue');
      const clampLowLocation = gl.getUniformLocation(this.program, 'u_clampLow');
      const clampHighLocation = gl.getUniformLocation(this.program, 'u_clampHigh');
      const matrixLocation = gl.getUniformLocation(this.program, 'u_matrix');

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2fv(domainLocation, this.domain);
      gl.uniform1i(clampLowLocation, this.clampLow);
      gl.uniform1i(clampHighLocation, this.clampHigh);
      gl.uniform1f(noDataValueLocation, this.noDataValue);
      gl.uniformMatrix3fv(matrixLocation, false, this.matrix);

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);


      setRectangle(gl, 0, 0, canvas.width, canvas.height);

      // Draw the rectangle.
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    } else if (this.ctx) {
      const ctx = this.ctx;
      const w = canvas.width;
      const h = canvas.height;

      const imageData = ctx.createImageData(w, h);

      const trange = this.domain[1] - this.domain[0];
      const steps = this.colorScaleCanvas.width;
      const csImageData = this.colorScaleCanvas.getContext('2d').getImageData(0, 0, steps, 1).data;
      let alpha;

      const data = dataset.data;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w) + x;
          // TODO: Possible increase of performance through use of worker threads?

          const index = ((y * w) + x) * 4;

          let c = Math.round(((data[i] - this.domain[0]) / trange) * steps);
          alpha = 255;
          if (c < 0) {
            c = 0;
            if (!this.clampLow) {
              alpha = 0;
            }
          } else if (c > 255) {
            c = 255;
            if (!this.clampHigh) {
              alpha = 0;
            }
          }

          if (data[i] === this.noDataValue) {
            alpha = 0;
          }

          imageData.data[index + 0] = csImageData[c * 4];
          imageData.data[index + 1] = csImageData[(c * 4) + 1];
          imageData.data[index + 2] = csImageData[(c * 4) + 2];
          imageData.data[index + 3] = alpha;
        }
      }

      ctx.putImageData(imageData, 0, 0); // at coords 0,0
    }
  }

  /**
   * Render the specified dataset with the current settings.
   * @param {string} id the identifier of the dataset to render.
   */
  renderDataset(id) {
    this.setCurrentDataset(id);
    return this.render();
  }

  /**
   * Get the color for the specified value.
   * @param {flaot} val the value to query the color for.
   * @returns {Array} the 4-tuple: red, green, blue, alpha in the range 0-255.
   */
  getColor(val) {
    const steps = this.colorScaleCanvas.width;
    const csImageData = this.colorScaleCanvas.getContext('2d')
                                             .getImageData(0, 0, steps, 1).data;
    const trange = this.domain[1] - this.domain[0];
    let c = Math.round(((val - this.domain[0]) / trange) * steps);
    let alpha = 255;
    if (c < 0) {
      c = 0;
      if (!this.clampLow) {
        alpha = 0;
      }
    }
    if (c > 255) {
      c = 255;
      if (!this.clampHigh) {
        alpha = 0;
      }
    }

    return [
      csImageData[c * 4],
      csImageData[(c * 4) + 1],
      csImageData[(c * 4) + 2],
      alpha,
    ];
  }
}

// register the symbols to be exported at the 'global' object (to be replaced by browserify)
export { plot, addColorScale, colorscales, renderColorScaleToCanvas };
