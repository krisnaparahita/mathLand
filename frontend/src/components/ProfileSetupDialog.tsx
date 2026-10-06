import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AVATAR_OPTIONS, AvatarBubble, COLOR_OPTIONS } from './AvatarBubble'
import { GRADES, topicColor, topicInk } from '@/curriculum'
import { useProfile } from '@/context/ProfileContext'

export function ProfileSetupDialog() {
  const { needsSetup, createProfile } = useProfile()
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<string>('cat')
  const [color, setColor] = useState<string>('indigo')
  const [grade, setGrade] = useState(1)
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!name.trim() || saving) return
    setSaving(true)
    try {
      await createProfile({ name: name.trim(), avatar, color, grade })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={needsSetup}>
      <DialogContent
        className="sm:max-w-md"
        style={{ borderRadius: 'var(--radius)', border: '3px solid var(--border)' }}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle style={{ fontSize: 'var(--font-size-title)' }}>
            <span className="flex items-center" style={{ gap: 'var(--spacing-xs)' }}>
              <Sparkles size={20} color="var(--accent)" />
              Welcome to MathLand!
            </span>
          </DialogTitle>
          <DialogDescription>
            Create a learning profile first so your level results can be saved.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col" style={{ gap: 'var(--spacing-md)' }}>
          <div>
            <div className="font-semibold" style={{ fontSize: 'var(--font-size-label)', marginBottom: 'var(--spacing-xs)' }}>
              Your nickname
            </div>
            <input
              value={name}
              maxLength={20}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void submit()
              }}
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
              Pick an avatar
            </div>
            <div className="flex flex-wrap" style={{ gap: 'var(--spacing-xs)' }}>
              {AVATAR_OPTIONS.map((option) => {
                const active = avatar === option.key
                return (
                  <button
                    key={option.key}
                    type="button"
                    title={option.label}
                    onClick={() => setAvatar(option.key)}
                    className="cursor-pointer rounded-full"
                    style={{
                      padding: 3,
                      border: active ? '3px solid var(--primary)' : '3px solid transparent',
                      transition: 'var(--duration-normal) var(--ease-default)',
                    }}
                  >
                    <AvatarBubble avatar={option.key} color={color} size={34} />
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div className="font-semibold" style={{ fontSize: 'var(--font-size-label)', marginBottom: 'var(--spacing-xs)' }}>
              Pick a color
            </div>
            <div className="flex flex-wrap" style={{ gap: 'var(--spacing-xs)' }}>
              {COLOR_OPTIONS.map((option) => {
                const active = color === option.key
                return (
                  <button
                    key={option.key}
                    type="button"
                    title={option.label}
                    onClick={() => setColor(option.key)}
                    className="cursor-pointer rounded-full"
                    style={{
                      width: 30,
                      height: 30,
                      background: topicColor(option.key),
                      border: active ? '3px solid var(--foreground)' : '3px solid transparent',
                      transition: 'var(--duration-normal) var(--ease-default)',
                    }}
                  />
                )
              })}
            </div>
          </div>

          <div>
            <div className="font-semibold" style={{ fontSize: 'var(--font-size-label)', marginBottom: 'var(--spacing-xs)' }}>
              What grade are you in?
            </div>
            <div className="flex flex-wrap" style={{ gap: 'var(--spacing-xs)' }}>
              {GRADES.map((g) => {
                const active = grade === g.grade
                return (
                  <button
                    key={g.grade}
                    type="button"
                    onClick={() => setGrade(g.grade)}
                    className="clay cursor-pointer"
                    style={{
                      paddingInline: 'var(--spacing-sm)',
                      paddingBlock: 'var(--spacing-xs)',
                      fontSize: 'var(--font-size-label)',
                      fontWeight: active ? 700 : 500,
                      background: active ? topicColor(g.color) : 'var(--card)',
                      color: active ? topicInk(g.color) : 'var(--foreground)',
                      borderRadius: '999px',
                      transition: 'var(--duration-normal) var(--ease-default)',
                    }}
                  >
                    {g.name}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void submit()}
            disabled={!name.trim() || saving}
            className="clay-solid cursor-pointer font-bold"
            style={{
              paddingBlock: 'var(--spacing-sm)',
              fontSize: 'var(--font-size-body)',
              background: name.trim() ? 'var(--accent)' : 'var(--muted)',
              color: name.trim() ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
              borderRadius: 'var(--radius)',
            }}
          >
            {saving ? 'Creating…' : 'Start playing'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
