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
      // preload the next
      const next = this.images[this.nextCurrent];
      if (next && next.mime.indexOf('image') === 0){
        (new Image()).src = next.path;
      }

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
    },

    nextCurrent(){
      if (this.current < this.images.length - 1){
        return this.current + 1;
      } else {
        return 0;
      }
    }
  }, 
  methods: {
    // system
    async init(dir){
      const res = await axios.get(`/images/?dir=${dir}`);
      this.images = res.data
        .filter(item => item.mime.indexOf('image') === 0 || item.mime.indexOf('video') === 0)
        .map(img => {
          return {
            ...img,
            path: `/storage/${img.path}`
          };
        });

      this.start();
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
          case ' ':
            if (this.isPaused){
              this.isPaused = false;
              this.lastTime = Date.now() - (this.lastPause - this.lastTime);
            } else {
              this.isPaused = true;
              this.lastPause = Date.now();
            }
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
      this.current = this.nextCurrent;
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
    },

    faceTag(width, height, face){
      return `left: ${face[0]/width*100}%; top: ${face[1]/height*100}%; width: ${face[2]/width*100}%; height: ${face[3]/height*100}%;`
    }
  },
  async mounted(){
    await this.init('')
  }
});
