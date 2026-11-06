import { useEffect, useMemo, useRef, useState } from "react"

type Market = "us" | "hk"
type Goal = "annual" | "trial" | "benefits"
type Style = "minimal" | "tech" | "warm"
type Language = "English" | "繁體中文" | "简体中文"
type StudioTab = "compare" | "review" | "evaluation"
type PaywallSource = {
  kind: "sample" | "upload"
  name: string
  previewUrl?: string
  format?: string
  width?: number
  height?: number
  size?: number
}

type Product = {
  name: string
  category: string
  description: string
  audience: string
  benefits: string[]
  usMonthly: string
  usAnnual: string
  hkMonthly: string
  hkAnnual: string
  trial: string
  renewal: string
}

const defaultProduct: Product = {
  name: "Demo Learning App",
  category: "教育",
  description: "AI 驅動的學習訂閱服務",
  audience: "學生及終身學習者",
  benefits: [
    "Unlimited Practice",
    "Personalized Learning",
    "Progress Tracking",
  ],
  usMonthly: "4.99",
  usAnnual: "39.99",
  hkMonthly: "38",
  hkAnnual: "298",
  trial: "3 days for eligible users",
  renewal:
    "Subscription renews automatically unless cancelled at least 24 hours before the current period ends.",
}

const marketData = {
  us: {
    label: "美國",
    short: "US",
    currency: "USD",
    monthly: "4.99",
    annual: "39.99",
  },
  hk: {
    label: "香港",
    short: "HK",
    currency: "HKD",
    monthly: "38",
    annual: "298",
  },
}

const languageLabels: Record<Language, string> = {
  English: "英語",
  繁體中文: "繁體中文（香港）",
  简体中文: "簡體中文",
}

const nextMarketPrice = (product: Product, market: Market, annual: boolean) =>
  market === "us"
    ? annual
      ? product.usAnnual
      : product.usMonthly
    : annual
      ? product.hkAnnual
      : product.hkMonthly

const Icon = ({ name, size = 18 }: { name: string size?: number }) => {
  const paths: Record<string, React.ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    swap: (
      <>
        <path d="M4 8h15M15 4l4 4-4 4" />
        <path d="M20 16H5M9 12l-4 4 4 4" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3-1.2 3.2L8 7.5l2.8 1.3L12 12l1.2-3.2L16 7.5l-2.8-1.3L12 3Z" />
        <path d="m5 13-.8 2.2L2 16l2.2.8L5 19l.8-2.2L8 16l-2.2-.8L5 13ZM19 13l-.6 1.4L17 15l1.4.6L19 17l.6-1.4L21 15l-1.4-.6L19 13Z" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </>
    ),
    layout: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 10h18M9 10v10" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    palette: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="8.5" cy="9" r=".8" fill="currentColor" />
        <circle cx="12" cy="7" r=".8" fill="currentColor" />
        <circle cx="15.5" cy="9" r=".8" fill="currentColor" />
        <path d="M16 15c0 1.2-1 2-2.1 2H12a2 2 0 0 1 0-4h2" />
      </>
    ),
    edit: (
      <>
        <path d="m4 16-.8 4 4-.8L18.5 8.9 15.1 5.5 4 16Z" />
        <path d="m13.8 6.8 3.4 3.4" />
      </>
    ),
    chevron: <path d="m8 10 4 4 4-4" />,
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4m0 0L8 8m4-4 4 4" />
        <path d="M4 15v4h16v-4" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v5c0 4.6 2.9 8 7 10 4.1-2 7-5.4 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </>
    ),
    wand: (
      <>
        <path d="m15 4 5 5L8 21l-5-5L15 4Z" />
        <path d="m12 7 5 5M5 3v4M3 5h4M19 16v5M16.5 18.5h5" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7h.01" />
      </>
    ),
    reset: (
      <>
        <path d="M4 10a8 8 0 1 1 2 8" />
        <path d="M4 4v6h6" />
      </>
    ),
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button className="logo" onClick={onClick} aria-label="MarketMorph 首頁">
      <span className="logo-mark">
        <span />
        <span />
        <span />
      </span>
      <span>MarketMorph</span>
    </button>
  )
}

function Navbar({
  page,
  setPage,
}: {
  page: "home" | "studio"
  setPage: (p: "home" | "studio") => void
}) {
  const go = (id: string) => {
    if (page !== "home") {
      setPage("home")
      setTimeout(
        () =>
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
        50,
      )
    } else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }
  return (
    <header className="navbar">
      <Logo onClick={() => setPage("home")} />
      <nav className="nav-links">
        <button onClick={() => go("home")}>首頁</button>
        <button onClick={() => go("features")}>主要功能</button>
        <button onClick={() => go("how")}>使用流程</button>
      </nav>
    </header>
  )
}

function ShowcaseBenefit({ children }: { children: React.ReactNode }) {
  return (
    <li>
      <span>
        <Icon name="check" size={12} />
      </span>
      {children}
    </li>
  )
}

function LandingShowcase() {
  return (
    <section className="product-showcase" aria-labelledby="showcase-title">
      <div className="showcase-shell">
        <div className="showcase-heading">
          <div>
            <span className="kicker">產品示例</span>
            <h2 id="showcase-title">一鍵本地化設計訂閱頁</h2>
          </div>
          <p>從同一款 App 出發，打造適合不同市場的訂閱體驗。</p>
        </div>

        <div className="showcase-comparison">
          <article className="showcase-side">
            <div className="showcase-label">
              <span className="showcase-flag">US</span>
              <div>
                <b>原始版本 · 美國</b>
                <small>會員權益優先 · 英語</small>
              </div>
            </div>
            <div className="showcase-phone showcase-phone-dark">
              <div className="showcase-island" />
              <div className="showcase-status">
                <span>9:41</span>
                <span>● ◒</span>
              </div>
              <div className="showcase-app">
                <span>
                  <Icon name="sparkles" size={20} />
                </span>
                <b>Demo Learning App</b>
              </div>
              <div className="showcase-copy">
                <h3>Unlock Your Learning Potential</h3>
                <p>Get unlimited access to premium learning tools.</p>
              </div>
              <ul className="showcase-benefits">
                <ShowcaseBenefit>Unlimited practice</ShowcaseBenefit>
                <ShowcaseBenefit>Personalized learning</ShowcaseBenefit>
                <ShowcaseBenefit>Progress tracking</ShowcaseBenefit>
              </ul>
              <div className="showcase-plans">
                <div className="showcase-plan selected">
                  <span className="showcase-radio" />
                  <div>
                    <b>Monthly</b>
                    <small>Billed every month</small>
                  </div>
                  <strong>
                    US$4.99<small>/month</small>
                  </strong>
                </div>
                <div className="showcase-plan">
                  <span className="showcase-radio" />
                  <div>
                    <b>Annual</b>
                    <small>Billed once a year</small>
                  </div>
                  <strong>
                    US$39.99<small>/year</small>
                  </strong>
                </div>
              </div>
              <button className="showcase-phone-cta">
                Continue with Premium <Icon name="arrow" size={14} />
              </button>
              <p className="showcase-terms">
                3 days for eligible users. Subscription renews automatically
                unless cancelled before the current period ends.
              </p>
            </div>
          </article>

          <div className="showcase-transform" aria-hidden="true">
            <span>
              <Icon name="swap" size={20} />
            </span>
            <b>調整</b>
            <small>市場 · 版面 · 方案</small>
          </div>

          <article className="showcase-side">
            <div className="showcase-label">
              <span className="showcase-flag showcase-flag-hk">HK</span>
              <div>
                <b>本地化版本 · 香港</b>
                <small>訂閱方案優先 · 繁體中文</small>
              </div>
            </div>
            <div className="showcase-phone showcase-phone-light" lang="zh-Hant">
              <div className="showcase-island" />
              <div className="showcase-status">
                <span>9:42</span>
                <span>● ◒</span>
              </div>
              <div className="showcase-app">
                <span>
                  <Icon name="sparkles" size={20} />
                </span>
                <b>Demo Learning App</b>
              </div>
              <div className="showcase-copy">
                <h3>解鎖進階學習體驗</h3>
                <p>以更適合你的方式，持續提升學習進度。</p>
              </div>
              <div className="showcase-plans">
                <div className="showcase-plan featured selected">
                  <em>重點方案</em>
                  <span className="showcase-radio" />
                  <div>
                    <b>全年會籍</b>
                    <small>每年收費</small>
                  </div>
                  <strong>
                    HK$298<small>/年</small>
                  </strong>
                </div>
                <div className="showcase-plan">
                  <span className="showcase-radio" />
                  <div>
                    <b>月費會籍</b>
                    <small>每月收費</small>
                  </div>
                  <strong>
                    HK$38<small>/月</small>
                  </strong>
                </div>
              </div>
              <ul className="showcase-benefits">
                <ShowcaseBenefit>無限次學習練習</ShowcaseBenefit>
                <ShowcaseBenefit>個人化學習內容</ShowcaseBenefit>
                <ShowcaseBenefit>學習進度追蹤</ShowcaseBenefit>
              </ul>
              <button className="showcase-phone-cta">
                開始 Premium 體驗 <Icon name="arrow" size={14} />
              </button>
              <p className="showcase-terms">
                符合資格的用戶可試用 3 天。訂閱將自動續期，可於當期結束前取消。
              </p>
            </div>
          </article>
        </div>

        <div className="showcase-summary">
          <div>
            <span>
              <Icon name="globe" size={16} />
            </span>
            <b>內容已本地化</b>
          </div>
          <div>
            <span>
              <Icon name="chart" size={16} />
            </span>
            <b>突出年費方案</b>
          </div>
          <div>
            <span>
              <Icon name="palette" size={16} />
            </span>
            <b>已調整版面及配色</b>
          </div>
          <p>示例使用虛構訂閱資料，僅供展示。</p>
        </div>
      </div>
    </section>
  )
}

