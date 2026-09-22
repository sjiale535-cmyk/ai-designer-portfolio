import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { assetUrl } from './assetUrl.js'

const VideoPlayerContext = createContext(null)

function VideoPlayerProvider({ children }) {
  const [selected, setSelected] = useState(null)
  const dialogRef = useRef(null)
  const playerRef = useRef(null)

  useEffect(() => {
    if (!selected) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.querySelectorAll('.portfolio-video video').forEach((video) => video.pause())
    dialogRef.current.showModal()
    playerRef.current.play().catch(() => {})
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [selected])

  const close = () => {
    playerRef.current?.pause()
    dialogRef.current?.close()
    setSelected(null)
  }

  return (
    <VideoPlayerContext.Provider value={setSelected}>
      {children}
      <dialog className="video-player" ref={dialogRef} aria-labelledby="video-player-title" onClose={() => setSelected(null)} onCancel={close} onClick={(event) => { if (event.target === event.currentTarget) close() }}>
        {selected && <div className="video-player__panel">
          <header><div><p>作品放映 / NOW PLAYING</p><h2 id="video-player-title">{selected.title}</h2></div><button type="button" autoFocus onClick={close} aria-label="关闭独立播放器">关闭 ×</button></header>
          <video key={selected.src} ref={playerRef} src={selected.src} controls playsInline preload="metadata" aria-label={`${selected.title}独立播放器`} />
          <footer><span>可使用进度条、声音与全屏控制 · 按 Esc 返回</span><a href={selected.src} target="_blank" rel="noreferrer">在新页面打开 ↗</a></footer>
        </div>}
      </dialog>
    </VideoPlayerContext.Provider>
  )
}

const featuredProject = {
  title: '宋祠之光',
  en: 'LIGHT OF SONGCI',
  src: assetUrl('/web-videos/songci-light.mp4'),
  award: '国赛一等奖',
  year: '2026',
}

const projectGroups = [
  {
    id: 'internship',
    no: 'A',
    title: '实习项目',
    en: 'INTERNSHIP WORK',
    note: '在真实内容生产流程中完成的动态视觉与视频作品。',
    items: [
      ['哈尔滨', 'HARBIN', assetUrl('/web-videos/harbin.mp4')],
      ['枯竹', 'WITHERED BAMBOO', assetUrl('/web-videos/withered-bamboo.mp4')],
      ['辣椒', 'CHILI', assetUrl('/web-videos/chili.mp4')],
      ['老哑巴', 'THE OLD MUTE', assetUrl('/web-videos/old-mute.mp4')],
      ['墨鱼', 'CUTTLEFISH', assetUrl('/web-videos/cuttlefish.mp4')],
      ['攀在树梢上的童年', 'CHILDHOOD IN THE TREES', assetUrl('/web-videos/childhood-in-trees.mp4')],
      ['七律长征', 'THE LONG MARCH', assetUrl('/web-videos/long-march.mp4')],
      ['王戎观虎', 'WANG RONG · TIGER', assetUrl('/web-videos/wang-rong-tiger.mp4')],
      ['王戎李子', 'WANG RONG · PLUM', assetUrl('/web-videos/wang-rong-plum.mp4')],
      ['小男孩', 'THE LITTLE BOY', assetUrl('/web-videos/little-boy.mp4')],
    ],
  },
  {
    id: 'education',
    no: 'B',
    title: '教育叙事作品',
    en: 'EDUCATIONAL STORIES',
    note: '诗文、校园与人物故事的影像表达。',
    items: [
      ['别董大', 'FAREWELL TO DONG DA', assetUrl('/web-videos/farewell-dongda.mp4')],
      ['参加模型比赛', 'MODEL COMPETITION', assetUrl('/web-videos/model-competition.mp4')],
      ['寒假义卖活动', 'WINTER CHARITY SALE', assetUrl('/web-videos/winter-charity-sale.mp4')],
      ['文段一', 'READING · 01', assetUrl('/web-videos/reading-one.mp4')],
      ['文段二', 'READING · 02', assetUrl('/web-videos/reading-two.mp4')],
      ['我的事业在中国', 'MY CAREER IN CHINA', assetUrl('/web-videos/career-in-china.mp4')],
      ['在学校里', 'AT SCHOOL', assetUrl('/web-videos/at-school.mp4')],
      ['找李老师', 'FINDING TEACHER LI', assetUrl('/web-videos/finding-teacher-li.mp4')],
    ],
  },
  {
    id: 'course',
    no: 'C',
    title: '结课作业',
    en: 'FINAL COURSE PROJECTS',
    note: '围绕完整主题进行叙事、视觉和后期制作的课程成果。',
    items: [
      ['打铁花', 'IRON FLOWER', assetUrl('/web-videos/datiehua.mp4')],
      ['时间邮局', 'TIME POST OFFICE', assetUrl('/web-videos/time-post-office.mp4')],
    ],
  },
]

const strengths = [
  { number: '01', title: '让脚本成为画面', en: 'SCRIPT → VISUAL', text: '从教育类内容的脚本出发，拆解人物、场景与镜头要求，用提示词组织 AI 生成，再筛选和调整画面，让视觉服务于内容理解。', evidence: '实践依据 / 高途教育 · AI 生成师实习' },
  { number: '02', title: '用镜头讲清故事', en: 'STORY → SEQUENCE', text: '关注镜头之间的逻辑、节奏与情绪，把文字主题转化为可观看的叙事；让单个画面不仅好看，也能在完整作品中发挥作用。', evidence: '代表作品 /《宋祠之光》· 国赛一等奖' },
  { number: '03', title: '从生成到完整成片', en: 'GENERATION → FILM', text: '把 AI 画面与剪辑、动画和后期制作衔接起来，结合 PR、AE、C4D 与剪映完成镜头组织、转场和成片输出，不止于单张视觉创作。', evidence: '作品验证 /《打铁花》《时间邮局》' },
  { number: '04', title: '在真实项目中迭代', en: 'FEEDBACK → DELIVERY', text: '在运营团队的内容生产流程中理解需求、安排制作顺序，并依据反馈调整画面。兼顾表达、制作节奏与交付，积累教育类 AI 动画项目经验。', evidence: '项目积累 / 2026.06—08 · 实习作品系列' },
]

const Arrow = ({ diagonal = false }) => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    {diagonal ? <path d="M5 15 15 5M7 5h8v8" /> : <path d="M4 10h11M10.5 5.5 15 10l-4.5 4.5" />}
  </svg>
)

