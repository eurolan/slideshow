(function(){
  let images = [], idx = 0, timer = null;
  const imgEl        = document.getElementById('slide');
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

  // Only list these extensions:
  gSTB.SetListFilesExt('.jpg .jpeg .png .gif');

  function shuffleArray(a){
    for(let i = a.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }

  function loadImages(){
    images = [];
    idx = 0;

    // 1) Get all mount points under /media
    var rootList = gSTB.ListDir('/media', false);
    eval(rootList); // yields dirs[], files[]

    dirs.forEach(function(dir){
      if (!dir || dir.slice(-1) !== '/') return;  // skip non‐dirs
      var listJs = gSTB.ListDir('/media/' + dir, false);
      eval(listJs);
      files.forEach(function(f){
        if (f.Name) {
          images.push('/media/' + dir + f.Name);
        }
      });
    });

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
    settings.interval = Number(intervalInput.value) * 1000;
    timer = setInterval(showNext, settings.interval);
    showNext();
  }

  function stopSlideshow(){
    if (timer) clearInterval(timer);
  }

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

  // initial population of images
  loadImages();
})();
