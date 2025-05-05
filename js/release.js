(function(){
  let images = [], idx = 0, timer = null;
  const imgEl         = document.getElementById('slide');
  const msgEl         = document.getElementById('message');
  const intervalInput = document.getElementById('interval');
  const btnShuffle    = document.getElementById('shuffle');
  const btnLoop       = document.getElementById('loop');
  const btnStart      = document.getElementById('start');
  const btnStop       = document.getElementById('stop');

  let settings = {
    interval: Number(intervalInput.value) * 1000,
    shuffle:  false,
    loop:     true
  };

  // let the STB send us Exit/VK events and file listings
  gSTB.EnableVKButton(true);        // API exposes Exit/Back
  gSTB.SetListFilesExt('.jpg .jpeg .png .gif');
  gSTB.EnableSpatialNavigation(true);    // :contentReference[oaicite:0]{index=0}
  gSTB.EnableTvButton(true);

  // show/hide utilities
  function showMessage(text) {
    imgEl.style.display = 'none';
    msgEl.textContent   = text;
    msgEl.style.display = 'block';
  }
  function hideMessage() {
    msgEl.style.display = 'none';
    imgEl.style.display = 'block';
  }

  function shuffleArray(a){
    for(let i = a.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }

  function loadImages(){
    images = [];
    idx = 0;

    let rootJs;
    try {
      rootJs = gSTB.ListDir('/media', false);
      eval(rootJs);               // defines dirs[], files[]
    } catch(e) {
      return showMessage('Error accessing file system');
    }

    const usbDirs = dirs.filter(d => d && d.endsWith('/'));
    if (!usbDirs.length) {
      return showMessage('No USB drive detected. Please insert a USB stick.');
    }

    hideMessage();

    usbDirs.forEach(dir => {
      const listJs = gSTB.ListDir('/media/' + dir, false);
      eval(listJs);  // redefines dirs[], files[]
      files.forEach(f => {
        if (f.Name) images.push('/media/' + dir + f.Name);
      });
    });

    if (!images.length) {
      return showMessage('No images found on USB drive.');
    }

    if (settings.shuffle) shuffleArray(images);
  }

  function showNext(){
    if (!images.length) return;
    imgEl.src = images[idx++];
    if (idx >= images.length) {
      if (settings.loop) {
        idx = 0;
        if (settings.shuffle) shuffleArray(images);
      } else {
        stopSlideshow();
      }
    }
  }

  function startSlideshow(){
    stopSlideshow();
    loadImages();
    if (!images.length) return;
    settings.interval = Number(intervalInput.value) * 1000;
    timer = setInterval(showNext, settings.interval);
    showNext();
  }

  function stopSlideshow(){
    if (timer) clearInterval(timer);
  }

  // wire up controls
  btnShuffle.addEventListener('click', ()=>{
    settings.shuffle = !settings.shuffle;
    btnShuffle.textContent = `Shuffle ${settings.shuffle? 'On':'Off'}`;
  });
  btnLoop.addEventListener('click', ()=>{
    settings.loop = !settings.loop;
    btnLoop.textContent = `Loop ${settings.loop? 'On':'Off'}`;
  });
  btnStart.addEventListener('click', startSlideshow);
  btnStop.addEventListener('click', stopSlideshow);

  // catch the remote’s Exit/Back and close the app
  document.addEventListener('keydown', function(e){
    // keyCode 13 = OK/Enter
    if (e.keyCode === 13) {
      const el = document.activeElement;
      if (el && el.click) {
        el.click();
        return;
      }
    }
    // Back/Esc/Exit keys
    const exitCodes = [8, 27, 461, 413]; // add any others your remote sends
    if (exitCodes.includes(e.keyCode)) {
      gSTB.CloseWebWindow();  // :contentReference[oaicite:1]{index=1}
    }
  });

  // initial check
  loadImages();
})();