function GenerativeVideo() {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!video || reduced || !HTMLCanvasElement.prototype.captureStream) return

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = 1440
    canvas.height = 900
    let frameId
    const startedAt = performance.now()
    const points = Array.from({ length: 68 }, (_, index) => ({
      x: ((index * 197) % canvas.width) / canvas.width,
      y: ((index * 83) % canvas.height) / canvas.height,
      radius: 0.6 + (index % 4) * 0.45,
      offset: index * 0.73,
    }))

    const draw = (now) => {
      const t = (now - startedAt) / 1000
      const bg = context.createRadialGradient(
        canvas.width * (0.66 + Math.sin(t * 0.12) * 0.04), canvas.height * 0.44, 10,
        canvas.width * 0.63, canvas.height * 0.44, canvas.width * 0.76,
      )
      bg.addColorStop(0, '#52624d')
      bg.addColorStop(0.22, '#26302c')
      bg.addColorStop(0.58, '#111514')
      bg.addColorStop(1, '#070808')
      context.fillStyle = bg
      context.fillRect(0, 0, canvas.width, canvas.height)

      context.save()
      context.globalCompositeOperation = 'screen'
      for (let band = 0; band < 4; band += 1) {
        context.beginPath()
        for (let x = 0; x <= canvas.width; x += 12) {
          const phase = x * 0.006 + t * (0.12 + band * 0.025)
          const y = canvas.height * (0.42 + band * 0.075) + Math.sin(phase + band * 1.4) * (54 + band * 10) + Math.sin(phase * 0.43) * 30
          if (x === 0) context.moveTo(x, y)
          else context.lineTo(x, y)
        }
        context.strokeStyle = `rgba(216, 255, 62, ${0.07 - band * 0.009})`
        context.lineWidth = 1
        context.stroke()
      }
      points.forEach((point) => {
        const y = (point.y + t * 0.005 + Math.sin(t * 0.18 + point.offset) * 0.012) % 1
        context.beginPath()
        context.arc(point.x * canvas.width, y * canvas.height, point.radius, 0, Math.PI * 2)
        context.fillStyle = `rgba(220, 255, 150, ${0.16 + (point.radius % 1) * 0.18})`
        context.fill()
      })
      context.restore()
      frameId = requestAnimationFrame(draw)
    }

    const stream = canvas.captureStream(24)
    video.srcObject = stream
    video.play().catch(() => {})
    frameId = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(frameId)
      stream.getTracks().forEach((track) => track.stop())
      video.srcObject = null
    }
  }, [])

  return <video ref={videoRef} className="hero__video" autoPlay muted loop playsInline poster={assetUrl('/assets/project-sunset-frame.jpg')} aria-hidden="true" />
}

