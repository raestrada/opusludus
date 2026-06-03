// Notation Engine — VexFlow wrapper for rendering musical scores
import VexFlow from "vexflow";
import { nameToMidi, DURATIONS } from "./theory";

const VF = VexFlow;

// Map our note names to VexFlow note keys (lowercase, no octave)
function toVFKey(name) {
  if (!name) return "b/4"; // rest placeholder
  const match = name.match(/^([A-G])([#♭]?)(\d)$/);
  if (!match) return "c/4";
  let letter = match[1].toLowerCase();
  const accidental = match[2];
  const octave = match[3];
  if (accidental === "#" || accidental === "♯") letter += "#";
  if (accidental === "♭" || accidental === "b") letter += "b";
  return letter + "/" + octave;
}

// Our internal duration to VexFlow duration
function toVFDuration(duration) {
  const map = {
    "1": "w",
    "2": "h",
    "4": "q",
    "8": "8",
    "16": "16",
    "2d": "hd",
    "4d": "qd",
    "8d": "8d",
  };
  return map[duration] || "q";
}

export class NotationRenderer {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this._widthExplicit = "width" in options;
    this.options = {
      clef: options.clef || "treble",
      timeSignature: options.timeSignature || [4, 4],
      keySignature: options.keySignature || "C",
      width: options.width || 800,
      height: options.height || 300,
      staffType: options.staffType || "single", // "single" | "grand"
      ...options,
    };
    this.renderer = null;
    this.context = null;
    this.staves = [];
    this.isSetup = false;
  }

  setup() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.warn("NotationRenderer: container not found:", this.containerId);
      return;
    }

    // Use container's width if available and no explicit width set
    const containerWidth = container.clientWidth;
    if (containerWidth > 0 && !this._widthExplicit) {
      this.options.width = containerWidth;
    }
    if (!this.options.height) {
      this.options.height = Math.max(200, containerWidth * 0.5);
    }

    // Clear existing content and create fresh SVG
    container.innerHTML = "";

    this.renderer = new VF.Renderer(
      container,
      VF.Renderer.Backends.SVG
    );
    this.renderer.resize(this.options.width, this.options.height);

    // Make SVG responsive
    const svg = container.querySelector("svg");
    if (svg) {
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.style.display = "block";
    }

    this.context = this.renderer.getContext();
    this.context.setFont("Arial", 10, "").setBackgroundFillStyle("#111128");
    this.context.setFillStyle("#e8e8f0");
    this.context.setStrokeStyle("#e8e8f0");

    this.isSetup = true;
  }

  render(composition) {
    if (!this.isSetup) this.setup();
    if (!this.renderer || !this.context) return;

    const ctx = this.context;
    ctx.clear();

    const mod = composition || this._defaultComposition();
    const measures = mod.measures || [];
    const clef = mod.clef || this.options.clef;
    const timeSig = mod.timeSignature || this.options.timeSignature;
    const keySig = mod.keySignature || this.options.keySignature;
    const measuresPerStave = Math.min(4, Math.max(1, measures.length));

    const staveWidth = (this.options.width - 60) / measuresPerStave;
    const staveY = this.options.staffType === "grand" ? 50 : 60;
    const bassY = staveY + 100;

    // Draw staves
    this.staves = [];

    for (let i = 0; i < measures.length; i += measuresPerStave) {
      const stave = new VF.Stave(30 + (i > 0 ? 0 : 0), staveY, staveWidth * Math.min(measuresPerStave, measures.length - i));
      if (i === 0) {
        stave.addClef(clef === "grand" ? "treble" : clef);
        if (keySig !== "C") {
          stave.addKeySignature(keySig);
        }
        stave.addTimeSignature(timeSig[0] + "/" + timeSig[1]);
      }
      stave.setStyle({ fillStyle: "#e8e8f0", strokeStyle: "#e8e8f0" });
      stave.setContext(ctx).draw();
      this.staves.push({ stave, index: i });
    }

    // TODO: Full note rendering with individual measure staves
    // For now, render a simplified view

    return this;
  }

  // Render a single-measure preview (for the composition interface)
  renderMeasure(composition, measureIndex = 0, options = {}) {
    if (!this.isSetup) this.setup();
    if (!this.renderer || !this.context) return;

    const ctx = this.context;
    ctx.clear();

    const measures = composition.measures || [];
    if (measureIndex >= measures.length) return;

    const measure = measures[measureIndex];
    const clef = composition.clef || "treble";
    const timeSig = composition.timeSignature || [4, 4];
    const keySig = composition.keySignature || "C";

    const staveWidth = this.options.width - 80;
    const stave = new VF.Stave(40, 50, staveWidth);
    stave.addClef(clef === "grand" ? "treble" : clef).addTimeSignature(timeSig[0] + "/" + timeSig[1]);
    if (keySig !== "C") stave.addKeySignature(keySig);
    stave.setStyle({ fillStyle: "#e8e8f0", strokeStyle: "#e8e8f0" });
    stave.setContext(ctx).draw();

    // Render voices
    const voices = measure.voices || [[]];
    const voiceGroups = [];

    for (let voiceIdx = 0; voiceIdx < voices.length; voiceIdx++) {
      const voiceNotes = voices[voiceIdx];
      const notes = [];
      for (let noteIdx = 0; noteIdx < voiceNotes.length; noteIdx++) {
        const n = voiceNotes[noteIdx];
        const noteId = `${this.containerId}-m${measureIndex}-v${voiceIdx}-n${noteIdx}`;
        const isInvalid = options.showErrors && options.invalidNoteIds && (
          options.invalidNoteIds.includes(noteId) || 
          options.invalidNoteIds.includes(`vf-${noteId}`)
        );
        const noteColor = isInvalid ? "#ff5252" : "#e8e8f0";
        const restColor = isInvalid ? "#ff5252" : "#a0a0b8";

        if (n.pitch) {
          const keys = [toVFKey(n.pitch)];
          const duration = toVFDuration(n.duration || "4");
          const staveNote = new VF.StaveNote({
            clef: clef === "grand" ? "treble" : clef,
            keys,
            duration,
          });
          staveNote.setAttribute('id', noteId);
          staveNote.setStyle({ fillStyle: noteColor, strokeStyle: noteColor });
          if (n.duration && n.duration.endsWith("d")) {
            staveNote.addModifier(new VF.Dot(), 0);
          }
          if (n.accidental) {
            staveNote.addModifier(new VF.Accidental(n.accidental), 0);
          }
          notes.push(staveNote);
        } else {
          // Rest
          const restNote = new VF.StaveNote({
            clef: clef === "grand" ? "treble" : clef,
            keys: ["b/4"],
            duration: toVFDuration(n.duration || "4") + "r",
          });
          restNote.setAttribute('id', noteId);
          restNote.setStyle({ fillStyle: restColor, strokeStyle: restColor });
          if (n.duration && n.duration.endsWith("d")) {
            restNote.addModifier(new VF.Dot(), 0);
          }
          notes.push(restNote);
        }
      }
      if (notes.length > 0) {
        const voice = new VF.Voice({
          num_beats: timeSig[0],
          beat_value: timeSig[1],
        });
        voice.setMode(VF.Voice.Mode.SOFT);
        voice.addTickables(notes);
        voiceGroups.push(voice);
      }
    }

    if (voiceGroups.length > 0) {
      const formatter = new VF.Formatter();
      formatter.joinVoices(voiceGroups).format(voiceGroups, stave.getNoteEndX() - stave.getNoteStartX());
      for (const voice of voiceGroups) {
        voice.draw(ctx, stave);
      }
    }

    this.addHitboxes();
    return this;
  }

  // Render the full composition across multiple staves
  renderFull(composition, activeMeasureIndex = 0, options = {}) {
    if (!this.isSetup) this.setup();
    if (!this.renderer || !this.context) return;

    const ctx = this.context;
    ctx.clear();

    const mod = composition;
    const measures = mod.measures || [];
    const clef = mod.clef || "treble";
    const timeSig = mod.timeSignature || [4, 4];
    const keySig = mod.keySignature || "C";
    const measuresPerLine = 4;

    const numLines = Math.ceil(measures.length / measuresPerLine);
    if (numLines > 1) {
      const requiredHeight = numLines * 120 + 30;
      if (this.options.height < requiredHeight) {
        this.resize(this.options.width, requiredHeight);
      }
    }

    for (let lineIdx = 0; lineIdx < Math.ceil(measures.length / measuresPerLine); lineIdx++) {
      const lineMeasures = measures.slice(
        lineIdx * measuresPerLine,
        (lineIdx + 1) * measuresPerLine
      );

      const staveY = 40 + lineIdx * 120;
      const totalWidth = this.options.width - 80;
      
      let baseStaveWidth = totalWidth / lineMeasures.length;
      const extra = 70;
      
      if (lineIdx === 0 && lineMeasures.length > 1) {
        baseStaveWidth = (totalWidth - extra) / lineMeasures.length;
      }

      let currentX = 40;
      for (let i = 0; i < lineMeasures.length; i++) {
        const measureIdx = lineIdx * measuresPerLine + i;
        
        let staveW = baseStaveWidth;
        if (lineIdx === 0 && lineMeasures.length > 1 && i === 0) {
          staveW = baseStaveWidth + extra;
        }

        const stave = new VF.Stave(currentX, staveY, staveW - 5);

        // Highlight active measure (Stroke-only to prevent black box fallbacks in VexFlow 5 SVGContext)
        if (measureIdx === activeMeasureIndex) {
          ctx.save();
          ctx.setStrokeStyle("#9c82ff"); // Bright purple/lavender focus outline
          ctx.setLineWidth(3); // High visibility border
          ctx.beginPath();
          ctx.rect(currentX, staveY - 10, staveW - 5, 110, {
            fill: "none",
            stroke: "#9c82ff",
            "stroke-width": "3"
          }); // Centered height to cover ledger lines/stems beautifully
          ctx.stroke();
          ctx.restore();
        }

        if (lineIdx === 0 && i === 0) {
          stave.addClef(clef === "grand" ? "treble" : clef);
          if (keySig !== "C") stave.addKeySignature(keySig);
          stave.addTimeSignature(timeSig[0] + "/" + timeSig[1]);
        }

        stave.setStyle({ fillStyle: "#e8e8f0", strokeStyle: "#e8e8f0" });
        stave.setContext(ctx).draw();

        const measure = lineMeasures[i];
        const voices = measure.voices || [[]];
        const voiceGroups = [];

        for (let voiceIdx = 0; voiceIdx < voices.length; voiceIdx++) {
          const voiceNotes = voices[voiceIdx];
          const notes = [];
          for (let noteIdx = 0; noteIdx < voiceNotes.length; noteIdx++) {
            const n = voiceNotes[noteIdx];
            const noteId = `${this.containerId}-m${measureIdx}-v${voiceIdx}-n${noteIdx}`;
            const isInvalid = options.showErrors && options.invalidNoteIds && (
              options.invalidNoteIds.includes(noteId) || 
              options.invalidNoteIds.includes(`vf-${noteId}`)
            );
            const noteColor = isInvalid ? "#ff5252" : "#e8e8f0";
            const restColor = isInvalid ? "#ff5252" : "#a0a0b8";

            if (n.pitch) {
              const keys = [toVFKey(n.pitch)];
              const staveNote = new VF.StaveNote({
                clef: clef === "grand" ? "treble" : clef,
                keys,
                duration: toVFDuration(n.duration || "4"),
              });
              staveNote.setAttribute('id', noteId);
              staveNote.setStyle({ fillStyle: noteColor, strokeStyle: noteColor });
              if (n.duration && n.duration.endsWith("d")) {
                staveNote.addModifier(new VF.Dot(), 0);
              }
              if (n.accidental) {
                staveNote.addModifier(new VF.Accidental(n.accidental), 0);
              }
              notes.push(staveNote);
            } else {
              const restNote = new VF.StaveNote({
                clef: clef === "grand" ? "treble" : clef,
                keys: ["b/4"],
                duration: toVFDuration(n.duration || "4") + "r",
              });
              restNote.setAttribute('id', noteId);
              restNote.setStyle({ fillStyle: restColor, strokeStyle: restColor });
              if (n.duration && n.duration.endsWith("d")) {
                restNote.addModifier(new VF.Dot(), 0);
              }
              notes.push(restNote);
            }
          }
          if (notes.length > 0) {
            const voice = new VF.Voice({
              num_beats: timeSig[0],
              beat_value: timeSig[1],
            });
            voice.setMode(VF.Voice.Mode.SOFT);
            voice.addTickables(notes);
            voiceGroups.push(voice);
          }
        }

        if (voiceGroups.length > 0) {
          const formatter = new VF.Formatter();
          // Use stave.getNoteEndX() - stave.getNoteStartX() to let VexFlow distribute notes correctly and prevent barline overlaps
          formatter.joinVoices(voiceGroups).format(voiceGroups, stave.getNoteEndX() - stave.getNoteStartX());
          for (const voice of voiceGroups) {
            voice.draw(ctx, stave);
          }
        }

        currentX += staveW;
      }
    }

    this.addHitboxes();
    return this;
  }

  addHitboxes() {
    // Wait a short time for VexFlow to finish drawing paths in DOM
    setTimeout(() => {
      const container = document.getElementById(this.containerId);
      if (!container) return;
      
      const noteGroups = container.querySelectorAll(".vf-stavenote");
      noteGroups.forEach(group => {
        // Prevent duplicate overlays
        if (group.querySelector(".note-hitbox")) return;
        
        try {
          const bbox = group.getBBox();
          if (bbox.width === 0 || bbox.height === 0) return;
          
          const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          rect.setAttribute("class", "note-hitbox");
          rect.setAttribute("x", bbox.x - 8);
          // 100px vertical hit column centered on the note makes clicking a breeze
          const targetHeight = Math.max(100, bbox.height + 24);
          const yOffset = bbox.y - (targetHeight - bbox.height) / 2;
          rect.setAttribute("y", yOffset);
          rect.setAttribute("width", bbox.width + 16);
          rect.setAttribute("height", targetHeight);
          rect.setAttribute("fill", "transparent");
          rect.setAttribute("stroke", "none");
          rect.setAttribute("style", "cursor: pointer; pointer-events: all; fill: transparent !important; stroke: none !important;");
          
          group.appendChild(rect);
        } catch (e) {
          // getBBox might fail if the SVG is detached or not yet visible
        }
      });
    }, 50);
  }

  resize(width, height) {
    this.options.width = width;
    this.options.height = height;
    if (this.renderer) {
      this.renderer.resize(width, height);
    }
  }

  destroy() {
    const container = document.getElementById(this.containerId);
    if (container) container.innerHTML = "";
    this.renderer = null;
    this.context = null;
    this.staves = [];
    this.isSetup = false;
  }

  _defaultComposition() {
    return {
      clef: "treble",
      timeSignature: [4, 4],
      keySignature: "C",
      measures: [
        {
          voices: [[
            { pitch: "C4", duration: "4" },
            { pitch: "D4", duration: "4" },
            { pitch: "E4", duration: "4" },
            { pitch: "F4", duration: "4" },
          ]],
        },
      ],
    };
  }
}

// Factory function
export function createNotationRenderer(containerId, options) {
  return new NotationRenderer(containerId, options);
}

export default NotationRenderer;
