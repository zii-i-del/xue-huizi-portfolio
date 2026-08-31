import { useState } from 'react'
import { profile } from '../../data/content'
import Reveal from '../ui/Reveal'
import Frame from '../ui/Frame'
import Marquee from '../ui/Marquee'
import FooterWordmark from '../ui/FooterWordmark'

const SOCIALS = [
  { label: 'Email', href: `mailto:${profile.email}` },
  { label: 'WeChat', value: profile.wechat },
  { label: 'Phone', href: `tel:${profile.phone}` },
]

function ContactField({ id, label, placeholder, type = 'text', textarea = false, value, onChange }) {
  const sharedProps = {
    id,
    name: id,
    value,
    onChange,
    placeholder,
    required: true,
    className: 'footer-contact-field__input',
  }

  return (
    <div className={`footer-contact-field${textarea ? ' footer-contact-field--message' : ''}`}>
      <Frame plus={false}>
        <label htmlFor={id} className="cjk footer-contact-field__label">
          {label}
        </label>
        {textarea ? (
          <textarea {...sharedProps} rows={4} autoComplete="off" />
        ) : (
          <input
            {...sharedProps}
            type={type}
            autoComplete={type === 'email' ? 'email' : 'name'}
          />
        )}
      </Frame>
    </div>
  )
}

export default function Footer() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [mailOpened, setMailOpened] = useState(false)
  const [copied, setCopied] = useState(null)

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    if (mailOpened) setMailOpened(false)
  }

  const submit = (event) => {
    event.preventDefault()
    const subject = encodeURIComponent(`作品集网站留言｜${form.name.trim()}`)
    const body = encodeURIComponent(
      `姓名：${form.name.trim()}\n邮箱：${form.email.trim()}\n\n留言：\n${form.message.trim()}`,
    )

    setMailOpened(true)
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
  }

  const copy = async (value, key) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(key)
      window.setTimeout(() => setCopied(null), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <footer id="contact" className="site-footer">
      <Reveal className="layout-block site-footer__inner">
        <div className="footer-flow" aria-label="Let's build something measurable. Get in touch.">
          <Marquee direction="right" duration={50} pauseOnHover={false} className="footer-flow__marquee">
            {["LET'S BUILD SOMETHING", 'MEASURABLE', 'GET IN TOUCH'].map((text) => (
              <span key={text} className="footer-flow__item">
                {text}
                <span className="footer-flow__symbol" aria-hidden="true">✳</span>
              </span>
            ))}
          </Marquee>
        </div>

        <form className="layout-grid footer-contact-form" onSubmit={submit}>
          <div className="footer-contact-form__name">
            <ContactField
              id="contact-name"
              label="姓名"
              placeholder="你的姓名"
              value={form.name}
              onChange={updateField('name')}
            />
          </div>
          <div className="footer-contact-form__email">
            <ContactField
              id="contact-email"
              label="邮箱"
              placeholder="name@example.com"
              type="email"
              value={form.email}
              onChange={updateField('email')}
            />
          </div>
          <div className="footer-contact-form__message">
            <ContactField
              id="contact-message"
              label="留言"
              placeholder="想聊聊什么"
              textarea
              value={form.message}
              onChange={updateField('message')}
            />
          </div>
          <div className="footer-contact-form__submit">
            <Frame>
              <button type="submit" className="cjk footer-contact-form__submit-button">
                {mailOpened ? '已打开邮件应用，请确认发送' : '发送留言'}
              </button>
            </Frame>
          </div>
        </form>

        <div className="layout-grid site-footer__infos">
          <div className="site-footer__copyright">
            <p className="font-stardust uppercase tracking-[0.18em]">
              © {new Date().getFullYear()} {profile.nameEn}
            </p>
          </div>

          <div className="site-footer__description">
            <p className="cjk font-owners">{profile.roleCn} · {profile.location}</p>
          </div>

          <div className="site-footer__socials">
            {SOCIALS.map((social) =>
              social.href ? (
                <a
                  key={social.label}
                  href={social.href}
                  className="social-link"
                >
                  {social.label}
                </a>
              ) : (
                <button
                  key={social.label}
                  type="button"
                  onClick={() => copy(social.value, social.label)}
                  className="social-link"
                >
                  {copied === social.label ? 'Copied' : social.label}
                </button>
              )
            )}
          </div>
        </div>

        <div className="site-footer__logo">
          <FooterWordmark text="XUE HUIZI" />
        </div>
      </Reveal>
    </footer>
  )
}
