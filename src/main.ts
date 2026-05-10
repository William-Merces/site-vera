import './style.css'
import { mediaData } from './media.generated'

type Screen = 'intro' | 'drumroll' | 'reveal' | 'letter' | 'hub' | 'album' | 'tiffany' | 'closing'
type Album = (typeof albums)[number]
type MediaItem = Album['items'][number]

const assetBase = import.meta.env.BASE_URL
const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Elemento #app nao encontrado.')
}

const albumCopy = {
  raizes: {
    title: 'Raízes de uma casa cheia',
    description:
      'Os começos, as fotos antigas e a beleza de ver a família crescendo ao redor da Vera.',
  },
  mesa: {
    title: 'Mesa, cuidado e abraço',
    description:
      'Memórias de casa, encontros, comida boa e o carinho que sempre nos reuniu.',
  },
  fe: {
    title: 'Fé que vira serviço',
    description:
      'Lembranças da força, da fé e do jeito da Vera transformar amor em atitude.',
  },
  caminhos: {
    title: 'Caminhos que fizemos juntos',
    description:
      'Passeios, viagens, mudanças e aqueles momentos que ficam voltando no coração.',
  },
  risos: {
    title: 'Risos, festa e bagunça boa',
    description:
      'A parte viva, espontânea e alegre da nossa família: cada foto com seu próprio barulho.',
  },
  sempre: {
    title: 'Agora e sempre',
    description:
      'As memórias recentes e a certeza de que ainda vamos colecionar muita coisa bonita.',
  },
} as const

const albums = mediaData.albums.map((album) => ({
  ...album,
  ...albumCopy[album.id as keyof typeof albumCopy],
}))

const letterSteps = [
  {
    title: 'Mãe,',
    text: [
      'Feliz Dia das Mães! Hoje, quero tirar um momento para agradecer por tudo o que você é e por tudo o que representa na minha vida e na de toda a nossa família.',
    ],
  },
  {
    title: 'Sua força',
    text: [
      'Quando olho para a nossa história, fico maravilhado com a sua força. A coragem que você demonstrou ao aceitar a nobre e desafiadora missão de ter e criar nove filhos é algo que me inspira profundamente.',
      'Foi você quem me ensinou a ler, plantando ali a semente para o meu amor pelos estudos e pela leitura, que moldaram tanto de quem eu sou hoje.',
    ],
  },
  {
    title: 'Mesa, casa e cuidado',
    text: [
      'Sem falar na sua comida, que é simplesmente a melhor que existe e sempre teve o dom de nos confortar e de buscar nos reunir em volta da mesa, em passeios familiares, projetos de serviço, leitura das escrituras e outras coisas citadas na Proclamação ao Mundo.',
    ],
  },
  {
    title: 'Alicerces',
    text: [
      'Esse seu cuidado e dedicação vão muito além do dia a dia.',
      'Mesmo que a minha casa na roça ainda não esteja de pé, eu nunca vou me esquecer de ver você ali, lado a lado comigo, suando para capinar o mato e ajudar a cavar o alicerce.',
      'Você sempre constrói conosco não só paredes, mas o alicerce das nossas vidas.',
    ],
  },
  {
    title: 'Uma fortaleza longe de casa',
    text: [
      'Durante a minha missão e nos anos em que morei fora, você me fortaleceu de uma forma incalculável.',
      'Seus conselhos foram uma verdadeira fortaleza e um legado que carreguei comigo. É incrível pensar que a sua sabedoria guiou não apenas a mim, mas também ajudou muitas das pessoas que conviveram comigo.',
    ],
  },
  {
    title: 'Serviço e fé',
    text: [
      'O seu exemplo de dedicação aos chamados e às designações de Deus na Igreja sempre me motivou a ser alguém melhor.',
      'Sempre vi você servindo ao próximo com amor genuíno. Lembro-me de quando você proporcionou às pessoas daqui uma experiência semelhante à de um Armazém do Bispo.',
      'Você abençoou a vida de tantas famílias distribuindo agasalhos e roupas, mostrando na prática o que significa viver o evangelho.',
    ],
  },
  {
    title: 'Nós não duvidamos',
    text: [
      'O Élder Jeffrey R. Holland disse certa vez que nenhum amor na mortalidade chega mais perto do puro amor de Jesus Cristo do que o amor abnegado que uma mãe tem por seu filho.',
      'Eu vejo o puro amor de Cristo refletido em você todos os dias, tanto na nossa família quanto na caridade que você tem pelos outros.',
      'Assim como os jovens guerreiros de Helamã podiam confiar no que aprenderam em casa, eu também posso dizer com toda a certeza: nós não duvidamos de que a nossa mãe sabia.',
    ],
  },
  {
    title: 'Um legado que permanece',
    text: [
      'Como diz a sua bênção patriarcal, é profético que você deixará um legado duradouro e que seus ensinamentos serão lembrados pela sua posteridade por muito tempo.',
      'Já vejo isso se cumprindo. Foi graças às lembranças que criamos juntos que comecei a desenvolver o dom do desenho, um incentivo que mudou a vida de todos nós em casa, inspirando os meus irmãos que hoje também vivem dessa área.',
      'Tudo começou com você.',
    ],
  },
  {
    title: 'Continuar colecionando lembranças',
    text: [
      'Obrigado por ser essa mãe incansável, que sempre busca apoiar e fazer de tudo para que os filhos tenham sucesso.',
      'Que você seja muito feliz, que concretize todos os seus sonhos e que possamos continuar criando e colecionando boas lembranças, escolhendo sempre fazer com que os momentos simples se tornem inesquecíveis.',
    ],
  },
  {
    title: 'Com todo amor',
    text: ['Eu te amo muito. Nós te amamos!', 'Com todo amor,', 'William Mercês'],
  },
]

