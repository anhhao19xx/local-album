const LIMIT = 12;

const App = new Vue({
  el: '#app',
  data: {
    // common
    images: [],
    mode: 'presentation',

    // presentation mode
    current: 0,
    isNext: true
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
    start(){
      setInterval(() => {
        if (!this.isNext){
          this.isNext = true;
          return;
        }

        this.current++;
      }, 5000);
    },

    nextSlide(){
      if (this.current < this.images.length - 1){
        this.current++;
        this.isNext = false;
      }
    },

    prevSlide(){
      if (this.current > 0){
        this.current++;
        this.isNext = false;
      }
    }
  },
  async mounted(){
    await this.init('')
  }
});
