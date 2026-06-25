import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className='relative overflow-hidden bg-navy-900'>
      {/* Radial spotlight effect top-right */}
      <div
        className='pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full opacity-20'
        style={{
          background: 'radial-gradient(circle, #c9a84c 0%, transparent 70%)',
        }}
        aria-hidden='true'
      />

      <div className='relative mx-auto max-w-7xl px-6 py-20 md:py-28 lg:py-36'>
        <div className='grid lg:grid-cols-2 gap-12 lg:gap-20 items-center'>
          {/* Left — copy */}
          <div className='flex flex-col items-start'>
            {/* Badge */}
            <div className='inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-sm text-gold-400 mb-8'>
              <span className='relative flex h-2 w-2' aria-hidden='true'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75' />
                <span className='relative inline-flex h-2 w-2 rounded-full bg-gold-500' />
              </span>
              Now in early access
            </div>

            <h1 className='font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6'>
              Track Every
              <br />
              <span className='text-gold-400'>Step.</span>
              <br />
              Master the Dance.
            </h1>

            <p className='text-lg text-slate-400 max-w-md mb-10 leading-relaxed'>
              The progress tracker built for serious ballroom dancers. Log
              syllabus patterns, earn achievements, and track your journey from
              Bronze to Open.
            </p>

            <div className='flex flex-col sm:flex-row gap-4 w-full sm:w-auto'>
              <Link
                href='/signup'
                className='inline-flex items-center justify-center rounded-full bg-gold-500 px-7 py-3.5 text-base font-semibold text-navy-900 hover:bg-gold-400 transition-colors'
              >
                Get Started Free
              </Link>
              <a
                href='#how-it-works'
                className='inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-base font-medium text-slate-300 hover:border-white/30 hover:text-white transition-colors'
              >
                See How It Works
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 16 16'
                  fill='currentColor'
                  aria-hidden='true'
                >
                  <path
                    fillRule='evenodd'
                    d='M8 3a.5.5 0 0 1 .5.5v7.793l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L7.5 11.293V3.5A.5.5 0 0 1 8 3z'
                  />
                </svg>
              </a>
            </div>

            {/* Social proof numbers */}
            <div className='mt-12 flex items-center gap-8 text-sm text-slate-500'>
              <div>
                <span className='block text-2xl font-bold text-white'>10+</span>
                Dance styles
              </div>
              <div className='h-8 w-px bg-white/10' aria-hidden='true' />
              <div>
                <span className='block text-2xl font-bold text-white'>
                  200+
                </span>
                Syllabus patterns
              </div>
              <div className='h-8 w-px bg-white/10' aria-hidden='true' />
              <div>
                <span className='block text-2xl font-bold text-white'>
                  Free
                </span>
                To get started
              </div>
            </div>
          </div>

          {/* Right — image */}
          <div className='relative flex justify-center lg:justify-end'>
            <div className='relative'>
              {/* Glow behind image */}
              <div
                className='absolute inset-0 -m-6 rounded-3xl opacity-30 blur-2xl'
                style={{
                  background:
                    'radial-gradient(ellipse, #c9a84c 0%, transparent 70%)',
                }}
                aria-hidden='true'
              />
              <Image
                src='/images/landingPage/BallroomDancingCouple.png'
                alt='Ballroom dancing couple'
                width={580}
                height={680}
                priority
                className='relative rounded-2xl border border-white/5 shadow-2xl'
              />
              {/* Floating stat card */}
              <div className='absolute -bottom-5 -left-5 rounded-2xl border border-white/10 bg-navy-800/90 backdrop-blur-sm px-5 py-4 shadow-xl'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gold-500/20'>
                    <svg
                      width='18'
                      height='18'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#c9a84c'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      aria-hidden='true'
                    >
                      <polyline points='23 6 13.5 15.5 8.5 10.5 1 18' />
                      <polyline points='17 6 23 6 23 12' />
                    </svg>
                  </div>
                  <div>
                    <p className='text-xs text-slate-400'>Pattern mastered</p>
                    <p className='text-sm font-semibold text-white'>
                      Natural Turn — Waltz
                    </p>
                  </div>
                </div>
              </div>
              {/* Floating achievement card */}
              <div className='absolute -top-5 -right-5 rounded-2xl border border-white/10 bg-navy-800/90 backdrop-blur-sm px-5 py-4 shadow-xl'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gold-500/20 text-xl'>
                    🏆
                  </div>
                  <div>
                    <p className='text-xs text-slate-400'>
                      Achievement unlocked
                    </p>
                    <p className='text-sm font-semibold text-gold-400'>
                      Bronze Graduate
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