let screen: Screen = 'intro'
let activeLetterStep = 0
let activeAlbumId: string = albums[0]?.id ?? ''
let activeSlide = 0
let slideshowPlaying = true
let albumMusicOn = true
let zoomOpen = false
let immersiveOpen = false
let zoomLevel = 1
let slideTimer: number | null = null
let musicController: MusicController | null = null
let revealTimer: number | null = null
let soundController: SoundController | null = null
let pendingZoomFocus: { x: number; y: number } | null = null
let panState:
  | {
      frame: HTMLElement
      pointerId: number
      startX: number
      startY: number
      scrollLeft: number
      scrollTop: number
    }
  | null = null

const asset = (path: string) => `${assetBase}${path.split('/').map(encodeURIComponent).join('/')}`
const familyPhoto = 'photos/william-irmaos-vera-vo.jpg'
const williamVeraPhoto = 'photos/william-e-vera.jpg'
const activeAlbum = () => albums.find((album) => album.id === activeAlbumId) ?? albums[0]
const activeItem = () => activeAlbum().items[activeSlide] ?? activeAlbum().items[0]

class SoundController {
  private readonly sounds = {
    drum: this.createAudio('audio/gift-drum-roll.mp3', 0.96),
    sparkle: this.createAudio('audio/magic-sparkle-whoosh.mp3', 0.82),
    reveal: this.createAudio('audio/happy-bells-notification.mp3', 0.78),
  }

  private revealTimers: number[] = []

  playGiftReveal() {
    this.clearRevealTimers()
    this.play('drum')
    this.queue('sparkle', 3440)
    this.queue('reveal', 3650)
  }

  private createAudio(path: string, volume: number) {
    const audio = new Audio(asset(path))
    audio.preload = 'auto'
    audio.volume = volume
    audio.load()
    return audio
  }

  private queue(sound: keyof SoundController['sounds'], delay: number) {
    this.revealTimers.push(window.setTimeout(() => this.play(sound), delay))
  }

  private clearRevealTimers() {
    this.revealTimers.forEach((timer) => window.clearTimeout(timer))
    this.revealTimers = []
  }

  private play(sound: keyof SoundController['sounds']) {
    const audio = this.sounds[sound]
    audio.currentTime = 0
    audio.play().catch(() => undefined)
  }
}

class MusicController {
  private readonly audio = new Audio()
  private currentTrack = ''

  constructor() {
    this.audio.loop = true
    this.audio.volume = 0.24
    this.audio.preload = 'auto'
  }

