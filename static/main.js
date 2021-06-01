const LIMIT = 12;
const DURATION = 5000;

const App = new Vue({
  el: '#app',
  data: {
    // common
    images: [],
    mode: 'presentation',

    // presentation mode
    defaultDuration: DURATION,
    lastTime: 0,
    progress: 0,

    lastPause: 0,
    isPaused: false,

    current: 0,
    isShowTools: true
  },
  computed: {
    slideImage(){
      const media = this.images[this.current];

      if (!media)
        return null;

      if (media.mime.indexOf('video') === 0){
        this.$nextTick(() => {
          const video = this.$refs.slideVideo;
          this.isPaused = true;

          video.addEventListener('durationchange', () => {
            this.progress = (video.currentTime/video.duration)*100;
          });

          video.addEventListener('timeupdate', (event) => {
            this.progress = (video.currentTime/video.duration)*100;
          });

          video.addEventListener('ended', () => {
            this.defaultDuration = DURATION;
            this.nextSlide();
            this.isPaused = false;
          });
        });
      }

      return media;
    }
  }, 
  methods: {
    // system
    async init(dir){
      const res = await axios.get(`/images/?dir=${dir}`);
      this.images = res.data
        .map(img => {
          return Object.assign({}, img, { id: this.id++, mime: mime.getType(img.path) });
        });

      this.start();
    },

    load(){
      this.images.push.apply(
        this.images, 
        this.allImages.slice(this.images.length, this.images.length + LIMIT)       
      );
    },

    keyHandle(e){
      if (this.mode === 'presentation'){
        switch (e.key){
          case 'ArrowRight':
            this.nextSlide();
            break;
          case 'ArrowLeft':
            this.prevSlide();
            break;
        }
      }
    },  

    // presentation
    loop(){
      requestAnimationFrame(() => {
        this.loop()
      });

      const now = Date.now();

      // mouse over
      if (now - this.lastMouseMove < DURATION){
        this.isShowTools = true;
      } else {
        this.isShowTools = false;
      }

      if (this.isPaused)
        return;

      const duration = now - this.lastTime;
      this.progress = duration/this.defaultDuration*100;

      // when reach duration
      if (duration < this.defaultDuration)
        return;

      this.lastTime = now;

      // auto next slide
      this.current++;

      if (this.current >= this.images.length)
        this.current = 0;

    },

    start(){
      this.lastMouseMove = 
      this.lastTime = Date.now();

      this.loop();
    },

    nextSlide(){
      if (this.current < this.images.length - 1){
        this.current++;
      } else {
        this.current = 0;
      }

      this.lastTime = Date.now();
    },

    prevSlide(){
      if (this.current > 0){
        this.current--;
      } else {
        this.current = this.images.length - 1;
      }

      this.lastTime = Date.now();
    },

    mouseMove(){
      this.lastMouseMove = Date.now();
      this.isShowTools = true;
    },

    mouseDown(){
      this.isPaused = true;
      this.lastPause = Date.now();
    },

    mouseUp(){
      this.isPaused = false;
      this.lastTime = Date.now() - (this.lastPause - this.lastTime);
    },

    fullScreen(){
      const body = document.body;

      if (window.innerHeight == screen.height && window.innerWidth == screen.width){ // close fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
          document.msExitFullscreen();
        }
      } else { // request fullscreen
        if (body.requestFullscreen) {
          body.requestFullscreen();
        } else if (body.webkitRequestFullscreen) { /* Safari */
          body.webkitRequestFullscreen();
        } else if (body.msRequestFullscreen) { /* IE11 */
          body.msRequestFullscreen();
        }
      }
    }
  },
  async mounted(){
    await this.init('')
  }
});