function Header() {
  return (
    <nav className="nav shell" aria-label="主导航">
      <a className="brand" href="#home" aria-label="夏超作品集首页"><span>XC</span><small>AI VISUAL<br />& MOTION</small></a>
      <div className="nav__links"><a href="#about">关于</a><a href="#work">项目</a><a href="#strengths">能力</a></div>
      <a className="contact-chip" href="mailto:3260975486@qq.com">联系我 <Arrow /></a>
    </nav>
  )
}

function PortfolioVideo({ src, title, featured = false, hoverPlay = true }) {
  const openPlayer = useContext(VideoPlayerContext)
  const videoRef = useRef(null)
  const [shouldLoad, setShouldLoad] = useState(featured)
  const [playing, setPlaying] = useState(featured)
  const [error, setError] = useState('')

  useEffect(() => {
    if (featured) return undefined
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setShouldLoad(true)
        observer.disconnect()
      }
    }, { rootMargin: '240px' })
    if (videoRef.current) observer.observe(videoRef.current)
    return () => observer.disconnect()
  }, [featured, src])

  useEffect(() => {
    if (!hoverPlay && !featured) {
      videoRef.current?.pause()
    }
  }, [hoverPlay, featured])

  const play = () => {
    const video = videoRef.current
    if (!video || !shouldLoad) return
    setError('')
    video.play().then(() => setPlaying(true)).catch((reason) => {
      if (reason.name !== 'AbortError') setError('暂时无法播放，请点击「打开完整视频」重试。')
    })
  }

  const pause = () => {
    if (featured) return
    videoRef.current?.pause()
    setPlaying(false)
  }

  return (
    <div className={`portfolio-video ${playing ? 'is-playing' : ''}`}>
      <video
        ref={videoRef}
        src={shouldLoad ? src : undefined}
        muted
        loop
        playsInline
        autoPlay={featured}
        preload={featured ? 'auto' : 'metadata'}
        aria-label={`${title}作品视频`}
        onClick={hoverPlay ? () => openPlayer({ src, title }) : undefined}
        onError={() => setError('视频加载失败，请点击「打开完整视频」检查或重试。')}
        onPointerEnter={hoverPlay ? play : undefined}
        onPointerLeave={hoverPlay ? pause : undefined}
        onFocus={hoverPlay ? play : undefined}
        onBlur={hoverPlay ? pause : undefined}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(event) => {
          if (!featured && event.currentTarget.duration > 0.2) event.currentTarget.currentTime = 0.1
        }}
      />
      {error && <div className="portfolio-video__error" role="alert">{error}<a href={src} target="_blank" rel="noreferrer">打开完整视频 ↗</a></div>}
      <button type="button" tabIndex={hoverPlay ? 0 : -1} className="portfolio-video__control" onClick={() => openPlayer({ src, title })} aria-label={`独立播放${title}`}>
        <span>▶</span>
      </button>
    </div>
  )
}

