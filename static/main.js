const LIMIT = 12;

const App = new Vue({
  el: '#app',
  data: {
    // common
    images: [],
    mode: 'presentation',

    // presentation mode
    current: 0
  },
  computed: {
    slideImage(){
      if (!this.images[this.current])
        return null;

      return this.images[this.current];
    }
  }, 
  methods: {
    load(){
      this.images.push.apply(
        this.images, 
        this.allImages.slice(this.images.length, this.images.length + LIMIT)       
      );
    },
    start(){
      setInterval(() => {
        this.current++;
      }, 5000);
    },
    async init(dir){
      const res = await axios.get(`/images/?dir=${dir}`);
      this.images = res.data
        .map(img => {
          return Object.assign({}, img, { id: this.id++, mime: mime.getType(img.path) });
        });

      this.start();
    }
  },
  async mounted(){
    await this.init('')
  }
});
