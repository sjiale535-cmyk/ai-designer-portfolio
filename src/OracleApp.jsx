import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import VisionController from './VisionController.jsx'
import { assetUrl } from './assetUrl.js'

const glyphs = [
  {
    char: '日', name: '日 · RÌ', meaning: '太阳',
    desc: '像太阳的轮廓，中间一点表示日光。甲骨文以具象的天体形态记录时间与光明。',
    phrase: '日出东方，万物始明',
    paths: ['M23 16 Q50 8 77 16 L76 83 Q50 91 24 83 Z', 'M43 50 Q50 43 57 50 Q50 57 43 50 Z'],
  },
  {
    char: '月', name: '月 · YUÈ', meaning: '月亮',
    desc: '弯曲的轮廓取自月牙，中间短划用来区别于“夕”。古人以月相标记时间流转。',
    phrase: '月有盈亏，周而复始',
    paths: ['M68 12 Q32 21 28 52 Q27 80 67 89 Q48 65 51 47 Q54 29 68 12 Z', 'M40 50 Q51 48 61 43'],
  },
  {
    char: '山', name: '山 · SHĀN', meaning: '山峰',
    desc: '三座峰峦并立，中峰高耸。字形直接描摹起伏的山势，是典型的象形文字。',
    phrase: '峰起中原，层峦有声',
    paths: ['M15 78 L15 48 L36 62 L50 18 L62 60 L84 43 L84 78', 'M13 78 Q50 84 87 78'],
  },
  {
    char: '水', name: '水 · SHUǏ', meaning: '流水',
    desc: '中间为水脉，两侧的曲线像涟漪与支流。流动的笔势保留了水的方向感。',
    phrase: '水循其势，润泽无声',
    paths: ['M51 11 Q43 28 51 47 Q60 66 49 89', 'M40 31 Q25 29 17 43 Q28 48 35 57', 'M62 27 Q75 34 83 48 Q71 49 64 61'],
  },
  {
    char: '火', name: '火 · HUǑ', meaning: '火焰',
    desc: '中心像向上燃烧的火苗，左右散开的笔画像迸出的火星，记录热与光的形态。',
    phrase: '微火成炬，照见文字',
    paths: ['M50 12 Q37 34 47 53 Q57 70 49 90', 'M35 39 Q22 48 18 68 Q31 60 40 58', 'M64 38 Q76 49 81 68 Q68 60 59 58'],
  },
  {
    char: '人', name: '人 · RÉN', meaning: '人形',
    desc: '侧身站立的人，头、躯干与腿被压缩成有方向的线条，表现行走与劳作。',
    phrase: '人立天地，手触古今',
    paths: ['M58 13 Q48 30 49 48 Q43 67 28 87', 'M49 46 Q60 63 73 83'],
  },
  {
    char: '木', name: '木 · MÙ', meaning: '树木',
    desc: '竖线是树干，上方伸展枝桠，下方露出根系。甲骨文字形完整保留一株树的结构。',
    phrase: '木有根脉，字有来处',
    paths: ['M50 10 L50 89', 'M50 29 Q34 27 20 42', 'M50 29 Q67 26 80 42', 'M50 68 Q36 73 26 88', 'M50 68 Q65 72 75 88'],
  },
  {
    char: '目', name: '目 · MÙ', meaning: '眼睛',
    desc: '横置的眼睛后来转为竖写，外框为眼廓，中间短线表示瞳孔，含有观看与辨识之意。',
    phrase: '目之所及，文明可见',
    paths: ['M16 38 Q50 13 84 38 Q52 70 16 38 Z', 'M43 38 Q50 29 57 38 Q50 48 43 38 Z'],
  },
  {
    char: '雨', name: '雨 · YǓ', meaning: '降雨',
    desc: '上部像天空或云层，下方点状刻画雨滴落下，是古人对自然现象的直接记录。',
    phrase: '云垂四野，雨落成字',
    paths: ['M16 30 Q50 19 84 30', 'M24 31 L24 72', 'M76 31 L76 72', 'M35 43 L32 53', 'M52 41 L49 53', 'M67 43 L64 54', 'M39 61 L36 72', 'M58 60 L55 72'],
  },
  {
    char: '鱼', name: '鱼 · YÚ', meaning: '游鱼',
    desc: '尖首、鱼身、鳞纹与尾鳍构成完整的鱼形，文字与自然形态在这里几乎重叠。',
    phrase: '鱼游字海，触之有灵',
    paths: ['M18 46 Q35 18 66 28 Q79 35 84 48 Q71 67 43 66 Q27 62 18 46 Z', 'M18 46 L7 31 L8 62 Z', 'M43 29 Q48 47 43 65', 'M58 31 Q63 47 58 63', 'M67 28 L78 17'],
  },
  {
    char: '鸟', name: '鸟 · NIǍO', meaning: '飞鸟',
    desc: '尖喙、圆眼、身体和尾羽被概括为有节奏的线条，保留了鸟类昂首欲飞的姿态。',
    phrase: '鸟鸣于野，字行于空',
    paths: ['M31 35 Q42 13 63 24 L80 31 L63 36 Q76 52 65 72 Q50 88 30 72 Q19 57 31 35 Z', 'M41 30 Q45 25 49 30', 'M34 69 L22 86', 'M48 75 L42 90'],
  },
  {
    char: '田', name: '田 · TIÁN', meaning: '田地',
    desc: '规整的边界中划分出田垄，表示先民耕作的土地，也是秩序与生长的象征。',
    phrase: '田畴纵横，四时生长',
    paths: ['M18 18 Q50 12 82 18 L80 82 Q50 87 20 81 Z', 'M50 16 L50 84', 'M19 50 Q50 46 81 50'],
  },
  {
    char: '马', name: '马 · MǍ', meaning: '奔马',
    desc: '昂起的马首、鬃毛、躯干、四足与长尾共同组成奔马侧影，是甲骨文中极具动态感的动物字形。',
    phrase: '马踏长风，刻痕生动',
    paths: ['M31 20 Q42 9 57 17 L69 29 L61 39 Q72 48 68 65 L61 78', 'M36 34 Q24 46 29 65 L25 83', 'M31 47 Q48 55 66 48', 'M41 56 L39 82', 'M55 56 L52 84', 'M68 61 Q83 58 87 44', 'M35 18 L27 10', 'M42 16 L37 7'],
  },
  {
    char: '鹿', name: '鹿 · LÙ', meaning: '神鹿',
    desc: '枝状鹿角连接修长头颈，身体下方伸出四足。复杂轮廓呈现先民对山林动物的细致观察。',
    phrase: '鹿行林野，角映星河',
    paths: ['M47 26 Q55 17 63 25 L60 39 Q73 48 70 66', 'M48 28 Q38 38 42 49 Q49 55 61 48', 'M51 18 L44 7 M51 18 L55 6 M60 18 L66 8 M60 18 L70 16', 'M43 49 Q27 59 24 75', 'M53 54 L45 84', 'M64 55 L64 84', 'M69 64 Q81 67 86 58'],
  },
  {
    char: '象', name: '象 · XIÀNG', meaning: '巨象',
    desc: '长鼻、巨耳、宽厚身体和四足被完整刻画，字形兼具重量与方向，是成熟象形系统的代表。',
    phrase: '象负大地，形载万物',
    paths: ['M25 33 Q38 15 61 21 Q78 25 80 45 Q81 63 68 71', 'M27 34 Q18 43 20 57 Q21 72 12 82', 'M21 42 Q12 37 10 28', 'M43 27 Q32 38 43 48 Q53 40 43 27 Z', 'M35 61 L31 84', 'M52 65 L50 86', 'M68 61 L70 83', 'M72 31 Q83 23 88 31'],
  },
  {
    char: '车', name: '车 · CHĒ', meaning: '战车',
    desc: '两轮、车舆、车轴与辕木构成俯视的车辆结构，记录了商代交通与礼仪器械的形态。',
    phrase: '双轮循迹，车辙成文',
    paths: ['M18 31 Q50 22 82 31 L77 68 Q50 77 23 68 Z', 'M14 50 L87 50', 'M50 14 L50 87', 'M14 27 Q6 35 10 46 Q16 51 22 43 Q24 33 14 27 Z', 'M86 27 Q94 35 90 46 Q84 51 78 43 Q76 33 86 27 Z', 'M35 36 L65 36 L65 63 L35 63 Z'],
  },
  {
    char: '舟', name: '舟 · ZHŌU', meaning: '行舟',
    desc: '尖首翘尾的船体中分出船舱，纵向书写仍保留独木舟在水面穿行的轮廓。',
    phrase: '一舟渡水，古今同航',
    paths: ['M25 18 Q47 10 72 22 L80 66 Q60 86 28 79 L18 60 Z', 'M25 38 Q48 31 75 40', 'M23 59 Q50 51 78 59', 'M48 15 L51 82', 'M16 70 Q48 91 84 69'],
  },
  {
    char: '门', name: '门 · MÉN', meaning: '门扉',
    desc: '左右门柱、上部门楣与可以开合的两扇门板组成入口，象征空间的边界与通行。',
    phrase: '推门见字，入境知源',
    paths: ['M17 83 L17 18 Q50 10 83 18 L83 83', 'M18 31 Q50 25 82 31', 'M49 27 L49 82', 'M28 37 L39 43 L39 72 L27 67 Z', 'M71 37 L60 43 L60 72 L72 67 Z', 'M34 54 L38 54', 'M62 54 L66 54'],
  },
  {
    char: '宫', name: '宫 · GŌNG', meaning: '宫室',
    desc: '屋顶之下叠置多个空间，表示有围护、有层次的居所，字形从建筑结构中提炼而来。',
    phrase: '重檐深院，宫室有序',
    paths: ['M12 34 L50 10 L88 34', 'M21 31 L21 84 M79 31 L79 84', 'M30 38 L70 38 L68 57 L32 57 Z', 'M28 66 Q50 60 72 66 L69 84 L31 84 Z', 'M50 38 L50 56', 'M40 72 L60 72'],
  },
  {
    char: '鼎', name: '鼎 · DǏNG', meaning: '礼鼎',
    desc: '上部为深腹器身，两侧有耳，下方三足支撑。鼎兼具炊器与礼器身份，是权力和秩序的象征。',
    phrase: '鼎立中原，器以载道',
    paths: ['M24 27 Q50 17 76 27 L71 62 Q50 72 29 62 Z', 'M25 33 Q13 28 13 41 Q15 51 27 48', 'M75 33 Q87 28 87 41 Q85 51 73 48', 'M34 65 L29 88', 'M50 68 L50 90', 'M66 65 L72 88', 'M34 37 Q50 32 66 37', 'M39 47 L61 47 M42 56 L58 56'],
  },
  {
    char: '龟', name: '龟 · GUĪ', meaning: '灵龟',
    desc: '头、足、尾与分格龟甲组合为完整俯视图。龟甲也是甲骨卜辞的重要载体，让字与材料相互指涉。',
    phrase: '龟甲藏辞，刻问天地',
    paths: ['M28 27 Q50 10 72 27 Q82 48 70 72 Q50 89 29 72 Q18 49 28 27 Z', 'M34 34 L66 66 M66 34 L34 66', 'M27 43 L73 43 M27 58 L73 58', 'M47 15 L50 5 L56 15', 'M29 36 L15 29 M27 63 L14 72', 'M72 37 L86 30 M72 63 L86 72', 'M50 84 L52 95'],
  },
  {
    char: '禾', name: '禾 · HÉ', meaning: '谷穗',
    desc: '下垂的穗头、叶片、茎秆和根须组成成熟谷物，体现农耕文明对生长周期的记录。',
    phrase: '禾穗低垂，岁有丰成',
    paths: ['M50 18 L50 87', 'M49 20 Q37 9 27 15 Q37 26 49 29', 'M49 35 Q31 32 18 47', 'M51 44 Q68 38 82 50', 'M50 67 Q38 72 28 88', 'M50 67 Q63 72 72 88', 'M58 14 Q69 12 75 20'],
  },
  {
    char: '册', name: '册 · CÈ', meaning: '简册',
    desc: '多根竹木简由绳索编联成册，纵横线条直接呈现早期书写载体的装订方式。',
    phrase: '简牍相连，文字成册',
    paths: ['M19 18 L22 83', 'M35 13 L37 87', 'M51 16 L51 84', 'M67 13 L65 87', 'M82 18 L78 83', 'M14 39 Q50 45 86 39', 'M14 64 Q50 58 86 64'],
  },
  {
    char: '舞', name: '舞 · WǓ', meaning: '祭舞',
    desc: '舞者双手持饰，四肢舒展，身体位于字形中心。繁复线条凝固了祭祀仪式中的动作瞬间。',
    phrase: '执羽而舞，通感天地',
    paths: ['M50 15 Q43 22 50 29 Q57 22 50 15 Z', 'M49 29 L49 63', 'M48 37 Q32 31 18 38', 'M51 37 Q68 30 83 38', 'M19 38 L11 26 M19 38 L10 49', 'M82 38 L90 26 M82 38 L91 49', 'M48 62 L31 86', 'M50 62 L68 86', 'M35 45 Q23 56 18 70', 'M65 45 Q77 56 82 70'],
  },
  {
    char: '龙', name: '龙 · LÓNG', meaning: '神龙',
    desc: '角、首、弯曲长身与尾部组合为想象中的神兽，字形在自然观察之外承载了先民的精神信仰。',
    phrase: '龙游云气，神形入骨',
    paths: ['M30 27 Q37 12 52 20 L68 14 L62 29 Q77 37 72 51 Q66 62 52 57', 'M52 57 Q35 61 40 75 Q48 89 68 80 Q80 72 84 59', 'M31 27 L19 20 M34 23 L28 10', 'M45 27 Q49 23 53 27', 'M29 36 Q17 43 13 55', 'M42 74 Q28 79 20 90', 'M67 79 Q76 87 87 88'],
  },
]

