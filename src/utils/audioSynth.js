// Soft music-box synthesizer for Happy Birthday using Web Audio API
class MusicBoxSynth {
  constructor() {
    this.ctx = null
    this.isPlaying = false
    this.isMuted = false
    this.timer = null
    this.gainNode = null

    this.NOTES = {
      'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
      'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00
    }

    const beat = 0.58 // ~103 BPM
    this.melody = [
      { note: 'G4', dur: 0.75 * beat, bass: 'C4' },
      { note: 'G4', dur: 0.25 * beat },
      { note: 'A4', dur: 1.0 * beat, bass: 'E4' },
      { note: 'G4', dur: 1.0 * beat, bass: 'G4' },
      { note: 'C5', dur: 1.0 * beat, bass: 'C4' },
      { note: 'B4', dur: 2.0 * beat, bass: 'G4' },

      { note: 'G4', dur: 0.75 * beat, bass: 'G3' },
      { note: 'G4', dur: 0.25 * beat },
      { note: 'A4', dur: 1.0 * beat, bass: 'B3' },
      { note: 'G4', dur: 1.0 * beat, bass: 'D4' },
      { note: 'D5', dur: 1.0 * beat, bass: 'G4' },
      { note: 'C5', dur: 2.0 * beat, bass: 'C4' },

      { note: 'G4', dur: 0.75 * beat, bass: 'C4' },
      { note: 'G4', dur: 0.25 * beat },
      { note: 'G5', dur: 1.0 * beat, bass: 'E4' },
      { note: 'E5', dur: 1.0 * beat, bass: 'G4' },
      { note: 'C5', dur: 1.0 * beat, bass: 'C4' },
      { note: 'B4', dur: 1.0 * beat, bass: 'E4' },
      { note: 'A4', dur: 2.0 * beat, bass: 'F4' },

      { note: 'F5', dur: 0.75 * beat, bass: 'F4' },
      { note: 'F5', dur: 0.25 * beat },
      { note: 'E5', dur: 1.0 * beat, bass: 'C4' },
      { note: 'C5', dur: 1.0 * beat, bass: 'E4' },
      { note: 'D5', dur: 1.0 * beat, bass: 'G4' },
      { note: 'C5', dur: 2.5 * beat, bass: 'C4' },
      { note: null, dur: 1.5 * beat }
    ]
  }

  init() {
    if (this.ctx) return
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    this.ctx = new AudioCtx()
    this.gainNode = this.ctx.createGain()
    this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime)
    this.gainNode.connect(this.ctx.destination)
  }

  playNote(freq, startTime, dur, vol = 0.5) {
    if (!this.ctx || !freq) return
    const osc = this.ctx.createOscillator()
    const noteGain = this.ctx.createGain()

    // Warm bell timbre with sine + gentle harmonic
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, startTime)

    // Music box envelope: instantaneous attack and smooth exponential decay
    noteGain.gain.setValueAtTime(0.001, startTime)
    noteGain.gain.exponentialRampToValueAtTime(vol, startTime + 0.008)
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.max(0.6, dur * 2.2))

    osc.connect(noteGain)
    noteGain.connect(this.gainNode)

    osc.start(startTime)
    osc.stop(startTime + Math.max(0.7, dur * 2.3))
  }

  scheduleRound() {
    if (!this.isPlaying || !this.ctx) return
    let t = this.ctx.currentTime + 0.05

    for (const item of this.melody) {
      if (item.note && this.NOTES[item.note]) {
        this.playNote(this.NOTES[item.note], t, item.dur, 0.42)
      }
      if (item.bass && this.NOTES[item.bass]) {
        this.playNote(this.NOTES[item.bass], t, item.dur, 0.22)
      }
      t += item.dur
    }

    const totalDur = (t - this.ctx.currentTime) * 1000
    this.timer = setTimeout(() => {
      if (this.isPlaying) this.scheduleRound()
    }, Math.max(200, totalDur - 100))
  }

  start() {
    this.init()
    if (!this.ctx) return false
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime)
    }
    this.isPlaying = true
    if (this.timer) clearTimeout(this.timer)
    this.scheduleRound()
    return true
  }

  stop() {
    this.isPlaying = false
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime)
    }
  }

  setMuted(muted) {
    this.isMuted = muted
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(muted ? 0 : 0.4, this.ctx.currentTime)
    }
  }
}

export const musicBox = new MusicBoxSynth()
