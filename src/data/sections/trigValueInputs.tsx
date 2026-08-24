/**
 * Typed value boxes for the trigonometry figures
 * ==============================================
 * A quiet row of figure-local text fields that sit BESIDE the drawing (never
 * over it), so a value can be typed exactly instead of dragged. Each field
 * shows the same formatted string the drawing shows, and commits on Enter or
 * on blur; anything unparseable simply snaps back.
 */

import { useEffect, useState } from "react";

export interface FigureValueField {
    id: string;
    label: string;
    color: string;
    /** The formatted value shown while the field is not being edited. */
    display: string;
    /** Apply a typed number to the model. */
    onCommit: (parsed: number) => void;
}

const parseTyped = (raw: string): number | null => {
    const cleaned = raw.replace(/−/g, "-").replace(/[°\s]/g, "");
    if (cleaned === "" || cleaned === "-") return null;
    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
};

function ValueInput({ field }: { field: FigureValueField }) {
    const [text, setText] = useState(field.display);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        if (!editing) setText(field.display);
    }, [field.display, editing]);

    const commit = () => {
        const parsed = parseTyped(text);
        if (parsed !== null) field.onCommit(parsed);
        setEditing(false);
    };

    return (
        <label className="flex items-center gap-2 text-[12px] text-[#64748B]">
            <span>{field.label}</span>
            <input
                type="text"
                inputMode="decimal"
                aria-label={`Type an exact value for ${field.label}`}
                value={text}
                onChange={(event) => setText(event.target.value)}
                onFocus={() => setEditing(true)}
                onBlur={commit}
                onKeyDown={(event) => {
                    if (event.key === "Enter") (event.target as HTMLInputElement).blur();
                    if (event.key === "Escape") {
                        setEditing(false);
                        setText(field.display);
                    }
                }}
                className="w-[74px] rounded-md border border-slate-200 bg-white px-2 py-1 text-right text-[13px] outline-none transition-colors focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
                style={{ fontVariantNumeric: "tabular-nums", color: field.color }}
            />
        </label>
    );
}

export function FigureValueInputs({ fields }: { fields: FigureValueField[] }) {
    return (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-6 pb-4">
            {fields.map((field) => (
                <ValueInput key={field.id} field={field} />
            ))}
        </div>
    );
}

// ── Shared commit maths ──────────────────────────────────────────────────────

export const roundTenth = (value: number) => Math.round(value * 10) / 10;

export const wrapDegrees = (value: number) => ((value % 360) + 360) % 360;

const clampUnit = (value: number) => Math.max(-1, Math.min(1, value));

/**
 * Angle (in degrees) whose cosine is `target`, keeping the half of the circle
 * the arm is currently in so the point does not jump across the axis.
 */
export const angleFromCosine = (target: number, currentAngle: number) => {
    const base = (Math.acos(clampUnit(target)) * 180) / Math.PI;
    const sineIsNegative = Math.sin((currentAngle * Math.PI) / 180) < 0;
    return roundTenth(sineIsNegative ? 360 - base : base);
};

/**
 * Angle (in degrees) whose sine is `target`, keeping the side of the vertical
 * axis the arm is currently on.
 */
export const angleFromSine = (target: number, currentAngle: number) => {
    const base = (Math.asin(clampUnit(target)) * 180) / Math.PI;
    const cosineIsNegative = Math.cos((currentAngle * Math.PI) / 180) < 0;
    return roundTenth(wrapDegrees(cosineIsNegative ? 180 - base : base));
};