const instances = Array.from({ length: 96 }, (_, index) => ({
  ...glyphs[index % glyphs.length],
  id: index,
  seed: (index * 37 + 13) % 101,
}))

const oracleTextureStyle = (index) => {
  const cell = ((index % 16) + 16) % 16
  return {
    '--oracle-texture': `url("${assetUrl('/oracle-assets/oracle-bone-atlas.png')}")`,
    '--texture-x': `${(cell % 4) * (100 / 3)}%`,
    '--texture-y': `${Math.floor(cell / 4) * (100 / 3)}%`,
    '--texture-angle': `${((index * 7) % 9) - 4}deg`,
  }
}

function OracleGlyph({ glyph, className = '', ariaHidden = false }) {
  const gradientId = `oracle-engraving-${useId().replace(/:/g, '')}`
  return (
    <svg className={`oracle-glyph ${className}`} viewBox="0 0 100 100" aria-hidden={ariaHidden} role={ariaHidden ? undefined : 'img'}>
      {!ariaHidden && <title>{glyph.name}的甲骨文字形</title>}
      <defs>
        <linearGradient id={gradientId} x1="12" y1="8" x2="88" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="currentColor" stopOpacity=".58" />
          <stop offset=".34" stopColor="currentColor" />
          <stop offset=".72" stopColor="currentColor" stopOpacity=".82" />
          <stop offset="1" stopColor="currentColor" stopOpacity=".44" />
        </linearGradient>
      </defs>
      <g className="oracle-glyph__echo" transform="translate(1.2 1.4)">
        {glyph.paths.map((path, index) => <path key={`echo-${index}`} d={path} pathLength="100" />)}
      </g>
      <g className="oracle-glyph__engraving" stroke={`url(#${gradientId})`}>
        {glyph.paths.map((path, index) => <path key={index} d={path} pathLength="100" />)}
      </g>
      <circle className="oracle-glyph__seal" cx="88" cy="14" r="1.35" />
    </svg>
  )
}