  async play(track: string) {
    const source = asset(track)
    if (this.currentTrack !== source) {
      this.audio.src = source
      this.currentTrack = source
      this.audio.currentTime = 0
    }

    if (!this.audio.paused) return
    await this.audio.play()
  }

  pause() {
    this.audio.pause()
  }

  stop() {
    this.audio.pause()
    this.audio.currentTime = 0
    this.currentTrack = ''
  }
}

const getMusic = () => {
  if (!musicController) {
    musicController = new MusicController()
  }

  return musicController
}

const getSound = () => {
  if (!soundController) {
    soundController = new SoundController()
  }

  return soundController
}

const clearSlideTimer = () => {
  if (slideTimer !== null) {
    window.clearTimeout(slideTimer)
    slideTimer = null
  }
}

const clearRevealTimer = () => {
  if (revealTimer !== null) {
    window.clearTimeout(revealTimer)
    revealTimer = null
  }
}

const startAlbum = (albumId: string) => {
  activeAlbumId = albumId
  activeSlide = 0
  slideshowPlaying = true
  albumMusicOn = true
  zoomOpen = false
  zoomLevel = 1
  screen = 'album'
  render()
  getMusic()
    .play(activeAlbum().music)
    .catch(() => {
      albumMusicOn = false
      render()
    })
}

const stopAlbumMusic = () => {
  albumMusicOn = false
  getMusic().pause()
}

const leaveAlbum = () => {
  clearSlideTimer()
  getMusic().stop()
  closeImmersive(false)
  zoomOpen = false
  zoomLevel = 1
}

const setSlide = (index: number) => {
  const album = activeAlbum()
  const length = album.items.length
  activeSlide = (index + length) % length
  zoomOpen = false
  zoomLevel = 1

  if (activeItem().type === 'video') {
    slideshowPlaying = false
    getMusic().pause()
  } else if (albumMusicOn) {
    getMusic().play(album.music).catch(() => {
      albumMusicOn = false
    })
  }

  render()
}

const nextSlide = () => setSlide(activeSlide + 1)
const previousSlide = () => setSlide(activeSlide - 1)

const requestNativeFullscreen = () => {
  window.requestAnimationFrame(() => {
    document.documentElement.requestFullscreen?.().catch(() => undefined)
  })
}

const openImmersive = () => {
  zoomOpen = false
  immersiveOpen = true
  slideshowPlaying = false
  render()
  requestNativeFullscreen()
}

const closeImmersive = (shouldRender = true) => {
  immersiveOpen = false
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => undefined)
  }
  if (shouldRender) render()
}

const renderIntro = () => `
  <main class="experience intro-screen">
    <div class="memory-orbit" aria-hidden="true">
      <img class="orbit-photo orbit-1" src="${asset(familyPhoto)}" alt="" />
      <img class="orbit-photo orbit-2" src="${asset(williamVeraPhoto)}" alt="" />
      ${mediaData.messageCovers
        .slice(0, 3)
        .map((cover, index) => `<img class="orbit-photo orbit-${index + 3}" src="${asset(cover)}" alt="" />`)
        .join('')}
    </div>
    <section class="intro-card" aria-labelledby="intro-title">
      <p>Feliz Dia das Mães</p>
      <h1 id="intro-title">Vera</h1>
      <span>tem uma surpresa esperando por você</span>
      <button type="button" data-action="start-surprise">Abrir surpresa</button>
    </section>
  </main>
`

const renderDrumroll = () => `
  <main class="experience drumroll-screen">
    <section class="gift-reveal" aria-live="polite">
      <p class="eyebrow">rufem os tambores...</p>
      <div class="big-gift" aria-hidden="true">
        <span class="big-gift-lid"></span>
        <span class="big-gift-box"></span>
        <span class="big-gift-ribbon"></span>
        ${Array.from({ length: 12 }, (_, index) => `<span class="burst-heart burst-${index + 1}"></span>`).join('')}
      </div>
      <h1>Um presente feito de memórias</h1>
    </section>
  </main>
`

