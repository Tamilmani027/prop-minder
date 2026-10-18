import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Home,
    Users,
    CreditCard,
    Wrench,
    Bell,
    BarChart3,
    Check,
    ArrowRight,
    Menu,
    X,
    FileText,
    BookOpen,
} from 'lucide-react'

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ')
}

/* ── Navbar ── */
function Navbar({
    isMenuOpen,
    setIsMenuOpen,
}: {
    isMenuOpen: boolean
    setIsMenuOpen: (v: boolean) => void
}) {
    const [scrolled, setScrolled] = useState(false)
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <nav
            className={cn(
                'fixed top-0 w-full z-50 transition-all duration-300',
                scrolled ? 'bg-[#1a1f1a]/98 shadow-lg' : 'bg-[#1a1f1a]',
            )}
        >
            <div className="max-w-[1200px] mx-auto px-8">
                <div className="flex justify-between items-center h-[72px]">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-[#3d7a4f] rounded-md flex items-center justify-center">
                            <Home className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-semibold text-[17px] tracking-[-0.01em]">
                            propminder
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-[#a8b5a8] hover:text-white text-sm transition-colors">
                            Features
                        </a>
                        <a href="#how-it-works" className="text-[#a8b5a8] hover:text-white text-sm transition-colors">
                            How it works
                        </a>
                        <a href="#pricing" className="text-[#a8b5a8] hover:text-white text-sm transition-colors">
                            Pricing
                        </a>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/login" className="text-[#a8b5a8] hover:text-white text-sm transition-colors">
                            Log in
                        </Link>
                        <Link
                            to="/register"
                            className="px-4 py-2 bg-[#3d7a4f] hover:bg-[#356b44] text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Get started free
                        </Link>
                    </div>

                    <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden bg-[#1a1f1a] border-t border-[#2a3328] px-8 pb-6">
                    <div className="flex flex-col gap-4 pt-4">
                        <a
                            href="#features"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-[#a8b5a8] hover:text-white text-sm py-2"
                        >
                            Features
                        </a>
                        <a
                            href="#how-it-works"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-[#a8b5a8] hover:text-white text-sm py-2"
                        >
                            How it works
                        </a>
                        <a
                            href="#pricing"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-[#a8b5a8] hover:text-white text-sm py-2"
                        >
                            Pricing
                        </a>
                        <Link to="/login" className="text-[#a8b5a8] hover:text-white text-sm py-2">
                            Log in
                        </Link>
                        <Link
                            to="/register"
                            className="px-4 py-2.5 bg-[#3d7a4f] text-white text-sm font-medium rounded-lg text-center"
                        >
                            Get started free
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
}

/* ── Hero ── */
function HeroSection() {
    return (
        <section className="bg-[#eef2ec] pt-[72px]">
            <div className="max-w-[1200px] mx-auto px-8 pt-20">
                {/* Badge */}
                <div className="flex justify-center mb-8">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#2e4f35] text-[#8dc89e] text-xs font-medium rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5fb97a] inline-block" />
                        A little less admin. A lot more clarity.
                    </span>
                </div>

                {/* Headline */}
                <h1
                    className="text-center text-[#1a1f1a] font-bold leading-[1.1] tracking-[-0.03em] mb-6"
                    style={{ fontSize: 'clamp(42px, 6vw, 72px)' }}
                >
                    Your properties.
                    <br />
                    Your peace of mind.
                </h1>

                {/* Subheading */}
                <p className="text-center text-[#5a6b5a] text-lg leading-relaxed max-w-xl mx-auto mb-10">
                    Bring your properties, tenants, and payments together.
                    <br />
                    One calm workspace to keep your portfolio moving.
                </p>

                {/* CTAs */}
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Link
                        to="/register"
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#2e4f35] hover:bg-[#243f2a] text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        Get started free <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1f1a] hover:bg-[#2a302a] text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        Explore the dashboard
                    </Link>
                </div>

                <p className="text-center text-[#8a9e8a] text-xs mb-12">
                    Free for up to 3 units · No credit card required
                </p>

                {/* Hero cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
                    {/* Left: free tier card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e0e8de]">
                        <p className="text-[#8a9e8a] text-xs font-medium mb-3">Free for up to 3 units</p>
                        <h3 className="text-[#1a1f1a] text-xl font-bold mb-4">No credit card required</h3>
                        <ul className="space-y-2.5 mb-5">
                            {[
                                'Track every property, tenant, and payment in one place.',
                                'Keep your portfolio moving with a calm, modern workspace.',
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-2.5">
                                    <span className="w-4 h-4 rounded-full bg-[#eef2ec] border border-[#3d7a4f] flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check className="w-2.5 h-2.5 text-[#3d7a4f]" />
                                    </span>
                                    <span className="text-[#5a6b5a] text-[13px] leading-snug">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="border-t border-[#eef2ec] pt-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-md bg-[#eef2ec] flex items-center justify-center">
                                    <BarChart3 className="w-3.5 h-3.5 text-[#3d7a4f]" />
                                </div>
                                <div>
                                    <p className="text-[#1a1f1a] text-xs font-semibold">Portfolio clarity</p>
                                    <p className="text-[#8a9e8a] text-[11px]">
                                        One workspace for properties, tenants, and payments.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center: property photo */}
                    <div className="rounded-2xl overflow-hidden min-h-[260px] md:min-h-0">
                        <img
                            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"
                            alt="Modern apartment building"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Right: dashboard overview */}
                    <div className="bg-[#1a1f1a] rounded-2xl p-6 shadow-sm">
                        <p className="text-[#8a9e8a] text-xs font-medium mb-3">Portfolio overview</p>
                        <h3 className="text-white text-xl font-bold mb-4">
                            Everything in
                            <br />
                            one view
                        </h3>
                        <ul className="space-y-2 mb-5">
                            {[
                                { icon: Home, label: 'Properties' },
                                { icon: Users, label: 'Tenants' },
                                { icon: CreditCard, label: 'Payments' },
                            ].map(({ icon: Icon, label }) => (
                                <li key={label} className="flex items-center gap-2.5">
                                    <div className="w-6 h-6 rounded-md bg-[#2a3328] flex items-center justify-center">
                                        <Icon className="w-3.5 h-3.5 text-[#5fb97a]" />
                                    </div>
                                    <span className="text-[#c8d8c8] text-sm">{label}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="bg-[#2a3328] rounded-xl p-3 mt-2">
                            <p className="text-[#8a9e8a] text-[11px] mb-1">Free plan</p>
                            <p className="text-white text-sm font-semibold">
                                Up to 3 units
                                <br />
                                included
                            </p>
                        </div>
                    </div>
                </div>

                {/* Ticker */}
                <div className="border-t border-[#d4e0d0] mt-8 py-4 flex items-center justify-center gap-6 flex-wrap">
                    {[
                        { icon: Home, label: 'Every property' },
                        { icon: Users, label: 'Every tenant' },
                        { icon: CreditCard, label: 'Every payment' },
                        { icon: Check, label: 'All in one place' },
                    ].map(({ icon: Icon, label }, i) => (
                        <div key={label} className="flex items-center gap-2">
                            {i > 0 && <span className="w-1 h-1 rounded-full bg-[#b0c8b0] mr-2" />}
                            <Icon className="w-3.5 h-3.5 text-[#5a6b5a]" />
                            <span className="text-[#5a6b5a] text-sm">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

/* ── Problem statement ── */
function ProblemSection() {
    const problems = [
        {
            icon: FileText,
            title: 'Scattered lease details',
            desc: 'Lease dates, rent amounts, and renewal clauses spread across emails, spreadsheets, and folders.',
        },
        {
            icon: CreditCard,
            title: 'Chasing payments',
            desc: "Manual rent tracking means late payments go unnoticed until it's too late.",
        },
        {
            icon: Bell,
            title: 'Missed maintenance',
            desc: "Tenant requests fall through the cracks when there's no central place to track them.",
        },
    ]

    return (
        <section id="how-it-works" className="bg-white py-24">
            <div className="max-w-[1200px] mx-auto px-8">
                <div className="grid md:grid-cols-2 gap-16 items-start mb-12">
                    <div>
                        <h2
                            className="text-[#1a1f1a] font-bold tracking-[-0.02em] leading-[1.15]"
                            style={{ fontSize: 'clamp(28px, 3vw, 40px)' }}
                        >
                            Property management is a lot.
                            <br />
                            <span className="text-[#3d7a4f]">Your software shouldn't be.</span>
                        </h2>
                    </div>
                    <div>
                        <p className="text-[#5a6b5a] text-base leading-relaxed">
                            Most landlords juggle six different tools and still end up with things slipping through
                            the cracks. Propminder pulls it all together — properties, tenants, leases, payments —
                            so you can focus on what you actually care about.
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {problems.map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="p-6 rounded-2xl border border-[#e8f0e6] bg-[#fafcfa]">
                            <div className="w-9 h-9 rounded-lg bg-[#eef2ec] flex items-center justify-center mb-4">
                                <Icon className="text-[#3d7a4f]" style={{ width: 18, height: 18 }} />
                            </div>
                            <h3 className="text-[#1a1f1a] font-semibold text-[15px] mb-2">{title}</h3>
                            <p className="text-[#5a6b5a] text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

/* ── Features ── */
function FeaturesSection() {
    const features = [
        {
            icon: Home,
            title: 'Property suite',
            desc: 'Add properties and units, track details, upload documents, and manage your whole portfolio from one clean dashboard.',
        },
        {
            icon: FileText,
            title: 'Tenant leases',
            desc: 'Store lease agreements, track start and end dates, and get reminders before anything expires.',
        },
        {
            icon: CreditCard,
            title: 'Financial tools',
            desc: "Record rent payments, monitor what's due, and export clean payment logs whenever you need them.",
        },
        {
            icon: Bell,
            title: 'Track inventory',
            desc: "Know what's in each unit and property. Attach notes, condition status, and values to every item.",
        },
        {
            icon: Wrench,
            title: 'Maintenance management',
            desc: 'Tenants can log issues, you track progress. Nothing gets forgotten and everything is in one place.',
        },
        {
            icon: BookOpen,
            title: 'Knowledge & findings logs',
            desc: 'Record inspections, important findings, and property notes so nothing gets lost between visits.',
        },
    ]

    return (
        <section id="features" className="bg-[#eef2ec] py-24">
            <div className="max-w-[1200px] mx-auto px-8">
                {/* Photo strip */}
                <div className="grid grid-cols-3 gap-3 mb-16 rounded-2xl overflow-hidden h-52 md:h-64">
                    <img
                        src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80"
                        alt="Aerial property view"
                        className="object-cover w-full h-full"
                    />
                    <img
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80"
                        alt="Modern workspace"
                        className="object-cover w-full h-full"
                    />
                    <img
                        src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80"
                        alt="Property managers"
                        className="object-cover w-full h-full"
                    />
                </div>

                <div className="text-center mb-12">
                    <p className="text-[#3d7a4f] text-xs font-semibold uppercase tracking-widest mb-3">
                        EVERYTHING CONNECTED
                    </p>
                    <h2
                        className="text-[#1a1f1a] font-bold tracking-[-0.02em]"
                        style={{ fontSize: 'clamp(26px, 3vw, 40px)' }}
                    >
                        Everything you manage, better connected.
                    </h2>
                    <p className="text-[#5a6b5a] text-base mt-4 max-w-lg mx-auto leading-relaxed">
                        Six tools replaced by one. Propminder keeps all your property details, tenants, and
                        finances in a single, organized place.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                    {features.map(({ icon: Icon, title, desc }) => (
                        <div
                            key={title}
                            className="bg-white rounded-2xl p-6 border border-[#e0e8de] hover:shadow-md transition-shadow"
                        >
                            <div className="w-9 h-9 rounded-lg bg-[#eef2ec] flex items-center justify-center mb-4">
                                <Icon className="text-[#3d7a4f]" style={{ width: 18, height: 18 }} />
                            </div>
                            <h3 className="text-[#1a1f1a] font-semibold text-[15px] mb-2">{title}</h3>
                            <p className="text-[#5a6b5a] text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

/* ── Pricing ── */
function PricingSection() {
    const [yearly, setYearly] = useState(false)

    const plans = [
        {
            name: 'Free plan',
            monthlyPrice: 0,
            desc: 'For landlords just getting started.',
            features: ['Up to 3 units', 'Property & tenant records', 'Basic payment tracking', 'Maintenance log'],
            cta: 'Get started free',
            highlight: false,
        },
        {
            name: 'Grow',
            monthlyPrice: 19,
            desc: 'For growing portfolios that need more.',
            features: [
                'Up to 20 units',
                'Everything in Free',
                'Lease tracking & reminders',
                'Financial exports',
                'Priority support',
            ],
            cta: 'Start free trial',
            highlight: true,
        },
        {
            name: 'Portfolio',
            monthlyPrice: 49,
            desc: 'For professional managers at scale.',
            features: [
                'Unlimited units',
                'Everything in Grow',
                'Multi-property dashboard',
                'Team access',
                'Advanced reporting',
                'API access',
            ],
            cta: 'Start free trial',
            highlight: false,
        },
    ]

    return (
        <section id="pricing" className="bg-white py-24">
            {/* Dark photo banner */}
            <div className="max-w-[1200px] mx-auto px-8 mb-16">
                <div className="rounded-2xl overflow-hidden h-44 relative">
                    <img
                        src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80"
                        alt="Property portfolio"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#1a1f1a]/60" />
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-8">
                <div className="text-center mb-10">
                    <p className="text-[#3d7a4f] text-xs font-semibold uppercase tracking-widest mb-3">
                        SIMPLE, TRANSPARENT PRICING
                    </p>
                    <h2
                        className="text-[#1a1f1a] font-bold tracking-[-0.02em] mb-3"
                        style={{ fontSize: 'clamp(26px, 3vw, 40px)' }}
                    >
                        A plan for every stage of your portfolio.
                    </h2>
                    <p className="text-[#5a6b5a] text-base">
                        Start small. Make room for more. Choose the plan that fits the way you manage.
                    </p>
                </div>

                {/* Toggle */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <button
                        onClick={() => setYearly(false)}
                        className={cn(
                            'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                            !yearly ? 'bg-[#1a1f1a] text-white' : 'text-[#5a6b5a] hover:text-[#1a1f1a]',
                        )}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setYearly(true)}
                        className={cn(
                            'px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                            yearly ? 'bg-[#1a1f1a] text-white' : 'text-[#5a6b5a] hover:text-[#1a1f1a]',
                        )}
                    >
                        Yearly
                        <span className="bg-[#3d7a4f] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            Save 20%
                        </span>
                    </button>
                </div>

                <p className="text-center text-[#8a9e8a] text-xs mb-10">
                    Monthly pricing shown. Start with Free—no credit card required.
                </p>

                <div className="grid md:grid-cols-3 gap-5">
                    {plans.map((plan) => {
                        const price = yearly ? Math.round(plan.monthlyPrice * 0.8) : plan.monthlyPrice
                        return (
                            <div
                                key={plan.name}
                                className={cn(
                                    'rounded-2xl p-7 border transition-all',
                                    plan.highlight
                                        ? 'bg-[#1a1f1a] border-[#1a1f1a]'
                                        : 'bg-white border-[#e0e8de]',
                                )}
                            >
                                <h3
                                    className={cn(
                                        'font-semibold text-base mb-1',
                                        plan.highlight ? 'text-white' : 'text-[#1a1f1a]',
                                    )}
                                >
                                    {plan.name}
                                </h3>
                                <p
                                    className={cn('text-xs mb-5', plan.highlight ? 'text-[#8a9e8a]' : 'text-[#5a6b5a]')}
                                >
                                    {plan.desc}
                                </p>
                                <div className="flex items-end gap-1 mb-6">
                                    <span
                                        className={cn(
                                            'text-4xl font-bold tracking-[-0.02em]',
                                            plan.highlight ? 'text-white' : 'text-[#1a1f1a]',
                                        )}
                                    >
                                        {price === 0 ? 'Free' : `$${price}`}
                                    </span>
                                    {price !== 0 && (
                                        <span
                                            className={cn('text-sm pb-1', plan.highlight ? 'text-[#8a9e8a]' : 'text-[#5a6b5a]')}
                                        >
                                            /mo
                                        </span>
                                    )}
                                </div>
                                <ul className="space-y-2.5 mb-7">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-center gap-2.5">
                                            <Check
                                                className={cn(
                                                    'flex-shrink-0',
                                                    plan.highlight ? 'text-[#5fb97a]' : 'text-[#3d7a4f]',
                                                )}
                                                style={{ width: 14, height: 14 }}
                                            />
                                            <span
                                                className={cn(
                                                    'text-[13px]',
                                                    plan.highlight ? 'text-[#c8d8c8]' : 'text-[#5a6b5a]',
                                                )}
                                            >
                                                {f}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to="/register"
                                    className={cn(
                                        'block w-full text-center py-2.5 rounded-lg text-sm font-medium transition-colors',
                                        plan.highlight
                                            ? 'bg-[#3d7a4f] hover:bg-[#356b44] text-white'
                                            : 'bg-[#eef2ec] hover:bg-[#d8e8d4] text-[#1a1f1a]',
                                    )}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

/* ── Testimonials ── */
function TestimonialsSection() {
    const testimonials = [
        {
            quote:
                "I want to open one place and know what needs me—not spend my morning piecing it all together.",
            name: 'Jamie Morgan',
            role: 'Independent landlord · 3 units',
            initials: 'JM',
            color: '#2e4f35',
        },
        {
            quote:
                "Having leases, rent, and reminders side by side would make a growing portfolio feel much more manageable.",
            name: 'Priya Shah',
            role: 'Portfolio owner · 24 units',
            initials: 'PS',
            color: '#4a3560',
        },
        {
            quote:
                "A shared view of payments and maintenance is exactly the kind of clarity our small team needs.",
            name: 'Daniel Brooks',
            role: 'Property manager · 60 units',
            initials: 'DB',
            color: '#3a4f60',
        },
    ]

    return (
        <section className="bg-[#f7f5f0] py-24">
            <div className="max-w-[1200px] mx-auto px-8">
                <div className="text-center mb-12">
                    <p className="text-[#3d7a4f] text-xs font-semibold uppercase tracking-widest mb-3">
                        LESS ADMIN, MORE BREATHING ROOM
                    </p>
                    <h2
                        className="text-[#1a1f1a] font-bold tracking-[-0.02em]"
                        style={{ fontSize: 'clamp(26px, 3vw, 40px)' }}
                    >
                        Built around the way you work.
                    </h2>
                    <p className="text-[#5a6b5a] text-base mt-3 max-w-md mx-auto">
                        For the independent owner, the growing portfolio, and the team behind it all.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                    {testimonials.map(({ quote, name, role, initials, color }) => (
                        <div key={name} className="bg-white rounded-2xl p-7 border border-[#e8e4de]">
                            <span className="text-4xl text-[#c8d8c0] font-serif leading-none block mb-4">"</span>
                            <p className="text-[#1a1f1a] text-[15px] leading-relaxed mb-6 italic">"{quote}"</p>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                    style={{ backgroundColor: color }}
                                >
                                    {initials}
                                </div>
                                <div>
                                    <p className="text-[#1a1f1a] text-[13px] font-semibold">{name}</p>
                                    <p className="text-[#8a9e8a] text-xs">{role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-center text-[#8a9e8a] text-xs mt-8">
                    Illustrative testimonials with fictional people and sample scenarios. Not verified customer
                    endorsements.
                </p>
            </div>
        </section>
    )
}

/* ── CTA banner ── */
function CTASection() {
    return (
        <section className="py-6 px-8">
            <div className="max-w-[1200px] mx-auto">
                <div className="relative rounded-2xl overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=1400&q=80"
                        alt="Property portfolio"
                        className="w-full h-64 md:h-72 object-cover"
                    />
                    <div className="absolute inset-0 bg-[#1a2e1a]/80" />
                    <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-between gap-6 px-10 md:px-16 py-10">
                        <div>
                            <h2
                                className="text-white font-bold leading-snug tracking-[-0.02em]"
                                style={{ fontSize: 'clamp(22px, 2.5vw, 36px)' }}
                            >
                                Give your portfolio
                                <br />a little peace of mind.
                            </h2>
                            <p className="text-[#a8c8a8] text-sm mt-2">
                                Make room for what matters. Start with Propminder today.
                            </p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Link
                                to="/register"
                                className="px-6 py-2.5 bg-white hover:bg-gray-100 text-[#1a2e1a] text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                            >
                                Get started free
                            </Link>
                            <span className="text-[#a8c8a8] text-xs">
                                Free for up to 3 units · No credit card required
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ── Footer ── */
function Footer() {
    const cols = [
        { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
        { title: 'Resources', links: ['Help center', 'API docs', 'Community', 'Status'] },
        { title: 'Legal', links: ['Privacy policy', 'Terms of service', 'Cookie policy'] },
    ]

    return (
        <footer className="bg-[#0f1410] text-[#6a7e6a] py-16">
            <div className="max-w-[1200px] mx-auto px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-7 h-7 bg-[#3d7a4f] rounded-md flex items-center justify-center">
                                <Home className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white font-semibold text-[17px] tracking-[-0.01em]">
                                propminder
                            </span>
                        </div>
                        <p className="text-[#4a5e4a] text-sm leading-relaxed max-w-[180px]">
                            Your properties. Your peace of mind. Property management, the way it should be.
                            Organised.
                        </p>
                    </div>

                    {cols.map(({ title, links }) => (
                        <div key={title}>
                            <h4 className="text-[#c8d8c8] text-sm font-semibold mb-4">{title}</h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-[#4a5e4a] hover:text-[#8a9e8a] text-sm transition-colors">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-[#1e2e1e] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[#3a4e3a] text-xs">
                        © {new Date().getFullYear()} Propminder. All rights reserved.
                    </p>
                    <p className="text-[#3a4e3a] text-xs">In India</p>
                </div>
            </div>
        </footer>
    )
}

/* ── Page ── */
export default function LandingPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <div className="min-h-screen font-sans antialiased">
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <HeroSection />
            <ProblemSection />
            <FeaturesSection />
            {/*<PricingSection />*/}
            <TestimonialsSection />
            <CTASection />
            <Footer />
        </div>
    )
}