function InkField({ pointerRef, activeRef }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let frame
    let width = 0
    let height = 0
    let particles = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles = Array.from({ length: Math.min(110, Math.floor(width / 12)) }, (_, i) => ({
        x: (i * 89) % width,
        y: (i * 53) % height,
        r: 0.5 + (i % 5) * 0.32,
        drift: 0.08 + (i % 7) * 0.018,
        alpha: 0.08 + (i % 6) * 0.025,
      }))
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      const pointer = pointerRef.current
      const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 280)
      glow.addColorStop(0, activeRef.current ? 'rgba(222, 151, 77, .11)' : 'rgba(222, 151, 77, .05)')
      glow.addColorStop(1, 'rgba(10, 8, 7, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)

      particles.forEach((particle, i) => {
        particle.y -= particle.drift
        particle.x += Math.sin((particle.y + i * 17) * 0.005) * 0.05
        if (particle.y < -8) particle.y = height + 8
        const dx = particle.x - pointer.x
        const dy = particle.y - pointer.y
        const proximity = Math.max(0, 1 - Math.hypot(dx, dy) / 190)
        ctx.beginPath()
        ctx.fillStyle = `rgba(227, 184, 120, ${particle.alpha + proximity * 0.48})`
        ctx.arc(particle.x, particle.y, particle.r + proximity * 1.8, 0, Math.PI * 2)
        ctx.fill()
      })
      frame = requestAnimationFrame(render)
    }

    resize()
    window.addEventListener('resize', resize)
    frame = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [activeRef, pointerRef])

  return <canvas ref={canvasRef} className="oracle-ink-field" aria-hidden="true" />
}