function WorkCard({ item, index, compact = false }) {
  const [title, en, src] = item
  return (
    <article className={`work-card ${compact ? 'work-card--compact' : ''}`} data-reveal>
      <PortfolioVideo src={src} title={title} />
      <div className="work-card__caption">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <div><p>{en}</p><h4>{title}</h4></div>
        <a className="work-card__open" href={src} target="_blank" rel="noreferrer" aria-label={`打开${title}完整视频`}><Arrow diagonal /></a>
      </div>
    </article>
  )
}

function InternshipCarousel({ items }) {
  const [active, setActive] = useState(0)
  const dragStart = useRef(null)
  const dragged = useRef(false)

  const move = (direction) => {
    setActive((current) => (current + direction + items.length) % items.length)
  }

  const offsetFor = (index) => {
    let offset = index - active
    if (offset > items.length / 2) offset -= items.length
    if (offset < -items.length / 2) offset += items.length
    return offset
  }

  return (
    <div
      className="internship-carousel"
      tabIndex="0"
      aria-label="实习项目旋转展示，使用左右方向键切换"
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') move(-1)
        if (event.key === 'ArrowRight') move(1)
      }}
    >
      <div
        className="internship-carousel__stage"
        onPointerDown={(event) => { dragStart.current = event.clientX; dragged.current = false }}
        onClickCapture={(event) => { if (dragged.current) { event.preventDefault(); event.stopPropagation(); dragged.current = false } }}
        onPointerUp={(event) => {
          if (dragStart.current === null) return
          const distance = event.clientX - dragStart.current
          if (Math.abs(distance) > 45) { dragged.current = true; move(distance > 0 ? -1 : 1) }
          dragStart.current = null
        }}
        onPointerCancel={() => { dragStart.current = null }}
      >
        <div className="internship-carousel__axis" aria-hidden="true"><span>ROTATION / 360°</span><i /></div>
        {items.map((item, index) => {
          const offset = offsetFor(index)
          if (Math.abs(offset) > 1) return null
          return (
            <article
              className={`internship-slide internship-slide--${offset < 0 ? 'left' : offset > 0 ? 'right' : 'active'}`}
              style={{
                '--slide-x': `${offset * 38}%`,
                '--slide-z': `${offset === 0 ? 80 : Math.abs(offset) * -150}px`,
                '--slide-rotate': `${offset * -25}deg`,
                '--slide-scale': 1 - Math.abs(offset) * 0.1,
                '--slide-opacity': 1 - Math.abs(offset) * 0.24,
                '--slide-brightness': 1 - Math.abs(offset) * 0.16,
                '--slide-layer': 10 - Math.abs(offset),
              }}
              key={item[0]}
              aria-hidden={offset !== 0}
              onClick={offset !== 0 ? () => setActive(index) : undefined}
            >
              <div className="internship-slide__frame">
                <PortfolioVideo src={item[2]} title={item[0]} hoverPlay={offset === 0} />
                <span className="internship-slide__index">{String(index + 1).padStart(2, '0')}</span>
              </div>
            </article>
          )
        })}
      </div>
      <div className="internship-carousel__footer">
        <div className="internship-carousel__current" aria-live="polite">
          <span>{String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
          <div><p>{items[active][1]}</p><h4>{items[active][0]}</h4></div>
        </div>
        <p className="internship-carousel__hint">DRAG TO ROTATE · 使用鼠标拖动或方向键切换</p>
        <div className="internship-carousel__controls">
          <a className="internship-carousel__open" href={items[active][2]} target="_blank" rel="noreferrer">打开完整视频 ↗</a>
          <button type="button" onClick={() => move(-1)} aria-label="上一个实习项目"><Arrow /></button>
          <button type="button" onClick={() => move(1)} aria-label="下一个实习项目"><Arrow /></button>
        </div>
      </div>
    </div>
  )
}

