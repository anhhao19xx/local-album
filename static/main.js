window.addEventListener('scroll', () => {
  const videos = document.querySelectorAll('.grid-item video[noevent="true"]');
  for (let video of videos){
    video.removeAttribute('noevent');
    video.addEventListener('mouseenter', () => {
      video.muted = false;
    });
    video.addEventListener('mouseleave', () => {
      video.muted = true;
    });
  }

  if (document.documentElement.scrollTop + window.innerHeight >= document.documentElement.scrollHeight - 1000) {
    App.load();
  }
});

const RawApp = {
  el: '#app',
  data: {
    allImages: [],
    isLoad: false,
    images: [],
    nextLoad: false,
    page: 0,
    id: 0,
    dir: '',
    options: {
      getSortData: {
        id: "id"
      },
      sortBy : "id"
    }
  },
  methods: {
    load(){
      if (this.isLoad){
        this.nextLoad = true;
        return;
      }

      this.isLoad = true;

      this.images.push.apply(
        this.images, 
        this.allImages.slice(this.page * 12, (this.page + 1) * 12)
        .map(img => {
          return Object.assign({}, img, { id: this.id++, mime: mime.getType(img.path) });
        })
      );
      this.page++;

      this.isLoad = false;

      if (this.nextLoad){
        this.nextLoad = false;
        this.load();
      }
    },
    layout () {
      this.$refs.cpt.layout('masonry');
    },
    async init(dir){
      const res = await axios.get(`/images/?dir=${dir}`);
      this.allImages = res.data;
      this.images = [];
      this.nextLoad = false;
      this.isLoad = false;
      this.page = 0;
      this.dir = dir;
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    }
  },
  async mounted(){
    await this.init('')
  }
};

const App = new Vue(RawApp);

setInterval(() => {
  App.layout();
}, 1000);