const renderReveal = () => `
  <main class="experience present-screen">
    <section class="present-card" aria-labelledby="present-title">
      <div class="present-photos" aria-hidden="true">
        <img src="${asset(familyPhoto)}" alt="" />
        <img src="${asset(williamVeraPhoto)}" alt="" />
      </div>
      <p class="eyebrow">William preparou para você</p>
      <h1 id="present-title">uma carta, um vídeo e álbuns de lembranças</h1>
      <p>
        Separei fotos de muitos momentos porque essas memórias mostram o quanto você construiu
        em nós e com todos nós.
      </p>
      <button type="button" data-action="open-letter">Ler a carta</button>
    </section>
  </main>
`

const renderLetter = () => {
  const step = letterSteps[activeLetterStep]
  const isLast = activeLetterStep === letterSteps.length - 1

  return `
    <main class="experience letter-screen">
      <section class="letter-shell" aria-labelledby="letter-title">
        <div class="letter-photo">
          <img src="${asset(mediaData.messageCovers[activeLetterStep % mediaData.messageCovers.length])}" alt="" />
        </div>
        <article class="letter-paper">
          <p class="eyebrow">Carta de William</p>
          <h1 id="letter-title">${step.title}</h1>
          <div class="letter-text">
            ${step.text
              .map((paragraph, index) => `<p style="--delay: ${index * 110}ms">${paragraph}</p>`)
              .join('')}
          </div>
          <div class="letter-progress" aria-label="Progresso da carta">
            ${letterSteps
              .map(
                (_, index) =>
                  `<span class="${index <= activeLetterStep ? 'is-read' : ''}" aria-hidden="true"></span>`,
              )
              .join('')}
          </div>
          <div class="letter-controls">
            <button class="ghost" type="button" data-action="prev-letter" ${activeLetterStep === 0 ? 'disabled' : ''}>Voltar</button>
            <button type="button" data-action="${isLast ? 'finish-letter' : 'next-letter'}">
              ${isLast ? 'Ver lembranças' : 'Continuar'}
            </button>
          </div>
        </article>
      </section>
    </main>
  `
}

const renderHub = () => `
  <main class="experience hub-screen">
    <section class="hub-hero">
      <p class="eyebrow">Memórias escolhidas com carinho</p>
      <h1>Álbuns para lembrar o quanto vivemos juntos</h1>
      <p>
        Catei fotos de muitos momentos porque cada lembrança guarda uma parte do que você fez por nós.
        Escolha por onde quer começar.
      </p>
    </section>

    <section class="tiffany-card" aria-labelledby="tiffany-title">
      <div>
        <p class="eyebrow">Especial</p>
        <h2 id="tiffany-title">Mensagem da Tiffany</h2>
      </div>
      <button type="button" data-action="open-tiffany">Assistir</button>
    </section>

    <section class="album-grid" aria-label="Álbuns de memórias">
      ${albums
        .map(
          (album) => `
            <button class="album-card theme-${album.theme}" type="button" data-action="open-album" data-album="${album.id}">
              <span class="album-cover">
                <img src="${asset(album.cover)}" alt="" loading="lazy" />
              </span>
              <span class="album-info">
                <span>${album.kicker}</span>
                <strong>${album.title}</strong>
                <small>${album.items.filter((item) => item.type === 'image').length} fotos + 1 vídeo</small>
              </span>
            </button>
          `,
        )
        .join('')}
    </section>
  </main>
`

const mediaMarkup = (item: MediaItem, album: Album) => {
  if (item.type === 'video') {
    return `
      <video class="memory-video" src="${asset(item.src)}" controls playsinline preload="metadata"></video>
    `
  }

  return `
    <button class="image-zoom-trigger" type="button" data-action="open-zoom" aria-label="Ampliar foto">
      <img class="memory-image" src="${asset(item.src)}" alt="Memória da família de Vera" />
    </button>
    <div class="album-glow theme-${album.theme}" aria-hidden="true"></div>
  `
}