function EducationWheel({ items }) {
  const [step, setStep] = useState(0)
  const start = useRef(null)
  const dragged = useRef(false)
  const active = ((step % items.length) + items.length) % items.length
  const select = (index) => {
    let distance = (index - active + items.length) % items.length
    if (distance > items.length / 2) distance -= items.length
    setStep((current) => current + distance)
  }
  return (
    <div className="education-wheel" tabIndex={0} aria-label="教育叙事八方作品轮盘" onKeyDown={(event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        setStep((current) => current + (event.key === 'ArrowRight' ? 1 : -1))
      }
    }}>
      <div className="education-wheel__stage" onPointerDown={(event) => { start.current = event.clientX; dragged.current = false }} onPointerUp={(event) => {
        if (start.current !== null && Math.abs(event.clientX - start.current) > 40) {
          dragged.current = true
          setStep((current) => current + (event.clientX < start.current ? 1 : -1))
        }
        start.current = null
      }} onPointerCancel={() => { start.current = null }} onClickCapture={(event) => { if (dragged.current) { event.stopPropagation(); event.preventDefault(); dragged.current = false } }}>
        <div className="education-wheel__label"><span>拖动旋转 · 点击正面作品播放</span></div>
        <div className="education-wheel__floor" aria-hidden="true"><div className="education-wheel__octagon" /><div className="education-wheel__inner" />{['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'].map((symbol, index) => <span key={symbol} style={{ transform: `rotate(${index * 45}deg) translateY(-230px)` }}>{symbol}</span>)}</div>
        <div className="education-wheel__rotor" style={{ '--wheel-turn': `${step * -45}deg` }}>
          {items.map((item, index) => {
            const distance = Math.min((index - active + 8) % 8, (active - index + 8) % 8)
            return <article className={`education-wheel__card ${active === index ? 'is-active' : ''}`} key={item[0]} style={{ '--card-turn': `${index * 45}deg` }} aria-hidden={active !== index} onClick={active !== index ? () => select(index) : undefined}>
              <div className="education-wheel__card-top"><span>{String(index + 1).padStart(2, '0')}</span><span>VISUAL STORY / 16:9</span></div>
              {distance <= 1 ? <PortfolioVideo src={item[2]} title={item[0]} hoverPlay={active === index} /> : <div className="education-wheel__placeholder">{String(index + 1).padStart(2, '0')}</div>}
              <div className="education-wheel__card-title"><p>{item[1]}</p><h4>{item[0]}</h4></div>
            </article>
          })}
        </div>
      </div>
      <div className="education-wheel__navigation">
        <button type="button" onClick={() => setStep((current) => current - 1)} aria-label="向左旋转教育作品">←</button>
        <div aria-live="polite"><span>{String(active + 1).padStart(2, '0')} / 08</span><strong>{items[active][0]}</strong></div>
        <button type="button" onClick={() => setStep((current) => current + 1)} aria-label="向右旋转教育作品">→</button>
      </div>
      <div className="education-wheel__index">{items.map((item, index) => <button key={item[0]} type="button" aria-pressed={index === active} onClick={() => select(index)}>{String(index + 1).padStart(2, '0')}<span>{item[0]}</span></button>)}</div>
    </div>
  )
}

