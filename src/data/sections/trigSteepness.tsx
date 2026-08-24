/**
 * Section 5 — The Steepness of the Arm (inversion)
 * ================================================
 * The student drags the OUTPUT: the height of the tangent segment on the
 * tower at x = 1. The arm swings backwards to whatever steepness is asked
 * for, and the little triangle shows that steepness is rise over run.
 */

import React, { useRef, useState, type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeInput,
    InlineFeedback,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure, FigureSlider } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp, useSpring, type Vec2 } from "@/lib/motion";
import {
    clozePropsFromDefinition,
    getVariableInfo,
    linkedHighlightPropsFromDefinition,
    numberPropsFromDefinition,
} from "../variables";
import { COS_COLOR, EASE_150, Halo, INK, INK_QUIET, INK_STRUCTURE, SIN_COLOR, formatAngle, formatUnit, svgPointFromEvent, toRadians } from "./trigShared";
import { FigureValueInputs, roundTenth } from "./trigValueInputs";

const VIEW_WIDTH = 440;
const VIEW_HEIGHT = 300;
const ORIGIN_X = 100;
const ORIGIN_Y = 262;
const UNIT = 104;
const TOWER_X = ORIGIN_X + UNIT;
const MIN_ANGLE = 5;
const MAX_ANGLE = 63;
const DEFAULT_ANGLE = 30;

