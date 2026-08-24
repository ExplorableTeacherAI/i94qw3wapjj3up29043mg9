/**
 * Shared drawing vocabulary for the trigonometry lesson
 * =====================================================
 * One ink palette, one accent per quantity (cosine teal, sine indigo), one
 * number formatter per quantity — used by every figure in this lesson so the
 * same value never appears in two formats or two colours.
 */

import React from "react";
import { type Vec2 } from "@/lib/motion";

export const INK = "#334155";
export const INK_STRUCTURE = "#64748B";
export const INK_QUIET = "#CBD5E1";
export const COS_COLOR = "#62D0AD";
export const SIN_COLOR = "#8E90F5";

export const EASE_150 = {
    transition: "opacity 150ms ease, stroke-width 150ms ease",
} as const;

/** The soft halo half of a linked highlight: a wider stroke of the same hue. */
export const Halo = ({ active, children }: { active: boolean; children: React.ReactNode }) =>
    active ? <g opacity={0.28}>{children}</g> : null;

export const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** One formatter per quantity, used in figures, sliders and prose alike. */
export const formatAngle = (degrees: number) => `${degrees.toFixed(1)}°`;

export const formatUnit = (value: number) => {
    const rounded = Math.abs(value) < 0.005 ? 0 : value;
    return `${rounded < 0 ? "−" : ""}${Math.abs(rounded).toFixed(2)}`;
};

/** Pointer position in viewBox coordinates. */
export const svgPointFromEvent = (
    event: React.PointerEvent,
    svg: SVGSVGElement | null,
    viewWidth: number,
    viewHeight: number,
): Vec2 => {
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
        x: ((event.clientX - rect.left) / rect.width) * viewWidth,
        y: ((event.clientY - rect.top) / rect.height) * viewHeight,
    };
};