function EvolutionPanel({ glyph, onClose, onNext }) {
  const [phase, setPhase] = useState(0)
  const glyphIndex = glyphs.findIndex((item) => item.char === glyph.char) + 1

  useEffect(() => {
    setPhase(0)
    const first = window.setTimeout(() => setPhase(1), 1200)
    const second = window.setTimeout(() => setPhase(2), 3200)
    return () => { window.clearTimeout(first); window.clearTimeout(second) }
  }, [glyph])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onNext])

  return (
    <aside className="oracle-detail" aria-live="polite" aria-label={`${glyph.name}释义`}>
      <button className="oracle-detail__close" onClick={onClose} aria-label="关闭释义">关闭 <span>×</span></button>
      <div className="oracle-detail__index">AWAKENED CHARACTER / {String(glyphIndex).padStart(2, '0')}</div>
      <div className={`oracle-evolution oracle-evolution--${phase}`}>
        <div className="oracle-evolution__ancient" style={oracleTextureStyle(glyphIndex - 1)}>
          <OracleGlyph glyph={glyph} />
          <i /><i /><i />
        </div>
        <div className="oracle-evolution__trace" aria-hidden="true" />
        <div className="oracle-evolution__modern">{glyph.char}</div>
      </div>
      <div className="oracle-detail__timeline" aria-label="字形演变进度">
        <span className={phase >= 0 ? 'is-on' : ''}>甲骨刻形</span>
        <b />
        <span className={phase >= 1 ? 'is-on' : ''}>线条提炼</span>
        <b />
        <span className={phase >= 2 ? 'is-on' : ''}>现代汉字</span>
      </div>
      <div className="oracle-detail__copy">
        <p className="oracle-detail__eyebrow">字义 / INTERPRETATION</p>
        <h2>{glyph.meaning}<small>{glyph.name}</small></h2>
        <p>{glyph.desc}</p>
        <blockquote>“{glyph.phrase}”</blockquote>
      </div>
      <button className="oracle-detail__next" onClick={onNext}>唤醒下一个字 <span>↗</span></button>
    </aside>
  )
}