function Landing({
  setPage,
  initialPrompt,
  setInitialPrompt,
  source,
  setSource,
}: {
  setPage: (p: "home" | "studio") => void
  initialPrompt: string
  setInitialPrompt: (s: string) => void
  source: PaywallSource | null
  setSource: (source: PaywallSource | null) => void
}) {
  const steps = [
    ["upload", "上傳原始訂閱頁面"],
    ["globe", "設定目標市場"],
    ["sparkles", "AI 本地化改造"],
    ["layout", "比較與檢查"],
  ]
  const promptRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [sourceError, setSourceError] = useState("")
  const [uploadStatus, setUploadStatus] =
    useState<"idle" | "validating" | "success" | "error">(
      source ? "success" : "idle",
    )
  const [uploadError, setUploadError] = useState("")
  useEffect(() => {
    const field = promptRef.current
    if (!field) return
    field.style.height = "0px"
    field.style.height = `${Math.min(field.scrollHeight, 118)}px`
  }, [initialPrompt])
  const startLocalization = () => {
    if (!source) {
      setSourceError("請先上傳原始訂閱頁面，或選擇示例訂閱頁面。")
      document.getElementById("home")?.scrollIntoView({ behavior: "smooth" })
      return
    }
    setSourceError("")
    setPage("studio")
  }
  const selectSample = () => {
    setSource({
      kind: "sample",
      name: "Demo Learning App · 美國原始版本",
      format: "示例資料",
    })
    setUploadStatus("success")
    setUploadError("")
    setSourceError("")
  }
  const handleUpload = (file?: File) => {
    if (!file) return
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setUploadStatus("error")
      setUploadError("不支援此檔案格式，請上傳 PNG、JPG 或 WebP 圖片。")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus("error")
      setUploadError("圖片超過 10MB，請選擇較小的檔案。")
      return
    }
    setUploadStatus("validating")
    setUploadError("")
    const reader = new FileReader()
    reader.onerror = () => {
      setUploadStatus("error")
      setUploadError("無法讀取圖片，請重新選擇檔案。")
    }
    reader.onload = () => {
      const previewUrl = String(reader.result)
      const image = new Image()
      image.onerror = () => {
        setUploadStatus("error")
        setUploadError("無法讀取圖片，請重新選擇檔案。")
      }
      image.onload = () => {
        if (!image.naturalWidth || !image.naturalHeight) {
          setUploadStatus("error")
          setUploadError("無法取得圖片尺寸，請重新選擇檔案。")
          return
        }
        setSource({
          kind: "upload",
          name: file.name,
          previewUrl,
          format:
            file.type === "image/jpeg"
              ? "JPG"
              : file.type.split("/")[1].toUpperCase(),
          width: image.naturalWidth,
          height: image.naturalHeight,
          size: file.size,
        })
        setUploadStatus("success")
        setUploadError("")
        setSourceError("")
      }
      image.src = previewUrl
    }
    reader.readAsDataURL(file)
  }
  return (
    <main className="landing" id="home" lang="zh-HK">
      <section className="hero">
        <div className="hero-glow glow-one" />
        <div className="hero-glow glow-two" />
        <h1>
          已有訂閱頁面，面向不同市場。
          <br />
          <em>AI 本地化重新設計。</em>
        </h1>
        <p className="hero-copy">
          上傳現有訂閱頁面，調整內容、版面、配色及訂閱方案展示。
        </p>
        <div
          className={`prompt-shell localization-composer ${
            sourceError ? "has-error" : ""
          }`}
        >
          <input
            ref={fileRef}
            className="source-file-input"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onClick={(event) => {
              event.currentTarget.value = ""
            }}
            onChange={(event) => handleUpload(event.target.files?.[0])}
          />
          <div className="source-area">
            {uploadStatus === "validating" ? (
              <div className="source-validating" role="status">
                <span className="spinner" />
                <div>
                  <b>正在檢查圖片……</b>
                  <small>正在確認檔案格式、大小及圖片尺寸。</small>
                </div>
              </div>
            ) : source ? (
              <div className="source-selected">
                <div className={`source-thumbnail ${source.kind}`}>
                  {source.previewUrl ? (
                    <img src={source.previewUrl} alt="已上傳的原始訂閱頁面" />
                  ) : (
                    <span>
                      <Icon name="sparkles" size={20} />
                    </span>
                  )}
                </div>
                <div className="source-file-meta">
                  <b>
                    <Icon name="check" size={15} />
                    原始訂閱頁面已加入
                  </b>
                  <span title={source.name}>{source.name}</span>
                  <small>
                    {source.format}
                    {source.width && source.height
                      ? ` · ${source.width} × ${source.height}px`
                      : ""}
                  </small>
                </div>
                <div className="source-actions">
                  <button onClick={() => fileRef.current?.click()}>更換</button>
                  <button
                    className="remove-source"
                    onClick={() => {
                      setSource(null)
                      setUploadStatus("idle")
                      setUploadError("")
                      if (fileRef.current) fileRef.current.value = ""
                    }}
                  >
                    移除
                  </button>
                </div>
              </div>
            ) : (
              <div className="source-empty">
                <button
                  className="source-choice"
                  onClick={() => fileRef.current?.click()}
                >
                  <span>
                    <Icon name="upload" size={21} />
                  </span>
                  <div>
                    <b>上傳原始訂閱頁面</b>
                    <small>PNG、JPG 或 WebP</small>
                  </div>
                </button>
                <em>或</em>
                <button className="source-choice" onClick={selectSample}>
                  <span>
                    <Icon name="layout" size={21} />
                  </span>
                  <div>
                    <b>使用示例訂閱頁面</b>
                    <small>Demo Learning App</small>
                  </div>
                </button>
              </div>
            )}
            {uploadStatus === "error" && uploadError && (
              <div className="upload-error-state" role="alert">
                <span>
                  <Icon name="close" size={18} />
                </span>
                <div>
                  <b>圖片校驗失敗</b>
                  <p>{uploadError}</p>
                </div>
                <button onClick={() => fileRef.current?.click()}>
                  重新選擇圖片
                </button>
              </div>
            )}
          </div>
          <div className="prompt-entry">
            <div className="prompt-icon">
              <Icon name="wand" size={22} />
            </div>
            <textarea
              ref={promptRef}
              value={initialPrompt}
              onChange={(e) => setInitialPrompt(e.target.value)}
              placeholder="補充本地化設計要求……"
              aria-label="本地化設計要求"
            />
          </div>
          <button
            className="button button-dark prompt-button"
            onClick={startLocalization}
          >
            開始本地化設計 <Icon name="arrow" size={18} />
          </button>
          {sourceError && (
            <p className="source-error" role="alert">
              <Icon name="info" size={15} />
              {sourceError}
            </p>
          )}
        </div>
      </section>

      <LandingShowcase />

      <section className="section how merged-workflow" id="features">
        <span className="anchor-target" id="how" />
        <div className="center-heading">
          <h2>不只是翻譯，更是已有訂閱頁面的本地化改造</h2>
        </div>
        <div className="steps">
          {steps.map(([icon, title], i) => (
            <div className="step" key={title}>
              <span className="step-number">0{i + 1}</span>
              <span className="step-icon">
                <Icon name={icon} size={20} />
              </span>
              <h3>{title}</h3>
              {i < 3 && <span className="step-line" />}
            </div>
          ))}
        </div>
        <button
          className="button button-dark workflow-cta"
          onClick={startLocalization}
        >
          開始本地化設計 <Icon name="arrow" size={18} />
        </button>
      </section>

      <footer>
        <Logo onClick={() => scrollTo({ top: 0, behavior: "smooth" })} />
        <span>為不同市場而設的 AI 訂閱頁面設計工具。</span>
        <span>CityUHK IS5542 · GenAI MVP</span>
      </footer>
    </main>
  )
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="segmented">
      {options.map((o) => (
        <button
          key={o.value}
          className={value === o.value ? "active" : ""}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function ProductSummary({
  product,
  market,
  onEdit,
  confirmed,
}: {
  product: Product
  market: Market
  onEdit: () => void
  confirmed?: boolean
}) {
  const price =
    market === "us"
      ? `USD ${product.usMonthly} / ${product.usAnnual}`
      : `HKD ${product.hkMonthly} / ${product.hkAnnual}`
  return (
    <div className="product-summary">
      <div className="product-top">
        <div className="app-symbol">
          <Icon name="sparkles" size={18} />
        </div>
        <div>
          <strong>{product.name}</strong>
          <span>{product.description}</span>
        </div>
        <button onClick={onEdit}>
          <Icon name="edit" size={14} /> 編輯資料
        </button>
      </div>
      <div className="summary-metrics">
        <span>
          <b>月費／年費</b> 方案
        </span>
        <span>
          <b>3 天</b> 試用
        </span>
        <span>
          <b>{confirmed ? "已確認" : "待確認"}</b> 資料
        </span>
      </div>
      <div className="current-price">
        <span>{marketData[market].label}已確認價格</span>
        <b>{price}</b>
      </div>
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="select-wrap">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {children}
        </select>
        <Icon name="chevron" size={15} />
      </div>
    </label>
  )
}

function ProductDrawer({
  open,
  product,
  onClose,
  onSave,
}: {
  open: boolean
  product: Product
  onClose: () => void
  onSave: (p: Product) => void
}) {
  const [draft, setDraft] = useState(product)
  const [jsonOpen, setJsonOpen] = useState(false)
  const [jsonValue, setJsonValue] = useState("")
  const [error, setError] = useState("")
  useEffect(() => setDraft(product), [product, open])
  const update = (key: keyof Product, value: string | string[]) =>
    setDraft((p) => ({ ...p, [key]: value }))
  const importJson = () => {
    try {
      const parsed = JSON.parse(jsonValue)
      if (!parsed.name || !Array.isArray(parsed.benefits))
        throw new Error("Required fields are missing")
      setDraft({ ...draft, ...parsed, benefits: parsed.benefits.slice(0, 6) })
      setError("")
      setJsonOpen(false)
    } catch {
      setError("JSON 格式無效。請至少包括「name」及「benefits」陣列。")
    }
  }
  return (
    <>
      <div
        className={`drawer-backdrop ${open ? "show" : ""}`}
        onClick={onClose}
      />
      <aside className={`drawer ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="drawer-header">
          <div>
            <span className="kicker">已確認的產品資料</span>
            <h2>編輯產品資料</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <div className="drawer-body">
          <button
            className="import-button"
            onClick={() => setJsonOpen(!jsonOpen)}
          >
            <Icon name="upload" size={17} />
            <span>
              <b>匯入產品 JSON</b>
              <small>只支援通過驗證的結構化資料</small>
            </span>
            <Icon name="chevron" size={15} />
          </button>
          {jsonOpen && (
            <div className="json-box">
              <textarea
                value={jsonValue}
                onChange={(e) => setJsonValue(e.target.value)}
                placeholder={'{"name":"Learning App","benefits":["..."]}'}
              />
              <button
                className="button button-dark button-small"
                onClick={importJson}
              >
                驗證並匯入
              </button>
              {error && <p className="field-error">{error}</p>}
            </div>
          )}
          <div className="form-grid">
            <label className="field">
              <span>產品名稱</span>
              <input
                value={draft.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </label>
            <label className="field">
              <span>產品類別</span>
              <input
                value={draft.category}
                onChange={(e) => update("category", e.target.value)}
              />
            </label>
          </div>
          <label className="field">
            <span>產品簡介</span>
            <textarea
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </label>
          <label className="field">
            <span>目標用戶</span>
            <input
              value={draft.audience}
              onChange={(e) => update("audience", e.target.value)}
            />
          </label>
          <label className="field">
            <span>
              會員權益 <small>每行一項</small>
            </span>
            <textarea
              rows={4}
              value={draft.benefits.join("\n")}
              onChange={(e) =>
                update("benefits", e.target.value.split("\n").filter(Boolean))
              }
            />
          </label>
          <div className="drawer-section-title">已確認的方案價格</div>
          <div className="price-grid">
            <label className="field">
              <span>美國月費方案 · USD</span>
              <input
                value={draft.usMonthly}
                onChange={(e) => update("usMonthly", e.target.value)}
              />
            </label>
            <label className="field">
              <span>美國年費方案 · USD</span>
              <input
                value={draft.usAnnual}
                onChange={(e) => update("usAnnual", e.target.value)}
              />
            </label>
            <label className="field">
              <span>香港月費方案 · HKD</span>
              <input
                value={draft.hkMonthly}
                onChange={(e) => update("hkMonthly", e.target.value)}
              />
            </label>
            <label className="field">
              <span>香港年費方案 · HKD</span>
              <input
                value={draft.hkAnnual}
                onChange={(e) => update("hkAnnual", e.target.value)}
              />
            </label>
          </div>
          <label className="field">
            <span>免費試用條款</span>
            <input
              value={draft.trial}
              onChange={(e) => update("trial", e.target.value)}
            />
          </label>
          <label className="field">
            <span>續訂說明</span>
            <textarea
              rows={3}
              value={draft.renewal}
              onChange={(e) => update("renewal", e.target.value)}
            />
          </label>
        </div>
        <div className="drawer-footer">
          <button className="button button-light" onClick={onClose}>
            取消
          </button>
          <button
            className="button button-dark"
            onClick={() => {
              onSave(draft)
              onClose()
            }}
          >
            儲存變更
          </button>
        </div>
      </aside>
    </>
  )
}

function InitialProductDrawer({
  open,
  product,
  confirmed,
  onClose,
  onConfirm,
}: {
  open: boolean
  product: Product
  confirmed: boolean
  onClose: () => void
  onConfirm: (product: Product) => void
}) {
  const [draft, setDraft] = useState(product)
  const [errors, setErrors] = useState<Record<string, string>>({})
  useEffect(() => {
    if (open) {
      setDraft(product)
      setErrors({})
    }
  }, [open, product])
  const update = (key: keyof Product, value: string | string[]) => {
    setDraft((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: "" }))
  }
  const confirm = () => {
    const nextErrors: Record<string, string> = {}
    if (!draft.name.trim()) nextErrors.name = "請輸入產品名稱。"
    const priceFields: Array<keyof Product> = [
      "usMonthly",
      "usAnnual",
      "hkMonthly",
      "hkAnnual",
    ]
    priceFields.forEach((key) => {
      const amount = Number(draft[key])
      if (!draft[key] || !Number.isFinite(amount) || amount <= 0)
        nextErrors[key] =
          key === "usMonthly" || key === "hkMonthly"
            ? "請輸入有效的月費金額。"
            : "請輸入有效的年費金額。"
    })
    if (!draft.trial.trim()) nextErrors.trial = "請確認免費試用的適用條件。"
    if (!draft.benefits.length) nextErrors.benefits = "請至少輸入一項會員權益。"
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    onConfirm(draft)
    onClose()
  }
  return (
    <>
      <div
        className={`drawer-backdrop ${open ? "show" : ""}`}
        onClick={onClose}
      />
      <aside
        className={`drawer initial-product-drawer ${open ? "open" : ""}`}
        aria-hidden={!open}
      >
        <div className="drawer-header">
          <div>
            <span className="kicker">產品資料</span>
            <h2>確認產品及訂閱資料</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="關閉">
            <Icon name="close" />
          </button>
        </div>
        <div className="drawer-body">
          <div
            className={`drawer-confirmation-status ${
              confirmed ? "confirmed" : ""
            }`}
          >
            <Icon name={confirmed ? "check" : "info"} size={19} />
            <div>
              <b>{confirmed ? "訂閱資料已確認" : "訂閱資料待確認"}</b>
              <p>
                {confirmed
                  ? "如修改價格、試用或權益，請重新確認。"
                  : "圖片不代表系統已準確識別商業資料，請逐項確認。"}
              </p>
            </div>
          </div>

          <label className={`field ${errors.name ? "field-invalid" : ""}`}>
            <span>產品名稱</span>
            <input
              value={draft.name}
              onChange={(event) => update("name", event.target.value)}
            />
            {errors.name && (
              <small className="field-error">{errors.name}</small>
            )}
          </label>

          <div className="drawer-section-title">美國方案 · USD</div>
          <div className="price-grid">
            <label
              className={`field ${errors.usMonthly ? "field-invalid" : ""}`}
            >
              <span>月費金額</span>
              <input
                inputMode="decimal"
                value={draft.usMonthly}
                onChange={(event) => update("usMonthly", event.target.value)}
              />
              {errors.usMonthly && (
                <small className="field-error">{errors.usMonthly}</small>
              )}
            </label>
            <label
              className={`field ${errors.usAnnual ? "field-invalid" : ""}`}
            >
              <span>年費金額</span>
              <input
                inputMode="decimal"
                value={draft.usAnnual}
                onChange={(event) => update("usAnnual", event.target.value)}
              />
              {errors.usAnnual && (
                <small className="field-error">{errors.usAnnual}</small>
              )}
            </label>
          </div>

          <div className="drawer-section-title">香港方案 · HKD</div>
          <div className="price-grid">
            <label
              className={`field ${errors.hkMonthly ? "field-invalid" : ""}`}
            >
              <span>月費金額</span>
              <input
                inputMode="decimal"
                value={draft.hkMonthly}
                onChange={(event) => update("hkMonthly", event.target.value)}
              />
              {errors.hkMonthly && (
                <small className="field-error">{errors.hkMonthly}</small>
              )}
            </label>
            <label
              className={`field ${errors.hkAnnual ? "field-invalid" : ""}`}
            >
              <span>年費金額</span>
              <input
                inputMode="decimal"
                value={draft.hkAnnual}
                onChange={(event) => update("hkAnnual", event.target.value)}
              />
              {errors.hkAnnual && (
                <small className="field-error">{errors.hkAnnual}</small>
              )}
            </label>
          </div>

          <label className={`field ${errors.trial ? "field-invalid" : ""}`}>
            <span>免費試用條款</span>
            <input
              value={draft.trial}
              onChange={(event) => update("trial", event.target.value)}
            />
            {errors.trial && (
              <small className="field-error">{errors.trial}</small>
            )}
          </label>

          <label className={`field ${errors.benefits ? "field-invalid" : ""}`}>
            <span>會員權益（每行一項）</span>
            <textarea
              rows={4}
              value={draft.benefits.join("\n")}
              onChange={(event) =>
                update(
                  "benefits",
                  event.target.value.split("\n").filter(Boolean),
                )
              }
            />
            {errors.benefits && (
              <small className="field-error">{errors.benefits}</small>
            )}
          </label>

          <label className="field">
            <span>續訂說明</span>
            <textarea
              rows={3}
              value={draft.renewal}
              onChange={(event) => update("renewal", event.target.value)}
            />
          </label>
        </div>
        <div className="drawer-footer">
          <button className="button button-light" onClick={onClose}>
            取消
          </button>
          <button className="button button-dark" onClick={confirm}>
            儲存資料
          </button>
        </div>
      </aside>
    </>
  )
}

function ProductDataUtilityDrawer({
  mode,
  product,
  inputData,
  onClose,
  onImport,
}: {
  mode: "import" | "view" | null
  product: Product
  inputData: Record<string, unknown>
  onClose: () => void
  onImport: (product: Product) => void
}) {
  const [jsonValue, setJsonValue] = useState("")
  const [error, setError] = useState("")
  useEffect(() => {
    if (mode === "import") {
      setJsonValue("")
      setError("")
    }
  }, [mode])
  const importData = () => {
    try {
      const parsed = JSON.parse(jsonValue)
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
        throw new Error("invalid")
      onImport({
        ...product,
        name: parsed.name === undefined ? product.name : String(parsed.name),
        category:
          parsed.category === undefined
            ? product.category
            : String(parsed.category),
        description:
          parsed.description === undefined
            ? product.description
            : String(parsed.description),
        audience:
          parsed.audience === undefined
            ? product.audience
            : String(parsed.audience),
        benefits: Array.isArray(parsed.benefits)
          ? parsed.benefits.map(String)
          : product.benefits,
        usMonthly:
          parsed.usMonthly === undefined
            ? product.usMonthly
            : String(parsed.usMonthly),
        usAnnual:
          parsed.usAnnual === undefined
            ? product.usAnnual
            : String(parsed.usAnnual),
        hkMonthly:
          parsed.hkMonthly === undefined
            ? product.hkMonthly
            : String(parsed.hkMonthly),
        hkAnnual:
          parsed.hkAnnual === undefined
            ? product.hkAnnual
            : String(parsed.hkAnnual),
        trial:
          parsed.trial === undefined ? product.trial : String(parsed.trial),
        renewal:
          parsed.renewal === undefined
            ? product.renewal
            : String(parsed.renewal),
      })
      onClose()
    } catch {
      setError("JSON 格式無效，請檢查欄位名稱及資料格式。")
    }
  }
  return (
    <>
      <div
        className={`drawer-backdrop ${mode ? "show" : ""}`}
        onClick={onClose}
      />
      <aside
        className={`drawer data-utility-drawer ${mode ? "open" : ""}`}
        aria-hidden={!mode}
      >
        <div className="drawer-header">
          <div>
            <span className="kicker">產品與訂閱資料</span>
            <h2>{mode === "import" ? "匯入產品資料" : "完整輸入資料"}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="關閉">
            <Icon name="close" />
          </button>
        </div>
        <div className="drawer-body">
          {mode === "import" ? (
            <>
              <div className="utility-note">
                <Icon name="info" size={18} />
                <p>
                  匯入結構化 JSON 產品資料。此操作不會更換原始 Paywall
                  圖片，匯入後需要重新確認資料。
                </p>
              </div>
              <label className={`field ${error ? "field-invalid" : ""}`}>
                <span>產品資料 JSON</span>
                <textarea
                  className="product-json-input"
                  value={jsonValue}
                  onChange={(event) => {
                    setJsonValue(event.target.value)
                    setError("")
                  }}
                  placeholder={`{
  "name": "Demo Learning App",
  "hkMonthly": "38",
  "hkAnnual": "298",
  "trial": "3 days for eligible users",
  "benefits": ["Unlimited Practice"]
}`}
                />
                {error && <small className="field-error">{error}</small>}
              </label>
            </>
          ) : (
            <>
              <div className="utility-note">
                <Icon name="info" size={18} />
                <p>
                  以下為目前前端原型使用的完整輸入資料，只供檢視，不會自動傳送至外部服務。
                </p>
              </div>
              <pre className="input-payload-view">
                {JSON.stringify(inputData, null, 2)}
              </pre>
            </>
          )}
        </div>
        <div className="drawer-footer">
          <button className="button button-light" onClick={onClose}>
            關閉
          </button>
          {mode === "import" && (
            <button className="button button-dark" onClick={importData}>
              匯入並套用
            </button>
          )}
        </div>
      </aside>
    </>
  )
}

function PlanCard({
  annual,
  market,
  highlighted,
  selected,
  product,
  generated,
  language = "English",
}: {
  annual: boolean
  market: Market
  highlighted?: boolean
  selected?: boolean
  product: Product
  generated?: boolean
  language?: Language
}) {
  const amount =
    market === "us"
      ? annual
        ? product.usAnnual
        : product.usMonthly
      : annual
        ? product.hkAnnual
        : product.hkMonthly
  const currency = market === "us" ? "US$" : "HK$"
  const traditional = generated && language === "繁體中文"
  const simplified = generated && language === "简体中文"
  return (
    <div
      className={`plan-card ${highlighted ? "highlighted" : ""} ${
        selected ? "selected" : ""
      }`}
    >
      <span className="radio">
        <i />
      </span>
      <div className="plan-name">
        <b>
          {annual
            ? traditional
              ? "年費方案"
              : simplified
                ? "年费方案"
                : "Annual"
            : traditional
              ? "月費方案"
              : simplified
                ? "月费方案"
                : "Monthly"}
        </b>
        <small>
          {annual
            ? traditional
              ? "每年收費"
              : simplified
                ? "每年收费"
                : "Billed yearly"
            : traditional
              ? "每月收費"
              : simplified
                ? "每月收费"
                : "Billed monthly"}
        </small>
      </div>
      <div className="plan-price">
        <b>
          {currency}
          {amount}
        </b>
        <small>
          /
          {annual
            ? traditional || simplified
              ? "年"
              : "year"
            : traditional || simplified
              ? "月"
              : "month"}
        </small>
      </div>
      {highlighted && (
        <em>
          {traditional ? "重點方案" : simplified ? "重点方案" : "Featured"}
        </em>
      )}
    </div>
  )
}

function PhonePaywall({
  type,
  market,
  goal,
  style,
  language,
  product,
}: {
  type: "original" | "generated"
  market: Market
  goal: Goal
  style: Style
  language: Language
  product: Product
}) {
  const generated = type === "generated"
  const isChinese = generated && language !== "English"
  const title = generated
    ? isChinese
      ? language === "繁體中文"
        ? "解鎖進階學習體驗"
        : "学习，从此更进一步"
      : goal === "annual"
        ? "Make Learning a Yearly Habit"
        : goal === "trial"
          ? "Start Learning Today"
          : "Everything You Need to Grow"
    : "Unlock Your Learning Potential"
  const subtitle = generated
    ? isChinese
      ? language === "繁體中文"
        ? "解鎖個人化學習體驗，按自己的節奏持續進步。"
        : "解锁个性化学习体验，按自己的节奏持续进步。"
      : "A focused plan for smarter, more consistent learning."
    : "Learn smarter with AI-powered tools built around your goals."
  const planFirst = generated && goal !== "benefits"
  const benefits = (
    <div className="benefits-list">
      {product.benefits.slice(0, 3).map((b, i) => (
        <div key={b}>
          <span>
            <Icon name="check" size={11} />
          </span>
          <p>
            {language === "繁體中文"
              ? ["無限次學習練習", "個人化學習內容", "學習進度追蹤"][i] || b
              : language === "简体中文"
                ? ["个性化学习路径", "无限 AI 练习", "学习进度分析"][i] || b
                : b}
          </p>
        </div>
      ))}
    </div>
  )
  const plans = (
    <div className="plans">
      {generated && goal === "annual" ? (
        <>
          <PlanCard
            annual
            market={market}
            product={product}
            highlighted
            selected
            generated
            language={language}
          />
          <PlanCard
            annual={false}
            market={market}
            product={product}
            generated
            language={language}
          />
        </>
      ) : (
        <>
          <PlanCard
            annual={false}
            market={market}
            product={product}
            selected={!generated}
            generated={generated}
            language={language}
          />
          <PlanCard
            annual
            market={market}
            product={product}
            highlighted={generated}
            generated={generated}
            language={language}
          />
        </>
      )}
    </div>
  )
  return (
    <div className={`phone ${type} style-${style}`}>
      <div className="phone-speaker" />
      <div className="paywall-content">
        <div className="phone-topline">
          <span>{type === "original" ? "9:41" : "9:42"}</span>
          <span className="phone-status">● ◒</span>
        </div>
        <button className="phone-close">×</button>
        <div className="paywall-brand">
          <span>
            <Icon name="sparkles" size={18} />
          </span>
          <b>{product.name}</b>
        </div>
        <div className="paywall-copy">
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        {planFirst ? (
          <>
            {plans}
            {benefits}
          </>
        ) : (
          <>
            {benefits}
            {plans}
          </>
        )}
        <button className="paywall-cta">
          {isChinese
            ? language === "繁體中文"
              ? "開始 Premium 體驗"
              : "继续使用 Premium"
            : generated && goal === "trial"
              ? "Start 3-Day Trial"
              : "Continue with Premium"}{" "}
          <Icon name="arrow" size={13} />
        </button>
        <p className="terms">
          {language === "繁體中文"
            ? "符合資格的使用者可享 3 天免費試用。訂閱將自動續期，可隨時取消。"
            : language === "简体中文"
              ? "符合资格的用户可免费试用 3 天。订阅将自动续期，可随时取消。"
              : `${product.trial}. ${product.renewal}`}
        </p>
        <div className="demo-note">
          {generated && language === "繁體中文"
            ? "虛構訂閱資料，僅供示範。"
            : generated && language === "简体中文"
              ? "虚构订阅数据，仅供演示。"
              : "Fictional subscription data for demonstration only."}
        </div>
      </div>
    </div>
  )
}

function EmptyGenerated() {
  return (
    <div className="empty-generated">
      <span>
        <Icon name="wand" size={28} />
      </span>
      <h3>等待本地化改版</h3>
      <p>完成設定及資料確認後，本地化版本會顯示在這裏。</p>
    </div>
  )
}

const Status = ({
  type,
  children,
}: {
  type: "pass" | "review" | "issue"
  children: React.ReactNode
}) => (
  <span className={`status ${type}`}>
    <i />
    {children}
  </span>
)

function DesignReview({
  market,
  goal,
  language,
  generated,
  stale,
}: {
  market: Market
  goal: Goal
  language: Language
  generated: boolean
  stale: boolean
}) {
  const [openCard, setOpenCard] = useState(0)
  const changes = [
    [
      "內容已更新",
      language === "English"
        ? "文案已按所選市場及設計目標調整，產品資料維持不變。"
        : `標題及 CTA 已配合${languageLabels[language]}輸出調整。`,
    ],
    [
      "版面已調整",
      goal === "benefits"
        ? "會員權益已移至訂閱方案之前，以配合所選設計目標。"
        : "訂閱方案已移至會員權益之前，讓方案更早顯示。",
    ],
    [
      "方案展示已修改",
      goal === "annual"
        ? "年費方案已移至月費方案上方，並加入視覺強調。"
        : "方案次序及強調方式已配合所選設計目標。",
    ],
    ["視覺風格已調整", "字體、間距及介面配色已按所選視覺方向調整。"],
  ]
  if (!generated)
    return (
      <div className="review-empty">
        <span>
          <Icon name="shield" size={28} />
        </span>
        <h3>請先生成設計以進行檢查</h3>
        <p>設計檢查會說明可見改動，並核對重要訂閱資料。</p>
      </div>
    )
  return (
    <div className="review-grid">
      {stale && (
        <div className="stale-alert">
          <Icon name="info" size={17} />
          <div>
            <b>生成設計後輸入內容已變更</b>
            <p>請重新生成設計，再使用這份檢查結果。</p>
          </div>
        </div>
      )}
      <section className="review-panel changes-panel">
        <div className="panel-heading">
          <div>
            <span className="kicker">設計修改說明</span>
            <h3>AI 修改了甚麼？</h3>
          </div>
          <span className="demo-badge">示範模擬</span>
        </div>
        <div className="change-list">
          {changes.map((c, i) => (
            <button
              className={openCard === i ? "open" : ""}
              onClick={() => setOpenCard(openCard === i ? -1 : i)}
              key={c[0]}
            >
              <span className="change-icon">
                <Icon
                  name={["edit", "layout", "chart", "palette"][i]}
                  size={17}
                />
              </span>
              <div>
                <b>{c[0]}</b>
                {openCard === i && <p>{c[1]}</p>}
              </div>
              <Icon name="chevron" size={15} />
            </button>
          ))}
        </div>
      </section>
      <section className="review-panel facts-panel">
        <div className="panel-heading">
          <div>
            <span className="kicker">商業資料核對</span>
            <h3>訂閱資料檢查</h3>
          </div>
          <Status type="review">需要人工確認</Status>
        </div>
        <div className="fact-list">
          {[
            ["方案價格", `${marketData[market].currency} 已確認數值`],
            ["貨幣", marketData[market].currency],
            ["收費週期", "月費／年費"],
            ["免費試用條款", "已保留資格條件"],
            ["會員權益", "3 項已確認權益"],
          ].map((x) => (
            <div key={x[0]}>
              <span>
                <b>{x[0]}</b>
                <small>{x[1]}</small>
              </span>
              <Status type="review">需要確認</Status>
            </div>
          ))}
        </div>
      </section>
      <section className="review-panel brand-panel">
        <div className="panel-heading">
          <div>
            <span className="kicker">視覺規範</span>
            <h3>品牌規範檢查</h3>
          </div>
          <Status type="review">需要人工確認</Status>
        </div>
        <div className="brand-check">
          <div className="swatches">
            <i style={{ background: "#17171d" }} />
            <i style={{ background: "#b8a7ff" }} />
            <i style={{ background: "#f4f1ff" }} />
          </div>
          <div>
            <b>已使用允許的品牌顏色</b>
            <p>
              未偵測到禁止使用的顏色。主要文字的對比度已通過，建議再由人手確認。
            </p>
          </div>
        </div>
      </section>
      <section className="review-panel summary-panel">
        <div className="panel-heading">
          <div>
            <span className="kicker">生成資料</span>
            <h3>生成摘要</h3>
          </div>
        </div>
        <div className="summary-list">
          <div>
            <span>設計目標</span>
            <b>
              {goal === "annual"
                ? "突出年費方案"
                : goal === "trial"
                  ? "突出免費試用"
                  : "突出會員權益"}
            </b>
          </div>
          <div>
            <span>輸出語言</span>
            <b>{languageLabels[language]}</b>
          </div>
          <div>
            <span>狀態</span>
            <Status type={stale ? "review" : "pass"}>
              {stale ? "需要重新生成" : "示範設計已完成"}
            </Status>
          </div>
          <div>
            <span>API 成本／時間</span>
            <b>不適用 · 示例資料</b>
          </div>
        </div>
      </section>
    </div>
  )
}

function EvaluationDashboard() {
  const kpis = [
    ["設計要求完成率", "—", "尚未提供實際測試數據", "check"],
    ["訂閱資料準確率", "—", "尚待建立驗證資料集", "shield"],
    ["人工評分", "—", "尚待評審小組評分", "sparkles"],
    ["生成時間", "—", "尚未連接 API", "clock"],
  ]
  const rows = [
    "設計目標符合程度",
    "訂閱資料準確程度",
    "人工評分",
    "完成時間",
    "模型使用成本",
    "人工修改時間",
  ]
  return (
    <div className="evaluation">
      <div className="evaluation-note">
        <Icon name="info" size={17} />
        <p>
          <b>成效評估框架 · 尚未提供實際測試數據。</b>
          目前尚未進行正式實驗，所有數值維持空白，避免將示例資料誤解為實際測試結果。
        </p>
      </div>
      <div className="kpi-grid">
        {kpis.map((k) => (
          <div className="kpi-card" key={k[0]}>
            <span>
              <Icon name={k[3]} size={19} />
            </span>
            <small>{k[0]}</small>
            <b>{k[1]}</b>
            <p>{k[2]}</p>
          </div>
        ))}
      </div>
      <div className="evaluation-main">
        <section className="comparison-table">
          <div className="panel-heading">
            <div>
              <span className="kicker">未來實驗</span>
              <h3>一般 AI 與 MarketMorph 的表現比較</h3>
            </div>
            <span className="placeholder-badge">尚未測試</span>
          </div>
          <div className="table-head">
            <span>評估指標</span>
            <b>一般 AI</b>
            <b>MarketMorph</b>
          </div>
          {rows.map((r) => (
            <div className="table-row" key={r}>
              <span>{r}</span>
              <i>尚未測量</i>
              <i>尚未測量</i>
            </div>
          ))}
        </section>
        <section className="impact-panel">
          <div className="panel-heading">
            <div>
              <span className="kicker">商業效益</span>
              <h3>日後將會量度的項目</h3>
            </div>
          </div>
          <div className="impact-item">
            <span>
              <Icon name="clock" size={18} />
            </span>
            <div>
              <b>預計節省時間</b>
              <p>比較原有流程與新流程所需時間</p>
            </div>
            <em>—</em>
          </div>
          <div className="impact-item">
            <span>
              <Icon name="chart" size={18} />
            </span>
            <div>
              <b>預計工作流程成本</b>
              <p>模型使用成本加上人工修改時間</p>
            </div>
            <em>—</em>
          </div>
          <div className="assumptions">
            <b>評估假設</b>
            <p>
              兩種流程會使用相同的產品資料、設計要求及評分準則。樣本數量及評審背景仍有待確認。
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

function Studio({
  prompt,
  setPage,
}: {
  prompt: string
  setPage: (p: "home" | "studio") => void
}) {
  const [product, setProduct] = useState<Product>(() =>
    source?.kind === "upload"
      ? {
          ...defaultProduct,
          name: "",
          description: "待確認的產品資料",
          benefits: [],
          usMonthly: "",
          usAnnual: "",
          hkMonthly: "",
          hkAnnual: "",
          trial: "",
        }
      : defaultProduct,
  )
  const [market, setMarket] = useState<Market>("hk")
  const [goal, setGoal] = useState<Goal>("annual")
  const [style, setStyle] = useState<Style>("minimal")
  const [language, setLanguage] = useState<Language>("繁體中文")
  const [languageTouched, setLanguageTouched] = useState(false)
  const [instructions, setInstructions] = useState(prompt)
  const [advanced, setAdvanced] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [stale, setStale] = useState(false)
  const [tab, setTab] = useState<StudioTab>("compare")
  const [mobilePreview, setMobilePreview] = useState<"original" | "generated">(
    "generated",
  )
  const [allowedColors, setAllowedColors] = useState(
    "#17171D, #B8A7FF, #F4F1FF",
  )
  const [forbiddenColors, setForbiddenColors] = useState("#FF2D55")
  const [restrictions, setRestrictions] = useState(
    "不得更改已確認的價格資料，並確保文字有足夠對比度。",
  )
  const markStale = () => generated && setStale(true)
  const changeMarket = (next: Market) => {
    setMarket(next)
    if (!languageTouched) setLanguage(next === "hk" ? "繁體中文" : "English")
    markStale()
  }
  const generate = () => {
    setGenerating(true)
    setTab("compare")
    window.setTimeout(() => {
      setGenerating(false)
      setGenerated(true)
      setStale(false)
    }, 1100)
  }
  const goalLabel = useMemo(
    () =>
      ({
        annual: "突出年費方案",
        trial: "突出免費試用",
        benefits: "突出會員權益",
      })[goal],
    [goal],
  )
  return (
    <main className="studio-page" lang="zh-HK">
      <div className="studio-nav">
        <Logo onClick={() => setPage("home")} />
        <span className="studio-divider" />
        <span className="studio-title">
          設計工作台 <i>示範</i>
        </span>
        <button className="back-home" onClick={() => setPage("home")}>
          返回網站
        </button>
      </div>
      <div className="studio-shell">
        <aside className="setup-panel">
          <div className="setup-heading">
            <div>
              <span className="kicker">設計設定</span>
              <h1>設計你的訂閱頁面</h1>
            </div>
            <button
              className="icon-button"
              title="重設示範"
              onClick={() => {
                setProduct(defaultProduct)
                setMarket("hk")
                setGoal("annual")
                setStyle("minimal")
                setLanguage("繁體中文")
                setGenerated(false)
                setStale(false)
              }}
            >
              <Icon name="reset" size={17} />
            </button>
          </div>
          <ProductSummary
            product={product}
            market={market}
            onEdit={() => setDrawer(true)}
          />
          <div className="input-stack">
            <div className="input-block">
              <div className="label-row">
                <label>目標市場</label>
                <small>同步更新已確認資料</small>
              </div>
              <Segmented
                value={market}
                onChange={changeMarket}
                options={[
                  { value: "us", label: "美國" },
                  { value: "hk", label: "香港" },
                ]}
              />
            </div>
            <div className="input-block">
              <label>設計目標</label>
              <SelectField
                label=""
                value={goal}
                onChange={(v) => {
                  setGoal(v as Goal)
                  markStale()
                }}
              >
                <option value="annual">突出年費方案</option>
                <option value="trial">突出免費試用</option>
                <option value="benefits">突出會員權益</option>
              </SelectField>
            </div>
            <div className="input-block">
              <label>視覺風格</label>
              <div className="style-options">
                {([
                  {
                    id: "minimal",
                    label: "簡約風格",
                    colors: ["#fff", "#b8a7ff"],
                  },
                  {
                    id: "tech",
                    label: "現代科技風格",
                    colors: ["#17171d", "#8fa5ff"],
                  },
                  {
                    id: "warm",
                    label: "溫暖親切風格",
                    colors: ["#fff5ea", "#efad88"],
                  },
                ] as const).map((x) => (
                  <button
                    className={style === x.id ? "active" : ""}
                    onClick={() => {
                      setStyle(x.id)
                      markStale()
                    }}
                    key={x.id}
                  >
                    <span>
                      <i style={{ background: x.colors[0] }} />
                      <i style={{ background: x.colors[1] }} />
                    </span>
                    {x.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="field instructions">
              <span>
                補充要求 <small>選填</small>
              </span>
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => {
                  setInstructions(e.target.value)
                  markStale()
                }}
                placeholder="請告訴 AI 你還希望調整甚麼，例如突出年費方案、保持簡潔佈局，或讓訂閱按鈕更顯眼。"
              />
            </label>
          </div>
          <div className={`advanced ${advanced ? "open" : ""}`}>
            <button
              className="advanced-toggle"
              onClick={() => setAdvanced(!advanced)}
            >
              <span>
                <Icon name="layout" size={16} />
                進階設定
              </span>
              <Icon name="chevron" size={15} />
            </button>
            {advanced && (
              <div className="advanced-body">
                <SelectField
                  label="輸出語言"
                  value={language}
                  onChange={(v) => {
                    setLanguage(v as Language)
                    setLanguageTouched(true)
                    markStale()
                  }}
                >
                  <option value="English">英語</option>
                  <option value="繁體中文">繁體中文（香港）</option>
                  <option value="简体中文">簡體中文</option>
                </SelectField>
                <div className="form-grid">
                  <label className="field">
                    <span>品牌允許使用的顏色</span>
                    <input
                      value={allowedColors}
                      onChange={(e) => setAllowedColors(e.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>品牌禁止使用的顏色</span>
                    <input
                      value={forbiddenColors}
                      onChange={(e) => setForbiddenColors(e.target.value)}
                    />
                  </label>
                </div>
                <label className="field">
                  <span>品牌限制</span>
                  <textarea
                    rows={2}
                    value={restrictions}
                    onChange={(e) => setRestrictions(e.target.value)}
                  />
                </label>
                <button className="developer-input">
                  <Icon name="upload" size={16} />
                  匯入產品資料／檢視輸入資料
                </button>
              </div>
            )}
          </div>
          <div className="generate-wrap">
            <button
              className="generate-button"
              onClick={generate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <span className="spinner" />
                  AI 正在生成設計……
                </>
              ) : (
                <>
                  <Icon name="sparkles" size={17} />
                  使用 AI 生成設計 <span>示範模擬</span>
                </>
              )}
            </button>
            <p>
              <Icon name="info" size={13} /> 僅為示範模擬，尚未連接外部 AI API。
            </p>
          </div>
        </aside>

        <section className="workspace">
          <div className="workspace-header">
            <div>
              <span className="kicker">即時設計預覽</span>
              <h2>
                {tab === "evaluation"
                  ? "成效評估看板"
                  : tab === "review"
                    ? "設計檢查"
                    : "訂閱頁面預覽"}
              </h2>
              <p>
                {tab === "evaluation"
                  ? "以清晰透明的框架量度未來成效。"
                  : tab === "review"
                    ? "了解每項改動，並核對重要商業資料。"
                    : "預覽並比較本地化前後的設計。"}
              </p>
            </div>
            <div className="workspace-tabs">
              {([
                ["compare", "修改前／修改後"],
                ["review", "設計檢查"],
                ["evaluation", "成效評估"],
              ] as [StudioTab, string][]).map((t) => (
                <button
                  className={tab === t[0] ? "active" : ""}
                  onClick={() => setTab(t[0])}
                  key={t[0]}
                >
                  {t[1]}
                  {t[0] === "review" && generated && <i />}
                </button>
              ))}
            </div>
          </div>
          <div className="workspace-body">
            {tab === "compare" && (
              <>
                <div className="comparison-meta">
                  <div className="mobile-preview-tabs">
                    <button
                      className={mobilePreview === "original" ? "active" : ""}
                      onClick={() => setMobilePreview("original")}
                    >
                      原始版本
                    </button>
                    <button
                      className={mobilePreview === "generated" ? "active" : ""}
                      onClick={() => setMobilePreview("generated")}
                    >
                      AI 生成版本
                    </button>
                  </div>
                  <span>
                    <i className="legend-dot original-dot" />
                    原始版本 — 美國／英語
                  </span>
                  <span className="meta-arrow">
                    <Icon name="arrow" size={15} />
                  </span>
                  <span>
                    <i className="legend-dot generated-dot" />
                    AI 生成版本 — {marketData[market].label}／
                    {languageLabels[language]}
                  </span>
                  {stale && <b className="needs-update">需要重新生成</b>}
                </div>
                <div className={`phone-comparison show-${mobilePreview}`}>
                  <div className="phone-column original-column">
                    <div className="phone-label">
                      <span>原始版本</span>
                      <small>示例資料</small>
                    </div>
                    <PhonePaywall
                      type="original"
                      market="us"
                      goal="benefits"
                      style="tech"
                      language="English"
                      product={product}
                    />
                  </div>
                  <div className="comparison-arrow">
                    <span>
                      <Icon name="arrow" size={18} />
                    </span>
                    <small>
                      AI
                      <br />
                      調整
                    </small>
                  </div>
                  <div className="phone-column generated-column">
                    <div className="phone-label">
                      <span>AI 生成版本</span>
                      <small>示範模擬</small>
                    </div>
                    {generating ? (
                      <div className="generating-state">
                        <span className="loader-orb">
                          <Icon name="sparkles" size={25} />
                        </span>
                        <h3>AI 正在生成設計……</h3>
                        <p>
                          正在套用「{goalLabel}」，並保留所有已確認的產品資料。
                        </p>
                        <div className="progress">
                          <i />
                        </div>
                      </div>
                    ) : generated ? (
                      <PhonePaywall
                        type="generated"
                        market={market}
                        goal={goal}
                        style={style}
                        language={language}
                        product={product}
                      />
                    ) : (
                      <EmptyGenerated onGenerate={generate} />
                    )}
                  </div>
                </div>
                {generated && !generating && (
                  <button
                    className="review-nudge"
                    onClick={() => setTab("review")}
                  >
                    <span>
                      <Icon name="shield" size={18} />
                    </span>
                    <div>
                      <b>設計已生成，可以開始檢查</b>
                      <p>查看設計改動，並核對 5 項訂閱資料。</p>
                    </div>
                    <Icon name="arrow" size={17} />
                  </button>
                )}
              </>
            )}
            {tab === "review" && (
              <DesignReview
                market={market}
                goal={goal}
                language={language}
                generated={generated}
                stale={stale}
              />
            )}
            {tab === "evaluation" && <EvaluationDashboard />}
          </div>
        </section>
      </div>
      <ProductDrawer
        open={drawer}
        product={product}
        onClose={() => setDrawer(false)}
        onSave={(p) => {
          setProduct(p)
          markStale()
        }}
      />
    </main>
  )
}

function InteractiveDesignReview({
  state,
  product,
}: {
  state: "pending" | "checking" | "passed" | "issue" | "manual"
  product: Product
}) {
  const content = {
    pending: {
      icon: "clock",
      title: "等待檢查",
      text: "設計生成後，系統會檢查訂閱資料及品牌規範。",
      tone: "neutral",
    },
    checking: {
      icon: "clock",
      title: "檢查中",
      text: "正在核對訂閱資料、品牌規範及設計修改原因。",
      tone: "neutral",
    },
    passed: {
      icon: "check",
      title: "已完成檢查",
      text: "訂閱價格、試用條款和品牌限制均符合已確認資料。",
      tone: "success",
    },
    issue: {
      icon: "close",
      title: "發現需要處理的問題",
      text: `年費方案顯示金額與已確認的 HK$${product.hkAnnual} 不一致。`,
      tone: "error",
    },
    manual: {
      icon: "info",
      title: "部分內容需要人工確認",
      text: "系統無法確認部分品牌表述是否符合要求。",
      tone: "warning",
    },
  }[state]
  const categories = [
    {
      title: "訂閱資料",
      text:
        state === "issue"
          ? "年費金額需要核對"
          : state === "pending" || state === "checking"
            ? "尚未檢查"
            : `HK$${product.hkMonthly}／HK$${product.hkAnnual}`,
      status:
        state === "issue"
          ? "發現問題"
          : state === "pending" || state === "checking"
            ? "未檢查"
            : state === "passed"
              ? "已檢查"
              : "需要確認",
    },
    {
      title: "品牌規範",
      text: "顏色限制及品牌表述",
      status:
        state === "passed"
          ? "已檢查"
          : state === "pending" || state === "checking"
            ? "未檢查"
            : "需要確認",
    },
    {
      title: "設計修改原因",
      text: "年費優先及版面排序",
      status:
        state === "pending" || state === "checking" ? "未檢查" : "需要人工確認",
    },
  ]
  return (
    <div className="interactive-review">
      <section className={`review-state-hero ${content.tone}`}>
        <span>
          <Icon name={content.icon} size={24} />
        </span>
        <div>
          <h3>{content.title}</h3>
          <p>{content.text}</p>
        </div>
      </section>
      <div className="interactive-review-grid">
        {categories.map((category) => (
          <article key={category.title}>
            <div>
              <Icon name="shield" size={19} />
              <h4>{category.title}</h4>
            </div>
            <p>{category.text}</p>
            <span>{category.status}</span>
          </article>
        ))}
      </div>
      {state === "issue" && (
        <section className="review-issue-detail">
          <h3>問題詳情</h3>
          <p>
            本地化版本的年費方案必須使用已確認的 HK$
            {product.hkAnnual}。請重新生成，或先返回產品資料檢查價格。
          </p>
        </section>
      )}
      <p className="review-demo-note">
        <Icon name="info" size={16} />
        示例演示狀態，尚未執行真實自動檢查。
      </p>
    </div>
  )
}

function LocalizationReviewCard({
  hasResult,
  generationStatus,
  reviewState,
  stale,
  onOpen,
}: {
  hasResult: boolean
  generationStatus: "idle" | "loading" | "success" | "error"
  reviewState: "pending" | "checking" | "passed" | "issue" | "manual"
  stale: boolean
  onOpen: () => void
}) {
  const state = stale
    ? "waiting"
    : generationStatus === "loading"
      ? "checking"
      : !hasResult
        ? "waiting"
        : reviewState === "pending" || reviewState === "checking"
          ? "checking"
          : reviewState === "passed"
            ? "complete"
            : reviewState === "issue"
              ? "issue"
              : "manual"
  const content = {
    waiting: {
      status: "等待生成",
      description: "完成本地化設計後，可在這裏查看檢查結果。",
      icon: "shield",
    },
    checking: {
      status: "檢查中",
      description: "核對訂閱資料與品牌要求，了解 AI 的設計理由。",
      icon: "clock",
    },
    complete: {
      status: "已完成檢查",
      description: "查看訂閱資料、品牌要求及設計修改的檢查結果。",
      icon: "check",
    },
    issue: {
      status: "發現問題",
      description: "部分設計內容需要進一步核對。",
      icon: "close",
    },
    manual: {
      status: "需人工確認",
      description: "部分設計內容需要進一步核對。",
      icon: "info",
    },
  }[state]
  const disabled = state === "waiting" || state === "checking"
  return (
    <section className={`localization-review-card state-${state}`}>
      <div className="review-card-icon">
        {state === "checking" ? (
          <span className="spinner" />
        ) : (
          <Icon name={content.icon} size={24} />
        )}
      </div>
      <div className="review-card-copy">
        <div>
          <h3>本地化設計檢查</h3>
          <span>{content.status}</span>
        </div>
        <p>{content.description}</p>
      </div>
      <button type="button" onClick={onOpen} disabled={disabled}>
        查看檢查結果 <span aria-hidden="true">→</span>
      </button>
    </section>
  )
}

function InitialStudio({
  prompt,
  setPage,
  source,
}: {
  prompt: string
  setPage: (p: "home" | "studio") => void
  source: PaywallSource | null
}) {
  const [product, setProduct] = useState<Product>(() =>
    source?.kind === "upload"
      ? {
          ...defaultProduct,
          name: "",
          description: "待確認的產品資料",
          benefits: [],
          usMonthly: "",
          usAnnual: "",
          hkMonthly: "",
          hkAnnual: "",
          trial: "",
        }
      : defaultProduct,
  )
  const [market, setMarket] = useState<Market>("hk")
  const [goal, setGoal] = useState<Goal>("annual")
  const [style, setStyle] = useState<Style>("minimal")
  const [language, setLanguage] = useState<Language>("繁體中文")
  const [languageTouched, setLanguageTouched] = useState(false)
  const [instructions, setInstructions] = useState(prompt)
  const [advanced, setAdvanced] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [dataUtility, setDataUtility] = useState<"import" | "view" | null>(null)
  const [confirmationState, setConfirmationState] =
    useState<"pending" | "checking" | "confirmed" | "error" | "updated">(
      "pending",
    )
  const [confirmationMessage, setConfirmationMessage] = useState("")
  const [generationStatus, setGenerationStatus] =
    useState<"idle" | "loading" | "success" | "error">("idle")
  const [generationError, setGenerationError] = useState("")
  const [preflightError, setPreflightError] = useState("")
  const [demoOutcome, setDemoOutcome] =
    useState<"success" | "service" | "network" | "invalid" | "timeout">(
      "success",
    )
  const [reviewState, setReviewState] =
    useState<"pending" | "checking" | "passed" | "issue" | "manual">("manual")
  const [resultStale, setResultStale] = useState(false)
  const [resultView, setResultView] = useState<"compare" | "review">("compare")
  const [generatedConfig, setGeneratedConfig] = useState<{
    market: Market
    goal: Goal
    style: Style
    language: Language
  } | null>(null)
  const [mobilePreview, setMobilePreview] = useState<"original" | "generated">(
    "original",
  )
  const [allowedColors, setAllowedColors] = useState(
    "#17171D, #B8A7FF, #F4F1FF",
  )
  const [forbiddenColors, setForbiddenColors] = useState("#FF2D55")
  const factsConfirmed = confirmationState === "confirmed"

  const markResultStale = () => {
    if (generationStatus !== "idle") setResultStale(true)
  }
  const changeMarket = (next: Market) => {
    setMarket(next)
    if (!languageTouched) setLanguage(next === "hk" ? "繁體中文" : "English")
    if (factsConfirmed) {
      setConfirmationState("updated")
      setConfirmationMessage("目標市場已變更，請重新確認對應價格資料。")
    }
    markResultStale()
  }
  const validateProductData = () => {
    if (!product.name.trim()) return "請輸入產品名稱。"
    const monthly = nextMarketPrice(product, market, false)
    const annual = nextMarketPrice(product, market, true)
    if (!monthly || !Number.isFinite(Number(monthly)) || Number(monthly) <= 0)
      return `${marketData[market].label}月費方案缺少有效價格。`
    if (!annual || !Number.isFinite(Number(annual)) || Number(annual) <= 0)
      return `${marketData[market].label}年費方案缺少有效價格。`
    if (!product.trial.trim()) return "請確認免費試用的適用條件。"
    if (!product.benefits.length) return "請至少輸入一項會員權益。"
    return ""
  }
  const confirmProductData = () => {
    if (confirmationState === "checking") return
    setConfirmationState("checking")
    setConfirmationMessage("")
    window.setTimeout(() => {
      const message = validateProductData()
      if (message) {
        setConfirmationState("error")
        setConfirmationMessage(message)
        return
      }
      setConfirmationState("confirmed")
      setConfirmationMessage("套餐價格、試用條款及會員權益已確認。")
      setPreflightError("")
    }, 450)
  }
  const runGeneration = () => {
    if (generationStatus === "loading") return
    if (!source) {
      setPreflightError("請先返回首頁上傳原始訂閱頁面或選擇示例。")
      return
    }
    if (!factsConfirmed) {
      setPreflightError("請先確認套餐價格、試用條款及會員權益。")
      return
    }
    if (!market || !language || !goal) {
      setPreflightError("請完成目標市場、輸出語言及設計目標設定。")
      return
    }
    const config = { market, goal, style, language }
    setPreflightError("")
    setGenerationError("")
    setGenerationStatus("loading")
    setResultStale(false)
    setResultView("compare")
    window.setTimeout(() => {
      if (demoOutcome !== "success") {
        const messages = {
          service: "暫時無法連接 AI 服務，請稍後重試。",
          network: "網絡連線出現問題，請檢查連線後重試。",
          invalid: "這次生成的設計資料未能通過檢查，請重新生成。",
          timeout: "生成時間較長，請重新嘗試。",
        }
        setGenerationError(messages[demoOutcome])
        setGenerationStatus("error")
        if (generatedConfig) setResultStale(true)
        return
      }
      setGeneratedConfig(config)
      setGenerationStatus("success")
      setMobilePreview("generated")
      setResultStale(false)
    }, 1200)
  }

  return (
    <main
      className={`studio-page initial-studio ${
        generationStatus === "loading" ? "is-generating" : ""
      }`}
      lang="zh-HK"
      aria-busy={generationStatus === "loading"}
    >
      <div className="studio-nav">
        <Logo onClick={() => setPage("home")} />
        <span className="studio-divider" />
        <span className="studio-title">設計工作台</span>
        <button className="back-home" onClick={() => setPage("home")}>
          返回首頁
        </button>
      </div>

      <div className="studio-shell">
        <aside className="setup-panel">
          <div className="setup-heading">
            <h1>設計設定</h1>
          </div>

          <div className="studio-source-summary">
            <div className={`source-thumbnail ${source?.kind ?? "sample"}`}>
              {source?.previewUrl ? (
                <img src={source.previewUrl} alt="原始訂閱頁面縮圖" />
              ) : (
                <span>
                  <Icon name="layout" size={20} />
                </span>
              )}
            </div>
            <div>
              <span>原始訂閱頁面</span>
              <b>{source?.name ?? "未選擇來源"}</b>
            </div>
            <button onClick={() => setPage("home")}>更換</button>
          </div>

          <section className="product-data-module">
            <div className="product-data-header">
              <h2>產品與訂閱資料</h2>
              <span className={`data-status state-${confirmationState}`}>
                {confirmationState === "confirmed"
                  ? "資料已確認"
                  : confirmationState === "checking"
                    ? "檢查中"
                    : confirmationState === "error"
                      ? "需要修正"
                      : confirmationState === "updated"
                        ? "需要重新確認"
                        : "待確認"}
              </span>
            </div>

            <div className="product-data-overview">
              <div className="app-symbol">
                <Icon name="sparkles" size={19} />
              </div>
              <div>
                <b>{product.name || "尚未填寫產品名稱"}</b>
                <p>{product.description || "產品資料待確認"}</p>
              </div>
              <button onClick={() => setDrawer(true)}>
                <Icon name="edit" size={16} />
                編輯資料
              </button>
            </div>

            <div className="product-data-facts">
              <span>
                月費{" "}
                <b>
                  {market === "us" ? "US$" : "HK$"}
                  {nextMarketPrice(product, market, false) || "待填寫"}
                </b>
              </span>
              <i />
              <span>
                年費{" "}
                <b>
                  {market === "us" ? "US$" : "HK$"}
                  {nextMarketPrice(product, market, true) || "待填寫"}
                </b>
              </span>
              <i />
              <span>{product.trial ? "3 天試用" : "試用條款待確認"}</span>
            </div>
            <p className="benefit-summary">
              會員權益：
              {product.benefits.length
                ? `${product.benefits.length} 項已填寫`
                : "待填寫"}
            </p>

            <div className="product-data-actions">
              <button onClick={() => setDataUtility("import")}>
                <span>
                  <Icon name="upload" size={20} />
                </span>
                匯入產品資料
              </button>
              <button onClick={() => setDataUtility("view")}>
                <span>
                  <Icon name="layout" size={20} />
                </span>
                檢視完整輸入資料
              </button>
            </div>

            <div
              className={`product-confirmation state-${confirmationState} ${
                preflightError ? "has-error" : ""
              }`}
            >
              <div className="confirmation-copy">
                <span>
                  {confirmationState === "checking" ? (
                    <span className="spinner" />
                  ) : (
                    <Icon
                      name={
                        confirmationState === "confirmed"
                          ? "check"
                          : confirmationState === "error"
                            ? "close"
                            : "info"
                      }
                      size={18}
                    />
                  )}
                </span>
                <div>
                  <b>
                    {confirmationState === "confirmed"
                      ? "訂閱資料已確認"
                      : confirmationState === "checking"
                        ? "正在檢查資料……"
                        : confirmationState === "error"
                          ? "部分訂閱資料需要修正"
                          : confirmationState === "updated"
                            ? "資料已更新，請重新確認"
                            : "訂閱資料待確認"}
                  </b>
                  <p>
                    {confirmationMessage ||
                      "請核對套餐價格、試用條款及會員權益。"}
                  </p>
                </div>
              </div>
              {confirmationState === "confirmed" ? (
                <button
                  className="confirmation-secondary"
                  onClick={() => setDrawer(true)}
                >
                  重新檢視資料
                </button>
              ) : confirmationState === "error" ? (
                <button
                  className="confirmation-primary"
                  onClick={() => setDrawer(true)}
                >
                  編輯資料
                </button>
              ) : (
                <button
                  className="confirmation-primary"
                  onClick={confirmProductData}
                  disabled={confirmationState === "checking"}
                >
                  {confirmationState === "checking"
                    ? "正在檢查資料……"
                    : "確認產品資料"}
                </button>
              )}
            </div>
            {preflightError && (
              <p className="preflight-error" role="alert">
                <Icon name="info" size={16} />
                {preflightError}
              </p>
            )}
          </section>

          <div className="input-stack">
            <div className="input-block">
              <label>目標市場</label>
              <SelectField
                label=""
                value={market}
                onChange={(value) => changeMarket(value as Market)}
              >
                <option value="us">美國</option>
                <option value="hk">香港</option>
              </SelectField>
            </div>

            <div className="input-block">
              <label>設計目標</label>
              <SelectField
                label=""
                value={goal}
                onChange={(value) => {
                  setGoal(value as Goal)
                  markResultStale()
                }}
              >
                <option value="annual">突出年費方案</option>
                <option value="trial">突出免費試用</option>
                <option value="benefits">突出會員權益</option>
              </SelectField>
            </div>

            <div className="input-block">
              <label>視覺風格</label>
              <div className="style-options">
                {([
                  {
                    id: "minimal",
                    label: "簡約",
                    colors: ["#fff", "#b8a7ff"],
                  },
                  {
                    id: "tech",
                    label: "科技感",
                    colors: ["#17171d", "#8fa5ff"],
                  },
                  {
                    id: "warm",
                    label: "溫暖親切",
                    colors: ["#fff5ea", "#efad88"],
                  },
                ] as const).map((item) => (
                  <button
                    className={style === item.id ? "active" : ""}
                    onClick={() => {
                      setStyle(item.id)
                      markResultStale()
                    }}
                    key={item.id}
                  >
                    <span>
                      <i style={{ background: item.colors[0] }} />
                      <i style={{ background: item.colors[1] }} />
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="field instructions">
              <span>補充要求</span>
              <textarea
                rows={3}
                value={instructions}
                onChange={(event) => {
                  setInstructions(event.target.value)
                  markResultStale()
                }}
                placeholder="告訴 AI 你想如何調整訂閱頁面……"
              />
            </label>
          </div>

          <div className={`advanced ${advanced ? "open" : ""}`}>
            <button
              className="advanced-toggle"
              onClick={() => setAdvanced(!advanced)}
            >
              <span>
                <Icon name="layout" size={18} />
                進階設定
              </span>
              <Icon name="chevron" size={17} />
            </button>
            {advanced && (
              <div className="advanced-body">
                <SelectField
                  label="輸出語言"
                  value={language}
                  onChange={(value) => {
                    setLanguage(value as Language)
                    setLanguageTouched(true)
                    markResultStale()
                  }}
                >
                  <option value="English">英語</option>
                  <option value="繁體中文">繁體中文（香港）</option>
                  <option value="简体中文">簡體中文</option>
                </SelectField>
                <div className="form-grid">
                  <label className="field">
                    <span>允許使用的顏色</span>
                    <input
                      value={allowedColors}
                      onChange={(event) => {
                        setAllowedColors(event.target.value)
                        markResultStale()
                      }}
                    />
                  </label>
                  <label className="field">
                    <span>禁止使用的顏色</span>
                    <input
                      value={forbiddenColors}
                      onChange={(event) => {
                        setForbiddenColors(event.target.value)
                        markResultStale()
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="generate-wrap">
            <button
              className="generate-button"
              disabled={generationStatus === "loading"}
              onClick={runGeneration}
            >
              {generationStatus === "loading" ? (
                <>
                  <span className="spinner" />
                  正在本地化設計……
                </>
              ) : (
                <>
                  <Icon name="sparkles" size={19} />
                  {generationStatus === "success"
                    ? "重新生成設計"
                    : generationStatus === "error"
                      ? "重新嘗試"
                      : "開始本地化設計"}
                  <Icon name="arrow" size={18} />
                </>
              )}
            </button>
            <p>
              <Icon name="info" size={15} />
              Demo Simulation，未連接真實 AI 服務。
            </p>
          </div>

          <details className="demo-state-controls">
            <summary>示例演示 · 狀態測試</summary>
            <label>
              <span>下次生成結果</span>
              <select
                value={demoOutcome}
                onChange={(event) =>
                  setDemoOutcome(
                    event.target
                      .value as "success" | "service" | "network" | "invalid" | "timeout",
                  )
                }
              >
                <option value="success">生成成功</option>
                <option value="service">AI 服務暫時不可用</option>
                <option value="network">網絡問題</option>
                <option value="invalid">結果無法使用</option>
                <option value="timeout">請求逾時</option>
              </select>
            </label>
            <label>
              <span>設計檢查狀態</span>
              <select
                value={reviewState}
                onChange={(event) =>
                  setReviewState(
                    event.target
                      .value as "pending" | "checking" | "passed" | "issue" | "manual",
                  )
                }
              >
                <option value="manual">需要人工確認</option>
                <option value="pending">等待檢查</option>
                <option value="checking">檢查中</option>
                <option value="passed">檢查通過</option>
                <option value="issue">發現問題</option>
              </select>
            </label>
          </details>
        </aside>

        <section className="workspace">
          <div className="workspace-header">
            <div>
              <h2>
                {resultView === "review"
                  ? "設計檢查"
                  : generationStatus === "success"
                    ? "訂閱頁面對比"
                    : "訂閱頁面預覽"}
              </h2>
            </div>
            {resultView === "review" ? (
              <button
                className="return-comparison"
                onClick={() => setResultView("compare")}
              >
                <Icon name="arrow" size={17} />
                返回頁面對比
              </button>
            ) : (
              <span
                className={`initial-state-badge state-${generationStatus} ${
                  resultStale ? "stale" : ""
                }`}
              >
                {resultStale
                  ? "需要重新生成"
                  : generationStatus === "success"
                    ? "本地化設計已生成 · 示例演示"
                    : generationStatus === "error"
                      ? "生成失敗"
                      : generationStatus === "loading"
                        ? "生成中"
                        : "初始狀態"}
              </span>
            )}
          </div>

          <div className="workspace-body">
            {resultView === "review" && generatedConfig ? (
              <InteractiveDesignReview state={reviewState} product={product} />
            ) : (
              <>
                <div className="mobile-preview-tabs">
                  <button
                    className={mobilePreview === "original" ? "active" : ""}
                    onClick={() => setMobilePreview("original")}
                  >
                    原始版本
                  </button>
                  <button
                    className={mobilePreview === "generated" ? "active" : ""}
                    onClick={() => setMobilePreview("generated")}
                  >
                    本地化版本
                  </button>
                </div>

                {resultStale && (
                  <div className="result-stale-alert">
                    <Icon name="info" size={18} />
                    <div>
                      <b>設計要求已修改</b>
                      <p>
                        目前顯示的是上一次模擬結果，請重新生成以套用新設定。
                      </p>
                    </div>
                  </div>
                )}
                {generationStatus === "error" && generationError && (
                  <div className="generation-error-banner" role="alert">
                    <span>
                      <Icon name="close" size={19} />
                    </span>
                    <div>
                      <b>未能完成本地化設計</b>
                      <p>{generationError}</p>
                    </div>
                    <button onClick={runGeneration}>重新嘗試</button>
                  </div>
                )}

                <div
                  className={`phone-comparison initial-comparison show-${mobilePreview}`}
                >
                  <div className="phone-column original-column">
                    <div className="phone-label">
                      <span>
                        {source?.kind === "upload"
                          ? "原始版本 · 已上傳"
                          : "原始版本 · 美國"}
                      </span>
                      <small>
                        {source?.kind === "upload"
                          ? source.name
                          : "虛構示例資料"}
                      </small>
                    </div>
                    {source?.kind === "upload" && source.previewUrl ? (
                      <div className="phone uploaded-source-phone">
                        <div className="phone-speaker" />
                        <img
                          src={source.previewUrl}
                          alt="使用者上傳的原始訂閱頁面"
                        />
                        <span>使用者提供的原始頁面</span>
                      </div>
                    ) : (
                      <PhonePaywall
                        type="original"
                        market="us"
                        goal="benefits"
                        style="tech"
                        language="English"
                        product={product}
                      />
                    )}
                  </div>

                  <div
                    className={`phone-column generated-column ${
                      resultStale ? "stale-result" : ""
                    }`}
                  >
                    <div className="phone-label">
                      <span>
                        {generatedConfig && generationStatus !== "loading"
                          ? `本地化版本 · ${marketData[generatedConfig.market].label}`
                          : "AI 本地化版本"}
                      </span>
                      <small>
                        {resultStale
                          ? "需要重新生成"
                          : generationStatus === "success"
                            ? "示範模擬"
                            : generationStatus === "error"
                              ? generatedConfig
                                ? "保留上次結果"
                                : "生成失敗"
                              : generationStatus === "loading"
                                ? "生成中"
                                : "等待改版"}
                      </small>
                    </div>
                    {generationStatus === "loading" ? (
                      <div className="generating-state">
                        <span className="loader-orb">
                          <Icon name="sparkles" size={26} />
                        </span>
                        <h3>正在建立本地化版本……</h3>
                        <p>根據已確認資料調整內容、版面與方案展示。</p>
                        <div className="progress">
                          <i />
                        </div>
                      </div>
                    ) : generatedConfig ? (
                      <PhonePaywall
                        type="generated"
                        market={generatedConfig.market}
                        goal={generatedConfig.goal}
                        style={generatedConfig.style}
                        language={generatedConfig.language}
                        product={product}
                      />
                    ) : generationStatus === "error" ? (
                      <div className="generation-error-state">
                        <span>
                          <Icon name="close" size={26} />
                        </span>
                        <h3>未能生成本地化版本</h3>
                        <p>{generationError}</p>
                        <button onClick={runGeneration}>重新嘗試</button>
                      </div>
                    ) : (
                      <EmptyGenerated />
                    )}
                  </div>
                </div>

                {generatedConfig && generationStatus !== "loading" && (
                  <section className="result-summary">
                    <div className="result-section-heading">
                      <div>
                        <h3>本次設計改動</h3>
                        <span>Demo Simulation</span>
                      </div>
                    </div>
                    <div className="result-summary-grid">
                      <article>
                        <span>
                          <Icon name="globe" size={18} />
                        </span>
                        <div>
                          <b>內容本地化</b>
                          <p>
                            {generatedConfig.language === "繁體中文"
                              ? "已調整為香港繁體中文、標題及會員權益文案。"
                              : generatedConfig.language === "简体中文"
                                ? "已按簡體中文輸出設定調整頁面文案。"
                                : "已按英語輸出設定調整標題及頁面文案。"}
                          </p>
                        </div>
                      </article>
                      <article>
                        <span>
                          <Icon name="palette" size={18} />
                        </span>
                        <div>
                          <b>版面與配色</b>
                          <p>
                            {generatedConfig.goal === "benefits" &&
                            generatedConfig.style === "tech"
                              ? "沿用會員權益優先排序及科技風格。"
                              : "已重新排列頁面內容並調整視覺風格。"}
                          </p>
                        </div>
                      </article>
                      <article>
                        <span>
                          <Icon name="chart" size={18} />
                        </span>
                        <div>
                          <b>訂閱方案展示</b>
                          <p>
                            {generatedConfig.goal === "annual"
                              ? "已根據設計目標突出年費方案。"
                              : generatedConfig.goal === "trial"
                                ? "已根據設計目標突出免費試用。"
                                : "已根據設計目標突出會員權益。"}
                          </p>
                        </div>
                      </article>
                    </div>
                  </section>
                )}

                <LocalizationReviewCard
                  hasResult={Boolean(generatedConfig)}
                  generationStatus={generationStatus}
                  reviewState={reviewState}
                  stale={resultStale}
                  onOpen={() => setResultView("review")}
                />
              </>
            )}
          </div>
        </section>
      </div>

      <InitialProductDrawer
        open={drawer}
        product={product}
        confirmed={factsConfirmed}
        onClose={() => setDrawer(false)}
        onConfirm={(nextProduct) => {
          setProduct(nextProduct)
          setConfirmationState("updated")
          setConfirmationMessage("產品資料已修改，請重新確認。")
          setPreflightError("")
          markResultStale()
        }}
      />
      <ProductDataUtilityDrawer
        mode={dataUtility}
        product={product}
        inputData={{
          source: {
            kind: source?.kind,
            name: source?.name,
            format: source?.format,
            width: source?.width,
            height: source?.height,
          },
          product,
          design: {
            market,
            goal,
            style,
            outputLanguage: language,
            instructions,
            allowedColors,
            forbiddenColors,
          },
          confirmationStatus: confirmationState,
        }}
        onClose={() => setDataUtility(null)}
        onImport={(nextProduct) => {
          setProduct(nextProduct)
          setConfirmationState("updated")
          setConfirmationMessage("已匯入新的產品資料，請重新確認。")
          setPreflightError("")
          markResultStale()
        }}
      />
    </main>
  )
}

export default function App() {
  const [page, setPage] = useState<"home" | "studio">("home")
  const [prompt, setPrompt] = useState("")
  const [source, setSource] = useState<PaywallSource | null>(null)
  useEffect(() => {
    document.documentElement.lang = "zh-HK"
    scrollTo({ top: 0 })
  }, [page])
  return (
    <>
      {page === "home" && (
        <>
          <Navbar page={page} setPage={setPage} />
          <Landing
            setPage={setPage}
            initialPrompt={prompt}
            setInitialPrompt={setPrompt}
            source={source}
            setSource={setSource}
          />
        </>
      )}
      {page === "studio" && (
        <InitialStudio prompt={prompt} setPage={setPage} source={source} />
      )}
    </>
  )
}
