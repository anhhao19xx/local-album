const LIMIT = 12;
const DURATION = 5000;

const App = new Vue({
  el: '#app',
  data: {
    // common
    images: [],
    mode: 'presentation',

    // presentation mode
    lastTime: 0,
    progress: 0,

    lastPause: 0,
    isPaused: false,

    current: 0,
    isNext: true,
    isShowTools: true
  },
  computed: {
    slideImage(){
      if (!this.images[this.current])
        return null;

      return this.images[this.current];
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
      this.progress = duration/DURATION*100;

      // when reach duration
      if (duration < DURATION)
        return;

      this.lastTime = now;

      // next slide
      if (!this.isNext){
        this.isNext = true;
        return;
      }

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

      this.isNext = false;
    },

    prevSlide(){
      if (this.current > 0){
        this.current--;
      } else {
        this.current = this.images.length - 1;
      }

      this.isNext = false;
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
    }
  },
  async mounted(){
    await this.init('')
  }
});
