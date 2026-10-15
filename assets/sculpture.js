/* One generated specimen, animated as a living surface. Static artwork remains
   available without WebGL; reduced motion disables all displacement and glints. */
(() => {
  const host=document.querySelector('.root-stage');if(!host)return;
  const canvas=host.querySelector('canvas'),image=host.querySelector('img');
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true,powerPreference:'low-power'});if(!gl)return;
  const compile=(kind,source)=>{const s=gl.createShader(kind);gl.shaderSource(s,source);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null;};
  const vertex=compile(gl.VERTEX_SHADER,`attribute vec2 position;varying vec2 uv;void main(){uv=vec2((position.x+1.)*.5,(1.-position.y)*.5);gl_Position=vec4(position,0.,1.);}`);
  const fragment=compile(gl.FRAGMENT_SHADER,`
    precision mediump float;
    uniform sampler2D sculpture;
    uniform vec2 viewport,pointer;
    uniform float time,light,mobile,moving,active;
    varying vec2 uv;
    void main(){
      vec2 p=uv;float ratio=viewport.x/viewport.y;
      if(mobile>.5){p.y=(uv.y-.39)/.66;p.x=(uv.x-.5)*min(1.,ratio/.88)+.64;}
      else if(ratio<1.5){p.x=(uv.x-.5)*(ratio/1.5)+.5;}
      else{p.y=(uv.y-.5)*(1.5/ratio)+.5;}
      float field=smoothstep(.2,.7,p.x);
      p+=vec2(sin(p.y*5.+time*.17),cos(p.x*5.+time*.13))*.0035*field*moving+pointer*.004*field;
      vec3 color=texture2D(sculpture,clamp(p,.001,.999)).rgb;
      float luminance=dot(color,vec3(.2126,.7152,.0722));
      color+=vec3(.012,.020,.012)*(1.-smoothstep(.06,.35,luminance));
      float wave=pow(max(0.,sin(p.x*7.+p.y*9.-time*.7)),18.);
      color+=vec3(.17,.12,.07)*wave*smoothstep(.23,.8,luminance)*moving*(1.+active*.7);
      float fade=mobile>.5?smoothstep(0.,.15,p.y):1.;
      color=mix(vec3(.067),color,fade);
      vec3 paper=vec3(.961,.961,.949)-vec3(.72,.75,.76)*luminance*fade;
      gl_FragColor=vec4(mix(color,paper,light),1.);
    }`);
  if(!vertex||!fragment)return;
  const program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
  gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const u={};for(const name of ['sculpture','viewport','pointer','time','light','mobile','moving','active'])u[name]=gl.getUniformLocation(program,name);
  let frame=0,last=0,elapsed=0,loaded=false,paused=matchMedia('(prefers-reduced-motion:reduce)').matches,hidden=document.hidden;
  let px=0,py=0,tx=0,ty=0,active=0;
  const paint=()=>{if(!loaded)return;gl.uniform2f(u.viewport,canvas.width,canvas.height);gl.uniform2f(u.pointer,paused?0:px,paused?0:py);gl.uniform1f(u.time,elapsed);gl.uniform1f(u.light,document.documentElement.dataset.theme==='light'?1:0);gl.uniform1f(u.mobile,innerWidth<640?1:0);gl.uniform1f(u.moving,paused?0:1);gl.uniform1f(u.active,active);gl.drawArrays(gl.TRIANGLES,0,6);};
  const resize=()=>{const b=host.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(b.width*d);canvas.height=Math.round(b.height*d);gl.viewport(0,0,canvas.width,canvas.height);paint();};
  const loop=now=>{frame=0;if(paused||hidden||!loaded)return;if(now-last>=32){elapsed+=Math.min((now-last)/1000,.05);last=now;px+=(tx-px)*.05;py+=(ty-py)*.05;paint();}frame=requestAnimationFrame(loop);};
  const run=()=>{cancelAnimationFrame(frame);last=performance.now();paint();if(loaded&&!paused&&!hidden)frame=requestAnimationFrame(loop);};
  let loading=false;
  const load=async()=>{if(loaded||loading||!image.naturalWidth)return;loading=true;try{await image.decode();}catch{loading=false;return;}const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.uniform1i(u.sculpture,0);loaded=true;resize();host.dataset.ready='true';run();};
  image.addEventListener('load',load,{once:true});load();
  const motionPreference=matchMedia('(prefers-reduced-motion:reduce)');
  motionPreference.addEventListener('change',e=>{paused=e.matches;run();});
  window.addEventListener('holdfast:product',e=>{active=e.detail?1:0;paint();});
  window.addEventListener('themechange',paint);
  document.addEventListener('visibilitychange',()=>{hidden=document.hidden;run();});
  document.addEventListener('pointermove',e=>{tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5;},{passive:true});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();loaded=false;cancelAnimationFrame(frame);delete host.dataset.ready;});
  new ResizeObserver(resize).observe(host);
})();