const renderAlbum = () => {
  const album = activeAlbum()
  const item = activeItem()
  const isVideo = item.type === 'video'

  return `
    <main class="experience album-screen theme-${album.theme}">
      <section class="album-viewer" aria-labelledby="album-title">
        <header class="album-header">
          <button class="icon-button" type="button" data-action="back-hub" aria-label="Voltar aos álbuns">←</button>
          <div>
            <p class="eyebrow">${album.kicker}</p>
            <h1 id="album-title">${album.title}</h1>
          </div>
          <button class="music-pill ${albumMusicOn ? 'is-on' : ''}" type="button" data-action="toggle-album-music" aria-pressed="${albumMusicOn}">
            ${albumMusicOn ? 'música ligada' : 'música'}
          </button>
        </header>

        <div class="album-stage ${slideshowPlaying ? 'is-playing' : 'is-paused'}">
          ${mediaMarkup(item, album)}
        </div>

        <div class="album-caption">
          <p>${album.description}</p>
          <span>${activeSlide + 1} de ${album.items.length}${isVideo ? ' · vídeo da memória' : ''}</span>
        </div>

        <div class="album-controls">
          <button class="icon-button" type="button" data-action="prev-slide" aria-label="Foto anterior">‹</button>
          <button type="button" data-action="toggle-slideshow">${slideshowPlaying ? 'Pausar' : 'Retomar'}</button>
          <button class="icon-button" type="button" data-action="next-slide" aria-label="Próxima foto">›</button>
          <button type="button" data-action="open-zoom" ${isVideo ? 'disabled' : ''}>Zoom</button>
          <button type="button" data-action="open-immersive">Tela cheia</button>
        </div>

        <div class="thumb-strip" aria-label="Pular para uma lembrança">
          ${album.items
            .map(
              (thumb, index) => `
                <button class="${index === activeSlide ? 'is-active' : ''}" type="button" data-action="go-slide" data-slide="${index}" aria-label="Abrir lembrança ${index + 1}">
                  ${
                    thumb.type === 'image'
                      ? `<img src="${asset(thumb.src)}" alt="" loading="lazy" />`
                      : '<span>▶</span>'
                  }
                </button>
              `,
            )
            .join('')}
        </div>
      </section>
      <div class="experience-finish">
        <button type="button" data-action="finish-experience">Encerrar homenagem</button>
      </div>
      ${zoomOpen && item.type === 'image' ? renderZoom(item) : ''}
      ${immersiveOpen ? renderImmersive() : ''}
    </main>
  `
}

const renderZoom = (item: MediaItem) => `
  <div class="zoom-layer" role="dialog" aria-modal="true" aria-label="Foto ampliada">
    <div class="zoom-toolbar">
      <button type="button" data-action="zoom-out">−</button>
      <span>${Math.round(zoomLevel * 100)}%</span>
      <button type="button" data-action="zoom-in">+</button>
      <button type="button" data-action="zoom-fit">Ajustar</button>
      <button type="button" data-action="close-zoom">Fechar</button>
    </div>
    <div class="zoom-frame ${zoomLevel > 1 ? 'is-zoomed' : ''}">
      <img src="${asset(item.src)}" alt="Foto ampliada da família" style="--zoom: ${zoomLevel}" draggable="false" />
    </div>
  </div>
`

const renderImmersive = () => {
  const isTiffany = screen === 'tiffany'
  const album = activeAlbum()
  const item = isTiffany ? { type: 'video', src: mediaData.tiffanyVideo } : activeItem()
  const isVideo = item.type === 'video'

  return `
    <div class="immersive-layer" role="dialog" aria-modal="true" aria-label="Apresentação em tela cheia">
      <div class="immersive-top">
        <button class="icon-button" type="button" data-action="close-immersive" aria-label="Sair da tela cheia">×</button>
      </div>
      <div class="immersive-stage">
        ${
          isVideo
            ? `<video class="immersive-media" src="${asset(item.src)}" controls playsinline autoplay></video>`
            : `<img class="immersive-media" src="${asset(item.src)}" alt="Memória da família de Vera" />`
        }
      </div>
      ${
        isTiffany
          ? ''
          : `<div class="immersive-controls">
              <button class="icon-button" type="button" data-action="prev-slide" aria-label="Foto anterior">‹</button>
              <button type="button" data-action="toggle-slideshow">${slideshowPlaying ? 'Pausar' : 'Retomar'}</button>
              <button class="icon-button" type="button" data-action="next-slide" aria-label="Próxima foto">›</button>
              <span>${activeSlide + 1} / ${album.items.length}</span>
            </div>`
      }
    </div>
  `
}