function App() {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return undefined
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return (
    <VideoPlayerProvider><main>
      <section className="hero" id="home">
        <GenerativeVideo />
        <div className="hero__wash" /><div className="hero__grid" /><div className="hero__grain" />
        <Header />
        <div className="hero__content shell">
          <div className="hero__eyebrow"><span /> AI 视觉 / 动态设计 <span /></div>
          <div className="hero__stage">
            <span className="hero__year hero__year--left">2023—</span>
            <div className="hero__collage">
              <div className="hero-shot hero-shot--wide"><img src={assetUrl('/assets/project-sunset-frame.jpg')} alt="" /></div>
              <div className="hero-shot hero-shot--portrait"><img src={assetUrl('/assets/xiachao-personal-seaside.jpg')} alt="" /></div>
              <div className="hero-shot hero-shot--small"><img src={assetUrl('/assets/project-lantern-frame.jpg')} alt="" /></div>
              <div className="hero__dots" aria-hidden="true" />
              <div className="hero__idea" aria-hidden="true">GOOD<br />IDEA!</div>
              <div className="hero__stamp" aria-hidden="true">PROMPT<br />FRAME<br />MOTION</div>
              <h1 aria-label="AI 视觉作品集"><span>AI视觉</span><span>作品集</span></h1>
            </div>
            <span className="hero__year hero__year--right">—2026</span>
          </div>
          <div className="hero__footer">
            <div className="hero__tags" aria-label="作品方向">
              {['AI 视觉', '动态设计', '视频剪辑', 'C4D', '后期制作'].map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <p>夏超 / AI 设计师。把提示词、镜头与后期语言，组织成有叙事感的动态视觉。</p>
          </div>
        </div>
        <a className="scroll-cue" href="#about" aria-label="向下浏览"><span /> SCROLL TO EXPLORE</a>
      </section>

      <section className="about section" id="about">
        <div className="shell">
          <div className="section-heading" data-reveal>
            <span className="section-no">01</span><p>ABOUT / EXPERIENCE</p>
            <h2>在生成与剪辑之间，<br />建立完整的视觉表达。</h2>
          </div>
          <div className="about__grid">
            <figure className="portrait" data-reveal>
              <img src={assetUrl('/assets/xiachao-personal-seaside.jpg')} alt="夏超在海边风电场前张开双臂的背影" />
              <figcaption><span>AI DESIGNER / XIA CHAO</span><span>PERSONAL ARCHIVE / 2026</span></figcaption>
            </figure>
            <div className="about__content" data-reveal>
              <p className="lead">我是夏超，一名数字媒体艺术专业的 AI 设计师，关注 AI 视觉生成、动画制作和新媒体内容。我的工作方式从理解脚本开始，以稳定、准确、有节奏的画面结束。</p>
              <div className="experience-list">
                <article><time>2026.06 — 2026.08</time><div><h3>高途教育 · AI 生成师</h3><p>途途课堂 TT 运营部设计二组，负责教育类 AI 动画视觉内容的完整制作流程。</p></div></article>
                <article><time>2023.10 — 2024.10</time><div><h3>郑州西亚斯学院就业处 · 学生助理</h3><p>参与资料管理、招聘会协调及流程对接，积累跨团队沟通与执行经验。</p></div></article>
                <article><time>2023.09 — 2027.06</time><div><h3>郑州西亚斯学院 · 数字媒体艺术</h3><p>本科在读，主修 UI、影视后期、三维动画、交互设计与数字媒体创作。</p></div></article>
              </div>
              <div className="about__contact">
                <a href="tel:+8617630407809">+86 176 3040 7809 <Arrow diagonal /></a>
                <a href="mailto:3260975486@qq.com">3260975486@qq.com <Arrow diagonal /></a>
              </div>
            </div>
          </div>
          <div className="stats" data-reveal>
            <div><strong>02</strong><span>个月<br />AI 动画项目实践</span></div>
            <div><strong>01</strong><span>项<br />全国总决赛一等奖</span></div>
            <div><strong>05+</strong><span>种<br />核心制作工具</span></div>
            <div><strong>2027</strong><span>数字媒体艺术<br />本科毕业年份</span></div>
          </div>
        </div>
      </section>

      <section className="work section" id="work">
        <div className="shell">
          <div className="section-heading section-heading--split" data-reveal>
            <div><span className="section-no">02</span><p>SELECTED WORK</p></div>
            <h2>作品项目</h2>
            <p className="section-note">国赛获奖作品、实习项目与课程练习，按创作经历完整呈现。</p>
          </div>
          <div className="work-catalog">
            <article className="award-project" data-reveal>
              <div className="award-project__visual">
                <PortfolioVideo src={featuredProject.src} title={featuredProject.title} featured />
                <div className="award-project__award">
                  <span>01</span>
                  <p>NATIONAL COMPETITION<br /><strong>FIRST PRIZE</strong></p>
                </div>
                <div className="award-project__title">
                  <p>{featuredProject.en}</p>
                  <h3>{featuredProject.title}</h3>
                </div>
              </div>
              <div className="award-project__info">
                <span>年度代表作品 / {featuredProject.year}</span>
                <strong>{featuredProject.award}</strong>
                <p>静音预览，点击画面可打开独立播放器观看完整作品。</p>
                <i><Arrow diagonal /></i>
              </div>
            </article>

            {projectGroups.map((group) => (
              <section className={`work-group work-group--${group.id}`} id={group.id === 'education' ? 'education' : undefined} key={group.id}>
                <header className="work-group__header" data-reveal>
                  <div><span>{group.no}</span><p>{group.en}</p></div>
                  <h3>{group.title}</h3>
                  <p>{group.note}</p>
                  <strong>{String(group.items.length).padStart(2, '0')} WORKS</strong>
                </header>
                {group.id === 'internship' ? (
                  <InternshipCarousel items={group.items} />
                ) : group.id === 'education' ? (
                  <EducationWheel items={group.items} />
                ) : (
                  <div className={`work-grid ${group.compact ? 'work-grid--compact' : ''}`}>
                    {group.items.map((item, index) => (
                      <WorkCard key={item[0]} item={item} index={index} compact={group.compact} />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="strengths section" id="strengths">
        <div className="shell">
          <div className="section-heading section-heading--split" data-reveal>
            <div><span className="section-no">03</span><p>CORE CAPABILITIES</p></div><h2>个人优势</h2>
            <p className="section-note">不止生成画面，更将脚本、镜头与后期连接成完整作品。</p>
          </div>
          <div className="strength-grid">
            {strengths.map((strength) => (
              <article key={strength.number} data-reveal>
                <span>{strength.number}</span><div><p>{strength.en}</p><h3>{strength.title}</h3></div>
                <p>{strength.text}<small className="strength-evidence">{strength.evidence}</small></p><span className="card-cross" aria-hidden="true">+</span>
              </article>
            ))}
          </div>
          <div className="tools" data-reveal><span>TOOLS / WORKFLOW</span><div>{['PHOTOSHOP', 'PREMIERE', 'AFTER EFFECTS', 'C4D', 'JIAN YING', 'AI GENERATION'].map((tool) => <span key={tool}>{tool}</span>)}</div></div>
        </div>
      </section>

      <footer className="contact" id="contact">
        <div className="contact__noise" />
        <div className="shell contact__inner">
          <div className="contact__top"><div><span className="section-no">04</span><p>LET'S WORK TOGETHER</p></div><span>ZHENGZHOU / CHINA<br />AVAILABLE FOR OPPORTUNITIES</span></div>
          <div className="contact__title" data-reveal><p>下一帧，一起创造。</p><h2>LET'S MAKE<br /><span>THE NEXT FRAME</span></h2></div>
          <div className="contact__bottom">
            <div className="contact__channels">
              <a className="contact__mail" href="tel:+8617630407809"><span>PHONE / 电话</span>+86 176 3040 7809 <Arrow diagonal /></a>
              <a className="contact__mail" href="mailto:3260975486@qq.com"><span>EMAIL / QQ 邮箱</span>3260975486@qq.com <Arrow diagonal /></a>
            </div>
            <div className="contact__details"><span>© 2026 XIA CHAO</span></div>
          </div>
        </div>
      </footer>
    </main></VideoPlayerProvider>
  )
}

export default App