function SteepnessDrawing() {
    const setVar = useSetVar();
    const angle = useVar<number>("rampAngle", DEFAULT_ANGLE);
    const highlight = useVar<string>("rampHighlight", "");

    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const draggingRef = useRef(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const handleScale = useSpring(dragging || hovered ? 1.15 : 1, { stiffness: 400, damping: 26 });

    const dim = (id: string) => (highlight && highlight !== id ? 0.35 : 1);
    const weight = (id: string, resting: number) => (highlight === id ? resting * 1.6 : resting);
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("rampHighlight", id),
        onPointerLeave: () => setVar("rampHighlight", ""),
    });

    const radians = toRadians(angle);
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);
    const tangent = Math.tan(radians);

    const tipX = ORIGIN_X + cosine * UNIT;
    const tipY = ORIGIN_Y - sine * UNIT;
    const towerY = ORIGIN_Y - tangent * UNIT;

    const handlePointerMove = (event: React.PointerEvent<SVGCircleElement>) => {
        if (!draggingRef.current) return;
        const point: Vec2 = svgPointFromEvent(event, svgRef.current, VIEW_WIDTH, VIEW_HEIGHT);
        const rise = (ORIGIN_Y - point.y) / UNIT;
        const degrees = (Math.atan(Math.max(rise, 0)) * 180) / Math.PI;
        setVar("rampAngle", roundTenth(clamp(degrees, MIN_ANGLE, MAX_ANGLE)));
    };

    const arcPath = `M ${ORIGIN_X + 32} ${ORIGIN_Y} A 32 32 0 0 0 ${ORIGIN_X + Math.cos(radians) * 32} ${ORIGIN_Y - Math.sin(radians) * 32}`;

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="block w-full select-none"
            role="img"
            aria-label="A ramp rising from the origin, with its steepness measured on a tower one unit away"
        >
            <defs>
                <filter id="steepness-handle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                </filter>
            </defs>

            {/* Readouts beside the drawing. */}
            <g fontSize="12" textAnchor="end" style={{ fontVariantNumeric: "tabular-nums", ...EASE_150 }}>
                <text x={VIEW_WIDTH - 24} y="44" fill={INK}>{`angle = ${formatAngle(angle)}`}</text>
                <text x={VIEW_WIDTH - 24} y="68" fill={SIN_COLOR} opacity={dim("rise")}>{`sin = ${formatUnit(sine)}`}</text>
                <text x={VIEW_WIDTH - 24} y="92" fill={COS_COLOR} opacity={dim("run")}>{`cos = ${formatUnit(cosine)}`}</text>
                <text x={VIEW_WIDTH - 24} y="124" fill={INK} opacity={dim("tan")}>
                    {`sin ÷ cos = ${formatUnit(tangent)}`}
                </text>
            </g>

            {/* Ground, tower, quarter arc, and the ramp itself. */}
            <g opacity={dim("__structure")} style={EASE_150}>
                <line x1={ORIGIN_X - 20} y1={ORIGIN_Y} x2={TOWER_X + 24} y2={ORIGIN_Y} stroke={INK_QUIET} strokeWidth="1.5" strokeLinecap="round" />
                <line x1={ORIGIN_X} y1={ORIGIN_Y + 16} x2={ORIGIN_X} y2={ORIGIN_Y - UNIT - 24} stroke={INK_QUIET} strokeWidth="1.5" strokeLinecap="round" />
                <path d={`M ${TOWER_X} ${ORIGIN_Y} A ${UNIT} ${UNIT} 0 0 0 ${ORIGIN_X} ${ORIGIN_Y - UNIT}`} fill="none" stroke={INK_STRUCTURE} strokeWidth="1.5" />
                <line x1={TOWER_X} y1={ORIGIN_Y} x2={TOWER_X} y2={34} stroke={INK_QUIET} strokeWidth="1.5" strokeDasharray="4 5" />
                <line x1={ORIGIN_X} y1={ORIGIN_Y} x2={TOWER_X} y2={towerY} stroke={INK_STRUCTURE} strokeWidth="2" strokeLinecap="round" />
                <path d={arcPath} fill="none" stroke={INK_STRUCTURE} strokeWidth="2" strokeLinecap="round" />
                <text x={ORIGIN_X + 46} y={ORIGIN_Y - 12} fill={INK} fontSize="12">&#952;</text>
                <circle cx={tipX} cy={tipY} r="4" fill={INK_STRUCTURE} />
                <text x={(ORIGIN_X + TOWER_X) / 2} y={ORIGIN_Y + 22} fill={INK} fontSize="11" textAnchor="middle">1</text>
            </g>

            {/* The little triangle: run in teal, rise in indigo. */}
            <g {...hoverProps("run")} opacity={dim("run")} style={EASE_150}>
                <Halo active={highlight === "run"}>
                    <line x1={ORIGIN_X} y1={ORIGIN_Y} x2={tipX} y2={ORIGIN_Y} stroke={COS_COLOR} strokeWidth={weight("run", 3) + 6} strokeLinecap="round" />
                </Halo>
                <line x1={ORIGIN_X} y1={ORIGIN_Y} x2={tipX} y2={ORIGIN_Y} stroke={COS_COLOR} strokeWidth={weight("run", 3)} strokeLinecap="round" />
            </g>
            <g {...hoverProps("rise")} opacity={dim("rise")} style={EASE_150}>
                <Halo active={highlight === "rise"}>
                    <line x1={tipX} y1={ORIGIN_Y} x2={tipX} y2={tipY} stroke={SIN_COLOR} strokeWidth={weight("rise", 3) + 6} strokeLinecap="round" />
                </Halo>
                <line x1={tipX} y1={ORIGIN_Y} x2={tipX} y2={tipY} stroke={SIN_COLOR} strokeWidth={weight("rise", 3)} strokeLinecap="round" />
            </g>

            {/* The same rise, stretched out to the tower one unit away. */}
            <g {...hoverProps("tan")} opacity={dim("tan")} style={EASE_150}>
                <Halo active={highlight === "tan"}>
                    <line x1={TOWER_X} y1={ORIGIN_Y} x2={TOWER_X} y2={towerY} stroke={SIN_COLOR} strokeWidth={weight("tan", 3.5) + 6} strokeLinecap="round" />
                </Halo>
                <line x1={TOWER_X} y1={ORIGIN_Y} x2={TOWER_X} y2={towerY} stroke={SIN_COLOR} strokeWidth={weight("tan", 3.5)} strokeLinecap="round" />
                <text x={TOWER_X + 14} y={(ORIGIN_Y + towerY) / 2 + 4} fill={SIN_COLOR} fontSize="12" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`tan = ${formatUnit(tangent)}`}
                </text>
            </g>

            <g transform={`translate(${TOWER_X} ${towerY}) scale(${handleScale})`}>
                <circle r="9" fill={SIN_COLOR} filter="url(#steepness-handle-shadow)" />
                <circle r="3.5" fill="#FFFFFF" />
            </g>
            <circle
                cx={TOWER_X}
                cy={towerY}
                r="24"
                fill="transparent"
                style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
                onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    draggingRef.current = true;
                    setDragging(true);
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={() => {
                    draggingRef.current = false;
                    setDragging(false);
                }}
                onPointerCancel={() => {
                    draggingRef.current = false;
                    setDragging(false);
                }}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
            />
        </svg>
    );
}