const renderTiffany = () => `
  <main class="experience tiffany-screen">
    <section class="video-letter" aria-labelledby="video-title">
      <button class="icon-button" type="button" data-action="back-hub" aria-label="Voltar aos álbuns">←</button>
      <div>
        <p class="eyebrow">Mensagem da Tiffany</p>
        <h1 id="video-title">Um carinho guardado em vídeo</h1>
      </div>
      <video src="${asset(mediaData.tiffanyVideo)}" controls playsinline preload="metadata"></video>
      <button class="video-fullscreen" type="button" data-action="open-immersive">Tela cheia</button>
    </section>
    ${immersiveOpen ? renderImmersive() : ''}
  </main>
`

const renderClosing = () => `
  <main class="experience closing-screen">
    <section class="closing-card" aria-labelledby="closing-title">
      <div class="closing-photo">
        <img src="${asset(familyPhoto)}" alt="William e seus irmãos com Vera e a avó" />
      </div>
      <div class="closing-message">
        <p class="eyebrow">Com todo amor</p>
        <h1 id="closing-title">Feliz Dia das Mães, mãe</h1>
        <p>
          Obrigado por cada lembrança, cada conselho, cada prato de comida, cada oração,
          cada esforço e cada alicerce que você ajudou a construir em nós.
        </p>
        <p>Eu te amo muito. Nós te amamos.</p>
        <div class="closing-actions">
          <button type="button" data-action="back-hub">Ver os álbuns de novo</button>
          <button class="ghost" type="button" data-action="restart">Voltar ao início</button>
        </div>
      </div>
    </section>
  </main>
`

const render = () => {
  clearSlideTimer()

  if (screen === 'intro') app.innerHTML = renderIntro()
  if (screen === 'drumroll') app.innerHTML = renderDrumroll()
  if (screen === 'reveal') app.innerHTML = renderReveal()
  if (screen === 'letter') app.innerHTML = renderLetter()
  if (screen === 'hub') app.innerHTML = renderHub()
  if (screen === 'album') app.innerHTML = renderAlbum()
  if (screen === 'tiffany') app.innerHTML = renderTiffany()
  if (screen === 'closing') app.innerHTML = renderClosing()

  applyPendingZoomFocus()

  if (screen === 'album' && slideshowPlaying && activeItem().type === 'image' && !zoomOpen) {
    slideTimer = window.setTimeout(() => nextSlide(), 5200)
  }
}

