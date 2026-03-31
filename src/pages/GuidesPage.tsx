const GUIDE_COLLECTIONS = [
  {
    icon: 'https://intercom.help/acctual/assets/svg/icon:content-pencil-square/000000',
    title: 'Getting started',
    desc: 'Set up your account, send invoices and get paid',
    count: '9 articles',
  },
  {
    icon: 'https://intercom.help/acctual/assets/svg/icon:ff-document-text/000000',
    title: 'Sending invoices',
    desc: 'Create, manage and track invoices to get paid faster',
    count: '5 articles',
  },
  {
    icon: 'https://intercom.help/acctual/assets/svg/icon:bizz-fin-currency-dollar/000000',
    title: 'Getting paid',
    desc: 'Accept payments, match transactions and send money',
    count: '9 articles',
  },
] as const;

const GUIDE_ARTICLES = [
  'What is Acctual?',
  'Creating and sending your first invoice',
  'Add flexible payment options',
  'Receive your first payment',
] as const;

export default function GuidesPage() {
  return (
    <>
      <section className="guides-page">
        <div className="guides-frame">
          <div className="guides-collections" role="list">
            {GUIDE_COLLECTIONS.map((item) => (
              <div
                key={item.title}
                className="guides-collection-card"
                data-testid="collection-card-classic"
              >
                <div className="guides-collection-icon-wrap">
                  <div className="guides-collection-icon">
                    <img src={item.icon} alt="" width="100%" height="100%" loading="lazy" />
                  </div>
                </div>
                <div className="guides-collection-body">
                  <div>
                    <div className="guides-collection-title">{item.title}</div>
                    <p className="guides-collection-desc">{item.desc}</p>
                  </div>
                  <span className="guides-collection-count">{item.count}</span>
                </div>
              </div>
            ))}
          </div>

          <section className="guides-articles">
            <header className="guides-articles-title">Helpful articles</header>
            <div role="list">
              {GUIDE_ARTICLES.map((title) => (
                <div key={title} className="guides-article-link" data-testid="article-link">
                  <span>{title}</span>
                  <span className="guides-article-chevron" aria-hidden>
                    ⌄
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="guides-contact">
            <div className="guides-contact-inner">
              <header className="guides-contact-title">Still need help?</header>
              <div className="guides-contact-desc">
                We&apos;re here to help. Reach out and we&apos;ll get back to you quickly.
              </div>
              <button type="button" className="guides-contact-btn">
                Contact us
              </button>
            </div>
          </section>
        </div>
      </section>

      <img
        src="/images/howItWorks/Feature/shadow.png"
        alt=""
        className="hiw__shadow-overlay"
        aria-hidden="true"
      />
    </>
  );
}
