(function(){
  let images = [], idx = 0, timer = null;
  const imgEl        = document.getElementById('slide');
  const msgEl        = document.getElementById('message');
  const intervalInput= document.getElementById('interval');
  const btnShuffle   = document.getElementById('shuffle');
  const btnLoop      = document.getElementById('loop');
  const btnStart     = document.getElementById('start');
  const btnStop      = document.getElementById('stop');

  let settings = {
    interval: Number(intervalInput.value) * 1000,
    shuffle:  false,
    loop:     true
  };

  // only look for these extensions
  gSTB.SetListFilesExt('.jpg .jpeg .png .gif');

  function showMessage(text) {
    msgEl.textContent = text;
    msgEl.style.display = 'block';
  }
  function hideMessage() {
    msgEl.style.display = 'none';
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

    // 1) list mount-points under /media
    let rootJs;
    try {
      rootJs = gSTB.ListDir('/media', false);
      eval(rootJs);  // defines dirs[], files[]
    } catch(e){
      showMessage('Error accessing file system');
      return;
    }

    // pick only real directories (end in '/')
    const usbDirs = dirs.filter(d => d && d.endsWith('/'));
    if (usbDirs.length === 0) {
      showMessage('No USB drive detected. Please insert a USB stick.');
      return;
    }

    // we have at least one USB
    hideMessage();

    // 2) walk each
    usbDirs.forEach(dir => {
      let listJs = gSTB.ListDir('/media/' + dir, false);
      eval(listJs);  // redefines dirs[], files[] for this partition
      files.forEach(f => {
        if (f.Name) {
          images.push('/media/' + dir + f.Name);
        }
      });
    });

    // 3) shuffle if desired
    if (settings.shuffle) shuffleArray(images);

    if (images.length === 0) {
      showMessage('No images found on USB drive.');
    }
  }

  function showNext(){
    if (images.length === 0) return;
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
    // reload images each time you hit Start (in case user plugged in after load)
    loadImages();

    // only run if we have something to show
    if (images.length === 0) return;

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

  // initial load: will show message if no USB
  loadImages();
})();
