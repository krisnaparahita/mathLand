import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Pencil, Plus, Sparkles, Target, Trash2, Trophy, UserRound } from 'lucide-react'
import { FadeIn, HoverLift } from '@/components/MotionPrimitives'
import { AVATAR_OPTIONS, AvatarBubble, COLOR_OPTIONS } from '@/components/AvatarBubble'
import { GRADES, getGrade, topicColor, topicInk, topicSoft, topicText } from '@/curriculum'
import { StickerBoard } from '@/components/StickerBoard'
import { useProfile } from '@/context/ProfileContext'
import { resultsApi } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

interface FormState {
  name: string
  avatar: string
  color: string
  grade: number
}

const EMPTY_FORM: FormState = { name: '', avatar: 'cat', color: 'indigo', grade: 1 }

export default function ProfilePage() {
  const { profile, profiles, selectProfile, createProfile, updateProfile, deleteProfile, loading } =
    useProfile()

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [editing, setEditing] = useState(false)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newForm, setNewForm] = useState<FormState>(EMPTY_FORM)

  useEffect(() => {
    if (profile && !editing) {
      setForm({ name: profile.name, avatar: profile.avatar, color: profile.color, grade: profile.grade })
    }
  }, [profile, editing])

  const { data: stats } = useQuery({
    queryKey: ['stats', profile?.id],
    queryFn: () => resultsApi.stats(profile!.id),
    enabled: Boolean(profile),
  })

  const save = async () => {
    if (!profile || !form.name.trim() || saving) return
    setSaving(true)
    try {
      await updateProfile({
        id: profile.id,
        name: form.name.trim(),
        avatar: form.avatar,
        color: form.color,
        grade: form.grade,
      })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const create = async () => {
    if (!newForm.name.trim() || saving) return
    setSaving(true)
    try {
      await createProfile({
        name: newForm.name.trim(),
        avatar: newForm.avatar,
        color: newForm.color,
        grade: newForm.grade,
      })
      setNewForm(EMPTY_FORM)
      setCreating(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="container" style={{ maxWidth: 900, paddingBottom: 'var(--spacing-3xl)' }}>
      <FadeIn>
        <header style={{ marginTop: 'var(--spacing-xl)' }}>
          <h1 className="font-bold text-display">My Profile</h1>
          <p style={{ color: 'var(--muted-foreground)', marginTop: 'var(--spacing-xs)' }}>
            Manage the nickname, avatar and grade. You can also create a separate profile for each child at home.
          </p>
        </header>
      </FadeIn>

      {loading ? (
        <p style={{ marginTop: 'var(--spacing-lg)', color: 'var(--muted-foreground)' }}>Loading profile…</p>
      ) : !profile ? (
        <div className="clay" style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-xl)', textAlign: 'center' }}>
          <p className="font-bold">No learning profile yet</p>
          <p style={{ color: 'var(--muted-foreground)', marginTop: 4, fontSize: 'var(--font-size-small)' }}>
            Once you create a profile, your results and stars are saved in it.
          </p>
        </div>
      ) : (
        <>
          {/* ── Current profile ── */}
          <FadeIn>
            <section
              className="clay"
              style={{
                marginTop: 'var(--spacing-lg)',
                padding: 'var(--spacing-lg)',
                background: topicSoft(profile.color),
                borderColor: `color-mix(in oklch, ${topicColor(profile.color)} 55%, white)`,
                boxShadow: `0 6px 0 color-mix(in oklch, ${topicColor(profile.color)} 55%, white)`,
              }}
            >
              <div className="flex items-center flex-wrap" style={{ gap: 'var(--spacing-md)' }}>
                <AvatarBubble avatar={profile.avatar} color={profile.color} size={72} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div className="font-bold text-title">{profile.name}</div>
                  <div style={{ color: 'var(--muted-foreground)', fontSize: 'var(--font-size-small)', marginTop: 2 }}>
                    {getGrade(profile.grade)?.name} · {getGrade(profile.grade)?.tagline}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditing((v) => !v)
                    setForm({
                      name: profile.name,
                      avatar: profile.avatar,
                      color: profile.color,
                      grade: profile.grade,
                    })
                  }}
                  className="clay clay-hover cursor-pointer inline-flex items-center font-semibold"
                  style={{
                    gap: 6,
                    paddingInline: 'var(--spacing-md)',
                    paddingBlock: 'var(--spacing-xs)',
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--font-size-label)',
                  }}
                >
                  {editing ? 'Cancel editing' : <><Pencil size={15} /> Edit profile</>}
                </button>
              </div>

              {stats && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                    gap: 'var(--spacing-sm)',
                    marginTop: 'var(--spacing-md)',
                  }}
                >
                  <MiniStat icon={<Trophy size={15} />} label="Levels played" value={String(stats.totalGames)} tone="var(--theme-gold)" />
                  <MiniStat icon={<Sparkles size={15} />} label="Total stars" value={String(stats.totalStars)} tone="var(--theme-gold)" />
                  <MiniStat icon={<Target size={15} />} label="Overall accuracy" value={`${stats.accuracy}%`} tone="var(--theme-green)" />
                  <MiniStat icon={<UserRound size={15} />} label="Practice streak" value={`${stats.streakDays} ${stats.streakDays === 1 ? 'day' : 'days'}`} tone="var(--accent)" />
                </div>
              )}

              {editing && (
                <div
                  style={{
                    marginTop: 'var(--spacing-lg)',
                    paddingTop: 'var(--spacing-md)',
                    borderTop: '2px dashed var(--border)',
                  }}
                >
                  <ProfileFields form={form} onChange={setForm} />
                  <button
                    type="button"
                    onClick={() => void save()}
                    disabled={!form.name.trim() || saving}
                    className="clay-solid cursor-pointer inline-flex items-center font-bold"
                    style={{
                      gap: 6,
                      marginTop: 'var(--spacing-md)',
                      paddingInline: 'var(--spacing-lg)',
                      paddingBlock: 'var(--spacing-sm)',
                      borderRadius: 'var(--radius)',
                      background: form.name.trim() ? 'var(--primary)' : 'var(--muted)',
                      color: form.name.trim() ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                    }}
                  >
                    <Check size={16} /> {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              )}
            </section>
          </FadeIn>

          {/* ── Stickers ── */}
          {stats && (
            <FadeIn>
              <section style={{ marginTop: 'var(--spacing-md)' }}>
                <StickerBoard totalStars={stats.totalStars} />
              </section>
            </FadeIn>
          )}

          {/* ── Progress by grade ── */}
          {stats && stats.gradeCounts.length > 0 && (
            <FadeIn>
              <section className="clay" style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-lg)' }}>
                <h2 className="font-bold text-title">Levels played by grade</h2>
                <div className="flex flex-wrap" style={{ gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
                  {GRADES.map((g) => {
                    const count = stats.gradeCounts.find((c) => c.grade === g.grade)?.games ?? 0
                    return (
                      <Link
                        key={g.grade}
                        to={`/grades/${g.grade}`}
                        className="clay-inset cursor-pointer"
                        style={{
                          padding: 'var(--spacing-sm) var(--spacing-md)',
                          borderRadius: 'var(--radius)',
                          minWidth: 110,
                        }}
                      >
                        <div className="font-semibold" style={{ fontSize: 'var(--font-size-small)' }}>
                          {g.name}
                        </div>
                        <div className="font-bold" style={{ fontSize: 'var(--font-size-title)', color: topicText(g.color) }}>
                          {count}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            </FadeIn>
          )}
        </>
      )}

      {/* ── Profile list ── */}
      <FadeIn>
        <section className="clay" style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-lg)' }}>
          <div className="flex items-center justify-between flex-wrap" style={{ gap: 'var(--spacing-sm)' }}>
            <h2 className="font-bold text-title">All profiles ({profiles.length})</h2>
            <button
              type="button"
              onClick={() => setCreating((v) => !v)}
              className="clay clay-hover cursor-pointer inline-flex items-center font-semibold"
              style={{
                gap: 6,
                paddingInline: 'var(--spacing-md)',
                paddingBlock: 'var(--spacing-xs)',
                borderRadius: 'var(--radius)',
                fontSize: 'var(--font-size-label)',
                color: 'var(--accent)',
              }}
            >
              <Plus size={16} /> New profile
            </button>
          </div>

          {creating && (
            <div
              style={{
                marginTop: 'var(--spacing-md)',
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--radius)',
                background: 'var(--muted)',
              }}
            >
              <ProfileFields form={newForm} onChange={setNewForm} />
              <button
                type="button"
                onClick={() => void create()}
                disabled={!newForm.name.trim() || saving}
                className="clay-solid cursor-pointer inline-flex items-center font-bold"
                style={{
                  gap: 6,
                  marginTop: 'var(--spacing-md)',
                  paddingInline: 'var(--spacing-lg)',
                  paddingBlock: 'var(--spacing-sm)',
                  borderRadius: 'var(--radius)',
                  background: newForm.name.trim() ? 'var(--accent)' : 'var(--muted-foreground)',
                  color: 'var(--accent-foreground)',
                }}
              >
                <Plus size={16} /> {saving ? 'Creating…' : 'Create and switch'}
              </button>
            </div>
          )}

          <div className="flex flex-col" style={{ gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
            {profiles.map((p) => {
              const active = p.id === profile?.id
              return (
                <HoverLift key={p.id} lift={-3}>
                  <div
                    className="clay"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-md)',
                      padding: 'var(--spacing-md)',
                      flexWrap: 'wrap',
                      borderColor: active ? `color-mix(in oklch, ${topicColor(p.color)} 60%, white)` : undefined,
                      background: active ? topicSoft(p.color) : undefined,
                    }}
                  >
                    <AvatarBubble avatar={p.avatar} color={p.color} size={44} />
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div className="font-bold" style={{ fontSize: 'var(--font-size-body)' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}>
                        {getGrade(p.grade)?.name ?? `Grade ${p.grade}`}
                      </div>
                    </div>

                    {active ? (
                      <span
                        className="font-semibold"
                        style={{
                          fontSize: 'var(--font-size-small)',
                          color: topicText(p.color),
                          paddingInline: 'var(--spacing-sm)',
                        }}
                      >
                        In use
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => selectProfile(p.id)}
                        className="clay cursor-pointer font-semibold"
                        style={{
                          paddingInline: 'var(--spacing-md)',
                          paddingBlock: 'var(--spacing-xs)',
                          borderRadius: '999px',
                          fontSize: 'var(--font-size-small)',
                          background: topicColor(p.color),
                          color: topicInk(p.color),
                        }}
                      >
                        Switch to this profile
                      </button>
                    )}

                    <button
                      type="button"
                      title="Delete profile"
                      onClick={() => {
                        if (window.confirm(`Delete the profile "${p.name}"? Its level results will be deleted too.`)) {
                          void deleteProfile(p.id)
                        }
                      }}
                      className="cursor-pointer"
                      style={{
                        background: 'var(--muted)',
                        border: 'none',
                        borderRadius: 999,
                        width: 34,
                        height: 34,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </HoverLift>
              )
            })}
          </div>
        </section>
      </FadeIn>
    </main>
  )
}

/* ────────────── Form fields (shared by edit / create) ────────────── */

function ProfileFields({
  form,
  onChange,
}: {
  form: FormState
  onChange: (next: FormState) => void
}) {
  return (
    <div className="flex flex-col" style={{ gap: 'var(--spacing-md)' }}>
      <div>
        <div className="font-semibold" style={{ fontSize: 'var(--font-size-label)', marginBottom: 'var(--spacing-xs)' }}>
          Nickname
        </div>
        <input
          value={form.name}
          maxLength={20}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          placeholder="For example: Alex"
          className="clay-inset w-full"
          style={{
            paddingInline: 'var(--spacing-md)',
            paddingBlock: 'var(--spacing-sm)',
            fontSize: 'var(--font-size-body)',
            background: 'var(--background)',
            border: '2px solid var(--border)',
            outline: 'none',
          }}
        />
      </div>

      <div>
        <div className="font-semibold" style={{ fontSize: 'var(--font-size-label)', marginBottom: 'var(--spacing-xs)' }}>
          Avatar
        </div>
        <div className="flex flex-wrap" style={{ gap: 'var(--spacing-xs)' }}>
          {AVATAR_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              title={option.label}
              onClick={() => onChange({ ...form, avatar: option.key })}
              className="cursor-pointer rounded-full"
              style={{
                padding: 3,
                border: form.avatar === option.key ? '3px solid var(--primary)' : '3px solid transparent',
              }}
            >
              <AvatarBubble avatar={option.key} color={form.color} size={32} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="font-semibold" style={{ fontSize: 'var(--font-size-label)', marginBottom: 'var(--spacing-xs)' }}>
          Color
        </div>
        <div className="flex flex-wrap" style={{ gap: 'var(--spacing-xs)' }}>
          {COLOR_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              title={option.label}
              onClick={() => onChange({ ...form, color: option.key })}
              className="cursor-pointer rounded-full"
              style={{
                width: 28,
                height: 28,
                background: topicColor(option.key),
                border: form.color === option.key ? '3px solid var(--foreground)' : '3px solid transparent',
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="font-semibold" style={{ fontSize: 'var(--font-size-label)', marginBottom: 'var(--spacing-xs)' }}>
          Grade
        </div>
        <div className="flex flex-wrap" style={{ gap: 'var(--spacing-xs)' }}>
          {GRADES.map((g) => {
            const active = form.grade === g.grade
            return (
              <button
                key={g.grade}
                type="button"
                onClick={() => onChange({ ...form, grade: g.grade })}
                className="clay cursor-pointer"
                style={{
                  paddingInline: 'var(--spacing-sm)',
                  paddingBlock: 'var(--spacing-xs)',
                  fontSize: 'var(--font-size-label)',
                  fontWeight: active ? 700 : 500,
                  background: active ? topicColor(g.color) : 'var(--card)',
                  color: active ? topicInk(g.color) : 'var(--foreground)',
                  borderRadius: 999,
                }}
              >
                {g.name}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MiniStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone: string
}) {
  return (
    <div className="clay-inset" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderRadius: 'var(--radius)' }}>
      <div className="inline-flex items-center font-semibold" style={{ gap: 4, fontSize: 'var(--font-size-small)', color: 'var(--muted-foreground)' }}>
        <span style={{ color: tone, display: 'inline-flex' }}>{icon}</span> {label}
      </div>
      <div className="font-bold" style={{ fontSize: 'var(--font-size-body)' }}>
        {value}
      </div>
    </div>
  )
}