function SteepnessValueInputs() {
    const setVar = useSetVar();
    const angle = useVar<number>("rampAngle", DEFAULT_ANGLE);
    const radians = toRadians(angle);
    const setAngle = (degrees: number) =>
        setVar("rampAngle", roundTenth(clamp(degrees, MIN_ANGLE, MAX_ANGLE)));

    return (
        <FigureValueInputs
            fields={[
                {
                    id: "ramp-angle",
                    label: "angle",
                    color: INK,
                    display: formatAngle(angle),
                    onCommit: (value) => setAngle(value),
                },
                {
                    id: "ramp-cos",
                    label: "cos",
                    color: COS_COLOR,
                    display: formatUnit(Math.cos(radians)),
                    onCommit: (value) => setAngle((Math.acos(clamp(value, 0, 1)) * 180) / Math.PI),
                },
                {
                    id: "ramp-sin",
                    label: "sin",
                    color: SIN_COLOR,
                    display: formatUnit(Math.sin(radians)),
                    onCommit: (value) => setAngle((Math.asin(clamp(value, 0, 1)) * 180) / Math.PI),
                },
                {
                    id: "ramp-tan",
                    label: "tan",
                    color: SIN_COLOR,
                    display: formatUnit(Math.tan(radians)),
                    onCommit: (value) => setAngle((Math.atan(Math.max(value, 0)) * 180) / Math.PI),
                },
            ]}
        />
    );
}

function SteepnessFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="ramp-steepness"
            onReset={() => {
                setVar("rampAngle", DEFAULT_ANGLE);
                setVar("rampHighlight", "");
            }}
            caption="Drag the indigo marker up and down the tower, or type an exact value. You are setting the steepness, and the ramp swings to match it."
        >
            <SteepnessDrawing />
            <SteepnessValueInputs />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="rampAngle"
                    label="Ramp angle"
                    {...numberPropsFromDefinition(getVariableInfo("rampAngle"))}
                    formatValue={formatAngle}
                />
            </div>
            <InteractionHintSequence
                hintKey="ramp-steepness-drag"
                steps={[
                    {
                        gesture: "drag-vertical",
                        label: "Drag the marker up the tower",
                        position: { x: "46%", y: "67%" },
                        dragPath: { type: "line", startOffset: { x: 0, y: 24 }, endOffset: { x: 0, y: -24 } },
                    },
                ]}
            />
        </Figure>
    );
}

export const trigSteepnessBlocks: ReactElement[] = [
    <StackLayout key="layout-steepness-heading" maxWidth="xl">
        <Block id="steepness-heading" padding="md">
            <EditableH2 id="h2-steepness-heading" blockId="steepness-heading">
                The Steepness of the Arm
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-steepness-setup" maxWidth="xl">
        <Block id="steepness-setup" padding="sm">
            <EditableParagraph id="para-steepness-setup" blockId="steepness-setup">
                • Think of the arm as a ramp in the gym, tilted at{" "}
                <InlineScrubbleNumber
                    varName="rampAngle"
                    {...numberPropsFromDefinition(getVariableInfo("rampAngle"))}
                    formatValue={formatAngle}
                />
                .
                <br />• Its{" "}
                <InlineLinkedHighlight
                    varName="rampHighlight"
                    highlightId="tan"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("rampHighlight"))}
                >
                    steepness
                </InlineLinkedHighlight>{" "}
                is rise over run, which is sine divided by cosine.
                <br />• Drag the indigo marker up the tower and the ramp swings to
                whatever steepness you ask for.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-steepness-figure" maxWidth="xl">
        <Block id="steepness-figure" padding="sm" hasVisualization>
            <SteepnessFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-steepness-insight" maxWidth="xl">
        <Block id="steepness-insight" padding="sm">
            <EditableParagraph id="para-steepness-insight" blockId="steepness-insight">
                • Pull the marker high and the ramp creeps toward straight up without
                ever getting there.
                <br />• The rise on the tower can grow forever while the cosine shrinks
                toward zero.
                <br />• Dividing by something tiny is exactly what makes the tangent
                explode.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-steepness-question-value" maxWidth="xl">
        <Block id="steepness-question-value" padding="sm">
            <EditableParagraph id="para-steepness-question-value" blockId="steepness-question-value">
                Somewhere on the circle an angle has sin θ = 0.6 and cos θ = 0.8, so
                its tangent is{" "}
                <InlineFeedback
                    varName="answerTanValue"
                    correctValue={["0.75", ".75", "3/4"]}
                    position="terminal"
                    successMessage="&#8212; correct, 0.6 divided by 0.8 is 0.75, a gentle ramp"
                    failureMessage="&#8212; almost"
                    hint="Steepness is the rise divided by the run, in that order"
                    reviewBlockId="steepness-figure"
                    reviewLabel="Compare the two readouts on the ramp"
                >
                    <InlineClozeInput
                        varName="answerTanValue"
                        correctAnswer={["0.75", ".75", "3/4"]}
                        {...clozePropsFromDefinition(getVariableInfo("answerTanValue"))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