export default function OracleApp() {
  const stageRef = useRef(null)
  const nodeRefs = useRef([])
  const pointerRef = useRef({ x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 })
  const activePointerRef = useRef(false)
  const pointersRef = useRef(new Map())
  const pinchRef = useRef(null)
  const nodesRef = useRef([])
  const depthRef = useRef(1)
  const focusedNodeRef = useRef(-1)
  const fieldFrozenRef = useRef(false)
  const modeRef = useRef('drift')
  const [selected, setSelected] = useState(null)
  const [mode, setMode] = useState('drift')
  const [depth, setDepth] = useState(1)
  const [intro, setIntro] = useState(true)
  const [fieldFrozen, setFieldFrozen] = useState(false)
  const [awakened, setAwakened] = useState(() => new Set())

  useEffect(() => {
    const previousTitle = document.title
    document.title = '字醒·中原 — 甲骨文互动体验'
    return () => { document.title = previousTitle }
  }, [])

  useEffect(() => {
    const width = window.innerWidth
    const height = window.innerHeight
    nodesRef.current = instances.map((item, i) => ({
      x: 90 + ((item.seed * 173 + i * 59) % Math.max(300, width - 180)),
      y: 90 + ((item.seed * 97 + i * 83) % Math.max(260, height - 180)),
      vx: ((i % 5) - 2) * 0.055,
      vy: (((i * 3) % 7) - 3) * 0.04,
      radius: 28 + (i % 4) * 7,
    }))

    let frame
    const tick = (time) => {
      const w = window.innerWidth
      const h = window.innerHeight
      const pointer = pointerRef.current
      const currentMode = modeRef.current

      let nearestIndex = -1
      if (activePointerRef.current && nodesRef.current.length) {
        let nearestDistance = Number.POSITIVE_INFINITY
        nodesRef.current.forEach((node, index) => {
          const distance = Math.hypot(node.x - pointer.x, node.y - pointer.y)
          if (distance < nearestDistance) {
            nearestDistance = distance
            nearestIndex = index
          }
        })
        focusedNodeRef.current = nearestIndex
      } else {
        focusedNodeRef.current = -1
      }

      nodesRef.current.forEach((node, i) => {
        const isFocused = i === focusedNodeRef.current
        if (isFocused) {
          // 手势停在哪里，最近的字就在哪里稳定下来。
          node.x += (pointer.x - node.x) * 0.24
          node.y += (pointer.y - node.y) * 0.24
          node.vx = 0
          node.vy = 0
        } else if (fieldFrozenRef.current) {
          node.vx *= 0.72
          node.vy *= 0.72
        } else if (currentMode === 'gather') {
          const angle = (i / nodesRef.current.length) * Math.PI * 2 + time * 0.00004
          const ring = Math.min(w, h) * (0.18 + (i % 3) * 0.075)
          node.vx += ((w * 0.5 + Math.cos(angle) * ring) - node.x) * 0.00008
          node.vy += ((h * 0.5 + Math.sin(angle) * ring) - node.y) * 0.00008
        } else if (currentMode === 'orbit') {
          const angle = (i / nodesRef.current.length) * Math.PI * 2 + time * (0.000035 + (i % 3) * 0.000006)
          const rx = w * (0.22 + (i % 4) * 0.055)
          const ry = h * (0.16 + (i % 3) * 0.06)
          node.x += (w * 0.5 + Math.cos(angle) * rx - node.x) * 0.012
          node.y += (h * 0.5 + Math.sin(angle) * ry - node.y) * 0.012
        } else {
          node.vx += Math.sin(time * 0.00023 + i * 1.7) * 0.0009
          node.vy += Math.cos(time * 0.00019 + i * 1.3) * 0.0008
        }

        if (!isFocused && !fieldFrozenRef.current && activePointerRef.current) {
          const distanceToPointer = Math.hypot(node.x - pointer.x, node.y - pointer.y)
          if (distanceToPointer < 260) {
            const attraction = (1 - distanceToPointer / 260) * 0.00075
            node.vx += (pointer.x - node.x) * attraction
            node.vy += (pointer.y - node.y) * attraction
          }
        }

        if (!isFocused && !fieldFrozenRef.current) {
          node.vx *= 0.996
          node.vy *= 0.996
          node.x += node.vx * depthRef.current
          node.y += node.vy * depthRef.current
        }
        const margin = 54
        if (node.x < margin || node.x > w - margin) { node.vx *= -1; node.x = Math.max(margin, Math.min(w - margin, node.x)) }
        if (node.y < margin || node.y > h - margin) { node.vy *= -1; node.y = Math.max(margin, Math.min(h - margin, node.y)) }

        const distance = Math.hypot(node.x - pointer.x, node.y - pointer.y)
        const proximity = activePointerRef.current ? Math.max(0, 1 - distance / 210) : 0
        const layerScale = 0.48 + (i % 6) * 0.105
        const scale = (layerScale + proximity * 0.72 + (isFocused ? 0.72 : 0)) * depthRef.current
        const opacity = 0.12 + (i % 7) * 0.075 + proximity * 0.38 + (isFocused ? 0.45 : 0)
        const element = nodeRefs.current[i]
        if (element) {
          element.style.transform = `translate3d(${node.x}px, ${node.y}px, 0) translate(-50%, -50%) scale(${scale})`
          element.style.opacity = Math.min(1, opacity)
          element.style.zIndex = isFocused ? 18 : (proximity > 0.15 ? 12 : String(1 + (i % 7)))
          element.dataset.near = isFocused || proximity > 0.36 ? 'true' : 'false'
          element.dataset.focused = isFocused ? 'true' : 'false'
        }
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  const disturb = useCallback((x, y, forceX, forceY) => {
    nodesRef.current.forEach((node) => {
      const dx = node.x - x
      const dy = node.y - y
      const distance = Math.max(24, Math.hypot(dx, dy))
      if (distance < 240) {
        const force = (1 - distance / 240) * 0.38
        node.vx += forceX * force + (dx / distance) * 0.34
        node.vy += forceY * force + (dy / distance) * 0.34
      }
    })
  }, [])

  const awakenAt = useCallback((x, y) => {
    if (!nodesRef.current.length) return
    let nearestIndex = 0
    let nearestDistance = Number.POSITIVE_INFINITY
    nodesRef.current.forEach((node, index) => {
      const distance = Math.hypot(node.x - x, node.y - y)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = index
      }
    })
    setIntro(false)
    setSelected(instances[nearestIndex])
  }, [])

  const setVisionDepth = useCallback((value) => {
    depthRef.current = value
    setDepth(value)
  }, [])

  const setVisionFreeze = useCallback((value) => {
    fieldFrozenRef.current = value
    setFieldFrozen(value)
  }, [])

  const handlePointerMove = (event) => {
    const last = pointerRef.current
    const next = { x: event.clientX, y: event.clientY }
    pointerRef.current = next
    activePointerRef.current = true
    if (pointersRef.current.has(event.pointerId)) pointersRef.current.set(event.pointerId, next)
    if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()]
      const distance = Math.hypot(a.x - b.x, a.y - b.y)
      if (pinchRef.current) {
        const nextDepth = Math.max(0.72, Math.min(1.35, depthRef.current * (distance / pinchRef.current)))
        depthRef.current = nextDepth
        setDepth(nextDepth)
      }
      pinchRef.current = distance
    } else if (event.buttons || event.pointerType === 'touch') {
      disturb(next.x, next.y, next.x - last.x, next.y - last.y)
    }
  }

  const handlePointerDown = (event) => {
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
  }

  const handlePointerUp = (event) => {
    pointersRef.current.delete(event.pointerId)
    pinchRef.current = null
  }

  const handleWheel = (event) => {
    const nextDepth = Math.max(0.72, Math.min(1.35, depthRef.current - event.deltaY * 0.00055))
    depthRef.current = nextDepth
    setDepth(nextDepth)
  }

  const changeMode = (nextMode) => {
    modeRef.current = nextMode
    setMode(nextMode)
  }

  const awakenRandom = () => {
    const candidates = glyphs.filter((glyph) => glyph.char !== selected?.char)
    setSelected(candidates[Math.floor(Math.random() * candidates.length)])
  }

  const nextGlyph = useCallback(() => {
    setSelected((current) => glyphs[(Math.max(0, glyphs.findIndex((glyph) => glyph.char === current?.char)) + 1) % glyphs.length])
  }, [])

  useEffect(() => {
    if (!selected) return
    setAwakened((current) => {
      if (current.has(selected.char)) return current
      const next = new Set(current)
      next.add(selected.char)
      return next
    })
  }, [selected])

  const introLabel = useMemo(() => intro ? '进入字海' : '互动说明', [intro])

  return (
    <main className={`oracle-site oracle-site--${mode} ${selected ? 'has-selection' : ''} ${fieldFrozen ? 'is-field-frozen' : ''}`}>
      <InkField pointerRef={pointerRef} activeRef={activePointerRef} />
      <div className="oracle-grain" aria-hidden="true" />
      <header className="oracle-header">
        <a className="oracle-brand" href={assetUrl('/oracle/')} aria-label="字醒中原首页">
          <span>字醒</span>
          <strong>中原</strong>
        </a>
        <div className="oracle-header__center">24 GLYPHS · 96 TRACES <i /> INTERACTIVE ARCHIVE</div>
        <a className="oracle-back" href="/">返回作品集 <span>↗</span></a>
      </header>

      <VisionController
        pointerRef={pointerRef}
        activePointerRef={activePointerRef}
        onAwakenAt={awakenAt}
        onDepth={setVisionDepth}
        onFieldFreeze={setVisionFreeze}
      />

      <section
        ref={stageRef}
        className="oracle-stage"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={() => { activePointerRef.current = false }}
        onWheel={handleWheel}
        aria-label="漂浮的甲骨文字形互动区域"
      >
        <div className="oracle-stage__title" aria-hidden="true">
          <span>让三千年前的文字</span>
          <strong>重新醒来</strong>
        </div>
        <div className="oracle-stage__halo" aria-hidden="true" />
        {instances.map((glyph, index) => (
          <button
            key={glyph.id}
            ref={(element) => { nodeRefs.current[index] = element }}
            className="oracle-floater"
            onPointerDown={(event) => { event.stopPropagation(); setSelected(glyph) }}
            onMouseDown={(event) => { event.stopPropagation(); setSelected(glyph) }}
            onTouchStart={(event) => { event.stopPropagation(); setSelected(glyph) }}
            onClick={(event) => { event.stopPropagation(); setSelected(glyph) }}
            onPointerEnter={() => { activePointerRef.current = true }}
            aria-label={`唤醒“${glyph.char}”字并查看释义`}
          >
            <OracleGlyph glyph={glyph} ariaHidden />
          </button>
        ))}
      </section>

      <nav className="oracle-modes" aria-label="字符场模式">
        <p>字场状态</p>
        {[
          ['drift', '漂游'], ['gather', '聚拢'], ['orbit', '星图'],
        ].map(([value, label], index) => (
          <button key={value} className={mode === value ? 'is-active' : ''} onClick={() => changeMode(value)}>
            <span>0{index + 1}</span>{label}
          </button>
        ))}
      </nav>

      <div className="oracle-depth" aria-label={`景深 ${Math.round(depth * 100)}%`}>
        <span>DEPTH</span><i style={{ '--depth': `${((depth - 0.72) / 0.63) * 100}%` }} /><b>{Math.round(depth * 100)}</b>
      </div>

      <div className="oracle-archive-meter" aria-label={`已唤醒 ${awakened.size} 个甲骨文`}>
        <div>
          <span>AWAKENED ARCHIVE</span>
          <b>{String(awakened.size).padStart(2, '0')}<i>/24</i></b>
        </div>
        <ol aria-hidden="true">
          {glyphs.map((glyph) => <li key={glyph.char} className={awakened.has(glyph.char) ? 'is-awake' : ''} />)}
        </ol>
      </div>

      <div className={`oracle-field-state ${fieldFrozen ? 'is-on' : ''}`} aria-live="polite">
        <i /> {fieldFrozen ? '掌心感应 · 字海已静止' : '字海正在呼吸'}
      </div>

      <button className="oracle-awaken" onClick={awakenRandom}>
        <span>唤醒一个字</span>
        <i>AWAKEN</i>
      </button>

      <button className="oracle-guide-button" onClick={() => setIntro(true)}>{introLabel} <span>?</span></button>

      {intro && (
        <div className="oracle-intro" role="dialog" aria-modal="true" aria-label="互动说明">
          <button className="oracle-intro__close" onClick={() => setIntro(false)} aria-label="关闭说明">×</button>
          <p className="oracle-intro__kicker">字醒 · 中原 / 交互实验 01</p>
          <h1>触碰字形，<br />听见文明的回声。</h1>
          <p className="oracle-intro__lead">九十六枚甲骨字形分层漂游。手指停在哪里，最近的字就在那里静止、显形；稳定停留一秒，自动进入字义与演变。</p>
          <div className="oracle-intro__steps">
            <span><b>01</b>指尖停留锁定</span>
            <span><b>02</b>停留一秒自动唤醒</span>
            <span><b>03</b>张开手掌静止字海</span>
            <span><b>04</b>掌距调节空间景深</span>
          </div>
          <button className="oracle-enter" onClick={() => setIntro(false)}><span>进入字海</span><i>→</i></button>
          <small>鼠标、触控板与触摸屏均可体验</small>
        </div>
      )}

      {selected && <EvolutionPanel key={selected.char} glyph={selected} onClose={() => setSelected(null)} onNext={nextGlyph} />}
    </main>
  )
}