const applyPendingZoomFocus = () => {
  if (!pendingZoomFocus) return

  const focus = pendingZoomFocus
  pendingZoomFocus = null
  window.requestAnimationFrame(() => {
    const frame = document.querySelector<HTMLElement>('.zoom-frame.is-zoomed')
    if (!frame) return

    frame.scrollLeft = frame.scrollWidth * focus.x - frame.clientWidth / 2
    frame.scrollTop = frame.scrollHeight * focus.y - frame.clientHeight / 2
  })
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const zoomFocusFromEvent = (event: MouseEvent, frame: HTMLElement) => {
  const image = frame.querySelector('img')
  const rect = image?.getBoundingClientRect() ?? frame.getBoundingClientRect()

  return {
    x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
    y: clamp((event.clientY - rect.top) / rect.height, 0, 1),
  }
}

app.addEventListener('click', (event) => {
  const target = event.target
  if (!(target instanceof HTMLElement)) return

  const button = target.closest<HTMLButtonElement>('[data-action]')
  const zoomFrame = target.closest<HTMLElement>('.zoom-frame')
  if (!button && zoomFrame && zoomLevel <= 1) {
    pendingZoomFocus = zoomFocusFromEvent(event, zoomFrame)
    zoomLevel = 1.85
    render()
    return
  }

  if (!button) return

  const action = button.dataset.action

  if (action === 'start-surprise') {
    clearRevealTimer()
    screen = 'drumroll'
    render()
    getSound().playGiftReveal()
    revealTimer = window.setTimeout(() => {
      screen = 'reveal'
      revealTimer = null
      render()
    }, 7200)
  }

  if (action === 'open-letter') {
    clearRevealTimer()
    activeLetterStep = 0
    screen = 'letter'
    render()
  }

  if (action === 'next-letter') {
    activeLetterStep = Math.min(activeLetterStep + 1, letterSteps.length - 1)
    render()
  }

  if (action === 'prev-letter') {
    activeLetterStep = Math.max(activeLetterStep - 1, 0)
    render()
  }

  if (action === 'finish-letter') {
    screen = 'hub'
    render()
  }

  if (action === 'open-tiffany') {
    leaveAlbum()
    screen = 'tiffany'
    render()
  }

  if (action === 'back-hub') {
    clearRevealTimer()
    leaveAlbum()
    immersiveOpen = false
    screen = 'hub'
    render()
  }

  if (action === 'open-album') {
    const albumId = button.dataset.album
    if (albumId) startAlbum(albumId)
  }

  if (action === 'prev-slide') previousSlide()
  if (action === 'next-slide') nextSlide()

  if (action === 'toggle-slideshow') {
    slideshowPlaying = !slideshowPlaying
    render()
  }

  if (action === 'open-immersive') {
    openImmersive()
  }

  if (action === 'close-immersive') {
    closeImmersive()
  }

  if (action === 'go-slide') {
    const slide = Number(button.dataset.slide)
    if (Number.isFinite(slide)) setSlide(slide)
  }

  if (action === 'toggle-album-music') {
    albumMusicOn = !albumMusicOn
    if (albumMusicOn) {
      getMusic().play(activeAlbum().music).catch(() => {
        albumMusicOn = false
        render()
      })
    } else {
      stopAlbumMusic()
    }
    render()
  }

  if (action === 'open-zoom' && activeItem().type === 'image') {
    zoomOpen = true
    slideshowPlaying = false
    zoomLevel = 1
    render()
  }

  if (action === 'close-zoom') {
    zoomOpen = false
    zoomLevel = 1
    render()
  }

  if (action === 'zoom-in') {
    pendingZoomFocus = { x: 0.5, y: 0.5 }
    zoomLevel = Math.min(zoomLevel + 0.25, 2.5)
    render()
  }

  if (action === 'zoom-out') {
    pendingZoomFocus = { x: 0.5, y: 0.5 }
    zoomLevel = Math.max(zoomLevel - 0.25, 1)
    render()
  }

  if (action === 'zoom-fit') {
    pendingZoomFocus = null
    zoomLevel = 1
    render()
  }

  if (action === 'finish-experience') {
    leaveAlbum()
    screen = 'closing'
    render()
  }

  if (action === 'restart') {
    leaveAlbum()
    clearRevealTimer()
    screen = 'intro'
    activeLetterStep = 0
    render()
  }
})

app.addEventListener('pointerdown', (event) => {
  const target = event.target
  if (!(target instanceof HTMLElement)) return

  const frame = target.closest<HTMLElement>('.zoom-frame.is-zoomed')
  if (!frame) return

  panState = {
    frame,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    scrollLeft: frame.scrollLeft,
    scrollTop: frame.scrollTop,
  }
  frame.classList.add('is-panning')
  frame.setPointerCapture(event.pointerId)
})

app.addEventListener('pointermove', (event) => {
  if (!panState || panState.pointerId !== event.pointerId) return

  const dx = event.clientX - panState.startX
  const dy = event.clientY - panState.startY
  panState.frame.scrollLeft = panState.scrollLeft - dx
  panState.frame.scrollTop = panState.scrollTop - dy
})

const stopPanning = () => {
  panState?.frame.classList.remove('is-panning')
  panState = null
}

app.addEventListener('pointerup', stopPanning)
app.addEventListener('pointercancel', stopPanning)

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (immersiveOpen) {
      closeImmersive()
      return
    }

    if (zoomOpen) {
      zoomOpen = false
      zoomLevel = 1
      render()
      return
    }
  }

  if (screen !== 'album') return
  if (event.key === 'ArrowRight') nextSlide()
  if (event.key === 'ArrowLeft') previousSlide()
})

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && immersiveOpen) {
    immersiveOpen = false
    render()
  }
})

render()
getSound()
