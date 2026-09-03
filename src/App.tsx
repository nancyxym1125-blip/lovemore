import { useEffect, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from 'react'
import { isRelationshipMilestone, relationshipDay, toLocalDateString } from './data'
import { ShaderBackground } from './ShaderBackground'

const loveMoreLogo = new URL('../brand/vi-v2/assets/logos/love-more-horizontal-burgundy.png', import.meta.url).href
const loveMoreStackedLogo = new URL('../brand/vi-v2/assets/logos/love-more-primary-stacked-white.png', import.meta.url).href
const PRIVATE_CODE = '19940312'
const RELATIONSHIP_START = '2026-05-31'
const LETTER_LINES = [
  '我总是想用文字 图案 视频 言语',
  '来表达我对你的\n爱 喜欢 思念\n还有心灵的激荡',
  '但是总是会觉得，\n这些都还不够，\n还远远不够。',
  '很多只言片语中 转瞬即逝的风景里 亦或者是工作的间隙间',
  '都藏着你啊',
  '我爱的莫雨晨',
]

const LETTER_EXIT_DURATION = 850

function getPreviewDay(search: string): number | null {
  const value = Number(new URLSearchParams(search).get('preview-day'))
  return Number.isSafeInteger(value) && value > 0 ? value : null
}

function BlurText({ children, exiting }: { children: string; exiting: boolean }) {
  const characters = Array.from(children)

  return (
    <p
      className={`letter-player__line ${exiting ? 'is-exiting' : 'is-entering'}`}
      aria-live="polite"
      aria-label={children}
    >
      {characters.map((character, index) => character === '\n' ? (
        <br aria-hidden="true" key={`break-${index}`} />
      ) : (
        <span
          aria-hidden="true"
          className="letter-player__character"
          key={`${index}-${character}`}
          style={{
            '--character-order': index,
          } as CSSProperties}
        >
          {character === ' ' ? '\u00A0' : character}
        </span>
      ))}
    </p>
  )
}

function App() {
  const today = toLocalDateString()
  const currentRelationshipDay = relationshipDay(RELATIONSHIP_START, today)
  const previewDay = getPreviewDay(window.location.search)
  const displayedRelationshipDay = previewDay ?? currentRelationshipDay
  const letterLines = previewDay !== null || isRelationshipMilestone(RELATIONSHIP_START, today)
    ? [
        ...LETTER_LINES,
        `这是我们正式在一起的\n第${displayedRelationshipDay}天`,
        '请允许我陪着你\n直至生命的尽头',
      ]
    : LETTER_LINES
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [unlocked, setUnlocked] = useState(() => window.sessionStorage.getItem('love-more-unlocked') === 'true')
  const [letterOpen, setLetterOpen] = useState(() => window.sessionStorage.getItem('love-more-unlocked') === 'true' && window.location.hash === '#letter')
  const [letterLine, setLetterLine] = useState(-1)
  const [letterExiting, setLetterExiting] = useState(false)
  const [easterEggOpen, setEasterEggOpen] = useState(false)

  useEffect(() => {
    if (!letterExiting) return

    const timer = window.setTimeout(() => {
      setLetterLine((current) => current >= letterLines.length ? -1 : current + 1)
      setLetterExiting(false)
    }, LETTER_EXIT_DURATION)

    return () => window.clearTimeout(timer)
  }, [letterExiting, letterLines.length])

  const enterPrivatePage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (code !== PRIVATE_CODE) {
      setError('暗号不对，再想一想。')
      return
    }
    window.sessionStorage.setItem('love-more-unlocked', 'true')
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#yu-chen`)
    setUnlocked(true)
  }

  const returnToEntry = () => {
    window.sessionStorage.removeItem('love-more-unlocked')
    window.history.replaceState(null, '', window.location.pathname)
    setCode('')
    setError('')
    setLetterLine(-1)
    setLetterExiting(false)
    setEasterEggOpen(false)
    setLetterOpen(false)
    setUnlocked(false)
  }

  const openLetter = () => {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#letter`)
    setLetterOpen(true)
  }

  const advanceLetter = () => {
    if (letterExiting || easterEggOpen) return
    if (letterLine >= letterLines.length) return
    if (letterLine < 0) {
      setLetterLine(0)
      return
    }
    setLetterExiting(true)
  }

  const handleLetterKey = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && easterEggOpen) {
      event.preventDefault()
      setEasterEggOpen(false)
      return
    }
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowRight') {
      event.preventDefault()
      advanceLetter()
    }
  }

  if (unlocked && letterOpen) {
    return (
      <main
        className="letter-player"
        role="button"
        tabIndex={0}
        autoFocus
        aria-label="播放下一句话"
        onClick={advanceLetter}
        onKeyDown={handleLetterKey}
      >
        <ShaderBackground className="letter-page__shader" />
        <div className="letter-player__shade" aria-hidden="true" />
        {previewDay !== null && (
          <p className="letter-player__preview">PREVIEW · DAY {previewDay}</p>
        )}
        <h1 className="sr-only">写给 YU CHEN 的话</h1>
        {letterLine >= 0 && letterLine < letterLines.length && (
          <BlurText key={letterLine} exiting={letterExiting}>
            {letterLines[letterLine]}
          </BlurText>
        )}
        {letterLine === LETTER_LINES.length - 1 && !letterExiting && (
          <button
            className="letter-player__easter-egg"
            type="button"
            aria-label="打开彩蛋"
            onClick={(event) => {
              event.stopPropagation()
              setEasterEggOpen(true)
            }}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <span aria-hidden="true">✦</span>
            彩蛋
          </button>
        )}
        {easterEggOpen && (
          <div
            className="easter-egg"
            role="dialog"
            aria-modal="true"
            aria-label="一段藏起来的话"
            onClick={(event) => {
              event.stopPropagation()
              setEasterEggOpen(false)
            }}
          >
            <section className="easter-egg__content" onClick={(event) => event.stopPropagation()}>
              <button
                className="easter-egg__close"
                type="button"
                aria-label="关闭彩蛋"
                autoFocus
                onClick={() => setEasterEggOpen(false)}
                onKeyDown={(event) => {
                  event.stopPropagation()
                  if (event.key === 'Escape') setEasterEggOpen(false)
                }}
              >
                ×
              </button>
              <p>输入这段话的时候是2026/9/2的晚上，在莫雨晨公司楼下，刚输入完就看见你走了过来，于是我慌慌张张地合上了电脑</p>
            </section>
          </div>
        )}
        {letterLine === letterLines.length && (
          <>
            <img
              className="letter-player__logo"
              src={loveMoreStackedLogo}
              alt="LOVE MORE"
              key="final-logo"
            />
            <button
              className="letter-player__home"
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                returnToEntry()
              }}
              onKeyDown={(event) => event.stopPropagation()}
            >
              回到首页
            </button>
          </>
        )}
      </main>
    )
  }

  if (unlocked) {
    return (
      <main className="welcome-screen" aria-labelledby="welcome-title">
        <ShaderBackground className="welcome-screen__shader" />
        <div className="welcome-screen__shade" aria-hidden="true" />
        <p className="welcome-screen__brand">LOVE MORE</p>
        <section className="welcome-screen__content">
          <p className="welcome-screen__eyebrow">WELCOME</p>
          <h1 id="welcome-title">YU CHEN</h1>
          <p className="welcome-screen__letter-note">这里有一封写给你的信</p>
          <button className="welcome-screen__letter-button" type="button" onClick={openLetter}>OPEN</button>
        </section>
        <button className="welcome-screen__return" type="button" onClick={returnToEntry}>← RETURN</button>
      </main>
    )
  }

  return (
    <main className="private-entry" aria-labelledby="page-title">
      <ShaderBackground className="private-entry__shader" />
      <div className="private-entry__shade" aria-hidden="true" />

      <p className="private-entry__owner">A PRIVATE PLACE FOR YU CHEN</p>

      <section className="private-entry__content">
        <h1 id="page-title" className="sr-only">Love More</h1>
        <img className="private-entry__logo" src={loveMoreLogo} alt="LOVE MORE" />

        <form className={error ? 'code-entry has-error' : 'code-entry'} onSubmit={enterPrivatePage}>
          <label htmlFor="private-code">输入暗号：</label>
          <div className="code-entry__field">
            <input
              id="private-code"
              name="code"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              spellCheck="false"
              maxLength={8}
              value={code}
              onChange={(event) => { setCode(event.target.value); setError('') }}
              aria-label="输入暗号"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'code-error' : undefined}
            />
            <button type="submit" aria-label="确认暗号">↗</button>
          </div>
          <p className="code-entry__error" id="code-error" role="alert">{error}</p>
        </form>
      </section>
    </main>
  )
}

export default App
